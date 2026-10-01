import type { UserRole } from "@/types/user.types";
import type { TaskPriority } from "@/types/task.types";

/**
 * Program month task lists. Each program month runs from the 15th to the 15th
 * (Pakistan time): Month 1 is Sep 15 – Oct 15, 2026, Month 2 Oct 15 – Nov 15, …
 *
 * "Assign Monthly Task" (Tasks page of Head RO / SRO / RO) assigns the current
 * month's list to every active or idle youth leader in the clicker's scope
 * (Head RO: all; SRO / RO: their team). Only youth leaders get monthly tasks.
 * Tasks are due at the end of the month (the next 15th) unless a template
 * sets its own `dueDate`.
 *
 * To add a month, add an entry here.
 */

export type MonthlyTaskTemplate = {
  /** Stable id: part of each assigned task's document id, so it's never assigned twice. */
  id: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  /** "YYYY-MM-DD" (end of that day, Pakistan time); defaults to the month's end. */
  dueDate?: string;
};

/** Only youth leaders receive monthly tasks. */
export type MonthlyTaskRole = Extract<UserRole, "youth-leader">;

export const MONTHLY_TASKS: Record<number, Partial<Record<MonthlyTaskRole, MonthlyTaskTemplate[]>>> = {
  1: {
    "youth-leader": [
      {
        id: "linkedin-appointment-letter",
        title: "Appointment letter upload on LinkedIn",
        description: "Share your YLP appointment letter on LinkedIn and tag Combine Foundation.",
      },
      {
        id: "introductory-meeting",
        title: "Attend introductory meeting",
        description: "Attend the introductory meeting with your RO and fellow youth leaders.",
      },
      {
        id: "orientation-session",
        title: "Attend orientation session",
        description: "Attend the YLP orientation session to learn how the program works.",
      },
      {
        id: "linkedin-profile-update",
        title: "LinkedIn profile update",
        description: "Update your LinkedIn profile to show your role as a YLP Youth Leader.",
      },
      {
        id: "appoint-5-volunteers",
        title: "Appoint 5 volunteers",
        description: "Recruit five volunteers for your team and request them from your Volunteers page.",
        priority: "high",
      },
      {
        id: "intro-video",
        title: "Create 1 minute intro video",
        description: "Record a one-minute video introducing yourself and your goals for the program.",
      },
      {
        id: "social-media-page",
        title: "Launch official social media page",
        description: "Launch the official social media page for your YLP chapter.",
      },
      {
        id: "cv-update",
        title: "Create/update CV",
        description: "Create or update your CV to include your YLP role and experience.",
      },
      {
        id: "six-month-plan",
        title: "Submit 6 month planning document",
        description: "Prepare and submit your plan for the six months of the program.",
        priority: "high",
      },
    ],
  },
};
