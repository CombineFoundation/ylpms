"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { AnalyticsStatCards } from "./AnalyticsStatCards";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { PerformanceBreakdown } from "./PerformanceBreakdown";
import { RANGE_OPTIONS, type AnalyticsSummary, type RangeOption } from "./analytics.types";
import { FilterPills, PageHeader } from "../shared/ListParts";

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Downloads the summary currently on screen as a CSV (stats + monthly series + regions). */
function downloadCsv(summary: AnalyticsSummary) {
  const rows: (string | number)[][] = [
    ["Metric", "Value", "Change"],
    ["Total users", summary.stats.totalUsers.total, `${summary.stats.totalUsers.change} ${summary.stats.totalUsers.changeLabel}`],
    ["Activities this month", summary.stats.activitiesThisMonth.total, `${summary.stats.activitiesThisMonth.change} ${summary.stats.activitiesThisMonth.changeLabel}`],
    ["Reports filed", summary.stats.reportsFiled.total, `${summary.stats.reportsFiled.change} ${summary.stats.reportsFiled.changeLabel}`],
    ["Tasks completed", summary.stats.tasksCompleted.total, `${summary.stats.tasksCompleted.change} ${summary.stats.tasksCompleted.changeLabel}`],
    [],
    ["Month", "Total users", "Activities"],
    ...summary.userGrowth.map((point, index) => [point.month, point.value, summary.activitiesPerMonth[index]?.value ?? 0]),
    [],
    ["Region", "Volunteers"],
    ...summary.volunteersByRegion.map((region) => [region.name, region.value]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-${summary.months}mo-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsContent() {
  const [range, setRange] = useState<RangeOption>("6");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    apiFetch<AnalyticsSummary>(`/api/analytics/head-ro?months=${range}`)
      .then((data) => !cancelled && setSummary(data))
      .catch((error) => !cancelled && setLoadError(errorMessage(error, "Unable to load analytics.")))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Performance insights across all regions."
        actions={
          <button
            type="button"
            onClick={() => summary && downloadCsv(summary)}
            disabled={!summary || isLoading}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <Download size={13} />
            Export CSV
          </button>
        }
      />

      <FilterPills label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />

      {isLoading && <p className="text-sm text-gray-400">Loading analytics...</p>}

      {!isLoading && loadError && (
        <p role="alert" className="text-sm text-red-500">
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && summary && (
        <>
          <AnalyticsStatCards stats={summary.stats} />
          <AnalyticsCharts
            userGrowth={summary.userGrowth}
            activitiesPerMonth={summary.activitiesPerMonth}
            volunteersByRegion={summary.volunteersByRegion}
          />
        </>
      )}

      {/* Loads separately so a summary failure doesn't hide performance (and vice versa). */}
      <PerformanceBreakdown />
    </div>
  );
}
