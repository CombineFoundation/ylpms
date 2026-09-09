import { createDoc, queryDocs } from "@/utils/firestore";
import {
  ActivityLog,
  ActivityAction,
  CreateActivityLogRequest,
} from "@/types/activitylog.types";
import { logger } from "@/utils/errors";
import { Timestamp } from "firebase/firestore";

/**
 * Activity Log Service - Track user actions for audit purposes
 */

/**
 * Create an activity log entry
 */
export async function createActivityLog(
  data: CreateActivityLogRequest
): Promise<ActivityLog> {
  try {
    const logId = crypto.randomUUID();

    const logData: ActivityLog = {
      id: logId,
      userId: data.userId,
      action: data.action,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes,
      ipAddress: data.ipAddress,
      createdAt: new Date(),
    };

    const log = await createDoc<ActivityLog>("activityLogs", logId, logData);
    logger.info(`Activity logged: ${data.action} by user ${data.userId}`);
    return log;
  } catch (error) {
    logger.error("Error creating activity log", error);
    // Don't throw - activity logging should not break operations
    return {} as ActivityLog;
  }
}

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(
  userId: string,
  limit?: number
): Promise<ActivityLog[]> {
  try {
    const logs = await queryDocs<ActivityLog>(
      "activityLogs",
      [{ field: "userId", operator: "==", value: userId }],
      { field: "createdAt", direction: "desc" },
      limit ? { pageSize: limit, pageNumber: 1 } : undefined
    );

    return logs;
  } catch (error) {
    logger.error(`Error fetching activity logs for user ${userId}`, error);
    throw error;
  }
}

/**
 * Get activity logs for an entity
 */
export async function getEntityActivityLogs(
  entityId: string,
  entityType?: string
): Promise<ActivityLog[]> {
  try {
    const filters = [
      { field: "entityId", operator: "==" as const, value: entityId },
    ];

    if (entityType) {
      filters.push({ field: "entityType", operator: "==" as const, value: entityType });
    }

    const logs = await queryDocs<ActivityLog>(
      "activityLogs",
      filters,
      { field: "createdAt", direction: "desc" }
    );

    return logs;
  } catch (error) {
    logger.error(`Error fetching activity logs for entity ${entityId}`, error);
    throw error;
  }
}

/**
 * Get all activity logs with filters
 */
export async function getActivityLogs(filters?: {
  action?: ActivityAction;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  pageNumber?: number;
}): Promise<ActivityLog[]> {
  try {
    const queryFilters = [];

    if (filters?.action) {
      queryFilters.push({ field: "action", operator: "==" as const, value: filters.action });
    }

    if (filters?.entityType) {
      queryFilters.push({
        field: "entityType",
        operator: "==" as const,
        value: filters.entityType,
      });
    }

    if (filters?.userId) {
      queryFilters.push({ field: "userId", operator: "==" as const, value: filters.userId });
    }

    const logs = await queryDocs<ActivityLog>(
      "activityLogs",
      queryFilters,
      { field: "createdAt", direction: "desc" },
      filters?.limit
        ? {
            pageSize: filters.limit,
            pageNumber: filters.pageNumber || 1,
          }
        : undefined
    );

    return logs;
  } catch (error) {
    logger.error("Error fetching activity logs", error);
    throw error;
  }
}
