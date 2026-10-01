import { withAuth } from "@/middleware/auth.middleware";
import { uploadReportPdf } from "@/services/report-attachment.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, ValidationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * POST /api/reports/attachments - Upload one PDF (multipart field "file", max 10 MB) into the
 * caller's own folder. Returns { path, name, size } to include in a report's `content.attachments`,
 * an activity's evidence, or a task submission (volunteers upload for the latter).
 * A developer in a portal (?sroId= / ?roId= / ?youthLeaderId= / ?volunteerId=) uploads as that person.
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const ownerId = (await resolveActingAs(req.user, req)).userId;

    const form = await req.formData().catch(() => {
      throw new ValidationError("Send the PDF as multipart/form-data");
    });
    const file = form.get("file");
    if (!(file instanceof File)) throw new ValidationError('Attach a PDF in the "file" field');

    return apiSuccess(await uploadReportPdf(file, ownerId), 201);
  } catch (error) {
    return apiError(error);
  }
});
