import type { Metadata } from "next";
import { VolunteerList } from "@/components/Youth-Leader/volunteers/VolunteerList";

export const metadata: Metadata = { title: "My Volunteers" };

export default function Page() {
  return <VolunteerList />;
}
