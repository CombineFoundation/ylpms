"use client";

import { Calendar, MapPin } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCertificateDate, kindLabels, roleLabels, type ApiTeamCertificateGroup } from "./certificate.types";
import { CertificateActions } from "./CertificateActions";

/** Everyone certified for one activity: the organizer's certificate first, then each volunteer's. */
export function TeamCertificateDetailModal({ group, onClose }: { group: ApiTeamCertificateGroup | null; onClose: () => void }) {
  const participants = group?.certificates.filter((c) => c.kind === "participation") ?? [];
  const organizers = group?.certificates.filter((c) => c.kind === "organizer") ?? [];

  return (
    <Modal isOpen={!!group} title={group?.activityTitle ?? ""} onClose={onClose} size="lg">
      {group && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {group.activityLocation || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatCertificateDate(group.activityDate)}
            </span>
            <span>Verified by {group.issuedByName}</span>
          </div>

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
                      <CertificateActions certificate={certificate} />
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
