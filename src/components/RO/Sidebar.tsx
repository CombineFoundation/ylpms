"use client";

import { PortalSidebar } from "@/components/shared/PortalSidebar";
import { navItems } from "./nav";

export default function Sidebar() {
  return <PortalSidebar navItems={navItems} portalName="RO Portal" notificationsHref="/RO/notifications" />;
}