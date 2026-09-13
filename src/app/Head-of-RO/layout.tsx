import { RoleGuard } from "@/components/auth/RoleGuard";
import { requirePortalAccess } from "@/lib/server-auth";

export default async function HeadOfRoLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess(["head-ro"]);
  return <RoleGuard allowedRoles={["head-ro"]}>{children}</RoleGuard>;
}
