import { RoleGuard } from "@/components/auth/RoleGuard";
import { requirePortalAccess } from "@/lib/server-auth";

export default async function RoLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess(["ro"]);
  return <RoleGuard allowedRoles={["ro"]}>{children}</RoleGuard>;
}
