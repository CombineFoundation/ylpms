import { roleTitles } from "@/hooks/useCurrentProfile";
import type { MemberProfile } from "@/types/user.types";

const roleShort: Record<MemberProfile["role"], string> = {
  developer: "Developer",
  "head-ro": "Head RO",
  sro: "SRO",
  ro: "RO",
  "youth-leader": "Youth Leader",
  volunteer: "Volunteer",
};

/** Name with a short role, e.g. "Ali Khan (RO)". */
export const nameWithRole = (name: string, role?: MemberProfile["role"]) => (role ? `${name} (${roleShort[role]})` : name);

/** Everything a reviewer needs about the person they're deciding on: contact details and who they report to. */
export function MemberProfileCard({ title, profile }: { title: string; profile: MemberProfile }) {
  const isStudent = profile.role === "youth-leader" || profile.role === "volunteer";
  const fields: [string, string | undefined][] = [
    ["Role", roleTitles[profile.role]],
    ["Team role", profile.teamRole],
    ["ID", profile.memberId],
    ["Email", profile.email],
    ["Phone", profile.phone],
    ["University", profile.university],
    [isStudent ? "City" : "Region", profile.region],
  ];

  return (
    <section className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <p className="mt-1 font-semibold text-gray-900">{profile.name}</p>
      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {fields
          .filter(([, value]) => !!value)
          .map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-gray-400">{label}</dt>
              <dd className="break-words text-gray-700">{value}</dd>
            </div>
          ))}
      </dl>
      {profile.chain.length > 0 && (
        <p className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-500">
          Reports to {profile.chain.map((manager) => nameWithRole(manager.name, manager.role)).join(" → ")}
        </p>
      )}
    </section>
  );
}
