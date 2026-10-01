import type { Metadata } from "next";
import Sidebar from "@/components/RO/Sidebar";
import { Topbar } from "@/components/RO/Topbar";
import { PortalScopePicker } from "@/components/shared/PortalScopePicker";

export const metadata: Metadata = {
  title: { template: "%s | RO Portal", default: "RO Portal" },
};

/** Shared shell for every RO page: sidebar + topbar (+ developer RO picker) + content. */
export default function ROLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PortalScopePicker role="ro" className="border-b px-6 py-2.5 lg:px-8" />
        <main className="flex flex-1 flex-col p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}