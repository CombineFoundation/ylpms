import { withAuth } from "@/middleware/auth.middleware";
import { getTeamCertificates } from "@/services/certificate.service";
import { requireRole } from "@/utils/auth";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

/**
 * GET /api/certificates/team - Certificates issued to the caller's team, one group per activity.
 * Head RO sees the whole program; an SRO or RO their own team. A developer in the
 * SRO / RO portal passes ?sroId= / ?roId= to see that person's team.
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const viewer = await resolveActingAs(req.user, req);
    requireRole(viewer.role, "ro");
    return apiSuccess(await getTeamCertificates(viewer));
  } catch (error) {
    return apiError(error);
  }
});
