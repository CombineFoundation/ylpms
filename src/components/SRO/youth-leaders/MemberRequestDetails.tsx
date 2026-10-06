import { MemberProfileCard } from "@/components/shared/MemberProfileCard";
import { formatRelativeTime } from "@/utils/user-status";
import type { ApiMemberRequest } from "@/types/member-request.types";

/** Every field of a member request, plus who asked for it, shown before the approver decides. */
export function MemberRequestDetails({ request, noun }: { request: ApiMemberRequest; noun: string }) {
  const fields: [string, string | undefined][] = [
    ["Name", request.name],
    ["Team role", request.teamRole],
    ["ID", request.memberId],
    ["Email", request.email],
    ["Phone", request.phone],
    ["University", request.university],
    ["City", request.region],
    ["Requested", request.createdAt ? formatRelativeTime(request.createdAt) : undefined],
  ];

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-gray-100 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Proposed {noun}</h3>
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
      </section>
      {request.requesterProfile ? (
        <MemberProfileCard title="Requested by" profile={request.requesterProfile} />
      ) : (
        <p className="text-xs text-gray-500">Requested by {request.requestedByName}</p>
      )}
    </div>
  );
}
