"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { printCertificate, type ApiCertificate } from "./certificate.types";
import { downloadCertificatePdf } from "./certificate-pdf";

/** "Download PDF" (a real file, works on phones) plus a smaller Print button. */
export function CertificateActions({ certificate }: { certificate: ApiCertificate }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await downloadCertificatePdf(certificate);
    } catch (err) {
      setError(errorMessage(err, "Couldn't create the PDF. Try Print instead."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            if (!printCertificate(certificate)) setError("Your browser blocked the print window. Allow pop-ups for this site.");
          }}
          aria-label="Print certificate"
          title="Print"
          className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <Printer size={14} />
        </button>
        <button
          type="button"
          onClick={download}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          <Download size={12} />
          {isSaving ? "Preparing…" : "Download PDF"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-right text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
