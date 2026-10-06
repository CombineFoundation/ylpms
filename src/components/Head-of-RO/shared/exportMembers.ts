"use client";

import { apiFetchPage } from "@/lib/api-client";
import { downloadCsv } from "@/utils/csv";
import { toUserRow, type ApiUser, type UserRow } from "./users";

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

type ExportOptions = {
  /** The list's API path without paging, e.g. `/api/users?role=volunteer&reportingToId=…`. */
  path: string;
  /** The same search/filters the screen applies, so the file matches what's shown. */
  keep: (row: UserRow) => boolean;
  /** e.g. "volunteers" → volunteers-2026-10-06.csv */
  fileStem: string;
  regionLabel: string;
  managerLabel: string;
  /** Header for directReportCount, or omit for roles with no team. */
  teamLabel?: string;
};

/** Downloads every matching member (all pages, not just those loaded on screen) as a CSV. */
export async function exportMembersCsv({ path, keep, fileStem, regionLabel, managerLabel, teamLabel }: ExportOptions) {
  const users: ApiUser[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { items, meta } = await apiFetchPage<ApiUser>(`${path}&pageSize=${PAGE_SIZE}&pageNumber=${page}`);
    users.push(...items);
    if (!meta.hasMore) break;
  }

  const rows = users
    .map((user) => ({ user, row: toUserRow(user) }))
    .filter(({ row }) => keep(row))
    .map(({ user, row }) => [
      row.name,
      row.memberId,
      row.email,
      user.phone ?? "",
      row.region,
      row.university,
      row.reportingToId ? row.reportingToName : "",
      row.status,
      row.joined,
      ...(teamLabel ? [row.directReportCount] : []),
    ]);

  const header = ["Name", "Program ID", "Email", "Phone", regionLabel, "University", managerLabel, "Status", "Joined"];
  const today = new Date().toISOString().slice(0, 10);
  downloadCsv(`${fileStem}-${today}.csv`, [teamLabel ? [...header, teamLabel] : header, ...rows]);
  return rows.length;
}
