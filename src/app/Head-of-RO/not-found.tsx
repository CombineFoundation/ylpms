import Link from "next/link";

export default function HeadRONotFound() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900">Page not found</h1>
      <p className="mt-1 text-sm text-gray-500">This page doesn&apos;t exist or has moved.</p>
      <Link
        href="/Head-of-RO/dashboard"
        className="mt-5 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
