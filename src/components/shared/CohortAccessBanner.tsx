"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award } from "lucide-react";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { formatDate } from "@/utils/format-date";

/** How long before the cohort ends the reminder starts showing. */
const REMINDER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Youth Leader and Volunteer portals: a reminder in the last 30 days of the
 * cohort to download certificates, and once it has ended, why only the
 * Certificates page is still open. Shows nothing for anyone else.
 */
export function CohortAccessBanner({ certificatesHref }: { certificatesHref: string }) {
  const pathname = usePathname();
  const access = useCurrentProfile().profile?.cohortAccess;
  if (!access) return null;

  if (access.closed) {
    return (
      <div role="status" className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900 lg:px-8">
        <Award className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          {access.message} Download them to keep a copy.
        </p>
      </div>
    );
  }

  const endsAt = access.endsAt ? new Date(access.endsAt) : null;
  if (!endsAt || endsAt.getTime() - Date.now() > REMINDER_DAYS * DAY_MS) return null;

  return (
    <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900 lg:px-8">
      <Award className="h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1">
        Your access to the portal ends on <strong>{formatDate(endsAt)}</strong>. After that you can only download your
        certificates.
      </p>
      {!pathname.startsWith(certificatesHref) && (
        <Link href={certificatesHref} className="font-semibold text-amber-900 underline underline-offset-2 hover:text-brand">
          View certificates
        </Link>
      )}
    </div>
  );
}
