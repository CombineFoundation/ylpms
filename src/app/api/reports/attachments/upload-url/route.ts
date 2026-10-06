import { withAuth } from "@/middleware/auth.middleware";
import { createAttachmentUpload } from "@/services/report-attachment.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { uploadUrlRequestSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * POST /api/reports/attachments/upload-url - A signed URL to upload one PDF or image (max 10 MB)
 * straight to Storage. Body: { name, size }. Returns { uploadUrl, uploadPath, headers }:
 * PUT the file to uploadUrl with those headers, then confirm it with POST /api/reports/attachments.
 * A developer in a portal (?sroId= / ?roId= / ?youthLeaderId= / ?volunteerId=) uploads as that person.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const ownerId = (await resolveActingAs(req.user, req)).userId;
    const file = uploadUrlRequestSchema.parse(await req.json());

    return apiSuccess(await createAttachmentUpload(file, ownerId), 201);
  } catch (error) {
    return apiError(error);
  }
});
