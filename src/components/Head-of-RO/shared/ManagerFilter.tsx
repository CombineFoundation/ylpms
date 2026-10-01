"use client";

import type { UserRole } from "@/types/user.types";
import { ManagerSelect } from "./ManagerSelect";

/** "Reporting to: [manager ▾]" filter, applied server-side via ?reportingToId=. */
export function ManagerFilter({
  label,
  roles,
  value,
  onChange,
}: {
  label: string;
  roles: UserRole[];
  value: string;
  onChange: (managerId: string) => void;
}) {
  return (
    <label className="flex max-w-sm flex-col text-sm font-medium text-gray-600 sm:flex-row sm:items-center sm:gap-2">
      <span className="shrink-0">{label}:</span>
      <span className="flex-1 [&_select]:mt-0 [&_select]:py-1.5">
        <ManagerSelect roles={roles} value={value} onChange={onChange} allowUnassigned={false} placeholder="Anyone" />
      </span>
    </label>
  );
}
