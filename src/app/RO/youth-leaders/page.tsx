import type { Metadata } from "next";
import { YouthLeaderList } from "@/components/RO/youth-leaders/YouthLeaderList";

export const metadata: Metadata = { title: "Youth Leaders" };

export default function YouthLeadersPage() {
  return <YouthLeaderList />;
}
