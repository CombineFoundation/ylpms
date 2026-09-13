import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/server-auth";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 5;
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_MS / 1000,
};

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: unknown };
    if (typeof idToken !== "string" || !idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }
    const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to create session." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
