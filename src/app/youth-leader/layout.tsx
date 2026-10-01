import type { Metadata } from "next";
import Sidebar from "@/components/Youth-Leader/Sidebar";
import Topbar from "@/components/Youth-Leader/Topbar";
import { PortalScopePicker } from "@/components/shared/PortalScopePicker";

export const metadata: Metadata = {
  title: { template: "%s | Youth Leader Portal", default: "Youth Leader Portal" },
};

/** Shared shell for every Youth Leader page: sidebar + topbar (+ developer picker) + content. */
export default function YouthLeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PortalScopePicker role="youth-leader" className="border-b px-6 py-2.5 lg:px-8" />
        <main className="flex flex-1 flex-col p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
