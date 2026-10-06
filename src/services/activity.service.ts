import {
  createDoc,
  updateDoc,
  deleteDocFromFirestore,
  queryDocs,
  queryPage,
  getDocById,
  getDocsByIds,
  getDocCount,
  updateDocAtomically,
  updateDocIfStatus,
  type Page,
} from "@/utils/firestore";
import type {
  CreateActivityRequest,
  Activity,
  ActivityListItem,
  ActivityPermissions,
  ActivityStatus,
  ActivityWorkflowAction,
  UpdateActivityRequest,
} from "@/types/activity.types";
import type { ReportAttachment } from "@/types/report.types";
import type { MemberProfile, User, UserRole } from "@/types/user.types";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError, logger } from "@/utils/errors";
import { toDate } from "@/utils/aggregation";
import { isInManagerChain } from "@/utils/authorization";
import { createActivityLog } from "./activitylog.service";
import { notifyUsers, getUserIdsByRoles, filterUsersByPreference } from "./notification.service";
import { requireOwnAttachments } from "./report-attachment.service";
import { issueActivityCertificates } from "./certificate.service";
import { chunk, getChainIds, getMemberProfiles, getTeam } from "./team.service";
import { getPerformanceTree } from "./performance.service";
import { formatDate } from "@/utils/format-date";

/**
 * Activity Service - activities and the youth leader activity workflow:
 * Create → Submit → Review → Approve → Conduct → Submit Evidence → Verify → Certificates.
 *
 * A youth leader's activity starts as a draft and needs their manager (RO, or
 * anyone above them in their chain) to approve it and later verify its
 * evidence. Activities organized by an RO or above are approved on creation and
 * self-verified when their organizer submits evidence.
 */

export type Actor = { userId: string; role: UserRole };

const ACTIVITIES_ROUTE_BY_ROLE: Partial<Record<UserRole, string>> = {
  developer: "/Head-of-RO/activities",
  "head-ro": "/Head-of-RO/activities",
  sro: "/SRO/activities",
  ro: "/RO/activities",
  "youth-leader": "/youth-leader/activities",
  volunteer: "/volunteer/activities",
};

/** An organizer may mark an activity as started this long before its start time. */
const START_WINDOW_MS = 60 * 60 * 1000;

/** When someone else changed the activity between reading it and saving. */
const STALE_MESSAGE = "This activity was just updated by someone else — refresh to see it";

const PRIVATE_STATUSES: ActivityStatus[] = ["draft", "submitted", "rejected"];
const EDITABLE_STATUSES: ActivityStatus[] = ["draft", "rejected", "planned"];
const CANCELLABLE_STATUSES: ActivityStatus[] = ["draft", "submitted", "rejected", "planned", "ongoing"];
const REVIEW_QUEUE_STATUSES: ActivityStatus[] = ["submitted", "evidence-submitted"];

const ORG_WIDE_ROLES: UserRole[] = ["head-ro", "developer"];
const isOrgWide = (actor: Actor) => ORG_WIDE_ROLES.includes(actor.role);
const needsApproval = (activity: Pick<Activity, "organizerRole">) => activity.organizerRole === "youth-leader";
const primaryOrganizer = (activity: Pick<Activity, "organizerIds">) => activity.organizerIds[0] ?? "";

async function requireActivity(activityId: string): Promise<Activity> {
  const activity = await getDocById<Activity>("events", activityId);
  if (!activity) throw new NotFoundError("Activity not found");
  return { ...activity, attendees: activity.attendees ?? [], organizerIds: activity.organizerIds ?? [] };
}

// ---------------------------------------------------------------------------
// Permissions

/**
 * Whether the actor reviews this activity's organizer: org-wide roles review
 * everyone; otherwise the organizer must be below the actor in their chain.
 * `teamIds` (the actor's whole team) avoids a chain walk per activity in lists.
 */
async function isReviewerOf(actor: Actor, activity: Activity, teamIds?: Set<string>): Promise<boolean> {
  if (isOrgWide(actor)) return true;
  if (actor.role !== "ro" && actor.role !== "sro") return false;
  const organizerId = primaryOrganizer(activity);
  if (!organizerId || organizerId === actor.userId) return false;
  return teamIds ? teamIds.has(organizerId) : isInManagerChain(actor.userId, organizerId);
}

