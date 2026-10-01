import type { Metadata } from "next";
import { TeamTasksContent } from "@/components/SRO/tasks/SroTasksContent";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <TeamTasksContent portal="ro" />;
}
