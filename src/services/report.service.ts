import {
  createDoc,
  updateDocIfStatus,
  deleteDocFromFirestore,
  queryPage,
  getDocById,
  getDocsByIds,
  type Filter,
  type Page,
} from "@/utils/firestore";
import {
  Report,
  ReportStatus,
  CreateReportRequest,
} from "@/types/report.types";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError, logger } from "@/utils/errors";
import { isInManagerChain } from "@/utils/authorization";
import { createActivityLog } from "./activitylog.service";
import {
  createNotification,
  notifyUsers,
  getUserIdsByRoles,
  filterUsersByPreference,
} from "./notification.service";
import type { User, UserRole } from "@/types/user.types";

/**
 * Report Service - Handles all report-related operations
 */

/**
 * Create a new report
 */
/**
 * `submittedByUserId` is whose report it is; `actorUserId` is who actually
 * submitted it, for the audit log — they differ when a developer acts as an SRO.
 */
export async function createReport(
  data: CreateReportRequest,
  submittedByUserId: string,
  actorUserId: string = submittedByUserId
): Promise<Report> {
  try {
    const reportId = crypto.randomUUID();

    const reportData: Omit<Report, "id"> = {
      title: data.title,
      type: data.type,
      status: "submitted",
      submittedBy: submittedByUserId,
      period: {
        startDate: new Date(data.period.startDate),
        endDate: new Date(data.period.endDate),
      },
      content: {
        summary: data.content.summary,
        achievements: data.content.achievements,
        challenges: data.content.challenges,
        metrics: data.content.metrics,
        ...(data.content.attachments?.length ? { attachments: data.content.attachments } : {}),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: new Date(),
    };

    const report = await createDoc<Report>(
      "reports",
      reportId,
      reportData as Report
    );

    await createActivityLog({
      userId: actorUserId,
      action: "report-submitted",
      description: `Submitted report "${data.title}"${
        actorUserId !== submittedByUserId ? ` on behalf of ${submittedByUserId}` : ""
      }`,
      entityType: "report",
      entityId: reportId,
    });

    await notifyReportReviewers(reportId, data.title, submittedByUserId, "submitted");

    logger.info(`Report created: ${reportId} by ${submittedByUserId}`);
    return report;
  } catch (error) {
    logger.error("Error creating report", error);
    throw error;
  }
}

/** Head ROs, and the submitter's SRO (who reviews it), so a new or resubmitted report shows up without polling. */
async function notifyReportReviewers(
  reportId: string,
  reportTitle: string,
  submittedByUserId: string,
  verb: "submitted" | "resubmitted"
) {
  try {
    const submitter = await getDocById<User>("users", submittedByUserId);
    const title = `${submitter?.name || "A user"} ${verb} a report for review`;
    const headRoIds = (await getUserIdsByRoles(["head-ro", "developer"])).filter((id) => id !== submittedByUserId);
    const recipients = await filterUsersByPreference(headRoIds, "report-submitted");
    await notifyUsers(recipients, {
      type: "report-submitted",
      title,
      message: reportTitle,
      relatedId: reportId,
      relatedType: "report",
      actionUrl: "/Head-of-RO/reports",
    });

    const sroId = submitter ? await findSroAbove(submitter) : null;
    if (sroId && sroId !== submittedByUserId) {
      // Review is an action item for the SRO, so it isn't preference-gated.
      await notifyUsers([sroId], {
        type: "report-submitted",
        title,
        message: reportTitle,
        relatedId: reportId,
        relatedType: "report",
        actionUrl: "/SRO/reports",
      });
    }
  } catch (error) {
    logger.error(`Failed to notify reviewers of report ${reportId}`, error);
  }
}

/**
 * The submitter fixes a returned (rejected) report and sends it back for
 * review. The reviewer's earlier feedback is kept as `previousReviewComment`.
 */
export async function resubmitReport(
  reportId: string,
  data: CreateReportRequest,
  submittedByUserId: string,
  actorUserId: string = submittedByUserId
): Promise<Report> {
  const report = await getReportById(reportId);
  if (!report) throw new NotFoundError("Report not found");
  if (report.submittedBy !== submittedByUserId) throw new AuthorizationError("Only the person who submitted this report can resubmit it");
  if (report.status !== "rejected") throw new ConflictError("Only a returned report can be edited and resubmitted");

  const saved = await updateDocIfStatus<Report>("reports", reportId, "rejected", {
    title: data.title,
    type: data.type,
    status: "submitted",
    period: { startDate: new Date(data.period.startDate), endDate: new Date(data.period.endDate) },
    content: {
      summary: data.content.summary,
      achievements: data.content.achievements,
      challenges: data.content.challenges,
      metrics: data.content.metrics,
      ...(data.content.attachments?.length ? { attachments: data.content.attachments } : {}),
    },
    submittedAt: new Date(),
    previousReviewComment: report.reviewComment,
    // null removes the field: the new version hasn't been reviewed yet.
    reviewComment: null,
    reviewedBy: null,
    reviewedAt: null,
  } as unknown as Partial<Report>);
  if (!saved) throw new ConflictError(`"${report.title}" was just changed — refresh and try again`);

  await createActivityLog({
    userId: actorUserId,
    action: "report-submitted",
    description: `Resubmitted report "${data.title}"${actorUserId !== submittedByUserId ? ` on behalf of ${submittedByUserId}` : ""}`,
    entityType: "report",
    entityId: reportId,
    changes: { status: { oldValue: "rejected", newValue: "submitted" } },
  });
  await notifyReportReviewers(reportId, data.title, submittedByUserId, "resubmitted");

  return (await getReportById(reportId))!;
}

/** The SRO the user reports to, directly or through their RO / youth leader. */
async function findSroAbove(user: User): Promise<string | null> {
  let current: User | null = user;
  for (let depth = 0; depth < 4 && current && "reportingToId" in current && current.reportingToId; depth++) {
    current = await getDocById<User>("users", current.reportingToId);
    if (current?.role === "sro") return current.id;
  }
  return null;
}

/** The submitter, Head RO / developer, or anyone above the submitter in their reporting chain. */
export async function canViewReport(caller: { userId: string; role: string }, submittedBy: string): Promise<boolean> {
  if (caller.userId === submittedBy) return true;
  if (caller.role === "head-ro" || caller.role === "developer") return true;
  return isInManagerChain(caller.userId, submittedBy);
}

/**
 * Get report by ID
 */
export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    return await getDocById<Report>("reports", reportId);
  } catch (error) {
    logger.error(`Error fetching report ${reportId}`, error);
    throw error;
  }
}

