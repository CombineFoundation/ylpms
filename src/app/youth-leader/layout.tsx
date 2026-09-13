import { RoleGuard } from "@/components/auth/RoleGuard";
import { requirePortalAccess } from "@/lib/server-auth";

export default async function YouthLeaderLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess(["youth-leader"]);
  return <RoleGuard allowedRoles={["youth-leader"]}>{children}</RoleGuard>;
}
