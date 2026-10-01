import type { Metadata } from "next";
import { VolunteerList } from "@/components/RO/volunteers/VolunteerList";

export const metadata: Metadata = { title: "Volunteers" };

export default function VolunteersPage() {
  return <VolunteerList />;
}