export function computePermissions(activity: Activity, actor: Actor, isReviewer: boolean, now = new Date()): ActivityPermissions {
  const status = activity.status;
  const isOrganizer = activity.organizerIds.includes(actor.userId);
  const isAttending = activity.attendees.includes(actor.userId);
  const start = toDate(activity.startDate);
  const end = toDate(activity.endDate);
  const hasEnded = !!end && end <= now;
  const hasRoom = !activity.maxAttendees || activity.attendees.length < activity.maxAttendees;
  const openForSignUp = (status === "planned" || status === "ongoing") && !hasEnded;

  return {
    // A youth leader editing their approved activity sends it back for approval (see updateActivity).
    canEdit: EDITABLE_STATUSES.includes(status) && (isOrgWide(actor) || isOrganizer),
    canDelete: isOrgWide(actor) || (isOrganizer && ["draft", "rejected", "cancelled"].includes(status)),
    canSubmit: isOrganizer && (status === "draft" || status === "rejected"),
    canWithdraw: isOrganizer && status === "submitted" && !activity.reapproval,
    canReview: isReviewer && status === "submitted",
    canStart: isOrganizer && status === "planned" && !!start && start.getTime() - START_WINDOW_MS <= now.getTime(),
    canSubmitEvidence: isOrganizer && (status === "ongoing" || (status === "planned" && !!start && start <= now)),
    canVerify: isReviewer && status === "evidence-submitted",
    canCancel: (isOrganizer || isReviewer) && CANCELLABLE_STATUSES.includes(status),
    canJoin: !isOrganizer && !isAttending && openForSignUp && hasRoom,
    canLeave: isAttending && openForSignUp,
    canViewEvidence: !!activity.evidence && (isOrganizer || isReviewer),
  };
}

// ---------------------------------------------------------------------------
// Reads

/**
 * Whose activities the actor sees: Head RO / developer everyone's (null);
 * anyone else only their own chain — themselves, everyone above them and
 * everyone below them. Activities run by Head RO / developer are seen by all.
 */
async function activityScope(actor: Actor): Promise<Set<string> | null> {
  return isOrgWide(actor) ? null : getChainIds(actor.userId);
}

function inScope(activity: Activity, actor: Actor, scope: Set<string> | null): boolean {
  if (!scope) return true;
  if (activity.organizerIds.includes(actor.userId) || activity.attendees.includes(actor.userId)) return true;
  return (!!activity.organizerRole && ORG_WIDE_ROLES.includes(activity.organizerRole)) || scope.has(primaryOrganizer(activity));
}

async function requireInScope(activity: Activity, actor: Actor) {
  if (!inScope(activity, actor, await activityScope(actor))) throw new NotFoundError("Activity not found");
}

/** Every activity organized by someone in the scope, plus Head RO / developer activities. */
async function activitiesInScope(scope: Set<string>): Promise<Activity[]> {
  const [byChain, byOrgWide] = await Promise.all([
    Promise.all(
      chunk([...scope]).map((ids) => queryDocs<Activity>("events", [{ field: "organizerIds", operator: "array-contains-any", value: ids }]))
    ),
    queryDocs<Activity>("events", [{ field: "organizerRole", operator: "in", value: ORG_WIDE_ROLES }]),
  ]);
  const byId = new Map([...byChain.flat(), ...byOrgWide].map((activity) => [activity.id, activity]));
  return [...byId.values()].map((activity) => ({ ...activity, attendees: activity.attendees ?? [], organizerIds: activity.organizerIds ?? [] }));
}

async function enrichForList(activities: Activity[], actor: Actor): Promise<ActivityListItem[]> {
  const organizerIds = [...new Set(activities.map(primaryOrganizer).filter(Boolean))];
  const organizers = await getDocsByIds<User>("users", organizerIds);
  const nameById = new Map(organizers.map((user) => [user.id, user.name]));
  const roleById = new Map(organizers.map((user) => [user.id, user.role]));

  // One team lookup for the whole list instead of a chain walk per activity.
  const needsTeam = (actor.role === "ro" || actor.role === "sro") && activities.some(needsApproval);
  const teamIds = needsTeam ? (await getTeam(actor.userId)).memberIds : undefined;

  const now = new Date();
  return Promise.all(
    activities.map(async (raw) => {
      const activity = { ...raw, attendees: raw.attendees ?? [], organizerIds: raw.organizerIds ?? [] };
      const isReviewer = await isReviewerOf(actor, activity, teamIds);
      return {
        ...activity,
        organizerName: nameById.get(primaryOrganizer(activity)) || "Unknown organizer",
        // Older activities didn't record it; fall back to the organizer's current role.
        organizerRole: activity.organizerRole ?? roleById.get(primaryOrganizer(activity)),
        attendeeCount: activity.attendees.length,
        isAttending: activity.attendees.includes(actor.userId),
        isOrganizer: activity.organizerIds.includes(actor.userId),
        permissions: computePermissions(activity, actor, isReviewer, now),
      };
    })
  );
}

