import type { Metadata } from "next";
import { SettingsForm } from "@/components/Head-of-RO/SettingsForm";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <SettingsForm />;
}
