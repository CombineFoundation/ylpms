import type { Metadata } from "next";
import { YouthLeadersList } from "@/components/Head-of-RO/youth-leaders/YouthLeadersList";

export const metadata: Metadata = { title: "Youth Leaders" };

export default function YouthLeadersPage() {
  return <YouthLeadersList />;
}
