"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { uploadReportPdf } from "@/lib/report-attachments";
import { scopedPath, usePortalData, usePortalScope, type ScopedRole } from "@/hooks/usePortalScope";
import { FilterPills, PageHeader } from "@/components/Head-of-RO/shared/ListParts";
import type { ApiReport } from "@/components/Head-of-RO/reports/report-display.types";
import { TeamReports } from "./TeamReports";
import { MyReports } from "./MyReports";
import { SubmitReportModal } from "./SubmitReportModal";
import { toReportPayload, type SubmitReportForm } from "./submit-report.types";

type Tab = "team" | "mine";

/** Portals whose users submit reports (volunteers don't). */
export type ReportingRole = Exclude<ScopedRole, "volunteer">;

const reviewerFor: Record<ReportingRole, string> = { sro: "Head RO", ro: "SRO", "youth-leader": "SRO" };
/** null: the role has no team reports to show (volunteers don't submit reports). */
const teamCopy: Record<ReportingRole, string | null> = {
  sro: "Review your team's reports",
  ro: "See your youth leaders' reports",
  "youth-leader": null,
};

/**
 * Reports for a manager: their team's (an SRO reviews them; an RO sees them
 * view-only) and their own, submitted to their reviewer (SRO → Head RO, RO /
 * youth leader → SRO). A youth leader only has their own.
 */
export function TeamReportList({ portal }: { portal: ReportingRole }) {
  const reviewer = reviewerFor[portal];
  const hasTeam = teamCopy[portal] !== null;
  const [tab, setTab] = useState<Tab>(hasTeam ? "team" : "mine");
  const { selectedId } = usePortalScope(portal);
  // GET /api/reports returns only the caller's own reports (or the chosen SRO's/RO's, for a developer).
  const mine = usePortalData<ApiReport[]>(portal, "/api/reports?pageSize=100", "Unable to load your reports.");
  const myReports = useMemo(() => mine.data ?? [], [mine.data]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const awaiting = myReports.filter((r) => r.status === "submitted" || r.status === "reviewed").length;
  const tabs = [
    { value: "team" as const, label: "Team reports" },
    { value: "mine" as const, label: `My reports (${myReports.length})` },
  ];
  const intro = hasTeam ? `${teamCopy[portal]} and submit your own to the ${reviewer}` : `Submit your reports to the ${reviewer}`;

  const handleSubmit = async (values: SubmitReportForm, files: File[]) => {
    setFormError(null);
    try {
      const attachments = [];
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading PDF ${index + 1} of ${files.length}...`);
        attachments.push(await uploadReportPdf(file, selectedId ? { role: portal, id: selectedId } : null));
      }
      setProgress(files.length ? "Submitting report..." : null);
      const payload = toReportPayload(values);
      await apiFetch(scopedPath("/api/reports", portal, selectedId), {
        method: "POST",
        body: { ...payload, content: { ...payload.content, attachments } },
      });
      setIsSubmitting(false);
      setTab("mine");
      setNotice(`"${values.title}" was submitted to the ${reviewer} for review.`);
      mine.reload();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to submit this report."));
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={awaiting > 0 ? `${intro} · ${awaiting} awaiting ${reviewer}.` : `${intro}.`}
        actions={
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsSubmitting(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" /> Submit Report
          </button>
        }
      />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {hasTeam && <FilterPills label="View" options={tabs} value={tab} onChange={setTab} />}

      {tab === "team" && portal !== "youth-leader" ? (
        <TeamReports portal={portal} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <MyReports reports={myReports} isLoading={mine.isLoading} error={mine.error} reviewer={reviewer} />
        </div>
      )}

      <SubmitReportModal
        isOpen={isSubmitting}
        error={formError}
        progress={progress}
        reviewer={reviewer}
        onClose={() => setIsSubmitting(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

/** The SRO portal's Reports page. */
export function ReportList() {
  return <TeamReportList portal="sro" />;
}
