import { withAuth } from "@/middleware/auth.middleware";
import { createTrainingFileUpload } from "@/services/training-file.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { uploadUrlRequestSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";
import { trainingTypeFrom } from "../training-type";

/**
 * POST /api/training/uploads/upload-url?type=video|pdf|ppt|assignment - A signed URL to upload
 * one training file straight to Storage. Body: { name, size }. Returns { uploadUrl, uploadPath, headers }:
 * PUT the file to uploadUrl with those headers, then confirm it with POST /api/training/uploads.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "sro");

    const type = trainingTypeFrom(req.url);
    const file = uploadUrlRequestSchema.parse(await req.json());

    return apiSuccess(await createTrainingFileUpload(file, type, req.user.userId), 201);
  } catch (error) {
    return apiError(error);
  }
});
