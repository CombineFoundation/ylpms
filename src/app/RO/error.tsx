"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ROError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("RO page crashed:", error);
  }, [error]);

  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-8 w-8 text-brand" />
      <h1 className="mt-3 text-lg font-semibold text-slate-800">Something went wrong</h1>
      <p className="mt-1 text-sm text-slate-500">This page hit an unexpected error. Try again, or reload the page.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}
