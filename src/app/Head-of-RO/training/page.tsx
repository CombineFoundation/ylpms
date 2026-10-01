import type { Metadata } from "next";
import { TrainingList } from "@/components/Head-of-RO/training/TrainingList";

export const metadata: Metadata = { title: "Training Portal" };

export default function TrainingPortalPage() {
  return <TrainingList />;
}
