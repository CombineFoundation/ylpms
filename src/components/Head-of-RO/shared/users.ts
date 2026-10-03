import { formatJoinedDate, getEffectiveStatus, type DisplayStatus, type TimestampInput } from "@/utils/user-status";
import type { UserRole, UserStatus } from "@/types/user.types";

/** A user as returned by GET /api/users (already enriched server-side). */
export type ApiUser = {
  id: string;
  email: string;
  name: string;
  memberId?: string;
  university?: string;
  role: UserRole;
  region?: string;
  phone?: string;
  status?: UserStatus;
  reportingToId?: string;
  reportingToName?: string;
  directReportCount?: number;
  lastLoginAt?: TimestampInput;
  createdAt?: TimestampInput;
};

export type UserRow = {
  id: string;
  email: string;
  name: string;
  /** Program ID ("" for older accounts without one). */
  memberId: string;
  /** "" when not entered. */
  university: string;
  role: UserRole;
  /** Raw stored region ("" when unset) — use this in edit forms. */
  region: string;
  /** Display label: the region, or "Unassigned". */
  regionLabel: string;
  storedStatus?: UserStatus;
  status: DisplayStatus;
  reportingToId: string;
  reportingToName: string;
  directReportCount: number;
  joined: string;
};

export function toUserRow(user: ApiUser): UserRow {
  return {
    id: user.id,
    email: user.email || "",
    name: user.name || "",
    memberId: user.memberId || "",
    university: user.university || "",
    role: user.role,
    region: user.region || "",
    regionLabel: user.region || "Unassigned",
    storedStatus: user.status,
    status: getEffectiveStatus(user),
    reportingToId: user.reportingToId || "",
    reportingToName: user.reportingToId ? user.reportingToName || "Unknown" : "Unassigned",
    directReportCount: user.directReportCount ?? 0,
    joined: formatJoinedDate(user.createdAt),
  };
}

export function matchesQuery(row: UserRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.name, row.email, row.memberId, row.university, row.regionLabel, row.reportingToName, row.status].some((value) =>
    value?.toLowerCase().includes(q)
  );
}

export const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Idle", label: "Idle" },
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
  { value: "Suspended", label: "Suspended" },
] as const;

export type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]["value"];

/** Unique non-empty region labels, for a region filter. */
export function regionOptions(rows: UserRow[]) {
  return [...new Set(rows.map((row) => row.regionLabel))].sort((a, b) => a.localeCompare(b));
}
