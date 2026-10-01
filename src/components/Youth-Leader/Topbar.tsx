"use client";

import { PortalTopBar } from "@/components/shared/PortalTopBar";
import { pageLabelFor } from "./nav";

export default function Topbar() {
  return <PortalTopBar pageLabelFor={pageLabelFor} notificationsHref="/youth-leader/notifications" />;
}
