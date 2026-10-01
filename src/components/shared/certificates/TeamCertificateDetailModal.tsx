"use client";

import { useState } from "react";
import { Calendar, Download, MapPin } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCertificateDate, kindLabels, printCertificate, roleLabels, type ApiTeamCertificateGroup } from "./certificate.types";

/** Everyone certified for one activity: the organizer's certificate first, then each volunteer's. */
export function TeamCertificateDetailModal({ group, onClose }: { group: ApiTeamCertificateGroup | null; onClose: () => void }) {
  const [popupBlocked, setPopupBlocked] = useState(false);
  const participants = group?.certificates.filter((c) => c.kind === "participation") ?? [];
  const organizers = group?.certificates.filter((c) => c.kind === "organizer") ?? [];

  return (
    <Modal isOpen={!!group} title={group?.eventTitle ?? ""} onClose={onClose} size="lg">
      {group && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {group.eventLocation || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatCertificateDate(group.eventDate)}
            </span>
            <span>Verified by {group.issuedByName}</span>
          </div>

          {popupBlocked && (
            <p role="alert" className="text-sm text-red-500">
              Your browser blocked the certificate window. Allow pop-ups for this site and try again.
            </p>
          )}

          {[
            { title: "Organizer", list: organizers, empty: "No organizer certificate in your team for this activity." },
            { title: `Participants (${participants.length})`, list: participants, empty: "No participant certificates in your team." },
          ].map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</h3>
              {section.list.length === 0 ? (
                <p className="text-sm text-gray-400">{section.empty}</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                  {section.list.map((certificate) => (
                    <li key={certificate.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{certificate.recipientName}</p>
                        <p className="text-xs text-gray-400">
                          {roleLabels[certificate.recipientRole] ?? certificate.recipientRole} · {kindLabels[certificate.kind]} ·{" "}
                          {certificate.certificateNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPopupBlocked(!printCertificate(certificate))}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand hover:text-brand"
                      >
                        <Download className="h-3.5 w-3.5" />
                        View / PDF
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}
