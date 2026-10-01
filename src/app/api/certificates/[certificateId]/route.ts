import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getCertificateForViewer } from "@/services/certificate.service";
import { AuthenticationError } from "@/utils/errors";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ certificateId: string }> };

/**
 * GET /api/certificates/[certificateId] - One certificate, for its holder, their
 * managers, and Head RO / developer.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { certificateId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      return apiSuccess(await getCertificateForViewer(certificateId, authReq.user));
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