/**
 * Get one page of reports with optional filters, newest first
 */
export async function getReports(filters: {
  status?: ReportStatus;
  submittedBy?: string;
  pageSize: number;
  pageNumber: number;
}): Promise<Page<Report>> {
  try {
    const queryFilters: Filter[] = [];

    if (filters.status) {
      queryFilters.push({ field: "status", operator: "==", value: filters.status });
    }

    if (filters.submittedBy) {
      queryFilters.push({ field: "submittedBy", operator: "==", value: filters.submittedBy });
    }

    return await queryPage<Report>(
      "reports",
      queryFilters,
      { field: "createdAt", direction: "desc" },
      { pageSize: filters.pageSize, pageNumber: filters.pageNumber }
    );
  } catch (error) {
    logger.error("Error fetching reports", error);
    throw error;
  }
}

/** Adds the submitter's name and region, resolved server-side. */
export async function enrichReportsForList<T extends { submittedBy: string }>(reports: T[]) {
  const submitterIds = [...new Set(reports.map((report) => report.submittedBy))];
  const submitters = await getDocsByIds<User>("users", submitterIds);
  const submitterById = new Map(submitters.map((user) => [user.id, user]));

  return reports.map((report) => {
    const submitter = submitterById.get(report.submittedBy);
    return {
      ...report,
      submittedByName: submitter?.name || "Unknown",
      submittedByRegion: submitter?.region || "Unassigned",
      submittedByRole: submitter?.role,
    };
  });
}

/**
 * Which review decisions are allowed from each status. Only submitted (or
 * already-reviewed) reports can be decided; approved/rejected are final.
 */
const ALLOWED_REVIEW_TRANSITIONS: Partial<Record<ReportStatus, ReportStatus[]>> = {
  submitted: ["reviewed", "approved", "rejected"],
  reviewed: ["approved", "rejected"],
};

const REPORTS_ROUTE_BY_ROLE: Record<UserRole, string> = {
  developer: "/Head-of-RO/reports",
  "head-ro": "/Head-of-RO/reports",
  sro: "/SRO/reports",
  ro: "/RO/reports",
  "youth-leader": "/youth-leader/reports",
  volunteer: "/volunteer/dashboard",
};

/**
 * Update a report's review status (approve/reject/mark reviewed)
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  reviewedByUserId: string,
  reviewComment?: string
): Promise<Report> {
  try {
    const report = await getReportById(reportId);
    if (!report) {
      throw new NotFoundError(`Report ${reportId} not found`);
    }

    const allowed = ALLOWED_REVIEW_TRANSITIONS[report.status] || [];
    if (!allowed.includes(status)) {
      throw new ValidationError(
        report.status === "approved" || report.status === "rejected"
          ? `This report was already ${report.status}`
          : `A ${report.status} report can't be marked ${status}`
      );
    }

    const saved = await updateDocIfStatus<Report>("reports", reportId, report.status, {
      status,
      reviewedBy: reviewedByUserId,
      reviewedAt: new Date(),
      reviewComment: reviewComment || undefined,
    });
    if (!saved) throw new ConflictError(`"${report.title}" was already reviewed — refresh to see it`);

    await createActivityLog({
      userId: reviewedByUserId,
      action: "report-reviewed",
      description: `Marked report "${report.title}" as ${status}`,
      entityType: "report",
      entityId: reportId,
      changes: { status: { oldValue: report.status, newValue: status } },
    });

    // Let the submitter know the outcome (and why, if rejected).
    if (report.submittedBy !== reviewedByUserId && status !== "reviewed") {
      try {
        const submitter = await getDocById<User>("users", report.submittedBy);
        await createNotification({
          userId: report.submittedBy,
          type: "other",
          title: `Your report "${report.title}" was ${status}`,
          message: reviewComment || (status === "approved" ? "No changes needed." : ""),
          relatedId: reportId,
          relatedType: "report",
          actionUrl: submitter ? REPORTS_ROUTE_BY_ROLE[submitter.role] : undefined,
        });
      } catch (error) {
        logger.error(`Failed to notify submitter of report ${reportId}`, error);
      }
    }

    logger.info(`Report ${reportId} status updated to ${status} by ${reviewedByUserId}`);

    return (await getReportById(reportId))!;
  } catch (error) {
    logger.error(`Error updating report ${reportId}`, error);
    throw error;
  }
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string, deletedByUserId: string): Promise<void> {
  try {
    const report = await getReportById(reportId);
    if (!report) {
      throw new NotFoundError(`Report ${reportId} not found`);
    }

    await deleteDocFromFirestore("reports", reportId);

    await createActivityLog({
      userId: deletedByUserId,
      action: "other",
      description: `Deleted report "${report.title}"`,
      entityType: "report",
      entityId: reportId,
    });

    logger.info(`Report deleted: ${reportId}`);
  } catch (error) {
    logger.error(`Error deleting report ${reportId}`, error);
    throw error;
  }
}
