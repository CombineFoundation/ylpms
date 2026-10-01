import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { canManageTrainingResource, getTrainingResourceById } from "@/services/training.service";
import { readTrainingFile } from "@/services/training-file.service";
import { AuthenticationError, NotFoundError } from "@/utils/errors";
import { apiError } from "@/utils/api-response";
import { INLINE_TRAINING_TYPES } from "@/utils/training-upload-rules";

type Params = { params: Promise<{ resourceId: string }> };

/**
 * GET /api/training/[resourceId]/file - Stream a resource's uploaded file to anyone who can
 * see the resource (every role for published ones; drafts only to people who manage them).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { resourceId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const resource = await getTrainingResourceById(resourceId);
      if (!resource || (!resource.published && !canManageTrainingResource(authReq.user, resource))) {
        throw new NotFoundError("Training resource not found");
      }
      if (!resource.file) throw new NotFoundError("This resource has no uploaded file");

      const contents = await readTrainingFile(resource.file);
      const disposition = INLINE_TRAINING_TYPES.includes(resource.file.contentType) ? "inline" : "attachment";
      return new NextResponse(new Uint8Array(contents), {
        status: 200,
        headers: {
          "Content-Type": resource.file.contentType,
          "Content-Length": String(contents.length),
          "Content-Disposition": `${disposition}; filename="${resource.file.name.replace(/"/g, "")}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
