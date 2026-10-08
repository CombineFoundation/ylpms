import type { UserRole } from "@/types/user.types";
import type { TaskPriority } from "@/types/task.types";

/**
 * Program month task lists. Each program month ends on the 15th (Pakistan
 * time): Month 1 is Sep 15 – Oct 15, 2026, Month 2 Oct 16 – Nov 15, …
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
  // Oct 16 – Nov 15, 2026
  2: {
    "youth-leader": [
      {
        id: "training-session",
        title: "Attend training session",
        description: "Attend this month's YLP training session.",
      },
      {
        id: "self-webinar",
        title: "Self webinar (min. 30 participants)",
        description: "Host your own webinar with at least 30 participants.",
      },
      {
        id: "onboard-5-volunteers",
        title: "Onboard 5 volunteers",
        description: "Onboard five new volunteers to your team and request them from your Volunteers page.",
        priority: "high",
      },
      {
        id: "volunteer-intro-meeting",
        title: "Volunteer team introductory meeting (10 volunteers)",
        description: "Hold an introductory meeting with your volunteer team, with at least 10 volunteers.",
      },
      {
        id: "guest-speaker-webinar",
        title: "Guest speaker webinar (min. 50 participants)",
        description: "Organize a webinar with a guest speaker and at least 50 participants.",
      },
      {
        id: "volunteer-profile-building",
        title: "Volunteer profile building",
        description: "Help your volunteers build and update their profiles.",
      },
      {
        id: "performance-report",
        title: "Submit month 2 performance report",
        description: "Submit your month 2 performance report, including your volunteers' performance.",
        priority: "high",
      },
    ],
  },
  // Nov 16 – Dec 15, 2026
  3: {
    "youth-leader": [
      {
        id: "training-session",
        title: "Attend training session",
        description: "Attend this month's YLP training session.",
      },
      {
        id: "awareness-campaign-approval",
        title: "Approval document with budget and plan for awareness campaign",
        description: "Submit the approval document for your awareness campaign, with its budget and plan.",
        priority: "high",
      },
      {
        id: "onboard-5-volunteers",
        title: "Onboard 5 volunteers",
        description: "Onboard five new volunteers to your team and request them from your Volunteers page.",
        priority: "high",
      },
      {
        id: "volunteer-intro-meeting",
        title: "Volunteer team introductory meeting (15 volunteers)",
        description: "Hold an introductory meeting with your volunteer team, with at least 15 volunteers.",
      },
      {
        id: "awareness-campaign",
        title: "Awareness campaign",
        description: "Run the awareness campaign from your approved plan.",
      },
      {
        id: "digital-portfolio",
        title: "Google Drive digital portfolio",
        description: "Put all your activities in one Google Drive folder and share its link, so everything can be checked in one place.",
      },
      {
        id: "performance-report",
        title: "Submit month 3 performance report",
        description: "Submit your month 3 performance report, including your volunteers' performance.",
        priority: "high",
      },
    ],
  },
  // Dec 16, 2026 – Jan 15, 2027
  4: {
    "youth-leader": [
      {
        id: "training-session",
        title: "Attend training session",
        description: "Attend this month's YLP training session.",
      },
      {
        id: "onboard-5-volunteers",
        title: "Onboard 5 volunteers",
        description: "Onboard five new volunteers to your team and request them from your Volunteers page.",
        priority: "high",
      },
      {
        id: "volunteer-intro-meeting",
        title: "Volunteer team introductory meeting (20 volunteers)",
        description: "Hold an introductory meeting with your volunteer team, with at least 20 volunteers.",
      },
      {
        id: "survey",
        title: "Survey (min. 50 responses)",
        description: "Conduct a survey and collect at least 50 responses.",
      },
      {
        id: "profile-and-volunteer-portfolio",
        title: "Update your profile and volunteer portfolio",
        description: "Update your profile (e.g. upload your activities on LinkedIn) and your volunteers' portfolio.",
      },
      {
        id: "social-media-campaign",
        title: "Execute one social media awareness campaign",
        description: "Plan and run one awareness campaign on social media.",
      },
      {
        id: "performance-report",
        title: "Submit month 4 performance report",
        description: "Submit your month 4 performance report, including your volunteers' performance and a reflection paragraph.",
        priority: "high",
      },
    ],
  },
};
