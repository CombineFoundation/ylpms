"use client";

import { PortalScopePicker } from "@/components/shared/PortalScopePicker";

/** Developer-only SRO picker shown under the SRO portal's top bar. */
export function SroScopePicker() {
  return <PortalScopePicker role="sro" className="border-b px-6 py-2.5 lg:px-8" />;
}
