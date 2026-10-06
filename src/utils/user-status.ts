/**
 * Active    – signed in within the last 7 days
 * Idle      – has signed in before, but not in the last 7 days
 * Pending   – account created, never signed in
 * Inactive  – deactivated (stored status "inactive"); can't sign in
 * Suspended – suspended by a manager; can't sign in
 */
import { formatDayMonth, formatMonthYear } from "./format-date";

export type DisplayStatus = "Active" | "Idle" | "Pending" | "Inactive" | "Suspended";

export const DISPLAY_STATUSES: DisplayStatus[] = ["Active", "Idle", "Pending", "Inactive", "Suspended"];

export type FirestoreTimestampLike = {
  _seconds?: number;
  _nanoseconds?: number;
  seconds?: number;
  nanoseconds?: number;
};

export type TimestampInput =
  | string
  | number
  | Date
  | FirestoreTimestampLike
  | null
  | undefined;

export const statusStyles: Record<DisplayStatus, string> = {
  Active: "bg-emerald-100 text-emerald-600",
  Idle: "bg-blue-100 text-blue-600",
  Pending: "bg-amber-100 text-amber-600",
  Inactive: "bg-gray-100 text-gray-500",
  Suspended: "bg-red-100 text-red-600",
};

export function timestampToDate(value?: TimestampInput): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value < 10_000_000_000 ? value * 1000 : value);
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const seconds = value._seconds ?? value.seconds;
  const nanoseconds = value._nanoseconds ?? value.nanoseconds ?? 0;

  if (typeof seconds === "number") {
    return new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000));
  }

  return null;
}

/**
 * Single source of truth for the status badge on every user list: a stored
     * inactive/suspended status always wins; otherwise it's derived from logins.
 */
export function getEffectiveStatus(user: { status?: string; lastLoginAt?: TimestampInput }): DisplayStatus {
  if (user.status === "suspended") return "Suspended";
  if (user.status === "inactive") return "Inactive";

  const lastLogin = timestampToDate(user.lastLoginAt);
  if (!lastLogin) return "Pending";

  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - lastLogin.getTime() >= sevenDays ? "Idle" : "Active";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatJoinedDate(value?: TimestampInput): string {
  const date = timestampToDate(value);
  return formatMonthYear(date);
}

export function formatRelativeTime(value?: TimestampInput): string {
  const date = timestampToDate(value);
  if (!date) return "-";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDayMonth(date);
}
