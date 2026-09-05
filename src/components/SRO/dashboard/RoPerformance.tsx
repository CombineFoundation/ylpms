"use client";

const roPerformance = [
  { name: "Pedro", value: 87, color: "#16a34a", initials: "PE", avatarBg: "bg-red-400" },
  { name: "Rosa", value: 92, color: "#16a34a", initials: "RO", avatarBg: "bg-orange-400" },
  { name: "Felipe", value: 61, color: "#eab308", initials: "FE", avatarBg: "bg-blue-500" },
  { name: "Gloria", value: 78, color: "#ef4444", initials: "GL", avatarBg: "bg-emerald-500" },
  { name: "Ramon", value: 70, color: "#f97316", initials: "RA", avatarBg: "bg-orange-500" },
];

export function RoPerformance() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">RO Performance</h2>
      <div className="mt-4 flex flex-col gap-4">
        {roPerformance.map((ro) => (
          <div key={ro.name} className="flex items-center gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${ro.avatarBg}`}
            >
              {ro.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">{ro.name}</span>
                <span className="text-slate-500 font-medium">{ro.value}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${ro.value}%`, backgroundColor: ro.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}