import type { Metadata } from "next";
import Sidebar from "@/components/SRO/Sidebar";
import { TopBar } from "@/components/SRO/TopBar";
import { SroScopePicker } from "@/components/SRO/SroScopePicker";

export const metadata: Metadata = {
  title: { template: "%s | SRO Portal", default: "SRO Portal" },
};

/** Shared shell for every SRO page: sidebar + topbar + content. */
export default function SROLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <SroScopePicker />
        <main className="flex flex-1 flex-col p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
