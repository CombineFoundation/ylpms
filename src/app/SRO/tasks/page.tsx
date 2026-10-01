import type { Metadata } from "next";
import { SroTasksContent } from "@/components/SRO/tasks/SroTasksContent";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <SroTasksContent />;
}
