"use client";

const notifications = [
  {
    text: "Pedro Manalo submitted a new report.",
    time: "3h ago",
    unread: true,
  },
  {
    text: "Task 'Coordinate event logistics' is overdue.",
    time: "3h ago",
    unread: true,
  },
  {
    text: "Gloria Mendoza completed Q2 performance report.",
    time: "6h ago",
    unread: false,
  },
  {
    text: "New youth leader registered under Rosa Bautista.",
    time: "1d ago",
    unread: false,
  },
];

export function RecentNotifications() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Recent Notifications</h2>
        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
          2 new
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {notifications.map((n, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
              n.unread ? "bg-orange-50" : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 text-slate-600">
              {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
              <span className={n.unread ? "" : "pl-3.5"}>{n.text}</span>
            </div>
            <span className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
              {n.time}
              {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}