import { createDoc, deleteDocFromFirestore, getDocById, queryDocs, updateDoc } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { isInManagerChain } from "@/utils/authorization";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError, logger } from "@/utils/errors";
import { createActivityLog } from "./activitylog.service";
import { notifyUsers } from "./notification.service";
import { createUser, getUserById, requireMemberIdAvailable } from "./user.service";
import { normalizeMemberId } from "@/utils/member-id";
import type { UserRole } from "@/types/user.types";
import type {
  CreateMemberRequest,
  MemberRequest,
  MemberRequestRole,
  MemberRequestStatus,
} from "@/types/member-request.types";

/**
 * Member Requests - managers below Head RO can't create accounts directly.
 * An RO requests a youth leader (their SRO approves); a youth leader requests
 * a volunteer (their RO approves). Approving creates the account under the
 * requester and emails credentials; rejecting needs a reason.
 */

type Caller = { userId: string; role: UserRole };

type RequestRule = {
  collection: string;
  requesterRole: UserRole;
  approverRole: UserRole;
  /** Field storing the approver's id (youth leader requests predate the generic name). */
  approverField: "sroId" | "approverId";
  label: string;
  approverTitle: string;
  approverRoute: string;
  requesterRoute: string;
};

const RULES: Record<MemberRequestRole, RequestRule> = {
  "youth-leader": {
    collection: "youthLeaderRequests",
    requesterRole: "ro",
    approverRole: "sro",
    approverField: "sroId",
    label: "youth leader",
    approverTitle: "SRO",
    approverRoute: "/SRO/youth-leaders",
    requesterRoute: "/RO/youth-leaders",
  },
  volunteer: {
    collection: "volunteerRequests",
    requesterRole: "youth-leader",
    approverRole: "ro",
    approverField: "approverId",
    label: "volunteer",
    approverTitle: "RO",
    approverRoute: "/RO/volunteers",
    requesterRoute: "/youth-leader/volunteers",
  },
};

type StoredRequest = Omit<MemberRequest, "role" | "approverId"> & { role?: MemberRequestRole; approverId?: string; sroId?: string };

function normalize(role: MemberRequestRole, stored: StoredRequest): MemberRequest {
  const { sroId, ...rest } = stored;
  return { ...rest, role, approverId: stored.approverId ?? sroId ?? "" };
}

const newestFirst = (a: MemberRequest, b: MemberRequest) =>
  (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0);

async function getRequest(role: MemberRequestRole, requestId: string): Promise<MemberRequest> {
  const request = await getDocById<StoredRequest>(RULES[role].collection, requestId);
  if (!request) throw new NotFoundError("Request not found");
  return normalize(role, request);
}

export async function createMemberRequest(
  role: MemberRequestRole,
  data: CreateMemberRequest,
  requesterId: string,
  createdByUserId: string
): Promise<MemberRequest> {
  const rule = RULES[role];
  try {
    const requester = await getUserById(requesterId);
    if (!requester || requester.role !== rule.requesterRole) {
      throw new AuthorizationError(`Only a ${rule.requesterRole} can request a new ${rule.label}`);
    }
    const approverId = "reportingToId" in requester ? requester.reportingToId : "";
    if (!approverId) {
      throw new ValidationError(
        `You aren't assigned to an ${rule.approverTitle} yet, so there's no one to approve this request.`
      );
    }

    const email = data.email.trim().toLowerCase();
    const [existingUsers, existingRequests] = await Promise.all([
      queryDocs("users", [{ field: "email", operator: "==", value: email }]),
      queryDocs<StoredRequest>(rule.collection, [{ field: "email", operator: "==", value: email }]),
    ]);
    if (existingUsers.length > 0) throw new ConflictError(`A user with email ${email} already exists`);
    if (existingRequests.some((request) => request.status === "pending")) {
      throw new ConflictError(`A request for ${email} is already awaiting approval`);
    }
    const memberId = data.memberId ? normalizeMemberId(data.memberId) : undefined;
    if (memberId) await requireIdNotRequested(rule, memberId);

    const requestId = crypto.randomUUID();
    const stored = await createDoc<StoredRequest>(rule.collection, requestId, {
      role,
      name: data.name.trim(),
      email,
      phone: data.phone || undefined,
      region: data.region || undefined,
      university: data.university || undefined,
      memberId,
      requestedBy: requesterId,
      requestedByName: requester.name,
      [rule.approverField]: approverId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as StoredRequest);
    const request = normalize(role, { ...stored, id: requestId });

    // Approval is an action item, so the approver is always told (not preference-gated).
    await notifyUsers([approverId], {
      type: "user-added",
      title: `${requester.name} requested to add ${rule.label} ${request.name}`,
      message: `${email} — awaiting your approval`,
      relatedId: requestId,
      relatedType: "user",
      actionUrl: rule.approverRoute,
    }).catch((error) => logger.error(`Failed to notify approver ${approverId} of request ${requestId}`, error));

    await createActivityLog({
      userId: createdByUserId,
      action: "other",
      description: `Requested to add ${rule.label} ${request.name} (${email})`,
      entityType: "user",
      entityId: requestId,
    });

    return request;
  } catch (error) {
    logger.error(`Error creating ${rule.label} request`, error);
    throw error;
  }
}

/** The ID must be free, and not already claimed by another request awaiting approval. */
async function requireIdNotRequested(rule: RequestRule, memberId: string) {
  await requireMemberIdAvailable(memberId);
  const claimed = await queryDocs<StoredRequest>(rule.collection, [{ field: "memberId", operator: "==", value: memberId }]);
  if (claimed.some((request) => request.status === "pending")) {
    throw new ConflictError(`ID ${memberId} is already used in a request awaiting approval`);
  }
}

/** Requests the manager made, newest first. */
export async function getRequestsByRequester(role: MemberRequestRole, requesterId: string): Promise<MemberRequest[]> {
  const requests = await queryDocs<StoredRequest>(RULES[role].collection, [
    { field: "requestedBy", operator: "==", value: requesterId },
  ]);
  return requests.map((request) => normalize(role, request)).sort(newestFirst);
}

/** Requests awaiting (or decided by) the approver, pending first. */
export async function getRequestsForApprover(role: MemberRequestRole, approverId: string): Promise<MemberRequest[]> {
  const rule = RULES[role];
  const requests = await queryDocs<StoredRequest>(rule.collection, [
    { field: rule.approverField, operator: "==", value: approverId },
  ]);
  return requests
    .map((request) => normalize(role, request))
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || newestFirst(a, b));
}

