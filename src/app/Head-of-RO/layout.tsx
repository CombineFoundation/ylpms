import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export const metadata: Metadata = {
  title: { template: "%s | Head RO Portal", default: "Head RO Portal" },
};

/** Shared shell for every Head RO page: sidebar + topbar + scrollable content. */
export default function HeadROLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
