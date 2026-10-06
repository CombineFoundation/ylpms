import { withAuth } from "@/middleware/auth.middleware";
import { confirmTrainingFileUpload } from "@/services/training-file.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError } from "@/utils/errors";
import { confirmUploadSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";
import { trainingTypeFrom } from "./training-type";

/**
 * POST /api/training/uploads?type=video|pdf|ppt|assignment - Confirm a training file uploaded
 * with a URL from POST /api/training/uploads/upload-url. Body: { uploadPath, name }. The file is
 * checked (videos .mp4/.webm up to 100 MB, documents up to 25 MB, real file signature).
 * Returns { path, name, size, contentType } to send as `file` on POST/PATCH /api/training.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "sro");

    const type = trainingTypeFrom(req.url);
    const { uploadPath, name } = confirmUploadSchema.parse(await req.json());

    return apiSuccess(await confirmTrainingFileUpload(uploadPath, name, type, req.user.userId), 201);
  } catch (error) {
    return apiError(error);
  }
});
