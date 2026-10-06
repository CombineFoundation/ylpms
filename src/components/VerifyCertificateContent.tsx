"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Search, ShieldAlert } from "lucide-react";
import { CERTIFICATE_LOGO } from "@/config/certificate";
import { formatDate } from "@/utils/format-date";
import type { CertificateVerification } from "@/types/certificate.types";

type Result = { kind: "found"; certificate: CertificateVerification } | { kind: "error"; message: string } | null;

/**
 * Public certificate check: anyone (an employer, a university) enters the
 * number printed on a certificate and sees whether it's genuine. The link
 * printed on each certificate opens this page with the number filled in.
 */
export default function VerifyCertificateContent() {
  const router = useRouter();
  const initial = useSearchParams().get("n") ?? "";
  const [number, setNumber] = useState(initial);
  const [result, setResult] = useState<Result>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsChecking(true);
    setResult(null);
    try {
      const response = await fetch(`/api/certificates/verify?n=${encodeURIComponent(trimmed)}`);
      const body = await response.json().catch(() => ({}));
      setResult(
        response.ok
          ? { kind: "found", certificate: body.data }
          : { kind: "error", message: body.error?.message || "Couldn't check this number. Please try again." }
      );
    } catch {
      setResult({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (initial) check(initial);
  }, [initial, check]);

  const certificate = result?.kind === "found" ? result.certificate : null;
  const isValid = certificate?.status === "issued";

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-10">
      <Link href="/" aria-label="Combine Foundation home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CERTIFICATE_LOGO} alt="Combine Foundation" className="h-14 w-auto" />
      </Link>
      <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">Verify a certificate</h1>
      <p className="mt-1 max-w-md text-center text-sm text-gray-500">
        Enter the number printed on a Youth Leadership Program certificate, e.g. YLP2/007/001.
      </p>

      <form
        className="mt-6 flex w-full max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          router.replace(`/verify?n=${encodeURIComponent(number.trim())}`);
          check(number);
        }}
      >
        <label htmlFor="certificate-number" className="sr-only">
          Certificate number
        </label>
        <input
          id="certificate-number"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder="Certificate number"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm uppercase text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={isChecking || !number.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isChecking ? "Checking…" : "Verify"}
        </button>
      </form>

      <div className="mt-6 w-full max-w-md" aria-live="polite">
        {result?.kind === "error" && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>{result.message}</p>
          </div>
        )}
        {certificate && (
          <div className={`rounded-2xl border bg-white p-5 shadow-sm ${isValid ? "border-emerald-200" : "border-amber-200"}`}>
            <p className={`flex items-center gap-2 font-semibold ${isValid ? "text-emerald-700" : "text-amber-700"}`}>
              {isValid ? <BadgeCheck className="h-5 w-5" aria-hidden /> : <ShieldAlert className="h-5 w-5" aria-hidden />}
              {isValid ? "Genuine certificate" : "This certificate has been revoked"}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Awarded to", certificate.recipientName],
                ["Certificate", certificate.title],
                ["Activity", certificate.eventTitle],
                ["Held", [certificate.eventLocation, certificate.eventDate && formatDate(new Date(certificate.eventDate))].filter(Boolean).join(" · ")],
                ["Issued", certificate.issuedAt ? formatDate(new Date(certificate.issuedAt)) : "—"],
                ["Number", certificate.certificateNumber],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-24 shrink-0 text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-gray-400">Issued by Combine Foundation&apos;s Youth Leadership Program.</p>
          </div>
        )}
      </div>
    </main>
  );
}
