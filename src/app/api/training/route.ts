import { withAuth } from "@/middleware/auth.middleware";
import { createTrainingResource, getTrainingResources } from "@/services/training.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { createTrainingResourceSchema } from "@/utils/validation";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";
import {
  TRAINING_CATEGORIES,
  type TrainingResourceCategory,
  type TrainingResourceType,
} from "@/types/training.types";

const TYPES: TrainingResourceType[] = ["video", "pdf", "ppt", "assignment"];

/**
 * GET /api/training - One page of training resources
 * GET /api/training?type=video&category=Leadership&pageSize=25&pageNumber=1
 *
 * Head RO / developer see everything (including drafts); every other role sees
 * all published resources.
 * GET /api/training?mine=true - (SRO) the caller's own resources, drafts included.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as TrainingResourceType | null;
    const category = searchParams.get("category") as TrainingResourceCategory | null;
    if (type && !TYPES.includes(type)) throw new ValidationError("Invalid type filter");
    if (category && !(TRAINING_CATEGORIES as readonly string[]).includes(category)) {
      throw new ValidationError("Invalid category filter");
    }

    const isManager = req.user.role === "head-ro" || req.user.role === "developer";
    const mine = searchParams.get("mine") === "true";
    if (mine) requireRole(req.user.role, "sro");

    const page = await getTrainingResources({
      type: type || undefined,
      category: category || undefined,
      authorId: mine ? req.user.userId : undefined,
      // Every role sees every published resource; only managers (and an SRO's own view) see drafts.
      publishedOnly: !isManager && !mine,
      ...parsePagination(searchParams),
    });

    return apiSuccess(page.items, 200, { page: page.page, pageSize: page.pageSize, hasMore: page.hasMore });
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/training - Add a training resource (SRO and above)
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "sro");

    const data = createTrainingResourceSchema.parse(await req.json());
    const resource = await createTrainingResource(data, req.user.userId);

    return apiSuccess(resource, 201);
  } catch (error) {
    return apiError(error);
  }
});
