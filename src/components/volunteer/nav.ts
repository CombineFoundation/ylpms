import { Award, Bell, BookOpen, CalendarDays, CheckSquare, LayoutDashboard, User } from "lucide-react";

/** Volunteer portal navigation, shared by the sidebar and the topbar breadcrumb. */
export const navItems = [
  { label: "Dashboard", href: "/volunteer/dashboard", icon: LayoutDashboard },
  { label: "My Tasks", href: "/volunteer/tasks", icon: CheckSquare },
  { label: "Activities", href: "/volunteer/activities", icon: CalendarDays },
  { label: "Training", href: "/volunteer/training", icon: BookOpen },
  { label: "Certificates", href: "/volunteer/certificates", icon: Award },
  { label: "Notifications", href: "/volunteer/notifications", icon: Bell },
  { label: "Profile", href: "/volunteer/profile", icon: User },
] as const;

export function pageLabelFor(pathname: string) {
  return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";
}
