import {
  createDoc,
  updateDoc,
  deleteDocFromFirestore,
  queryDocs,
  queryPage,
  getDocById,
  getDocsByIds,
  getDocCount,
  batchWrite,
  type Filter,
  type Page,
} from "@/utils/firestore";
import {
  User,
  BaseUser,
  UserRole,
  UserStatus,
  CreateUserRequest,
  UpdateUserRequest,
  UserInvitation,
} from "@/types/user.types";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  logger,
} from "@/utils/errors";
import { MANAGER_FIELD_FOR, MANAGER_ROLES_FOR } from "@/utils/authorization";
import { normalizeMemberId } from "@/utils/member-id";
import { COHORT_ROLES, getCurrentCohort } from "./cohort.service";
import { OPEN_TASK_STATUSES } from "@/types/task.types";
import { createActivityLog } from "./activitylog.service";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { sendPasswordResetLinkEmail, sendUserCredentialsEmail } from "@/lib/mailer";
import { notifyUsers, getUserIdsByRoles, filterUsersByPreference } from "./notification.service";

/**
 * User Service - Handles all user-related operations
 */

/** Statuses that block sign-in; mirrored onto the Firebase Auth account's `disabled` flag. */
const DISABLED_STATUSES = new Set<UserStatus>(["inactive", "suspended"]);

const roleLabels: Record<UserRole, string> = {
  developer: "Developer",
  "head-ro": "Head RO",
  sro: "SRO",
  ro: "RO",
  "youth-leader": "Youth Leader",
  volunteer: "Volunteer",
};

type ReportingUser = User & { reportingToId?: string };

/** A user plus the display data list screens need, resolved server-side. */
export type UserListItem = ReportingUser & {
  reportingToName?: string;
  directReportCount?: number;
};

/**
 * Throws unless `managerId` is an existing user whose role may manage `role`
 * (e.g. an RO's manager must be an SRO).
 */
async function validateManager(role: UserRole, managerId: string): Promise<User> {
  const allowed = MANAGER_ROLES_FOR[role];
  if (!allowed) {
    throw new ValidationError(`A ${roleLabels[role]} can't be assigned a manager`);
  }

  const manager = await getUserById(managerId);
  if (!manager) {
    throw new ValidationError("The selected manager no longer exists");
  }
  if (!allowed.includes(manager.role)) {
    throw new ValidationError(
      `A ${roleLabels[role]} must report to a ${allowed.map((r) => roleLabels[r]).join(" or ")}, not a ${roleLabels[manager.role]}`
    );
  }
  return manager;
}

/**
 * Create a new user
 */
/** Throws if another user already has this program ID. */
export async function requireMemberIdAvailable(memberId: string, exceptUserId?: string): Promise<void> {
  const taken = await queryDocs<User>("users", [{ field: "memberId", operator: "==", value: normalizeMemberId(memberId) }]);
  if (taken.some((user) => user.id !== exceptUserId)) {
    throw new ConflictError(`ID ${normalizeMemberId(memberId)} is already in use`);
  }
}

