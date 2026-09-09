import {
  createDoc,
  updateDoc,
  deleteDocFromFirestore,
  queryDocs,
  getDocById,
  docExists,
  batchWrite,
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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, Timestamp } from "firebase/firestore";
import { createActivityLog } from "./activitylog.service";

/**
 * User Service - Handles all user-related operations
 */

/**
 * Create a new user
 */
export async function createUser(
  data: CreateUserRequest,
  createdByUserId: string
): Promise<User> {
  try {
    // Check if email already exists
    const existingUser = await queryDocs<User>("users", [
      { field: "email", operator: "==", value: data.email.toLowerCase() },
    ]);

    if (existingUser.length > 0) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    // Generate user ID
    const userId = crypto.randomUUID();

    // Create user data based on role
    const baseUserData: Omit<BaseUser, "id"> = {
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role,
      status: "pending", // Users start as pending until email verification
      phone: data.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add role-specific fields
    let userData: any = baseUserData;

    if (data.role === "sro" || data.role === "ro") {
      userData.reportingToId = data.parentId || "";
      userData.assignedROIds = [];
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
    const user = await createDoc<User>("users", userId, userData);

    // Log activity
    await createActivityLog({
      userId: createdByUserId,
      action: "user-created",
      description: `Created user ${data.name} with role ${data.role}`,
      entityType: "user",
      entityId: userId,
    });

    logger.info(`User created: ${userId} (${data.email})`);
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
 * Get all users with optional filters
 */
export async function getUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
  reportingToId?: string;
  pageSize?: number;
  pageNumber?: number;
}): Promise<User[]> {
  try {
    const queryFilters = [];

    if (filters?.role) {
      queryFilters.push({ field: "role", operator: "==" as const, value: filters.role });
    }

    if (filters?.status) {
      queryFilters.push({ field: "status", operator: "==" as const, value: filters.status });
    }

    if (filters?.reportingToId) {
      queryFilters.push({
        field: "reportingToId",
        operator: "==" as const,
        value: filters.reportingToId,
      });
    }

    const users = await queryDocs<User>(
      "users",
      queryFilters,
      { field: "createdAt", direction: "desc" },
      filters?.pageSize
        ? {
            pageSize: filters.pageSize,
            pageNumber: filters.pageNumber || 1,
          }
        : undefined
    );

    return users;
  } catch (error) {
    logger.error("Error fetching users", error);
    throw error;
  }
}

/**
 * Get users by role with reporting structure
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const users = await queryDocs<User>("users", [
      { field: "role", operator: "==", value: role },
    ]);
    return users;
  } catch (error) {
    logger.error(`Error fetching users by role ${role}`, error);
    throw error;
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

    // Update user
    await updateDoc("users", userId, data);

    // Log activity
    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    Object.entries(data).forEach(([key, newValue]) => {
      if ((user as any)[key] !== newValue) {
        changes[key] = { oldValue: (user as any)[key], newValue };
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

/**
 * Delete user (archive)
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

    // Archive instead of hard delete
    await updateDoc("users", userId, {
      status: "inactive",
    });

    // Log activity
    await createActivityLog({
      userId: deletedByUserId,
      action: "user-deleted",
      description: `Deleted user ${user.name}`,
      entityType: "user",
      entityId: userId,
    });

    logger.info(`User deleted (archived): ${userId}`);
  } catch (error) {
    logger.error(`Error deleting user ${userId}`, error);
    throw error;
  }
}

/**
 * Assign users to a manager
 */
export async function assignUsersToManager(
  managerId: string,
  userIds: string[],
  updatedByUserId: string
): Promise<void> {
  try {
    const manager = await getUserById(managerId);
    if (!manager) {
      throw new NotFoundError(`Manager ${managerId} not found`);
    }

    const operations = [];

    // Add users to manager's list based on role
    if (manager.role === "sro" && "assignedROIds" in manager) {
      const currentROIds = (manager as any).assignedROIds || [];
      const newROIds = [...new Set([...currentROIds, ...userIds])];

      operations.push({
        type: "update" as const,
        collection: "users",
        docId: managerId,
        data: { assignedROIds: newROIds },
      });
    } else if (manager.role === "ro" && "assignedYouthLeaderIds" in manager) {
      const currentYLIds = (manager as any).assignedYouthLeaderIds || [];
      const newYLIds = [...new Set([...currentYLIds, ...userIds])];

      operations.push({
        type: "update" as const,
        collection: "users",
        docId: managerId,
        data: { assignedYouthLeaderIds: newYLIds },
      });
    }

    // Update reporting relationship for assigned users
    userIds.forEach((userId) => {
      operations.push({
        type: "update" as const,
        collection: "users",
        docId: userId,
        data: { reportingToId: managerId },
      });
    });

    if (operations.length > 0) {
      await batchWrite(operations);
    }

    // Log activity
    await createActivityLog({
      userId: updatedByUserId,
      action: "user-updated",
      description: `Assigned ${userIds.length} users to manager ${managerId}`,
      entityType: "user",
      entityId: managerId,
    });

    logger.info(`Assigned ${userIds.length} users to manager ${managerId}`);
  } catch (error) {
    logger.error(`Error assigning users to manager`, error);
    throw error;
  }
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
    await firebaseUpdateDoc("users", userId, { role: newRole });

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
