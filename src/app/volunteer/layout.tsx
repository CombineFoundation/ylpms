import { RoleGuard } from "@/components/auth/RoleGuard";
import { requirePortalAccess } from "@/lib/server-auth";

export default async function VolunteerLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess(["volunteer"]);
  return <RoleGuard allowedRoles={["volunteer"]}>{children}</RoleGuard>;
}
