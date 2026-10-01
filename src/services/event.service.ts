import {
  createDoc,
  updateDoc,
  deleteDocFromFirestore,
  queryDocs,
  queryPage,
  getDocById,
  getDocsByIds,
  type Page,
} from "@/utils/firestore";
import type {
  CreateEventRequest,
  Event,
  EventListItem,
  EventPermissions,
  EventStatus,
  EventWorkflowAction,
  UpdateEventRequest,
} from "@/types/event.types";
import type { ReportAttachment } from "@/types/report.types";
import type { User, UserRole } from "@/types/user.types";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError, logger } from "@/utils/errors";
import { toDate } from "@/utils/aggregation";
import { isInManagerChain } from "@/utils/authorization";
import { createActivityLog } from "./activitylog.service";
import { notifyUsers, getUserIdsByRoles, filterUsersByPreference } from "./notification.service";
import { requireOwnAttachments } from "./report-attachment.service";
import { issueEventCertificates } from "./certificate.service";
import { getTeam } from "./team.service";

/**
 * Event Service - events and the youth leader activity workflow:
 * Create → Submit → Review → Approve → Conduct → Submit Evidence → Verify → Certificates.
 *
 * A youth leader's event starts as a draft and needs their manager (RO, or
 * anyone above them in their chain) to approve it and later verify its
 * evidence. Events organized by an RO or above are approved on creation and
 * self-verified when their organizer submits evidence.
 */

export type Actor = { userId: string; role: UserRole };

const EVENTS_ROUTE_BY_ROLE: Partial<Record<UserRole, string>> = {
  developer: "/Head-of-RO/activities",
  "head-ro": "/Head-of-RO/activities",
  sro: "/SRO/activities",
  ro: "/RO/activities",
  "youth-leader": "/youth-leader/activities",
  volunteer: "/volunteer/activities",
};

/** An organizer may mark an event as started this long before its start time. */
const START_WINDOW_MS = 60 * 60 * 1000;

const PRIVATE_STATUSES: EventStatus[] = ["draft", "submitted", "rejected"];
const EDITABLE_STATUSES: EventStatus[] = ["draft", "rejected", "planned"];
const CANCELLABLE_STATUSES: EventStatus[] = ["draft", "submitted", "rejected", "planned", "ongoing"];
const REVIEW_QUEUE_STATUSES: EventStatus[] = ["submitted", "evidence-submitted"];

const isOrgWide = (actor: Actor) => actor.role === "head-ro" || actor.role === "developer";
const needsApproval = (event: Pick<Event, "organizerRole">) => event.organizerRole === "youth-leader";
const primaryOrganizer = (event: Pick<Event, "organizerIds">) => event.organizerIds[0] ?? "";

async function requireEvent(eventId: string): Promise<Event> {
  const event = await getDocById<Event>("events", eventId);
  if (!event) throw new NotFoundError("Event not found");
  return { ...event, attendees: event.attendees ?? [], organizerIds: event.organizerIds ?? [] };
}

// ---------------------------------------------------------------------------
// Permissions

/**
 * Whether the actor reviews this event's organizer: org-wide roles review
 * everyone; otherwise the organizer must be below the actor in their chain.
 * `teamIds` (the actor's whole team) avoids a chain walk per event in lists.
 */
async function isReviewerOf(actor: Actor, event: Event, teamIds?: Set<string>): Promise<boolean> {
  if (isOrgWide(actor)) return true;
  if (actor.role !== "ro" && actor.role !== "sro") return false;
  const organizerId = primaryOrganizer(event);
  if (!organizerId || organizerId === actor.userId) return false;
  return teamIds ? teamIds.has(organizerId) : isInManagerChain(actor.userId, organizerId);
}

