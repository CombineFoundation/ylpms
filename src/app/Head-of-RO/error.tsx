"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function HeadROError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Head RO page crashed:", error);
  }, [error]);

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-8 w-8 text-brand" />
      <h1 className="mt-3 text-lg font-semibold text-gray-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-gray-500">This page hit an unexpected error. Try again, or reload the page.</p>
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
