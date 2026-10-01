import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";
import type { MemberRequestSummary } from "@/components/SRO/dashboard/dashboard.types";

type PendingRequestsBannerProps = {
  requests: MemberRequestSummary;
  /** Where the requests are handled, e.g. "/SRO/youth-leaders". */
  href: string;
  /** e.g. "youth leader" or "volunteer". */
  noun: string;
};

/** Pending member requests: an action item for an approver, a status note for the requester. */
export function PendingRequestsBanner({ requests, href, noun }: PendingRequestsBannerProps) {
  if (!requests || requests.pending === 0) return null;
  const plural = requests.pending === 1 ? noun : `${noun}s`;
  const text =
    requests.kind === "to-approve"
      ? `${requests.pending} ${plural} waiting for your approval`
      : `${requests.pending} ${plural} you requested ${requests.pending === 1 ? "is" : "are"} awaiting RO approval`;

  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        requests.kind === "to-approve"
          ? "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 shrink-0" />
        {text}
      </span>
      <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold">
        {requests.kind === "to-approve" ? "Review" : "View"} <ChevronRight size={13} />
      </span>
    </Link>
  );
}