export function computePermissions(event: Event, actor: Actor, isReviewer: boolean, now = new Date()): EventPermissions {
  const status = event.status;
  const isOrganizer = event.organizerIds.includes(actor.userId);
  const isAttending = event.attendees.includes(actor.userId);
  const start = toDate(event.startDate);
  const end = toDate(event.endDate);
  const hasEnded = !!end && end <= now;
  const hasRoom = !event.maxAttendees || event.attendees.length < event.maxAttendees;
  const openForSignUp = (status === "planned" || status === "ongoing") && !hasEnded;

  return {
    canEdit:
      EDITABLE_STATUSES.includes(status) &&
      (isOrgWide(actor) || (isOrganizer && (status !== "planned" || !needsApproval(event)))),
    canDelete: isOrgWide(actor) || (isOrganizer && ["draft", "rejected", "cancelled"].includes(status)),
    canSubmit: isOrganizer && (status === "draft" || status === "rejected"),
    canReview: isReviewer && status === "submitted",
    canStart: isOrganizer && status === "planned" && !!start && start.getTime() - START_WINDOW_MS <= now.getTime(),
    canSubmitEvidence: isOrganizer && (status === "ongoing" || (status === "planned" && !!start && start <= now)),
    canVerify: isReviewer && status === "evidence-submitted",
    canCancel: (isOrganizer || isReviewer) && CANCELLABLE_STATUSES.includes(status),
    canJoin: !isOrganizer && !isAttending && openForSignUp && hasRoom,
    canLeave: isAttending && openForSignUp,
    canViewEvidence: !!event.evidence && (isOrganizer || isReviewer),
  };
}

// ---------------------------------------------------------------------------
// Reads

async function enrichForList(events: Event[], actor: Actor): Promise<EventListItem[]> {
  const organizerIds = [...new Set(events.map(primaryOrganizer).filter(Boolean))];
  const organizers = await getDocsByIds<User>("users", organizerIds);
  const nameById = new Map(organizers.map((user) => [user.id, user.name]));

  // One team lookup for the whole list instead of a chain walk per event.
  const needsTeam = (actor.role === "ro" || actor.role === "sro") && events.some(needsApproval);
  const teamIds = needsTeam ? (await getTeam(actor.userId)).memberIds : undefined;

  const now = new Date();
  return Promise.all(
    events.map(async (raw) => {
      const event = { ...raw, attendees: raw.attendees ?? [], organizerIds: raw.organizerIds ?? [] };
      const isReviewer = await isReviewerOf(actor, event, teamIds);
      return {
        ...event,
        organizerName: nameById.get(primaryOrganizer(event)) || "Unknown organizer",
        attendeeCount: event.attendees.length,
        isAttending: event.attendees.includes(actor.userId),
        isOrganizer: event.organizerIds.includes(actor.userId),
        permissions: computePermissions(event, actor, isReviewer, now),
      };
    })
  );
}

/** Drafts are private to their organizer; proposals under review also to their reviewers. */
function isVisibleTo(item: EventListItem, actor: Actor): boolean {
  if (item.status === "draft") return item.isOrganizer;
  if (PRIVATE_STATUSES.includes(item.status)) return item.isOrganizer || isOrgWide(actor) || item.permissions.canReview;
  return true;
}

const byStartDate = (direction: 1 | -1) => (a: Event, b: Event) =>
  direction * ((toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0));

export type EventView = "all" | "mine" | "joined" | "review";

/**
 * Events for a portal's list.
 * - all: upcoming (not yet ended, soonest first) or past events, one page at a time.
 * - mine: every event the actor organizes, newest first.
 * - joined: every event the actor signed up for, soonest first.
 * - review: proposals and evidence awaiting the actor's decision.
 */
export async function listEvents(options: {
  view: EventView;
  when: "upcoming" | "past";
  actor: Actor;
  pageSize: number;
  pageNumber: number;
}): Promise<Page<EventListItem>> {
  const { view, when, actor, pageSize, pageNumber } = options;
  try {
    if (view === "all") {
      const now = new Date();
      const page = await queryPage<Event>(
        "events",
        [{ field: "endDate", operator: when === "upcoming" ? ">=" : "<", value: now }],
        { field: "endDate", direction: when === "upcoming" ? "asc" : "desc" },
        { pageSize, pageNumber }
      );
      const items = (await enrichForList(page.items, actor)).filter((item) => isVisibleTo(item, actor));
      return { ...page, items };
    }

    let events: Event[] = [];
    if (view === "mine") {
      events = (await queryDocs<Event>("events", [{ field: "organizerIds", operator: "array-contains", value: actor.userId }])).sort(
        byStartDate(-1)
      );
    } else if (view === "joined") {
      events = (await queryDocs<Event>("events", [{ field: "attendees", operator: "array-contains", value: actor.userId }])).sort(
        byStartDate(1)
      );
    } else if (isOrgWide(actor) || actor.role === "ro" || actor.role === "sro") {
      events = (await queryDocs<Event>("events", [{ field: "status", operator: "in", value: REVIEW_QUEUE_STATUSES }])).sort(
        byStartDate(1)
      );
    }

    let items = await enrichForList(events, actor);
    if (view === "review") items = items.filter((item) => item.permissions.canReview || item.permissions.canVerify);
    return { items, page: 1, pageSize: items.length, hasMore: false };
  } catch (error) {
    logger.error(`Error listing events (${view})`, error);
    throw error;
  }
}

