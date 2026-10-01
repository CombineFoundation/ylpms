import type { Metadata } from "next";
import { SroTrainingList } from "@/components/SRO/training/SroTrainingList";

export const metadata: Metadata = { title: "Training" };

export default function TrainingPage() {
  return <SroTrainingList />;
}
