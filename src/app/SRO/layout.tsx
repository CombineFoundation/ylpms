import { RoleGuard } from "@/components/auth/RoleGuard";
import { requirePortalAccess } from "@/lib/server-auth";

export default async function SroLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess(["sro"]);
  return <RoleGuard allowedRoles={["sro"]}>{children}</RoleGuard>;
}