export async function createUser(
  data: CreateUserRequest,
  createdByUserId: string
): Promise<User> {
  try {
    const email = data.email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await queryDocs<User>("users", [
      { field: "email", operator: "==", value: email },
    ]);

    if (existingUser.length > 0) {
      throw new ConflictError(`A user with email ${email} already exists`);
    }

    if (data.parentId) {
      await validateManager(data.role, data.parentId);
    }
    const memberId = data.memberId ? normalizeMemberId(data.memberId) : undefined;
    if (memberId) await requireMemberIdAvailable(memberId);

    const temporaryPassword = `${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}A!`;
    let authUser;
    try {
      authUser = await getFirebaseAdminAuth().createUser({
        email,
        password: temporaryPassword,
        displayName: data.name,
      });
    } catch (error) {
      if ((error as { code?: string }).code === "auth/email-already-exists") {
        throw new ConflictError(`A sign-in account for ${email} already exists`);
      }
      throw error;
    }
    const userId = authUser.uid;
    await getFirebaseAdminAuth().setCustomUserClaims(userId, { role: data.role });

    // Create user data based on role
    const baseUserData: Omit<BaseUser, "id"> = {
      email,
      name: data.name,
      memberId,
      university: data.university || undefined,
      teamRole: data.role === "volunteer" ? data.teamRole?.trim() || undefined : undefined,
      cohortId: COHORT_ROLES.includes(data.role) ? (await getCurrentCohort()).id : undefined,
      region: data.region,
      role: data.role,
      status: "pending", // Promoted to "active" on first sign-in (POST /api/auth/session)
      mustChangePassword: true, // Cleared once they replace the emailed password (POST /api/auth/password-changed)
      phone: data.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add role-specific fields
    const userData: Record<string, unknown> = { ...baseUserData };

    if (data.role === "sro") {
      userData.reportingToId = "";
      userData.assignedROIds = [];
    } else if (data.role === "ro") {
      userData.reportingToId = data.parentId || "";
      userData.assignedYouthLeaderIds = [];
      userData.assignedVolunteerIds = [];
    } else if (data.role === "youth-leader") {
      userData.reportingToId = data.parentId || "";
      userData.assignedVolunteerIds = [];
    } else if (data.role === "volunteer") {
      userData.reportingToId = data.parentId || "";
      userData.joinDate = new Date();
    }

    // Create user document in Firestore
    let user: User;
    try {
      user = await createDoc<User>("users", userId, userData as unknown as User);
      await sendUserCredentialsEmail(email, data.name, temporaryPassword, data.role);
    } catch (error) {
      await getFirebaseAdminAuth().deleteUser(userId).catch(() => undefined);
      await deleteDocFromFirestore("users", userId).catch(() => undefined);
      throw error;
    }

    // Reciprocally add this user to their manager's assigned-* array, so the
    // manager immediately sees the new report without a separate assign step.
    const managerField = MANAGER_FIELD_FOR[data.role];
    if (data.parentId && managerField) {
      try {
        const manager = await getUserById(data.parentId);
        const currentIds = ((manager as unknown as Record<string, string[] | undefined>)?.[managerField]) || [];
        await updateDoc("users", data.parentId, {
          [managerField]: [...new Set([...currentIds, userId])],
        });
      } catch (error) {
        logger.error(`Failed to add ${userId} to manager ${data.parentId}'s ${managerField}`, error);
      }
    }

    // Let Head ROs know a new RO/SRO joined the org, even if they didn't add it themselves.
    if (data.role === "ro" || data.role === "sro") {
      try {
        const headRoIds = (await getUserIdsByRoles(["head-ro", "developer"])).filter(
          (id) => id !== createdByUserId
        );
        const recipients = await filterUsersByPreference(headRoIds, "user-added");
        await notifyUsers(recipients, {
          type: "user-added",
          title: data.parentId
            ? `New ${roleLabels[data.role]} ${data.name} was added`
            : `New ${roleLabels[data.role]} ${data.name} registered and awaiting assignment`,
          message: email,
          relatedId: userId,
          relatedType: "user",
          actionUrl: data.role === "ro" ? "/Head-of-RO/ro" : "/Head-of-RO/sro",
        });
      } catch (error) {
        logger.error(`Failed to notify Head ROs of new ${data.role} ${userId}`, error);
      }
    }

    // Log activity
    await createActivityLog({
      userId: createdByUserId,
      action: "user-created",
      description: `Created user ${data.name} with role ${data.role}`,
      entityType: "user",
      entityId: userId,
    });

    logger.info(`User created: ${userId} (${email})`);
    return user;
  } catch (error) {
    logger.error("Error creating user", error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    if (!userId) return null;
    const user = await getDocById<User>("users", userId);
    return user;
  } catch (error) {
    logger.error(`Error fetching user ${userId}`, error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await queryDocs<User>("users", [
      { field: "email", operator: "==", value: email.toLowerCase() },
    ]);

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    logger.error(`Error fetching user by email ${email}`, error);
    throw error;
  }
}

/**
 * Get one page of users with optional filters. `unassigned` limits to users
 * with no manager (reportingToId == "").
 */
export async function getUsers(filters: {
  role?: UserRole;
  status?: UserStatus;
  reportingToId?: string;
  unassigned?: boolean;
  pageSize: number;
  pageNumber: number;
}): Promise<Page<User>> {
  try {
    const queryFilters: Filter[] = [];

    if (filters.role) {
      queryFilters.push({ field: "role", operator: "==", value: filters.role });
    }
    if (filters.status) {
      queryFilters.push({ field: "status", operator: "==", value: filters.status });
    }
    if (filters.unassigned) {
      queryFilters.push({ field: "reportingToId", operator: "==", value: "" });
    } else if (filters.reportingToId) {
      queryFilters.push({ field: "reportingToId", operator: "==", value: filters.reportingToId });
    }

    // Newest first where an index exists (none, or role only — see
    // firestore.indexes.json). Other equality combinations page in document-id
    // order, which is still stable, instead of requiring more composite indexes.
    const canOrderByCreated = queryFilters.length === 0 || (queryFilters.length === 1 && !!filters.role);
    return await queryPage<User>(
      "users",
      queryFilters,
      canOrderByCreated ? { field: "createdAt", direction: "desc" } : undefined,
      {
        pageSize: filters.pageSize,
        pageNumber: filters.pageNumber,
      }
    );
  } catch (error) {
    logger.error("Error fetching users", error);
    throw error;
  }
}

/**
 * Adds the manager's name and a live count of direct reports to each user, so
 * list screens don't have to download every user just to resolve names.
 */
export async function enrichUsersForList(users: User[]): Promise<UserListItem[]> {
  const managerIds = [
    ...new Set(users.map((user) => (user as ReportingUser).reportingToId).filter(Boolean) as string[]),
  ];
  const [managers, counts] = await Promise.all([
    getDocsByIds<User>("users", managerIds),
    Promise.all(
      users.map((user) =>
        getDocCount("users", [{ field: "reportingToId", operator: "==", value: user.id }]).catch(() => 0)
      )
    ),
  ]);
  const managerNames = new Map(managers.map((manager) => [manager.id, manager.name]));

  return users.map((user, index) => {
    const reportingToId = (user as ReportingUser).reportingToId;
    return {
      ...user,
      reportingToName: reportingToId ? managerNames.get(reportingToId) : undefined,
      directReportCount: counts[index],
    };
  });
}

/**
 * Get users by role with reporting structure
 */
export async function getUsersByRole(role: UserRole, reportingToId?: string): Promise<User[]> {
  try {
    const filters: Filter[] = [{ field: "role", operator: "==", value: role }];
    if (reportingToId) {
      filters.push({ field: "reportingToId", operator: "==", value: reportingToId });
    }
    return await queryDocs<User>("users", filters);
  } catch (error) {
    logger.error(`Error fetching users by role ${role}`, error);
    throw error;
  }
}

/**
 * Refuses to deactivate/suspend/delete the last active Head RO, which would
 * leave nobody able to manage the organisation.
 */
async function assertNotLastHeadRO(user: User, action: string): Promise<void> {
  if (user.role !== "head-ro") return;
  const headRos = await queryDocs<User>("users", [{ field: "role", operator: "==", value: "head-ro" }]);
  const othersActive = headRos.filter((other) => other.id !== user.id && !DISABLED_STATUSES.has(other.status));
  if (othersActive.length === 0) {
    throw new ValidationError(`You can't ${action} the only active Head RO. Add another Head RO first.`);
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  data: UpdateUserRequest,
  updatedByUserId: string
): Promise<User> {
  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    if (data.memberId !== undefined) {
      data = { ...data, memberId: normalizeMemberId(data.memberId) };
      if (data.memberId !== user.memberId) await requireMemberIdAvailable(data.memberId!, userId);
    }

    const statusChanged = data.status !== undefined && data.status !== user.status;
    const disabling = statusChanged && DISABLED_STATUSES.has(data.status!);
    if (disabling) {
      await assertNotLastHeadRO(user, "deactivate");
    }

    // Update user
    await updateDoc("users", userId, data);

    // Keep Firebase Auth in step with the stored status so a deactivated user
    // can't simply sign back in, and their existing sessions end now.
    if (statusChanged) {
      try {
        const auth = getFirebaseAdminAuth();
        await auth.updateUser(userId, { disabled: disabling });
        if (disabling) await auth.revokeRefreshTokens(userId);
      } catch (error) {
        logger.error(`Failed to sync Auth disabled flag for ${userId}`, error);
      }
    }

    if (data.name && data.name !== user.name) {
      await getFirebaseAdminAuth()
        .updateUser(userId, { displayName: data.name })
        .catch((error) => logger.warn(`Failed to update Auth displayName for ${userId}`, error));
    }

    // Log activity
    const changes: Record<string, { oldValue: unknown; newValue: unknown }> = {};
    Object.entries(data).forEach(([key, newValue]) => {
      const oldValue = (user as unknown as Record<string, unknown>)[key];
      if (oldValue !== newValue) {
        changes[key] = { oldValue, newValue };
      }
    });

    await createActivityLog({
      userId: updatedByUserId,
      action: "user-updated",
      description: `Updated user ${user.name}`,
      entityType: "user",
      entityId: userId,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    logger.info(`User updated: ${userId}`);

    // Return updated user
    const updatedUser = await getUserById(userId);
    return updatedUser!;
  } catch (error) {
    logger.error(`Error updating user ${userId}`, error);
    throw error;
  }
}

/** What deleting a user would affect, so the UI can warn before it happens. */
export async function getUserDeletionImpact(userId: string): Promise<{ directReports: number; openTasks: number }> {
  const [directReports, openTasks] = await Promise.all([
    getDocCount("users", [{ field: "reportingToId", operator: "==", value: userId }]),
    getDocCount("tasks", [
      { field: "assignedTo", operator: "==", value: userId },
      { field: "status", operator: "in", value: OPEN_TASK_STATUSES },
    ]),
  ]);
  return { directReports, openTasks };
}

/**
 * Delete user permanently
 *
 * Deleting a manager (SRO/RO/Youth Leader) would otherwise leave their
 * direct reports pointing at a `reportingToId` that no longer exists, and
 * leave the deleted user's own manager with a stale ID in its assigned-*
 * array. Clear both sides so reports become "Unassigned" (visible and
 * re-assignable again) instead of silently orphaned. Open tasks assigned to
 * the user are cancelled rather than left pointing at a deleted assignee.
 */
export async function deleteUser(
  userId: string,
  deletedByUserId: string
): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await assertNotLastHeadRO(user, "delete");

    const [directReports, openTasks] = await Promise.all([
      getUsersReportingTo(userId),
      queryDocs<{ id: string }>("tasks", [
        { field: "assignedTo", operator: "==", value: userId },
        { field: "status", operator: "in", value: OPEN_TASK_STATUSES },
      ]),
    ]);

    // Unassign anyone who reported directly to this user.
    const operations: Array<{
      type: "update";
      collection: string;
      docId: string;
      data: Record<string, unknown>;
    }> = directReports.map((report) => ({
      type: "update",
      collection: "users",
      docId: report.id,
      data: { reportingToId: "" },
    }));

    openTasks.forEach((task) =>
      operations.push({
        type: "update",
        collection: "tasks",
        docId: task.id,
        data: { status: "cancelled" },
      })
    );

    // Remove this user from their own manager's assigned-* array.
    const reportingToId = (user as ReportingUser).reportingToId;
    const managerField = MANAGER_FIELD_FOR[user.role];
    if (reportingToId && managerField) {
      const manager = await getUserById(reportingToId);
      if (manager) {
        const currentIds = ((manager as unknown as Record<string, string[] | undefined>)[managerField]) || [];
        operations.push({
          type: "update",
          collection: "users",
          docId: reportingToId,
          data: { [managerField]: currentIds.filter((id) => id !== userId) },
        });
      }
    }

    if (operations.length > 0) {
      await batchWrite(operations);
    }

    await deleteDocFromFirestore("users", userId);
    await getFirebaseAdminAuth()
      .deleteUser(userId)
      .catch((error) => logger.error(`Failed to delete Auth account for ${userId}`, error));

    // Log activity
    await createActivityLog({
      userId: deletedByUserId,
      action: "user-deleted",
      description: `Deleted user ${user.name} (${directReports.length} reports unassigned, ${openTasks.length} open tasks cancelled)`,
      entityType: "user",
      entityId: userId,
    });

    logger.info(`User deleted permanently: ${userId}`);
  } catch (error) {
    logger.error(`Error deleting user ${userId}`, error);
    throw error;
  }
}

/**
 * Move users under a new manager (or unassign them with `managerId = null`).
 *
 * Validates each role pairing (e.g. only ROs under an SRO), removes each user
 * from their previous manager's assigned-* array and adds them to the new
 * one, all in a single batch.
 */
export async function setUsersManager(
  userIds: string[],
  managerId: string | null,
  updatedByUserId: string
): Promise<void> {
  try {
    const uniqueIds = [...new Set(userIds)];
    const users = await getDocsByIds<User>("users", uniqueIds);
    if (users.length !== uniqueIds.length) {
      throw new NotFoundError("One or more selected users no longer exist");
    }

    let manager: User | null = null;
    if (managerId) {
      if (uniqueIds.includes(managerId)) {
        throw new ValidationError("A user can't report to themselves");
      }
      for (const user of users) {
        manager = await validateManager(user.role, managerId);
      }
    } else {
      const unassignable = users.find((user) => !MANAGER_FIELD_FOR[user.role]);
      if (unassignable) {
        throw new ValidationError(`A ${roleLabels[unassignable.role]} can't be unassigned`);
      }
    }

    // Accumulate array edits per manager so multiple moves in one call don't
    // overwrite each other's changes.
    const managerArrays = new Map<string, Record<string, Set<string>>>();
    const loadManagerArrays = async (id: string) => {
      if (!managerArrays.has(id)) {
        const record = (id === managerId && manager ? manager : await getUserById(id)) as unknown as
          | Record<string, unknown>
          | null;
        const arrays: Record<string, Set<string>> = {};
        (["assignedROIds", "assignedYouthLeaderIds", "assignedVolunteerIds"] as const).forEach((field) => {
          if (record && Array.isArray(record[field])) arrays[field] = new Set(record[field] as string[]);
        });
        managerArrays.set(id, arrays);
      }
      return managerArrays.get(id)!;
    };

    const operations: Array<{ type: "update"; collection: string; docId: string; data: Record<string, unknown> }> = [];

    for (const user of users) {
      const field = MANAGER_FIELD_FOR[user.role]!;
      const previousId = (user as ReportingUser).reportingToId;
      if (previousId === (managerId || "")) continue;

      if (previousId) {
        const arrays = await loadManagerArrays(previousId);
        arrays[field]?.delete(user.id);
      }
      if (managerId) {
        const arrays = await loadManagerArrays(managerId);
        (arrays[field] ||= new Set()).add(user.id);
      }

      operations.push({
        type: "update",
        collection: "users",
        docId: user.id,
        data: { reportingToId: managerId || "" },
      });
    }

    managerArrays.forEach((arrays, id) => {
      const data = Object.fromEntries(Object.entries(arrays).map(([field, ids]) => [field, [...ids]]));
      if (Object.keys(data).length > 0) {
        operations.push({ type: "update", collection: "users", docId: id, data });
      }
    });

    if (operations.length > 0) {
      await batchWrite(operations);
    }

    await createActivityLog({
      userId: updatedByUserId,
      action: "user-updated",
      description: managerId
        ? `Assigned ${users.length} user(s) to ${manager?.name || managerId}`
        : `Unassigned ${users.length} user(s) from their manager`,
      entityType: "user",
      entityId: managerId || uniqueIds[0],
    });

    logger.info(`Set manager of ${users.length} users to ${managerId ?? "none"}`);
  } catch (error) {
    logger.error("Error setting users' manager", error);
    throw error;
  }
}

/**
 * Emails a user a Firebase link to set a new password — e.g. when their welcome
 * email never arrived. Their account and data are unchanged.
 */
export async function sendPasswordReset(userId: string, sentByUserId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) throw new NotFoundError("User not found");

  const link = await getFirebaseAdminAuth().generatePasswordResetLink(user.email);
  await sendPasswordResetLinkEmail(user.email, user.name, link);

  await createActivityLog({
    userId: sentByUserId,
    action: "user-updated",
    description: `Sent a password reset link to ${user.name} (${user.email})`,
    entityType: "user",
    entityId: userId,
  });
}

/**
 * Assign users to a manager
 */
export async function assignUsersToManager(
  managerId: string,
  userIds: string[],
  updatedByUserId: string
): Promise<void> {
  return setUsersManager(userIds, managerId, updatedByUserId);
}

/**
 * Get users reporting to a manager
 */
export async function getUsersReportingTo(managerId: string): Promise<User[]> {
  try {
    const users = await queryDocs<User>("users", [
      { field: "reportingToId", operator: "==", value: managerId },
    ]);

    return users;
  } catch (error) {
    logger.error(`Error fetching users reporting to ${managerId}`, error);
    throw error;
  }
}

/**
 * Change user role
 */
export async function changeUserRole(
  userId: string,
  newRole: UserRole,
  changedByUserId: string
): Promise<User> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const oldRole = user.role;

    // Update role
    await updateDoc("users", userId, { role: newRole });
    await getFirebaseAdminAuth().setCustomUserClaims(userId, { role: newRole });

    // Log activity
    await createActivityLog({
      userId: changedByUserId,
      action: "user-updated",
      description: `Changed user role from ${oldRole} to ${newRole}`,
      entityType: "user",
      entityId: userId,
      changes: {
        role: { oldValue: oldRole, newValue: newRole },
      },
    });

    logger.info(`User role changed: ${userId} (${oldRole} → ${newRole})`);

    return (await getUserById(userId))!;
  } catch (error) {
    logger.error(`Error changing user role`, error);
    throw error;
  }
}

