import { withAuth } from "@/middleware/auth.middleware";
import { getCertificatesForUser } from "@/services/certificate.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/certificates - The caller's certificates, newest first.
 * A developer in a portal (?youthLeaderId= / ?volunteerId= …) sees that person's.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const owner = await resolveActingAs(req.user, req);
    return apiSuccess(await getCertificatesForUser(owner.userId));
  } catch (error) {
    return apiError(error);
  }
});
