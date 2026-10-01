import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getEvidenceAttachment } from "@/services/event.service";
import { readReportAttachment } from "@/services/report-attachment.service";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { apiError } from "@/utils/api-response";

type Params = { params: Promise<{ eventId: string; index: string }> };

/**
 * GET /api/events/[eventId]/evidence/[index] - Stream one evidence PDF to the
 * event's organizer and the people who review it.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { eventId, index } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();
      if (!/^\d+$/.test(index)) throw new NotFoundError("Attachment not found");

      const attachment = await getEvidenceAttachment(eventId, Number(index), await resolveActingAs(authReq.user, authReq));
      const contents = await readReportAttachment(attachment);

      return new NextResponse(new Uint8Array(contents), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(contents.length),
          "Content-Disposition": `inline; filename="${attachment.name.replace(/"/g, "")}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