/** Drafts are private to their organizer; proposals under review also to their reviewers. */
function isVisibleTo(item: ActivityListItem, actor: Actor): boolean {
  if (item.status === "draft") return item.isOrganizer;
  // Sign-ups keep seeing an activity whose changes are awaiting approval.
  if (PRIVATE_STATUSES.includes(item.status)) {
    return item.isOrganizer || isOrgWide(actor) || item.permissions.canReview || item.isAttending;
  }
  return true;
}

const byStartDate = (direction: 1 | -1) => (a: Activity, b: Activity) =>
  direction * ((toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0));

export type ActivityView = "all" | "mine" | "joined" | "review";

/**
 * Activities for a portal's list.
 * - all: upcoming (not yet ended, soonest first) or past activities, one page at a time.
 * - mine: every activity the actor organizes, newest first.
 * - joined: every activity the actor signed up for, soonest first.
 * - review: proposals and evidence awaiting the actor's decision.
 */
export async function listActivities(options: {
  view: ActivityView;
  when: "upcoming" | "past";
  actor: Actor;
  pageSize: number;
  pageNumber: number;
}): Promise<Page<ActivityListItem>> {
  const { view, when, actor, pageSize, pageNumber } = options;
  try {
    if (view === "all") {
      const now = new Date();
      const scope = await activityScope(actor);
      if (scope) {
        // Chain-scoped: fetch the chain's activities, then filter, sort and page in memory.
        const ended = (activity: Activity) => (toDate(activity.endDate)?.getTime() ?? 0) < now.getTime();
        const matching = (await activitiesInScope(scope))
          .filter((activity) => (when === "upcoming" ? !ended(activity) : ended(activity)))
          .sort((a, b) => (when === "upcoming" ? 1 : -1) * ((toDate(a.endDate)?.getTime() ?? 0) - (toDate(b.endDate)?.getTime() ?? 0)));
        const visible = (await enrichForList(matching, actor)).filter((item) => isVisibleTo(item, actor));
        const start = (pageNumber - 1) * pageSize;
        return {
          items: visible.slice(start, start + pageSize),
          page: pageNumber,
          pageSize,
          hasMore: visible.length > start + pageSize,
        };
      }
      const page = await queryPage<Activity>(
        "events",
        [{ field: "endDate", operator: when === "upcoming" ? ">=" : "<", value: now }],
        { field: "endDate", direction: when === "upcoming" ? "asc" : "desc" },
        { pageSize, pageNumber }
      );
      const items = (await enrichForList(page.items, actor)).filter((item) => isVisibleTo(item, actor));
      return { ...page, items };
    }

    let activities: Activity[] = [];
    if (view === "mine") {
      activities = (await queryDocs<Activity>("events", [{ field: "organizerIds", operator: "array-contains", value: actor.userId }])).sort(
        byStartDate(-1)
      );
    } else if (view === "joined") {
      activities = (await queryDocs<Activity>("events", [{ field: "attendees", operator: "array-contains", value: actor.userId }])).sort(
        byStartDate(1)
      );
    } else if (isOrgWide(actor) || actor.role === "ro" || actor.role === "sro") {
      activities = (await queryDocs<Activity>("events", [{ field: "status", operator: "in", value: REVIEW_QUEUE_STATUSES }])).sort(
        byStartDate(1)
      );
    }

    let items = await enrichForList(activities, actor);
    if (view === "review") items = items.filter((item) => item.permissions.canReview || item.permissions.canVerify);
    return { items, page: 1, pageSize: items.length, hasMore: false };
  } catch (error) {
    logger.error(`Error listing activities (${view})`, error);
    throw error;
  }
}

type Person = { id: string; name: string; role: UserRole };

export type ActivityDetail = ActivityListItem & {
  /** Everyone signed up (organizers and reviewers only). */
  attendeeList?: Person[];
  /** Who took part, from the submitted evidence. */
  participantList?: Person[];
  /** Who the organizer may mark as a participant: attendees plus their own team. */
  candidateList?: (Person & { signedUp: boolean })[];
  /** The organizer's contact details and reporting chain, for the people who manage the activity. */
  organizerProfile?: MemberProfile;
};