type Person = { id: string; name: string; role: UserRole };

export type EventDetail = EventListItem & {
  /** Everyone signed up (organizers and reviewers only). */
  attendeeList?: Person[];
  /** Who took part, from the submitted evidence. */
  participantList?: Person[];
  /** Who the organizer may mark as a participant: attendees plus their own team. */
  candidateList?: (Person & { signedUp: boolean })[];
};

const toPerson = (user: User): Person => ({ id: user.id, name: user.name, role: user.role });
const byName = (a: Person, b: Person) => a.name.localeCompare(b.name);

/** One event with attendee / participant names for the people who manage it. */
export async function getEventDetail(eventId: string, actor: Actor): Promise<EventDetail> {
  const event = await requireEvent(eventId);
  const [item] = await enrichForList([event], actor);
  if (!isVisibleTo(item, actor)) throw new NotFoundError("Event not found");

  const { canReview, canVerify, canViewEvidence } = item.permissions;
  const canManage = item.isOrganizer || isOrgWide(actor) || canReview || canVerify || canViewEvidence;
  if (!canManage) return item;

  const teamIds = item.permissions.canSubmitEvidence ? [...(await getTeam(primaryOrganizer(event))).memberIds] : [];
  const people = await getDocsByIds<User>("users", [
    ...new Set([...event.attendees, ...(event.evidence?.participantIds ?? []), ...teamIds]),
  ]);
  const personById = new Map(people.map((user) => [user.id, user]));
  const peopleFor = (ids: string[]) => ids.flatMap((id) => (personById.has(id) ? [toPerson(personById.get(id)!)] : [])).sort(byName);

  return {
    ...item,
    attendeeList: peopleFor(event.attendees),
    participantList: event.evidence ? peopleFor(event.evidence.participantIds) : undefined,
    candidateList: item.permissions.canSubmitEvidence
      ? peopleFor([...new Set([...event.attendees, ...teamIds])]).map((person) => ({
          ...person,
          signedUp: event.attendees.includes(person.id),
        }))
      : undefined,
  };
}

export async function getEventById(eventId: string): Promise<Event | null> {
  return getDocById<Event>("events", eventId);
}

// ---------------------------------------------------------------------------
// Writes

async function notifyHeadROsOfNewEvent(event: Pick<Event, "id" | "title" | "location" | "startDate">, exceptId: string) {
  try {
    const headRoIds = (await getUserIdsByRoles(["head-ro", "developer"])).filter((id) => id !== exceptId);
    const recipients = await filterUsersByPreference(headRoIds, "event-created");
    await notifyUsers(recipients, {
      type: "event-created",
      title: `New event "${event.title}" scheduled`,
      message: `${event.location} · ${toDate(event.startDate)?.toLocaleDateString() ?? ""}`,
      relatedId: event.id,
      relatedType: "event",
      actionUrl: "/Head-of-RO/activities",
    });
  } catch (error) {
    logger.error("Failed to notify Head ROs of new event", error);
  }
}

/**
 * `organizer` is who the event belongs to (the portal user a developer acts
 * as); `actorUserId` is who actually did it, for the audit log.
 */
