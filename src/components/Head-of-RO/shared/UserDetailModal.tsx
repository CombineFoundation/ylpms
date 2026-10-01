"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { apiFetchPage, errorMessage } from "@/lib/api-client";
import { getInitials } from "@/utils/user-status";
import { StatusBadge } from "./ListParts";
import { toUserRow, type ApiUser, type UserRow } from "./users";

type UserDetailModalProps = {
  user: UserRow | null;
  managerLabel: string;
  /** Label for the direct-reports section, e.g. "Volunteers"; omit to hide it. */
  reportsLabel?: string;
  onClose: () => void;
};

/** Read-only profile view with the user's manager and (optionally) their direct reports. */
export function UserDetailModal({ user, managerLabel, reportsLabel, onClose }: UserDetailModalProps) {
  const [reports, setReports] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !reportsLabel) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setReports([]);
    apiFetchPage<ApiUser>(`/api/users?reportingToId=${user.id}&pageSize=100`)
      .then(({ items }) => !cancelled && setReports(items.map(toUserRow)))
      .catch((err) => !cancelled && setError(errorMessage(err, "Unable to load direct reports.")))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user, reportsLabel]);

  return (
    <Modal isOpen={!!user} title={user?.name ?? ""} onClose={onClose} size="lg">
      {user && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-500">{user.memberId ? `ID ${user.memberId} · ` : ""}{user.email}</p>
              {user.university && <p className="truncate text-xs text-gray-400">{user.university}</p>}
              <div className="mt-1">
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-xs text-gray-400">{managerLabel}</dt>
              <dd className="mt-0.5 font-medium text-gray-800">{user.reportingToName}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-xs text-gray-400">Region</dt>
              <dd className="mt-0.5 font-medium text-gray-800">{user.regionLabel}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-xs text-gray-400">Joined</dt>
              <dd className="mt-0.5 font-medium text-gray-800">{user.joined}</dd>
            </div>
          </dl>

          {reportsLabel && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                {reportsLabel} ({isLoading ? "…" : reports.length})
              </h3>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {!isLoading && !error && reports.length === 0 && <p className="text-sm text-gray-400">None yet.</p>}
              {reports.length > 0 && (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                  {reports.map((report) => (
                    <li key={report.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{report.name}</p>
                        <p className="truncate text-xs text-gray-400">{report.email}</p>
                      </div>
                      <StatusBadge status={report.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