const toPerson = (user: User): Person => ({ id: user.id, name: user.name, role: user.role });
const byName = (a: Person, b: Person) => a.name.localeCompare(b.name);

/** One activity with attendee / participant names for the people who manage it. */
export async function getActivityDetail(activityId: string, actor: Actor): Promise<ActivityDetail> {
  const activity = await requireActivity(activityId);
  await requireInScope(activity, actor);
  const [item] = await enrichForList([activity], actor);
  if (!isVisibleTo(item, actor)) throw new NotFoundError("Activity not found");

  const { canReview, canVerify, canViewEvidence } = item.permissions;
  const canManage = item.isOrganizer || isOrgWide(actor) || canReview || canVerify || canViewEvidence;
  if (!canManage) return item;

  const teamIds = item.permissions.canSubmitEvidence ? [...(await getTeam(primaryOrganizer(activity))).memberIds] : [];
  const [people, profiles] = await Promise.all([
    getDocsByIds<User>("users", [...new Set([...activity.attendees, ...(activity.evidence?.participantIds ?? []), ...teamIds])]),
    getMemberProfiles([primaryOrganizer(activity)]),
  ]);
  const personById = new Map(people.map((user) => [user.id, user]));
  const peopleFor = (ids: string[]) => ids.flatMap((id) => (personById.has(id) ? [toPerson(personById.get(id)!)] : [])).sort(byName);

  return {
    ...item,
    organizerProfile: profiles.get(primaryOrganizer(activity)),
    attendeeList: peopleFor(activity.attendees),
    participantList: activity.evidence ? peopleFor(activity.evidence.participantIds) : undefined,
    candidateList: item.permissions.canSubmitEvidence
      ? peopleFor([...new Set([...activity.attendees, ...teamIds])]).map((person) => ({
          ...person,
          signedUp: activity.attendees.includes(person.id),
        }))
      : undefined,
  };
}

export async function getActivityById(activityId: string): Promise<Activity | null> {
  return getDocById<Activity>("events", activityId);
}

// ---------------------------------------------------------------------------
// Writes

/**
 * An activity just opened for sign-ups: tell everyone who can see and join it
 * (Head RO, plus the organizer's chain — or everyone, for an activity Head RO
 * or a developer runs), except the organizer and whoever approved it. Each
 * person can turn these off with their "New activity alerts" setting.
 */
