import type { Metadata } from "next";
import { VolunteersList } from "@/components/Head-of-RO/volunteers/VolunteersList";

export const metadata: Metadata = { title: "Volunteers" };

export default function VolunteersPage() {
  return <VolunteersList />;
}