/**
 * Send user invitation
 */
export async function createUserInvitation(
  email: string,
  role: UserRole,
  invitedByUserId: string
): Promise<UserInvitation> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const invitationId = crypto.randomUUID();

    const invitation: UserInvitation = {
      id: invitationId,
      email: email.toLowerCase(),
      role,
      invitedBy: invitedByUserId,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      accepted: false,
    };

    await createDoc<UserInvitation>("userInvitations", invitationId, invitation);

    logger.info(`User invitation created: ${email} (${role})`);
    return invitation;
  } catch (error) {
    logger.error("Error creating user invitation", error);
    throw error;
  }
}

/**
 * Accept user invitation
 */
export async function acceptUserInvitation(
  invitationId: string,
  userDetails: Omit<CreateUserRequest, "role">
): Promise<User> {
  try {
    const invitation = await getDocById<UserInvitation>(
      "userInvitations",
      invitationId
    );

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (invitation.accepted) {
      throw new ValidationError("Invitation has already been accepted");
    }

    if (new Date() > invitation.expiresAt) {
      throw new ValidationError("Invitation has expired");
    }

    // Create the user
    const user = await createUser(
      {
        ...userDetails,
        email: invitation.email,
        role: invitation.role,
      },
      invitation.invitedBy
    );

    // Mark invitation as accepted
    await updateDoc("userInvitations", invitationId, {
      accepted: true,
      acceptedAt: new Date(),
    });

    logger.info(`User invitation accepted: ${invitation.email}`);
    return user;
  } catch (error) {
    logger.error("Error accepting user invitation", error);
    throw error;
  }
}
