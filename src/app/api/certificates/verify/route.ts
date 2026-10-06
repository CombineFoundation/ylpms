import type { NextRequest } from "next/server";
import { verifyCertificate } from "@/services/certificate.service";
import { apiError, apiSuccess } from "@/utils/api-response";
import { NotFoundError, RateLimitError, ValidationError } from "@/utils/errors";

/** Per server instance, best effort: enough to stop a script guessing numbers. */
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 20;
const recentByIp = new Map<string, number[]>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) throw new RateLimitError("Too many checks from this connection. Please wait a minute.");
  recent.push(now);
  recentByIp.set(ip, recent);
  if (recentByIp.size > 5000) recentByIp.clear();
}

/**
 * GET /api/certificates/verify?n=YLP2/007/001 - Public (no sign-in): confirms a
 * certificate is genuine, returning only what's printed on it.
 */
export async function GET(req: NextRequest) {
  try {
    checkRateLimit(req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown");
    const number = req.nextUrl.searchParams.get("n")?.trim() ?? "";
    if (!number || number.length > 64) throw new ValidationError("Enter the certificate number printed on the certificate");

    const certificate = await verifyCertificate(number);
    if (!certificate) throw new NotFoundError("No certificate has this number. Check it and try again.");
    return apiSuccess(certificate);
  } catch (error) {
    return apiError(error);
  }
}
