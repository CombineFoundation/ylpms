import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText,
  HandHelping,
  LayoutDashboard,
  Settings,
} from "lucide-react";

/** Youth Leader portal navigation, shared by the sidebar and the topbar breadcrumb. */
export const navItems = [
  { label: "Dashboard", href: "/youth-leader/dashboard", icon: LayoutDashboard },
  { label: "My Volunteers", href: "/youth-leader/volunteers", icon: HandHelping },
  { label: "Tasks", href: "/youth-leader/tasks", icon: CheckSquare },
  { label: "Activities", href: "/youth-leader/activities", icon: CalendarDays },
  { label: "Reports", href: "/youth-leader/reports", icon: FileText },
  { label: "Training", href: "/youth-leader/training", icon: BookOpen },
  { label: "Certificates", href: "/youth-leader/certificates", icon: Award },
  { label: "Notifications", href: "/youth-leader/notifications", icon: Bell },
  { label: "Settings", href: "/youth-leader/settings", icon: Settings },
] as const;

export function pageLabelFor(pathname: string) {
  return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";
}