async function notifyNewActivity(
  activity: Pick<Activity, "id" | "title" | "location" | "startDate" | "organizerIds" | "organizerRole">,
  exceptIds: string[]
) {
  try {
    const organizerId = primaryOrganizer(activity);
    const runByOrgWide = !!activity.organizerRole && ORG_WIDE_ROLES.includes(activity.organizerRole);
    const [headRoIds, tree, chainIds] = await Promise.all([
      getUserIdsByRoles(ORG_WIDE_ROLES),
      getPerformanceTree(),
      runByOrgWide || !organizerId ? Promise.resolve(null) : getChainIds(organizerId),
    ]);

    const excluded = new Set([...exceptIds, ...activity.organizerIds]);
    const teamIds = chainIds ? [...chainIds] : Object.keys(tree.nodes);
    const recipients = await filterUsersByPreference(
      [...new Set([...headRoIds, ...teamIds])].filter((id) => !excluded.has(id)),
      "event-created"
    );

    // Group by portal so each link opens the recipient's own Activities page.
    const byRoute = new Map<string, string[]>();
    recipients.forEach((id) => {
      const route = tree.nodes[id] ? ACTIVITIES_ROUTE_BY_ROLE[tree.nodes[id].role] : "/Head-of-RO/activities";
      if (route) byRoute.set(route, [...(byRoute.get(route) ?? []), id]);
    });
    await Promise.all(
      [...byRoute.entries()].map(([route, ids]) =>
        notifyUsers(ids, {
          type: "event-created",
          title: `New activity "${activity.title}" is open for sign-ups`,
          message: `${activity.location} · ${formatDate(toDate(activity.startDate))}`,
          relatedId: activity.id,
          relatedType: "event",
          actionUrl: route,
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify people of new activity ${activity.id}`, error);
  }
}

/**
 * `organizer` is who the activity belongs to (the portal user a developer acts
 * as); `actorUserId` is who actually did it, for the audit log.
 */
export async function createActivity(data: CreateActivityRequest, organizer: Actor, actorUserId = organizer.userId): Promise<Activity> {
  try {
    const activityId = crypto.randomUUID();
    const status: ActivityStatus = organizer.role === "youth-leader" ? "draft" : "planned";

    const activityData: Omit<Activity, "id"> = {
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

    const activity = await createDoc<Activity>("events", activityId, activityData as Activity);

    await createActivityLog({
      userId: actorUserId,
      action: "event-created",
      description: `${status === "draft" ? "Drafted" : "Created"} activity "${data.title}"`,
      entityType: "event",
      entityId: activityId,
    });

    if (status === "planned") await notifyNewActivity({ ...activityData, id: activityId }, [organizer.userId, actorUserId]);

    logger.info(`Activity created: ${activityId} by ${organizer.userId} (${status})`);
    return { ...activity, id: activityId };
  } catch (error) {
    logger.error("Error creating activity", error);
    throw error;
  }
}

async function permissionsFor(activity: Activity, actor: Actor) {
  return computePermissions(activity, actor, await isReviewerOf(actor, activity));
}

export async function updateActivity(activityId: string, data: UpdateActivityRequest, actor: Actor): Promise<Activity> {
  try {
    const activity = await requireActivity(activityId);
    if (!(await permissionsFor(activity, actor)).canEdit) {
      throw new AuthorizationError(
        EDITABLE_STATUSES.includes(activity.status)
          ? "You can't edit this activity"
          : "This activity can no longer be edited"
      );
    }

    // Validate the resulting date range, not just the fields that were sent.
    const start = data.startDate ?? toDate(activity.startDate);
    const end = data.endDate ?? toDate(activity.endDate);
    if (start && end && end <= start) {
      throw new ValidationError("End date must be after start date", { endDate: ["End date must be after start date"] });
    }
    if (data.maxAttendees && data.maxAttendees < activity.attendees.length) {
      throw new ValidationError(`${activity.attendees.length} people have already signed up`, {
        maxAttendees: [`Must be at least ${activity.attendees.length} (already signed up)`],
      });
    }

    // A youth leader changing their approved activity sends it back to their RO, and sign-ups are told.
    const needsReapproval =
      activity.status === "planned" && needsApproval(activity) && activity.organizerIds.includes(actor.userId) && !isOrgWide(actor);
    if (needsReapproval) {
      const saved = await updateDocIfStatus("events", activityId, "planned", {
        ...data,
        status: "submitted",
        submittedAt: new Date(),
        reviewComment: null,
        reapproval: true,
      });
      if (!saved) throw new ConflictError(STALE_MESSAGE);
      const actorName = (await getDocById<User>("users", actor.userId))?.name || "The organizer";
      const title = data.title ?? activity.title;
      await notifyReviewers(activity, `${actorName} changed "${title}"`, "It was approved before; review the new details on your Activities page.");
      await notifyAttendees(activity, `"${title}" was changed`, "Its new details are awaiting approval — check the date and venue.");
    } else {
      // updateDoc treats null as "remove the field" (clears maxAttendees).
      await updateDoc<Activity>("events", activityId, data as Partial<Activity>);
    }

    await createActivityLog({
      userId: actor.userId,
      action: "event-updated",
      description: `Updated activity "${activity.title}"`,
      entityType: "event",
      entityId: activityId,
    });

    logger.info(`Activity updated: ${activityId}`);
    return requireActivity(activityId);
  } catch (error) {
    logger.error(`Error updating activity ${activityId}`, error);
    throw error;
  }
}

export async function deleteActivity(activityId: string, actor: Actor): Promise<void> {
  try {
    const activity = await requireActivity(activityId);
    if (!(await permissionsFor(activity, actor)).canDelete) {
      throw new AuthorizationError("Only drafts, rejected and cancelled activities can be deleted. Cancel it instead.");
    }

    await deleteDocFromFirestore("events", activityId);

    await createActivityLog({
      userId: actor.userId,
      action: "other",
      description: `Deleted activity "${activity.title}"`,
      entityType: "event",
      entityId: activityId,
    });

    logger.info(`Activity deleted: ${activityId}`);
  } catch (error) {
    logger.error(`Error deleting activity ${activityId}`, error);
    throw error;
  }
}

export type EvidenceInput = { summary: string; participantIds: string[]; attachments: ReportAttachment[] };

type WorkflowInput = { action: ActivityWorkflowAction; comment?: string; evidence?: EvidenceInput };

/** Who approves a youth leader's activities: their manager, or Head ROs if they have none. */
async function reviewerIdsFor(activity: Activity): Promise<string[]> {
  const organizer = await getDocById<User>("users", primaryOrganizer(activity));
  const managerId = organizer && "reportingToId" in organizer ? organizer.reportingToId : "";
  return managerId ? [managerId] : getUserIdsByRoles(["head-ro"]);
}

async function notifyReviewers(activity: Activity, title: string, message: string) {
  try {
    const reviewerIds = await reviewerIdsFor(activity);
    const reviewers = await getDocsByIds<User>("users", reviewerIds);
    await Promise.all(
      reviewers.map((reviewer) =>
        notifyUsers([reviewer.id], {
          type: "event-updated",
          title,
          message,
          relatedId: activity.id,
          relatedType: "event",
          actionUrl: ACTIVITIES_ROUTE_BY_ROLE[reviewer.role],
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify reviewers of activity ${activity.id}`, error);
  }
}

async function notifyOrganizers(activity: Activity, title: string, message: string, exceptId: string) {
  try {
    const organizers = await getDocsByIds<User>(
      "users",
      activity.organizerIds.filter((id) => id !== exceptId)
    );
    await Promise.all(
      organizers.map((organizer) =>
        notifyUsers([organizer.id], {
          type: "event-updated",
          title,
          message,
          relatedId: activity.id,
          relatedType: "event",
          actionUrl: ACTIVITIES_ROUTE_BY_ROLE[organizer.role],
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify organizers of activity ${activity.id}`, error);
  }
}

async function notifyAttendees(activity: Activity, title: string, message: string) {
  if (activity.attendees.length === 0) return;
  try {
    const attendees = await getDocsByIds<User>("users", activity.attendees);
    await Promise.all(
      attendees.map((attendee) =>
        notifyUsers([attendee.id], {
          type: "event-updated",
          title,
          message,
          relatedId: activity.id,
          relatedType: "event",
          actionUrl: ACTIVITIES_ROUTE_BY_ROLE[attendee.role],
        })
      )
    );
  } catch (error) {
    logger.error(`Failed to notify attendees of activity ${activity.id}`, error);
  }
}

/** Participants must have signed up, or be in the organizer's own team. */
async function validateEvidence(activity: Activity, evidence: EvidenceInput) {
  const allowed = new Set([...activity.attendees, ...(await getTeam(primaryOrganizer(activity))).memberIds]);
  const unknown = evidence.participantIds.filter((id) => !allowed.has(id));
  if (unknown.length > 0) {
    throw new ValidationError("Participants must have signed up for this activity or be in your team", {
      participantIds: ["Some selected participants can't be credited for this activity"],
    });
  }
  await requireOwnAttachments(evidence.attachments, primaryOrganizer(activity));
}

/**
 * Issues the activity's certificates and returns how many it has in total.
 * Safe to repeat: people who already hold one are skipped, so a retry after a
 * failure finishes the job without duplicates.
 */
async function issueCertificatesFor(activity: Activity, issuedById: string): Promise<number> {
  await issueActivityCertificates(activity, issuedById);
  return getDocCount("certificates", [{ field: "eventId", operator: "==", value: activity.id }]);
}

/**
 * Moves an activity through the activity workflow. `actor` is who the action is
 * taken as (a developer acting in a portal acts as that portal's user);
 * `auditUserId` is who actually did it.
 */
export async function runActivityWorkflow(
  activityId: string,
  input: WorkflowInput,
  actor: Actor,
  auditUserId = actor.userId
): Promise<Activity> {
  try {
    const activity = await requireActivity(activityId);
    const permissions = await permissionsFor(activity, actor);
    const actorUser = await getDocById<User>("users", actor.userId);
    const actorName = actorUser?.name || "Someone";
    const reviewStamp = { reviewedBy: actor.userId, reviewedByName: actorName, reviewedAt: new Date() };
    const deny = (message: string): never => {
      throw new ConflictError(message);
    };

    let changes: Record<string, unknown> = {};
    let expectedStatus: string = activity.status;
    let logText = "";
    let after: () => Promise<void> = async () => {};

    switch (input.action) {
      case "submit":
        if (!permissions.canSubmit) deny("Only a draft or rejected activity can be submitted for review");
        changes = { status: "submitted", submittedAt: new Date(), reviewComment: null };
        logText = `Submitted activity "${activity.title}" for review`;
        after = () =>
          notifyReviewers(activity, `${actorName} submitted "${activity.title}" for approval`, `${activity.location} · review it on your Activities page.`);
        break;

      case "withdraw":
        if (!permissions.canWithdraw) deny("Only a proposal awaiting approval can be withdrawn");
        changes = { status: "draft", submittedAt: null };
        logText = `Withdrew activity "${activity.title}" to draft`;
        break;

      case "approve":
        if (!permissions.canReview) deny("This activity isn't awaiting your approval");
        changes = { status: "planned", ...reviewStamp, reviewComment: input.comment || null, reapproval: null };
        logText = `Approved activity "${activity.title}"`;
        after = async () => {
          await notifyOrganizers(activity, `"${activity.title}" was approved`, input.comment || "Volunteers can now sign up.", actor.userId);
          // Changes to an activity people already signed up for: tell them, not everyone again.
          if (activity.reapproval) {
            await notifyAttendees(activity, `"${activity.title}" is confirmed`, `${activity.location} · ${formatDate(toDate(activity.startDate))}`);
          } else {
            await notifyNewActivity(activity, [actor.userId, auditUserId]);
          }
        };
        break;

      case "reject":
        if (!permissions.canReview) deny("This activity isn't awaiting your approval");
        if (!input.comment || input.comment.length < 3) {
          throw new ValidationError("Please give a reason for rejecting this activity", { comment: ["A reason is required"] });
        }
        changes = { status: "rejected", ...reviewStamp, reviewComment: input.comment };
        logText = `Rejected activity "${activity.title}"`;
        after = () => notifyOrganizers(activity, `"${activity.title}" needs changes`, input.comment!, actor.userId);
        break;

      case "start":
        if (!permissions.canStart) deny("This activity can't be started yet");
        // Clear the approval note so an "ongoing" comment always means returned evidence.
        changes = { status: "ongoing", reviewComment: null };
        logText = `Started activity "${activity.title}"`;
        break;

      case "submit-evidence": {
        if (!permissions.canSubmitEvidence) deny("Evidence can only be submitted once the activity has started");
        if (!input.evidence) throw new ValidationError("Evidence is required");
        await validateEvidence(activity, input.evidence);
        const evidence = { ...input.evidence, submittedBy: actor.userId, submittedAt: new Date() };
        if (needsApproval(activity)) {
          changes = { status: "evidence-submitted", evidence, reviewComment: null };
          logText = `Submitted evidence for activity "${activity.title}"`;
          after = () =>
            notifyReviewers(
              activity,
              `${actorName} submitted evidence for "${activity.title}"`,
              `${evidence.participantIds.length} participant(s) · verify it to issue certificates.`
            );
        } else {
          // Organized by an RO or above (a training or meeting): nobody else to verify, so it
          // completes now, and it issues no certificates.
          changes = { status: "completed", evidence, ...reviewStamp, reviewComment: null };
          logText = `Completed activity "${activity.title}"`;
        }
        break;
      }

      case "return-evidence":
        if (!permissions.canVerify) deny("This activity's evidence isn't awaiting your verification");
        if (!input.comment || input.comment.length < 3) {
          throw new ValidationError("Please say what needs to change", { comment: ["A reason is required"] });
        }
        changes = { status: "ongoing", ...reviewStamp, reviewComment: input.comment };
        logText = `Returned evidence for activity "${activity.title}"`;
        after = () => notifyOrganizers(activity, `Evidence for "${activity.title}" was returned`, input.comment!, actor.userId);
        break;

      case "verify": {
        if (!permissions.canVerify) deny("This activity's evidence isn't awaiting your verification");
        // Mark it completed first, so a Return pressed at the same moment can't undo it after certificates exist.
        const claimed = await updateDocIfStatus("events", activityId, "evidence-submitted", {
          status: "completed",
          ...reviewStamp,
          reviewComment: input.comment || null,
        });
        if (!claimed) deny(STALE_MESSAGE);
        expectedStatus = "completed";
        // If issuing fails it goes back to awaiting verification, so Verify can simply be pressed again.
        const certificateCount = await issueCertificatesFor(activity, actor.userId).catch(async (error) => {
          await updateDocIfStatus("events", activityId, "completed", { status: "evidence-submitted" });
          throw error;
        });
        changes = { status: "completed", certificatesIssuedAt: new Date(), certificateCount };
        logText = `Verified activity "${activity.title}"`;
        after = () =>
          notifyOrganizers(activity, `"${activity.title}" was verified`, `${certificateCount} certificate(s) issued.`, actor.userId);
        break;
      }

      case "cancel":
        if (!permissions.canCancel) deny("This activity can't be cancelled");
        changes = { status: "cancelled" };
        logText = `Cancelled activity "${activity.title}"`;
        after = async () => {
          await notifyAttendees(activity, `"${activity.title}" was cancelled`, `${activity.location} · ${formatDate(toDate(activity.startDate))}`);
          if (!activity.organizerIds.includes(actor.userId)) {
            await notifyOrganizers(activity, `"${activity.title}" was cancelled by ${actorName}`, input.comment || "", actor.userId);
          }
        };
        break;
    }

    // Only if nobody else moved it on since it was read (two reviewers, or a double click).
    if (!(await updateDocIfStatus("events", activityId, expectedStatus, changes))) deny(STALE_MESSAGE);
    await createActivityLog({
      userId: auditUserId,
      action: "event-updated",
      description: auditUserId === actor.userId ? logText : `${logText} on behalf of ${actor.userId}`,
      entityType: "event",
      entityId: activityId,
      changes: { status: { oldValue: activity.status, newValue: changes.status } },
    });
    await after();

    logger.info(`Activity ${activityId}: ${input.action} by ${actor.userId}`);
    return requireActivity(activityId);
  } catch (error) {
    logger.error(`Error running "${input.action}" on activity ${activityId}`, error);
    throw error;
  }
}

/** Sign up for (or withdraw from) an approved activity. */
export async function setActivityAttendance(activityId: string, join: boolean, actor: Actor): Promise<Activity> {
  try {
    const activity = await requireActivity(activityId);
    const permissions = await permissionsFor(activity, actor);

    if (join) {
      if (activity.attendees.includes(actor.userId)) return activity;
      await requireInScope(activity, actor);
      if (!permissions.canJoin) {
        throw new ConflictError(
          activity.maxAttendees && activity.attendees.length >= activity.maxAttendees
            ? "This activity is full"
            : "Sign-ups are closed for this activity"
        );
      }
    } else {
      if (!activity.attendees.includes(actor.userId)) return activity;
      if (!permissions.canLeave) throw new ConflictError("You can't withdraw from this activity any more");
    }

    // Atomic, so two people joining at once can't drop each other or overfill the activity.
    const updated = await updateDocAtomically<Activity>("events", activityId, (current) => {
      const list = current.attendees ?? [];
      if (!join) return list.includes(actor.userId) ? { attendees: list.filter((id) => id !== actor.userId) } : null;
      if (list.includes(actor.userId)) return null;
      if (current.maxAttendees && list.length >= current.maxAttendees) throw new ConflictError("This activity is full");
      return { attendees: [...list, actor.userId] };
    });
    const attendees = updated.attendees ?? [];

    await createActivityLog({
      userId: actor.userId,
      action: "other",
      description: `${join ? "Signed up for" : "Withdrew from"} activity "${activity.title}"`,
      entityType: "event",
      entityId: activityId,
    });

    return { ...activity, attendees };
  } catch (error) {
    logger.error(`Error updating attendance for activity ${activityId}`, error);
    throw error;
  }
}

/** One evidence PDF, for the organizer and their reviewers. */
export async function getEvidenceAttachment(
  activityId: string,
  index: number,
  actor: Actor
): Promise<{ attachment: ReportAttachment; ownerId: string }> {
  const activity = await requireActivity(activityId);
  if (!(await permissionsFor(activity, actor)).canViewEvidence) throw new AuthorizationError();
  const attachment = activity.evidence?.attachments?.[index];
  if (!attachment) throw new NotFoundError("Attachment not found");
  // Evidence is uploaded by the primary organizer (see validateEvidence).
  return { attachment, ownerId: primaryOrganizer(activity) };
}

/** Activities a user organizes, grouped by workflow stage (for dashboards). */
export async function countActivitiesByStatus(organizerId: string): Promise<Partial<Record<ActivityStatus, number>>> {
  const activities = await queryDocs<Activity>("events", [{ field: "organizerIds", operator: "array-contains", value: organizerId }]);
  const counts: Partial<Record<ActivityStatus, number>> = {};
  activities.forEach((activity) => (counts[activity.status] = (counts[activity.status] || 0) + 1));
  return counts;
}
