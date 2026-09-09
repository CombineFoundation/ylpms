import { Timestamp } from "firebase/firestore";

export type VolunteerStatus = "active" | "inactive" | "on-leave" | "suspended";

export interface Volunteer {
  id: string;
  userId: string; // Reference to user document
  name: string;
  email: string;
  phone: string;
  status: VolunteerStatus;
  joinDate: Timestamp | Date;
  reportingToId: string; // Youth Leader or RO
  hoursVolunteered: number;
  tasksCompleted: number;
  certificationsEarned: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CreateVolunteerRequest {
  name: string;
  email: string;
  phone: string;
  reportingToId: string;
  joinDate?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface UpdateVolunteerRequest {
  name?: string;
  phone?: string;
  status?: VolunteerStatus;
  hoursVolunteered?: number;
  tasksCompleted?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}
