import { NextRequest, NextResponse } from "next/server";

const ROUTE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: "/Head-of-RO", roles: ["developer", "head-ro"] },
  { prefix: "/SRO", roles: ["sro", "developer"] },
  { prefix: "/RO", roles: ["ro", "developer"] },
  { prefix: "/youth-leader", roles: ["youth-leader", "developer"] },
  { prefix: "/volunteer", roles: ["volunteer", "developer"] },
];

/**
 * UX-level route guard only — the "role" cookie is client-writable and not
 * cryptographically verified. Real authorization happens server-side in the
 * API routes (see src/utils/authorization.ts). This just keeps a signed-in
 * user from landing on another role's page shell by direct navigation.
 */
export function proxy(req: NextRequest) {
  const rule = ROUTE_RULES.find((r) => req.nextUrl.pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const role = req.cookies.get("role")?.value;
  if (!role || !rule.roles.includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // The portal root has no page of its own; send it to the dashboard with a real 307.
  if (req.nextUrl.pathname === "/Head-of-RO" || req.nextUrl.pathname === "/Head-of-RO/") {
    return NextResponse.redirect(new URL("/Head-of-RO/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Head-of-RO",
    "/Head-of-RO/:path*",
    "/SRO/:path*",
    "/RO/:path*",
    "/youth-leader/:path*",
    "/volunteer/:path*",
  ],
};
