import { createDoc, updateDoc, deleteDocFromFirestore, getDocById, queryPage, type Filter, type Page } from "@/utils/firestore";
import { NotFoundError, logger } from "@/utils/errors";
import { createActivityLog } from "./activitylog.service";
import { deleteTrainingFile, requireOwnTrainingFile } from "./training-file.service";
import type {
  CreateTrainingResourceRequest,
  TrainingResourceCategory,
  TrainingResource,
  TrainingResourceType,
  UpdateTrainingResourceRequest,
} from "@/types/training.types";
import type { User } from "@/types/user.types";

/**
 * Training Service - Training Portal resources (videos, PDFs, PPTs, assignments).
 * Head RO manages all of them and SROs manage the ones they created; every
 * role can read every published resource.
 */

/** Head RO / developer manage any resource; an SRO only the ones they authored. */
export function canManageTrainingResource(
  caller: { userId: string; role: string },
  resource: Pick<TrainingResource, "authorId">
): boolean {
  if (caller.role === "head-ro" || caller.role === "developer") return true;
  return caller.role === "sro" && resource.authorId === caller.userId;
}

const COLLECTION = "trainingResources";

export async function getTrainingResources(filters: {
  type?: TrainingResourceType;
  category?: TrainingResourceCategory;
  /** Learners only see published resources (every role sees every published resource). */
  publishedOnly?: boolean;
  /** Only resources created by this user (drafts included), e.g. an SRO's own. */
  authorId?: string;
  pageSize: number;
  pageNumber: number;
}): Promise<Page<TrainingResource>> {
  try {
    const queryFilters: Filter[] = [];
    if (filters.type) queryFilters.push({ field: "type", operator: "==", value: filters.type });
    if (filters.category) queryFilters.push({ field: "category", operator: "==", value: filters.category });
    if (filters.authorId) queryFilters.push({ field: "authorId", operator: "==", value: filters.authorId });
    if (filters.publishedOnly) queryFilters.push({ field: "published", operator: "==", value: true });

    // Newest first when unfiltered (single-field index); filtered views page
    // in document order so no composite index is required.
    return await queryPage<TrainingResource>(
      COLLECTION,
      queryFilters,
      queryFilters.length === 0 ? { field: "createdAt", direction: "desc" } : undefined,
      { pageSize: filters.pageSize, pageNumber: filters.pageNumber }
    );
  } catch (error) {
    logger.error("Error fetching training resources", error);
    throw error;
  }
}

export async function getTrainingResourceById(resourceId: string): Promise<TrainingResource | null> {
  return getDocById<TrainingResource>(COLLECTION, resourceId);
}

export async function createTrainingResource(
  data: CreateTrainingResourceRequest,
  authorId: string
): Promise<TrainingResource> {
  try {
    const resourceId = crypto.randomUUID();
    if (data.file) await requireOwnTrainingFile(data.file, authorId);
    const author = await getDocById<User>("users", authorId);

    const resource = await createDoc<TrainingResource>(COLLECTION, resourceId, {
      ...data,
      authorId,
      authorName: author?.name || "Unknown",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TrainingResource);

    await createActivityLog({
      userId: authorId,
      action: "other",
      description: `Added training ${data.type} "${data.title}"`,
      entityType: "course",
      entityId: resourceId,
    });

    return resource;
  } catch (error) {
    logger.error("Error creating training resource", error);
    throw error;
  }
}

export async function updateTrainingResource(
  resourceId: string,
  data: UpdateTrainingResourceRequest,
  updatedByUserId: string
): Promise<TrainingResource> {
  try {
    const existing = await getTrainingResourceById(resourceId);
    if (!existing) throw new NotFoundError("Training resource not found");

    const replacesFile = data.file !== undefined && data.file?.path !== existing.file?.path;
    if (data.file && replacesFile) await requireOwnTrainingFile(data.file, updatedByUserId);
    // A resource is either a link or a file: setting one clears the other.
    const changes: Record<string, unknown> = { ...data };
    if (data.file) changes.url = null;
    if (data.url) changes.file = null;

    // updateDoc treats null as "remove the field" (clearing duration/pages/url/file).
    await updateDoc(COLLECTION, resourceId, changes);
    if (existing.file && (replacesFile || data.url)) await deleteTrainingFile(existing.file);

    await createActivityLog({
      userId: updatedByUserId,
      action: "other",
      description:
        data.published !== undefined && data.published !== existing.published
          ? `${data.published ? "Published" : "Unpublished"} training resource "${existing.title}"`
          : `Updated training resource "${existing.title}"`,
      entityType: "course",
      entityId: resourceId,
    });

    return (await getTrainingResourceById(resourceId))!;
  } catch (error) {
    logger.error(`Error updating training resource ${resourceId}`, error);
    throw error;
  }
}

export async function deleteTrainingResource(resourceId: string, deletedByUserId: string): Promise<void> {
  try {
    const existing = await getTrainingResourceById(resourceId);
    if (!existing) throw new NotFoundError("Training resource not found");

    await deleteDocFromFirestore(COLLECTION, resourceId);
    if (existing.file) await deleteTrainingFile(existing.file);

    await createActivityLog({
      userId: deletedByUserId,
      action: "other",
      description: `Deleted training resource "${existing.title}"`,
      entityType: "course",
      entityId: resourceId,
    });
  } catch (error) {
    logger.error(`Error deleting training resource ${resourceId}`, error);
    throw error;
  }
}
