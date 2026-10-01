import { withAuth } from "@/middleware/auth.middleware";
import { uploadTrainingFile } from "@/services/training-file.service";
import { requireRole } from "@/utils/auth";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";
import type { TrainingResourceType } from "@/types/training.types";

const TYPES: TrainingResourceType[] = ["video", "pdf", "ppt", "assignment"];

/**
 * POST /api/training/uploads?type=video|pdf|ppt|assignment - Upload one training file
 * (multipart field "file"; videos .mp4/.webm up to 100 MB, documents up to 25 MB).
 * Returns { path, name, size, contentType } to send as `file` on POST/PATCH /api/training.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();
    requireRole(req.user.role, "sro");

    const type = new URL(req.url).searchParams.get("type") as TrainingResourceType | null;
    if (!type || !TYPES.includes(type)) throw new ValidationError("Choose the resource type before uploading");

    const form = await req.formData().catch(() => {
      throw new ValidationError("Send the file as multipart/form-data");
    });
    const file = form.get("file");
    if (!(file instanceof File)) throw new ValidationError('Attach the file in the "file" field');

    return apiSuccess(await uploadTrainingFile(file, type, req.user.userId), 201);
  } catch (error) {
    return apiError(error);
  }
});
