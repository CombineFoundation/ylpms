import {
  BarChart2,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText,
  HandHelping,
  Heart,
  LayoutDashboard,
  Settings,
} from "lucide-react";

/** RO portal navigation, shared by the sidebar and the topbar breadcrumb. */
export const navItems = [
  { label: "Dashboard", href: "/RO/dashboard", icon: LayoutDashboard },
  { label: "Youth Leaders", href: "/RO/youth-leaders", icon: Heart },
  { label: "Volunteers", href: "/RO/volunteers", icon: HandHelping },
  { label: "Tasks", href: "/RO/tasks", icon: CheckSquare },
  { label: "Reports", href: "/RO/reports", icon: FileText },
  { label: "Training", href: "/RO/training", icon: BookOpen },
  { label: "Activities", href: "/RO/activities", icon: CalendarDays },
  { label: "Analytics", href: "/RO/analytics", icon: BarChart2 },
  { label: "Notifications", href: "/RO/notifications", icon: Bell },
  { label: "Settings", href: "/RO/settings", icon: Settings },
] as const;

export function pageLabelFor(pathname: string) {
  return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";
}