/** Developers can act for anyone; otherwise the reviewer must be the approver role above the requester. */
async function requireCanReview(role: MemberRequestRole, caller: Caller, request: MemberRequest) {
  const rule = RULES[role];
  if (caller.role === "developer") return;
  if (caller.role !== rule.approverRole || !(await isInManagerChain(caller.userId, request.requestedBy))) {
    throw new AuthorizationError(`Only the requester's ${rule.approverTitle} can review this request`);
  }
}

export async function reviewMemberRequest(
  role: MemberRequestRole,
  requestId: string,
  decision: Exclude<MemberRequestStatus, "pending">,
  caller: Caller,
  comment?: string,
  /** The new member's ID; required on approval when the request doesn't carry one (volunteers). */
  memberId?: string
): Promise<MemberRequest> {
  const rule = RULES[role];
  try {
    const request = await getRequest(role, requestId);
    await requireCanReview(role, caller, request);
    if (request.status !== "pending") throw new ConflictError(`This request was already ${request.status}`);

    const reviewer = await getUserById(caller.userId);

    // Create the account first: if it fails (e.g. the email got taken), the
    // request stays pending so the approver can retry or reject it.
    let createdUserId: string | undefined;
    const assignedId = decision === "approved" ? request.memberId || (memberId && normalizeMemberId(memberId)) : undefined;
    if (decision === "approved") {
      if (!assignedId) throw new ValidationError(`Enter the new ${rule.label}'s ID to approve this request`);
      const user = await createUser(
        {
          email: request.email,
          name: request.name,
          phone: request.phone,
          region: request.region,
          university: request.university,
          role,
          parentId: request.requestedBy,
          memberId: assignedId,
        },
        caller.userId
      );
      createdUserId = user.id;
    }

    const changes = {
      status: decision,
      reviewedBy: caller.userId,
      reviewedByName: reviewer?.name || "Unknown",
      reviewedAt: new Date(),
      reviewComment: comment || undefined,
      createdUserId,
      memberId: assignedId || request.memberId,
    };
    await updateDoc(rule.collection, requestId, changes);

    await notifyUsers([request.requestedBy], {
      type: "user-added",
      title:
        decision === "approved"
          ? `${rule.label[0].toUpperCase()}${rule.label.slice(1)} ${request.name} was approved`
          : `Your request to add ${request.name} was rejected`,
      message:
        decision === "approved"
          ? `Their account was created and sign-in details were emailed to ${request.email}.`
          : comment || "",
      relatedId: createdUserId || requestId,
      relatedType: "user",
      actionUrl: rule.requesterRoute,
    }).catch((error) => logger.error(`Failed to notify ${request.requestedBy} of request ${requestId}`, error));

    await createActivityLog({
      userId: caller.userId,
      action: "other",
      description: `${decision === "approved" ? "Approved" : "Rejected"} ${rule.label} request for ${request.name} (${request.email})`,
      entityType: "user",
      entityId: requestId,
    });

    return { ...request, ...changes };
  } catch (error) {
    logger.error(`Error reviewing ${rule.label} request ${requestId}`, error);
    throw error;
  }
}

/** The requester (or a developer) can withdraw a request that hasn't been decided yet. */
export async function withdrawMemberRequest(role: MemberRequestRole, requestId: string, caller: Caller): Promise<void> {
  const rule = RULES[role];
  const request = await getRequest(role, requestId);
  if (caller.role !== "developer" && caller.userId !== request.requestedBy) {
    throw new AuthorizationError("Only the person who made this request can withdraw it");
  }
  if (request.status !== "pending") throw new ConflictError(`This request was already ${request.status}`);

  await deleteDocFromFirestore(rule.collection, requestId);
  await createActivityLog({
    userId: caller.userId,
    action: "other",
    description: `Withdrew ${rule.label} request for ${request.name} (${request.email})`,
    entityType: "user",
    entityId: requestId,
  });
}
