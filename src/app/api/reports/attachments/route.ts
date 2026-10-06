import { withAuth } from "@/middleware/auth.middleware";
import { confirmReportPdfUpload } from "@/services/report-attachment.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { confirmUploadSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * POST /api/reports/attachments - Confirm a PDF uploaded with a URL from
 * POST /api/reports/attachments/upload-url. Body: { uploadPath, name }. The PDF is checked
 * (max 10 MB, real PDF) and filed into the caller's own folder. Returns { path, name, size }
 * to include in a report's `content.attachments`, an activity's evidence, or a task submission.
 * A developer in a portal (?sroId= / ?roId= / ?youthLeaderId= / ?volunteerId=) uploads as that person.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const ownerId = (await resolveActingAs(req.user, req)).userId;
    const { uploadPath, name } = confirmUploadSchema.parse(await req.json());

    return apiSuccess(await confirmReportPdfUpload(uploadPath, name, ownerId), 201);
  } catch (error) {
    return apiError(error);
  }
});
