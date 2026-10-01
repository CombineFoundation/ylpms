import type { Metadata } from "next";
import { TaskList } from "@/components/Head-of-RO/tasks/TaskList";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <TaskList />;
}
