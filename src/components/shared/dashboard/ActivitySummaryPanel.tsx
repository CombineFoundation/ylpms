import Link from "next/link";
import { Award, CalendarDays, ChevronRight, ClipboardCheck, ThumbsUp } from "lucide-react";
import type { ActivitySummary } from "@/components/SRO/dashboard/dashboard.types";

type ActivitySummaryPanelProps = {
  activities: ActivitySummary;
  /** The portal's events page, e.g. "/RO/activities". */
  eventsHref: string;
  /** Hide the review tiles for someone who doesn't review activities (a youth leader). */
  showReview?: boolean;
  title?: string;
};

/** Activities awaiting the viewer's approval / verification, and what's coming up. */
export function ActivitySummaryPanel({ activities, eventsHref, showReview = true, title = "Activities" }: ActivitySummaryPanelProps) {
  const toReview = activities.awaitingApproval + activities.awaitingVerification;
  const tiles = [
    ...(showReview
      ? [
          { label: "Awaiting approval", value: activities.awaitingApproval, icon: ThumbsUp, style: "bg-amber-50 text-amber-600" },
          {
            label: "Awaiting verification",
            value: activities.awaitingVerification,
            icon: ClipboardCheck,
            style: "bg-purple-50 text-purple-600",
          },
        ]
      : []),
    { label: "Upcoming", value: activities.upcoming, icon: CalendarDays, style: "bg-blue-50 text-blue-600" },
    { label: "Certificates issued", value: activities.certificatesIssued, icon: Award, style: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-700">
          {title}
          {showReview && toReview > 0 && (
            <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              {toReview} need{toReview === 1 ? "s" : ""} you
            </span>
          )}
        </h2>
        <Link href={eventsHref} className="flex items-center gap-0.5 text-xs font-medium text-orange-500">
          Open <ChevronRight size={13} />
        </Link>
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-3 ${tiles.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-xl p-3 ${tile.style}`}>
            <tile.icon size={15} />
            <p className="mt-2 text-lg font-semibold">{tile.value}</p>
            <p className="text-[11px] opacity-80">{tile.label}</p>
          </div>
        ))}
      </div>

      {showReview && activities.reviewQueue.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Waiting on you</p>
          <ul className="mt-2 flex flex-col gap-2">
            {activities.reviewQueue.map((item) => (
              <li key={item.id}>
                <Link
                  href={eventsHref}
                  className="flex items-center justify-between gap-3 rounded-xl bg-orange-50/60 px-3 py-2 text-sm hover:bg-orange-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-slate-700">{item.title}</span>
                    <span className="text-xs text-slate-400">
                      {item.organizerName} · {item.date}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-orange-600">
                    {item.status === "submitted" ? "Approve" : "Verify"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coming up</p>
        {activities.upcomingEvents.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">No upcoming activities.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {activities.upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700">{event.title}</p>
                  <p className="text-xs text-slate-400">
                    {event.date}
                    {event.location ? ` · ${event.location}` : ""} · {event.organizerName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
