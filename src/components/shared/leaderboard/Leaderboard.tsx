"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { getInitials } from "@/utils/user-status";
import { FilterPills, PageHeader } from "@/components/Head-of-RO/shared/ListParts";
import type { LeaderboardEntry, LeaderboardResponse, LeaderboardTier } from "@/types/leaderboard.types";
import { TIERS, tierInfo } from "./tiers";

type Tab = "youthLeaders" | "volunteers";

function TierBadge({ tier }: { tier: LeaderboardTier }) {
  const info = tierInfo(tier);
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${info.badge}`}>
      <info.icon className="h-3.5 w-3.5" aria-hidden />
      {info.label}
    </span>
  );
}

/** Just the tier's icon, for narrow screens. */
function TierIcon({ tier, className = "" }: { tier: LeaderboardTier; className?: string }) {
  const info = tierInfo(tier);
  return (
    <span title={info.label} className={`rounded-full p-1.5 ring-1 ${info.badge} ${className}`}>
      <info.icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{info.label}</span>
    </span>
  );
}

function Avatar({ name, tier, size = "sm" }: { name: string; tier: LeaderboardTier; size?: "sm" | "lg" }) {
  const dimensions = size === "lg" ? "h-14 w-14 text-base" : "h-9 w-9 text-xs";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-navy font-bold text-white ring-2 ${dimensions} ${tierInfo(tier).ring}`}
    >
      {getInitials(name) || "?"}
    </span>
  );
}

/** The top three, biggest in the middle on wide screens. */
function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const order = entries.length === 3 ? [entries[1], entries[0], entries[2]] : entries;
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
      {order.map((entry) => (
        <li
          key={entry.userId}
          className={`flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm ${
            entry.rank === 1 ? "sm:pb-7 sm:pt-6" : ""
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">#{entry.rank}</span>
          <Avatar name={entry.name} tier={entry.tier} size="lg" />
          <span className="font-semibold text-gray-900">{entry.name}</span>
          {entry.city && <span className="-mt-1 text-xs text-gray-400">{entry.city}</span>}
          <TierBadge tier={entry.tier} />
          <span className="text-2xl font-bold text-gray-900">{entry.score}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Leaderboard for every portal: the current cohort's youth leaders and
 * volunteers, ranked, with tiers. Opened from the trophy in the top bar.
 * The score is shown, never how it's worked out.
 */
export function Leaderboard() {
  const { profile } = useCurrentProfile();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab | null>(null);

  const load = () => {
    setError(null);
    apiFetch<LeaderboardResponse>("/api/leaderboard")
      .then(setData)
      .catch((err) => setError(errorMessage(err, "Unable to load the leaderboard.")));
  };
  useEffect(load, []);

  // Volunteers start on their own board; everyone else on youth leaders.
  const activeTab: Tab = tab ?? (profile?.role === "volunteer" ? "volunteers" : "youthLeaders");
  const entries = useMemo(() => data?.[activeTab] ?? [], [data, activeTab]);
  const mine = entries.find((entry) => entry.userId === profile?.id);
  const rest = entries.length > 3 ? entries.slice(3) : [];

  const tabs = [
    { value: "youthLeaders" as const, label: `Youth Leaders${data ? ` (${data.youthLeaders.length})` : ""}` },
    { value: "volunteers" as const, label: `Volunteers${data ? ` (${data.volunteers.length})` : ""}` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description={`${data ? `${data.cohortName} · ` : ""}Youth leaders and volunteers ranked by their performance.`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills label="Show" options={tabs} value={activeTab} onChange={setTab} />
        <ul className="flex flex-wrap gap-2" aria-label="Tiers">
          {TIERS.map((item) => (
            <li key={item.tier} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${item.badge}`}>
              <item.icon className="h-3 w-3" aria-hidden />
              {item.label} <span className="font-normal opacity-75">· {item.share}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={load} className="text-xs font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}
      {!data && !error && <p className="text-sm text-gray-400">Loading the leaderboard…</p>}

      {data && entries.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          No one is ranked yet. The leaderboard fills in as {activeTab === "volunteers" ? "volunteers" : "youth leaders"} are
          assigned tasks.
        </p>
      )}

      {entries.length > 0 && <Podium entries={entries.slice(0, 3)} />}

      {rest.length > 0 && (
        <ol className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {rest.map((entry) => {
            const isMe = entry.userId === profile?.id;
            return (
              <li
                key={entry.userId}
                aria-current={isMe ? "true" : undefined}
                className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${isMe ? "bg-brand/5" : ""}`}
              >
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-gray-500">#{entry.rank}</span>
                <Avatar name={entry.name} tier={entry.tier} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-900">
                    {entry.name}
                    {isMe && <span className="ml-1.5 text-xs font-normal text-brand-dark">(you)</span>}
                  </span>
                  {entry.city && <span className="block truncate text-xs text-gray-400">{entry.city}</span>}
                </span>
                <span className="hidden sm:inline-flex">
                  <TierBadge tier={entry.tier} />
                </span>
                <TierIcon tier={entry.tier} className="sm:hidden" />
                <span className="w-10 shrink-0 text-right text-base font-bold text-gray-900">{entry.score}</span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Pinned to the bottom of the screen, so your own rank shows without scrolling. */}
      {mine && (
        <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-2xl border border-brand/30 bg-white px-4 py-3 shadow-lg sm:px-5">
          <span className="shrink-0 text-lg font-bold text-gray-900">#{mine.rank}</span>
          <Avatar name={mine.name} tier={mine.tier} />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-dark">Your rank</span>
            <span className="block truncate text-sm text-gray-600">
              {mine.name} · of {entries.length}
            </span>
          </span>
          <span className="hidden sm:inline-flex">
            <TierBadge tier={mine.tier} />
          </span>
          <TierIcon tier={mine.tier} className="sm:hidden" />
          <span className="w-10 shrink-0 text-right text-xl font-bold text-gray-900">{mine.score}</span>
        </div>
      )}
    </div>
  );
}
