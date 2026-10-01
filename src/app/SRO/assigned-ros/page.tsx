import type { Metadata } from "next";
import { AssignedROList } from "@/components/SRO/assigned-ros/AssignedROList";

export const metadata: Metadata = { title: "Assigned ROs" };

export default function AssignedROsPage() {
  return <AssignedROList />;
}
