import type { NextRequest } from "next/server";
import { createApplication } from "@/services/application.service";
import { applicationSchema } from "@/utils/application-validation";
import { apiError, apiSuccess } from "@/utils/api-response";
import { RateLimitError } from "@/utils/errors";

/** Per server instance, best effort: enough to slow a script hammering the form. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentByIp = new Map<string, number[]>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    throw new RateLimitError("Too many applications from this connection. Please try again later.");
  }
  recent.push(now);
  recentByIp.set(ip, recent);
  if (recentByIp.size > 5000) recentByIp.clear();
}

/** POST /api/applications - Public (no sign-in): the landing page's Apply form. */
export async function POST(req: NextRequest) {
  try {
    const { website, ...application } = applicationSchema.parse(await req.json());

    // A bot filled the hidden field: pretend it worked and save nothing.
    if (website) return apiSuccess({ referenceNumber: "YLP-RECEIVED" }, 201);

    checkRateLimit(req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown");
    return apiSuccess(await createApplication(application), 201);
  } catch (error) {
    return apiError(error);
  }
}
