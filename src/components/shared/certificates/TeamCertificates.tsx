"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, Download, Eye } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { usePortalData } from "@/hooks/usePortalScope";
import { PageHeader, SearchInput, TableMessageRow, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";
import { exportActivityCertificatesCsv, formatCertificateDate, roleLabels, type ApiTeamCertificateGroup, type ApiTeamCertificates } from "./certificate.types";
import { TeamCertificateDetailModal } from "./TeamCertificateDetailModal";

type TeamPortal = "head-ro" | "sro" | "ro";
type Loaded = { data: ApiTeamCertificates | null; isLoading: boolean; error: string | null; reload: () => void };

const PATH = "/api/certificates/team";
const ERROR = "Unable to load certificates.";

const DESCRIPTIONS: Record<TeamPortal, string> = {
  "head-ro": "Certificates issued across the program, one row per verified activity. Open a row to see every volunteer who was certified.",
  sro: "Certificates issued to your team, one row per verified activity. Open a row to see every volunteer who was certified.",
  ro: "Certificates issued to your youth leaders and their volunteers, one row per verified activity. Open a row to see who was certified.",
};

/** Certificates issued to a manager's team (Head RO: the whole program), grouped by activity. */
export function TeamCertificates({ portal }: { portal: TeamPortal }) {
  return portal === "head-ro" ? <HeadROCertificates /> : <ScopedCertificates portal={portal} />;
}

function HeadROCertificates() {
  const [data, setData] = useState<ApiTeamCertificates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await apiFetch<ApiTeamCertificates>(PATH));
    } catch (err) {
      setError(errorMessage(err, ERROR));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return <CertificatesView portal="head-ro" loaded={{ data, isLoading, error, reload }} />;
}

function ScopedCertificates({ portal }: { portal: "sro" | "ro" }) {
  const loaded = usePortalData<ApiTeamCertificates>(portal, PATH, ERROR);
  return <CertificatesView portal={portal} loaded={loaded} />;
}

function CertificatesView({ portal, loaded }: { portal: TeamPortal; loaded: Loaded }) {
  const { data, isLoading, error, reload } = loaded;
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<ApiTeamCertificateGroup | null>(null);

  const groups = useMemo(() => data?.groups ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((group) =>
      [group.activityTitle, group.activityLocation, ...group.certificates.flatMap((c) => [c.recipientName, c.certificateNumber])].some(
        (value) => value?.toLowerCase().includes(q)
      )
    );
  }, [groups, search]);

  const totals = data?.totals;
  const stats = [
    { label: "Certificates issued", value: totals?.certificates },
    { label: "Verified activities", value: totals?.activities },
    { label: "Leadership (organizers)", value: totals?.leadership },
    { label: "Participation (volunteers)", value: totals?.participation },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Certificates" description={DESCRIPTIONS[portal]} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{isLoading || stat.value === undefined ? "–" : stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:w-[28rem]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by activity, person or certificate number..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <th className="px-5 py-3">Activity</th>
                <th className="px-4 py-3">Organizer certificate</th>
                <th className="px-4 py-3">Volunteers certified</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && <TableMessageRow colSpan={5} message="Loading certificates..." />}
              {!isLoading && error && <TableMessageRow colSpan={5} message={error} error />}
              {!isLoading &&
                !error &&
                filtered.map((group) => (
                  <tr key={group.activityId} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{group.activityTitle}</p>
                      <p className="text-xs text-gray-400">
                        {group.activityLocation || "—"} · {formatCertificateDate(group.activityDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="flex items-center gap-1.5 font-medium text-gray-800">
                        <Award className="h-4 w-4 shrink-0 text-brand" />
                        {group.lead.recipientName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {roleLabels[group.lead.recipientRole] ?? group.lead.recipientRole} · {group.lead.certificateNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      {group.participantCount}
                      <span className="text-gray-400"> volunteer{group.participantCount === 1 ? "" : "s"}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-500">{formatCertificateDate(group.issuedAt)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {portal === "head-ro" && (
                          <button
                            type="button"
                            onClick={() => exportActivityCertificatesCsv(group)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand hover:text-brand"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Export CSV
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewing(group)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand hover:text-brand"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && !error && filtered.length === 0 && (
                <TableMessageRow
                  colSpan={5}
                  message={emptyMessage({
                    isFiltered: !!search.trim(),
                    noun: "certificates",
                    emptyHint: "They're issued when an activity's evidence is verified.",
                  })}
                />
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && error && (
          <div className="border-t border-gray-100 px-5 py-3">
            <button type="button" onClick={reload} className="text-sm font-medium text-brand hover:underline">
              Retry
            </button>
          </div>
        )}
      </section>

      <TeamCertificateDetailModal group={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
