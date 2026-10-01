import type { Metadata } from "next";
import Sidebar from "@/components/volunteer/Sidebar";
import Topbar from "@/components/volunteer/Topbar";
import { PortalScopePicker } from "@/components/shared/PortalScopePicker";

export const metadata: Metadata = {
  title: { template: "%s | Volunteer Portal", default: "Volunteer Portal" },
};

/** Shared shell for every Volunteer page: sidebar + topbar (+ developer picker) + content. */
export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PortalScopePicker role="volunteer" className="border-b px-6 py-2.5 lg:px-8" />
        <main className="flex flex-1 flex-col p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
