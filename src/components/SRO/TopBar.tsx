"use client";

import { PortalTopBar } from "@/components/shared/PortalTopBar";
import { pageLabelFor } from "./nav";

export function TopBar() {
  return <PortalTopBar pageLabelFor={pageLabelFor} notificationsHref="/SRO/notifications" />;
}
