import type { Metadata } from "next";
import { TrainingLibrary } from "@/components/shared/TrainingLibrary";

export const metadata: Metadata = { title: "Training" };

export default function TrainingPage() {
  return <TrainingLibrary />;
}
