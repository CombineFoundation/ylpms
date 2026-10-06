import {
  createDoc,
  updateDoc,
  deleteDocFromFirestore,
  queryDocs,
  queryPage,
  getDocById,
  getDocCount,
  batchWrite,
  type Filter,
  type Page,
} from "@/utils/firestore";
import {
  Notification,
  CreateNotificationRequest,
} from "@/types/notification.types";
import type { User, UserRole } from "@/types/user.types";
import { AuthorizationError, NotFoundError, logger } from "@/utils/errors";

/**
 * Notification Service - Handles all notification-related operations
 */

/**
 * The Settings page only exposes toggles for these four notification
 * types; everything else (e.g. task-assigned) is always sent.
 */
export type ToggleableNotificationType =
  | "report-submitted"
  | "user-added"
  | "task-completed"
  | "event-created";

export type NotificationPreferenceFlags = {
  reportSubmissions: boolean;
  newRegistrations: boolean;
  taskUpdates: boolean;
  eventReminders: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferenceFlags = {
  reportSubmissions: true,
  newRegistrations: true,
  taskUpdates: true,
  eventReminders: true,
};

const preferenceFieldByType: Record<ToggleableNotificationType, keyof NotificationPreferenceFlags> = {
  "report-submitted": "reportSubmissions",
  "user-added": "newRegistrations",
  "task-completed": "taskUpdates",
  "event-created": "eventReminders",
};

/**
 * A user's notification preferences, defaulting every toggle to on when
 * they haven't saved any yet.
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferenceFlags> {
  try {
    const saved = await getDocById<NotificationPreferenceFlags>("notificationPreferences", userId);
    return { ...DEFAULT_PREFERENCES, ...saved };
  } catch (error) {
    logger.error(`Error fetching notification preferences for ${userId}`, error);
    return DEFAULT_PREFERENCES;
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferenceFlags>
): Promise<NotificationPreferenceFlags> {
  try {
    const current = await getNotificationPreferences(userId);
    const merged = { ...current, ...preferences };
    await createDoc<NotificationPreferenceFlags>("notificationPreferences", userId, merged);
    return merged;
  } catch (error) {
    logger.error(`Error updating notification preferences for ${userId}`, error);
    throw error;
  }
}

/**
 * Narrow a list of candidate recipients down to those who haven't opted
 * out of this notification type.
 */
export async function filterUsersByPreference(
  userIds: string[],
  type: ToggleableNotificationType
): Promise<string[]> {
  const field = preferenceFieldByType[type];
  const checks = await Promise.all(
    userIds.map(async (userId) => ({
      userId,
      enabled: (await getNotificationPreferences(userId))[field],
    }))
  );
  return checks.filter((check) => check.enabled).map((check) => check.userId);
}

export async function isNotificationEnabled(
  userId: string,
  type: ToggleableNotificationType
): Promise<boolean> {
  const preferences = await getNotificationPreferences(userId);
  return preferences[preferenceFieldByType[type]];
}

/**
 * Create a notification for a single user.
 */
export async function createNotification(
  data: CreateNotificationRequest
): Promise<Notification> {
  try {
    const notificationId = crypto.randomUUID();

    const notificationData: Omit<Notification, "id"> = {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
      actionUrl: data.actionUrl,
      read: false,
      createdAt: new Date(),
    };

    return await createDoc<Notification>(
      "notifications",
      notificationId,
      notificationData as Notification
    );
  } catch (error) {
    logger.error("Error creating notification", error);
    throw error;
  }
}

/**
 * Fan out the same notification to several recipients at once. Used for
 * activities that many users care about (e.g. a new activity being scheduled).
 * Best-effort — callers should not let a notification failure break the
 * mutation that triggered it.
 */
export async function notifyUsers(
  userIds: string[],
  data: Omit<CreateNotificationRequest, "userId">
): Promise<void> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return;

  try {
    await batchWrite(
      uniqueIds.map((userId) => ({
        type: "set" as const,
        collection: "notifications",
        docId: crypto.randomUUID(),
        data: {
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          relatedId: data.relatedId,
          relatedType: data.relatedType,
          actionUrl: data.actionUrl,
          read: false,
        },
      }))
    );
  } catch (error) {
    logger.error("Error fanning out notifications", error);
  }
}

/**
 * Look up every user in the given roles, for role-wide notification fan-out
 * (e.g. alerting all Head ROs about a new submission).
 */
export async function getUserIdsByRoles(roles: UserRole[]): Promise<string[]> {
  try {
    const results = await Promise.all(
      roles.map((role) =>
        queryDocs<User>("users", [{ field: "role", operator: "==", value: role }])
      )
    );
    return [...new Set(results.flat().map((user) => user.id))];
  } catch (error) {
    logger.error("Error looking up users by role", error);
    return [];
  }
}

/**
 * Get notifications for a user, most recent first.
 */
export async function getNotificationsForUser(
  userId: string,
  options: { unreadOnly?: boolean; pageSize: number; pageNumber: number }
): Promise<Page<Notification>> {
  try {
    const filters: Filter[] = [{ field: "userId", operator: "==", value: userId }];
    if (options.unreadOnly) {
      filters.push({ field: "read", operator: "==", value: false });
    }

    return await queryPage<Notification>(
      "notifications",
      filters,
      { field: "createdAt", direction: "desc" },
      { pageSize: options.pageSize, pageNumber: options.pageNumber }
    );
  } catch (error) {
    logger.error(`Error fetching notifications for ${userId}`, error);
    throw error;
  }
}

/**
 * Count of unread notifications for a user (for a topbar badge).
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await getDocCount("notifications", [
      { field: "userId", operator: "==", value: userId },
      { field: "read", operator: "==", value: false },
    ]);
  } catch (error) {
    logger.error(`Error counting unread notifications for ${userId}`, error);
    throw error;
  }
}

/**
 * Mark a single notification as read. Only the recipient may do this.
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<Notification> {
  try {
    const notification = await getDocById<Notification>("notifications", notificationId);
    if (!notification) {
      throw new NotFoundError(`Notification ${notificationId} not found`);
    }
    if (notification.userId !== userId) {
      throw new AuthorizationError();
    }

    await updateDoc<Notification>("notifications", notificationId, {
      read: true,
      readAt: new Date(),
    });

    return (await getDocById<Notification>("notifications", notificationId))!;
  } catch (error) {
    logger.error(`Error marking notification ${notificationId} as read`, error);
    throw error;
  }
}

/**
 * Mark every unread notification for a user as read.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    const unread = await queryDocs<Notification>("notifications", [
      { field: "userId", operator: "==", value: userId },
      { field: "read", operator: "==", value: false },
    ]);

    if (unread.length === 0) return;

    await batchWrite(
      unread.map((notification) => ({
        type: "update" as const,
        collection: "notifications",
        docId: notification.id,
        data: { read: true, readAt: new Date() },
      }))
    );
  } catch (error) {
    logger.error(`Error marking all notifications as read for ${userId}`, error);
    throw error;
  }
}

/**
 * Delete a notification. Only the recipient may do this.
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    const notification = await getDocById<Notification>("notifications", notificationId);
    if (!notification) {
      throw new NotFoundError(`Notification ${notificationId} not found`);
    }
    if (notification.userId !== userId) {
      throw new AuthorizationError();
    }

    await deleteDocFromFirestore("notifications", notificationId);
  } catch (error) {
    logger.error(`Error deleting notification ${notificationId}`, error);
    throw error;
  }
}
