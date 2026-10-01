/** Placeholder layout while a dashboard summary loads. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="h-64 rounded-2xl bg-slate-200 lg:col-span-2" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-slate-200" />
        <div className="h-56 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
