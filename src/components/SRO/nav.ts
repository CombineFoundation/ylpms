import { BookOpen, CalendarDays, FileText, LayoutGrid, ListChecks, MessageSquare, UserRound, Users } from "lucide-react";

/** SRO portal navigation, shared by the sidebar and the topbar breadcrumb. */
export const navItems = [
  { label: "Dashboard", href: "/SRO/dashboard", icon: LayoutGrid },
  { label: "Assigned ROs", href: "/SRO/assigned-ros", icon: Users },
  { label: "Youth Leaders", href: "/SRO/youth-leaders", icon: UserRound },
  { label: "Tasks", href: "/SRO/tasks", icon: ListChecks },
  { label: "Reports", href: "/SRO/reports", icon: FileText },
  { label: "Training", href: "/SRO/training", icon: BookOpen },
  { label: "Activities", href: "/SRO/activities", icon: CalendarDays },
  { label: "Notifications", href: "/SRO/notifications", icon: MessageSquare },
] as const;

export function pageLabelFor(pathname: string) {
  return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";
}
