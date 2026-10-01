"use client";

import { useMemo, useState } from "react";
import { Award, Calendar, Download, MapPin } from "lucide-react";
import { usePortalData } from "@/hooks/usePortalScope";
import type { ScopedRole } from "@/utils/portal-scope";
import { PageHeader, SearchInput, emptyMessage } from "@/components/Head-of-RO/shared/ListParts";
import { timestampToDate } from "@/utils/user-status";
import { certificateHtml, formatCertificateDate, kindLabels, type ApiCertificate } from "./certificate.types";

/** Opens the certificate in its own window and triggers print (where it can be saved as a PDF). */
function printCertificate(certificate: ApiCertificate): boolean {
  const url = URL.createObjectURL(new Blob([certificateHtml(certificate)], { type: "text/html" }));
  const tab = window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return !!tab;
}

/** The signed-in user's certificates, issued when activities they took part in are verified. */
export function CertificateList({ portal }: { portal: ScopedRole }) {
  const { data, isLoading, error, reload } = usePortalData<ApiCertificate[]>(portal, "/api/certificates", "Unable to load certificates.");
  const certificates = useMemo(() => data ?? [], [data]);
  const [search, setSearch] = useState("");
  const [popupBlocked, setPopupBlocked] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter((c) => [c.title, c.eventTitle, c.certificateNumber, c.eventLocation].some((v) => v.toLowerCase().includes(q)));
  }, [certificates, search]);

  const now = new Date();
  const thisMonth = certificates.filter((c) => {
    const issuedAt = timestampToDate(c.issuedAt);
    return issuedAt?.getFullYear() === now.getFullYear() && issuedAt.getMonth() === now.getMonth();
  }).length;
  const leadership = certificates.filter((c) => c.kind === "organizer").length;

  const stats = [
    { label: "Total certificates", value: certificates.length },
    { label: "Earned this month", value: thisMonth },
    { label: "Participation", value: certificates.length - leadership },
    { label: "Leadership", value: leadership },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Issued automatically when an activity you took part in (or organized) is verified. Download any of them as a PDF."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{isLoading ? "–" : stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="sm:w-96">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by activity or certificate number..." />
      </div>

      {popupBlocked && (
        <p role="alert" className="text-sm text-red-500">
          Your browser blocked the certificate window. Allow pop-ups for this site and try again.
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 animate-pulse" aria-busy="true" aria-label="Loading certificates">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-44 rounded-xl bg-slate-200" />
          ))}
        </div>
      )}
      {!isLoading && error && (
        <p role="alert" className="text-sm text-red-500">
          {error}{" "}
          <button type="button" onClick={reload} className="font-medium text-brand hover:underline">
            Retry
          </button>
        </p>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-400">
          {emptyMessage({
            isFiltered: !!search.trim(),
            noun: "certificates",
            emptyHint: "Take part in an activity — once its organizer's evidence is verified, your certificate appears here.",
          })}
        </p>
      )}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((certificate) => (
            <article key={certificate.id} className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                  <Award className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {kindLabels[certificate.kind]}
                </span>
              </div>
              <h2 className="text-sm font-bold text-gray-800">{certificate.title}</h2>
              <p className="mt-0.5 text-sm text-gray-600">{certificate.eventTitle}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {formatCertificateDate(certificate.eventDate)}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  {certificate.eventLocation}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="font-mono text-[11px] text-gray-400">{certificate.certificateNumber}</span>
                <button
                  type="button"
                  onClick={() => setPopupBlocked(!printCertificate(certificate))}
                  className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                >
                  <Download size={12} />
                  Download PDF
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
