import { Timestamp } from "firebase/firestore";

export type EventStatus = "planned" | "ongoing" | "completed" | "cancelled";

export type EventType = "workshop" | "training" | "meeting" | "volunteer-event" | "other";

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  location: string;
  attendees: string[]; // User IDs
  organizerIds: string[]; // User IDs of organizers
  maxAttendees?: number;
  image?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  location: string;
  maxAttendees?: number;
  image?: File;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  status?: EventStatus;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxAttendees?: number;
}