export async function createEvent(data: CreateEventRequest, organizer: Actor, actorUserId = organizer.userId): Promise<Event> {
  try {
    const eventId = crypto.randomUUID();
    const status: EventStatus = organizer.role === "youth-leader" ? "draft" : "planned";

    const eventData: Omit<Event, "id"> = {
      title: data.title,
      description: data.description,
      type: data.type,
      mode: data.mode,
      status,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      attendees: [],
      organizerIds: [organizer.userId],
      organizerRole: organizer.role,
      maxAttendees: data.maxAttendees,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event = await createDoc<Event>("events", eventId, eventData as Event);

    await createActivityLog({
      userId: actorUserId,
      action: "event-created",
      description: `${status === "draft" ? "Drafted" : "Created"} event "${data.title}"`,
      entityType: "event",
      entityId: eventId,
    });

    if (status === "planned") await notifyHeadROsOfNewEvent({ ...eventData, id: eventId }, organizer.userId);

    logger.info(`Event created: ${eventId} by ${organizer.userId} (${status})`);
    return { ...event, id: eventId };
  } catch (error) {
    logger.error("Error creating event", error);
    throw error;
  }
}

async function permissionsFor(event: Event, actor: Actor) {
  return computePermissions(event, actor, await isReviewerOf(actor, event));
}

export async function updateEvent(eventId: string, data: UpdateEventRequest, actor: Actor): Promise<Event> {
  try {
    const event = await requireEvent(eventId);
    if (!(await permissionsFor(event, actor)).canEdit) {
      throw new AuthorizationError(
        EDITABLE_STATUSES.includes(event.status)
          ? "You can't edit this event"
          : "This event can no longer be edited"
      );
    }

    // Validate the resulting date range, not just the fields that were sent.
    const start = data.startDate ?? toDate(event.startDate);
    const end = data.endDate ?? toDate(event.endDate);
    if (start && end && end <= start) {
      throw new ValidationError("End date must be after start date", { endDate: ["End date must be after start date"] });
    }
    if (data.maxAttendees && data.maxAttendees < event.attendees.length) {
      throw new ValidationError(`${event.attendees.length} people have already signed up`, {
        maxAttendees: [`Must be at least ${event.attendees.length} (already signed up)`],
      });
    }

    // updateDoc treats null as "remove the field" (clears maxAttendees).
    await updateDoc<Event>("events", eventId, data as Partial<Event>);

    await createActivityLog({
      userId: actor.userId,
      action: "event-updated",
      description: `Updated event "${event.title}"`,
      entityType: "event",
      entityId: eventId,
    });

    logger.info(`Event updated: ${eventId}`);
    return requireEvent(eventId);
  } catch (error) {
    logger.error(`Error updating event ${eventId}`, error);
    throw error;
  }
}

export async function deleteEvent(eventId: string, actor: Actor): Promise<void> {
  try {
    const event = await requireEvent(eventId);
    if (!(await permissionsFor(event, actor)).canDelete) {
      throw new AuthorizationError("Only drafts, rejected and cancelled events can be deleted. Cancel it instead.");
    }

    await deleteDocFromFirestore("events", eventId);

    await createActivityLog({
      userId: actor.userId,
      action: "other",
      description: `Deleted event "${event.title}"`,
      entityType: "event",
      entityId: eventId,
    });

    logger.info(`Event deleted: ${eventId}`);
  } catch (error) {
    logger.error(`Error deleting event ${eventId}`, error);
    throw error;
  }
}

export type EvidenceInput = { summary: string; participantIds: string[]; attachments: ReportAttachment[] };

type WorkflowInput = { action: EventWorkflowAction; comment?: string; evidence?: EvidenceInput };

/** Who approves a youth leader's events: their manager, or Head ROs if they have none. */
async function reviewerIdsFor(event: Event): Promise<string[]> {
  const organizer = await getDocById<User>("users", primaryOrganizer(event));
  const managerId = organizer && "reportingToId" in organizer ? organizer.reportingToId : "";
  return managerId ? [managerId] : getUserIdsByRoles(["head-ro"]);
}

async function notifyReviewers(event: Event, title: string, message: string) {
  try {
    const reviewerIds = await reviewerIdsFor(event);
    const reviewers = await getDocsByIds<User>("users", reviewerIds);
    await Promise.all(
      reviewers.map((reviewer) =>
        notifyUsers([reviewer.id], {
          type: "event-updated",
          title,
          message,
          relatedId: event.id,
          relatedType: "event",
          actionUrl: EVENTS_ROUTE_BY_ROLE[reviewer.role],
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify reviewers of event ${event.id}`, error);
  }
}

async function notifyOrganizers(event: Event, title: string, message: string, exceptId: string) {
  try {
    const organizers = await getDocsByIds<User>(
      "users",
      event.organizerIds.filter((id) => id !== exceptId)
    );
    await Promise.all(
      organizers.map((organizer) =>
        notifyUsers([organizer.id], {
          type: "event-updated",
          title,
          message,
          relatedId: event.id,
          relatedType: "event",
          actionUrl: EVENTS_ROUTE_BY_ROLE[organizer.role],
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify organizers of event ${event.id}`, error);
  }
}

async function notifyAttendees(event: Event, title: string, message: string) {
  if (event.attendees.length === 0) return;
  try {
    const attendees = await getDocsByIds<User>("users", event.attendees);
    await Promise.all(
      attendees.map((attendee) =>
        notifyUsers([attendee.id], {
          type: "event-updated",
          title,
          message,
          relatedId: event.id,
          relatedType: "event",
          actionUrl: EVENTS_ROUTE_BY_ROLE[attendee.role],
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify attendees of event ${event.id}`, error);
  }
}

/** Participants must have signed up, or be in the organizer's own team. */
async function validateEvidence(event: Event, evidence: EvidenceInput) {
  const allowed = new Set([...event.attendees, ...(await getTeam(primaryOrganizer(event))).memberIds]);
  const unknown = evidence.participantIds.filter((id) => !allowed.has(id));
  if (unknown.length > 0) {
    throw new ValidationError("Participants must have signed up for this event or be in your team", {
      participantIds: ["Some selected participants can't be credited for this event"],
    });
  }
  await requireOwnAttachments(evidence.attachments, primaryOrganizer(event));
}

/**
 * Moves an event through the activity workflow. `actor` is who the action is
 * taken as (a developer acting in a portal acts as that portal's user);
 * `auditUserId` is who actually did it.
 */
export async function runEventWorkflow(
  eventId: string,
  input: WorkflowInput,
  actor: Actor,
  auditUserId = actor.userId
): Promise<Event> {
  try {
    const event = await requireEvent(eventId);
    const permissions = await permissionsFor(event, actor);
    const actorUser = await getDocById<User>("users", actor.userId);
    const actorName = actorUser?.name || "Someone";
    const reviewStamp = { reviewedBy: actor.userId, reviewedByName: actorName, reviewedAt: new Date() };
    const deny = (message: string): never => {
      throw new ConflictError(message);
    };

    let changes: Record<string, unknown> = {};
    let logText = "";
    let after: () => Promise<void> = async () => {};

    switch (input.action) {
      case "submit":
        if (!permissions.canSubmit) deny("Only a draft or rejected event can be submitted for review");
        changes = { status: "submitted", submittedAt: new Date(), reviewComment: null };
        logText = `Submitted event "${event.title}" for review`;
        after = () =>
          notifyReviewers(event, `${actorName} submitted "${event.title}" for approval`, `${event.location} · review it on your Events page.`);
        break;

      case "approve":
        if (!permissions.canReview) deny("This event isn't awaiting your approval");
        changes = { status: "planned", ...reviewStamp, reviewComment: input.comment || null };
        logText = `Approved event "${event.title}"`;
        after = async () => {
          await notifyOrganizers(event, `"${event.title}" was approved`, input.comment || "Volunteers can now sign up.", actor.userId);
          await notifyHeadROsOfNewEvent(event, actor.userId);
        };
        break;

      case "reject":
        if (!permissions.canReview) deny("This event isn't awaiting your approval");
        if (!input.comment || input.comment.length < 3) {
          throw new ValidationError("Please give a reason for rejecting this event", { comment: ["A reason is required"] });
        }
        changes = { status: "rejected", ...reviewStamp, reviewComment: input.comment };
        logText = `Rejected event "${event.title}"`;
        after = () => notifyOrganizers(event, `"${event.title}" needs changes`, input.comment!, actor.userId);
        break;

      case "start":
        if (!permissions.canStart) deny("This event can't be started yet");
        // Clear the approval note so an "ongoing" comment always means returned evidence.
        changes = { status: "ongoing", reviewComment: null };
        logText = `Started event "${event.title}"`;
        break;

      case "submit-evidence": {
        if (!permissions.canSubmitEvidence) deny("Evidence can only be submitted once the event has started");
        if (!input.evidence) throw new ValidationError("Evidence is required");
        await validateEvidence(event, input.evidence);
        const evidence = { ...input.evidence, submittedBy: actor.userId, submittedAt: new Date() };
        if (needsApproval(event)) {
          changes = { status: "evidence-submitted", evidence, reviewComment: null };
          logText = `Submitted evidence for event "${event.title}"`;
          after = () =>
            notifyReviewers(
              event,
              `${actorName} submitted evidence for "${event.title}"`,
              `${evidence.participantIds.length} participant(s) · verify it to issue certificates.`
            );
        } else {
          // Organized by an RO or above: nobody else to verify, so it completes now.
          changes = { status: "completed", evidence, ...reviewStamp, reviewComment: null };
          logText = `Completed event "${event.title}"`;
          after = async () => {
            const count = await issueEventCertificates({ ...event, evidence }, actor.userId);
            await updateDoc("events", eventId, { certificatesIssuedAt: new Date(), certificateCount: count });
          };
        }
        break;
      }

      case "return-evidence":
        if (!permissions.canVerify) deny("This event's evidence isn't awaiting your verification");
        if (!input.comment || input.comment.length < 3) {
          throw new ValidationError("Please say what needs to change", { comment: ["A reason is required"] });
        }
        changes = { status: "ongoing", ...reviewStamp, reviewComment: input.comment };
        logText = `Returned evidence for event "${event.title}"`;
        after = () => notifyOrganizers(event, `Evidence for "${event.title}" was returned`, input.comment!, actor.userId);
        break;

      case "verify":
        if (!permissions.canVerify) deny("This event's evidence isn't awaiting your verification");
        changes = { status: "completed", ...reviewStamp, reviewComment: input.comment || null };
        logText = `Verified event "${event.title}"`;
        after = async () => {
          const count = await issueEventCertificates(event, actor.userId);
          await updateDoc("events", eventId, { certificatesIssuedAt: new Date(), certificateCount: count });
          await notifyOrganizers(event, `"${event.title}" was verified`, `${count} certificate(s) issued.`, actor.userId);
        };
        break;

      case "cancel":
        if (!permissions.canCancel) deny("This event can't be cancelled");
        changes = { status: "cancelled" };
        logText = `Cancelled event "${event.title}"`;
        after = async () => {
          await notifyAttendees(event, `"${event.title}" was cancelled`, `${event.location} · ${toDate(event.startDate)?.toLocaleDateString() ?? ""}`);
          if (!event.organizerIds.includes(actor.userId)) {
            await notifyOrganizers(event, `"${event.title}" was cancelled by ${actorName}`, input.comment || "", actor.userId);
          }
        };
        break;
    }

    await updateDoc("events", eventId, changes);
    await createActivityLog({
      userId: auditUserId,
      action: "event-updated",
      description: auditUserId === actor.userId ? logText : `${logText} on behalf of ${actor.userId}`,
      entityType: "event",
      entityId: eventId,
      changes: { status: { oldValue: event.status, newValue: changes.status } },
    });
    await after();

    logger.info(`Event ${eventId}: ${input.action} by ${actor.userId}`);
    return requireEvent(eventId);
  } catch (error) {
    logger.error(`Error running "${input.action}" on event ${eventId}`, error);
    throw error;
  }
}

/** Sign up for (or withdraw from) an approved event. */
export async function setEventAttendance(eventId: string, join: boolean, actor: Actor): Promise<Event> {
  try {
    const event = await requireEvent(eventId);
    const permissions = await permissionsFor(event, actor);

    if (join) {
      if (event.attendees.includes(actor.userId)) return event;
      if (!permissions.canJoin) {
        throw new ConflictError(
          event.maxAttendees && event.attendees.length >= event.maxAttendees
            ? "This event is full"
            : "Sign-ups are closed for this event"
        );
      }
    } else {
      if (!event.attendees.includes(actor.userId)) return event;
      if (!permissions.canLeave) throw new ConflictError("You can't withdraw from this event any more");
    }

    // Read-modify-write is fine at this scale; the cap is re-checked above.
    const attendees = join
      ? [...event.attendees, actor.userId]
      : event.attendees.filter((id) => id !== actor.userId);
    await updateDoc("events", eventId, { attendees });

    await createActivityLog({
      userId: actor.userId,
      action: "other",
      description: `${join ? "Signed up for" : "Withdrew from"} event "${event.title}"`,
      entityType: "event",
      entityId: eventId,
    });

    return { ...event, attendees };
  } catch (error) {
    logger.error(`Error updating attendance for event ${eventId}`, error);
    throw error;
  }
}

/** One evidence PDF, for the organizer and their reviewers. */
export async function getEvidenceAttachment(eventId: string, index: number, actor: Actor): Promise<ReportAttachment> {
  const event = await requireEvent(eventId);
  if (!(await permissionsFor(event, actor)).canViewEvidence) throw new AuthorizationError();
  const attachment = event.evidence?.attachments?.[index];
  if (!attachment) throw new NotFoundError("Attachment not found");
  return attachment;
}

/** Events a user organizes, grouped by workflow stage (for dashboards). */
export async function countEventsByStatus(organizerId: string): Promise<Partial<Record<EventStatus, number>>> {
  const events = await queryDocs<Event>("events", [{ field: "organizerIds", operator: "array-contains", value: organizerId }]);
  const counts: Partial<Record<EventStatus, number>> = {};
  events.forEach((event) => (counts[event.status] = (counts[event.status] || 0) + 1));
  return counts;
}
