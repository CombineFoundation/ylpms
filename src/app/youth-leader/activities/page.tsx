import type { Metadata } from "next";
import { ActivityBoard } from "@/components/shared/activities/ActivityBoard";

export const metadata: Metadata = { title: "Activities" };

export default function Page() {
  return <ActivityBoard portal="youth-leader" />;
}
