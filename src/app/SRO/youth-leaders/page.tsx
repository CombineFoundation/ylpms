import type { Metadata } from "next";
import { YouthLeaderList } from "@/components/SRO/youth-leaders/YouthLeaderList";

export const metadata: Metadata = { title: "Youth Leaders" };

export default function YouthLeadersPage() {
  return <YouthLeaderList />;
}
