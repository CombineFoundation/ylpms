// User roles in the hierarchy
export type UserRole = 
  | "head-ro" 
  | "sro" 
  | "ro" 
  | "youth-leader" 
  | "volunteer";

// User status
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Head RO (Highest level)
export interface HeadRO extends BaseUser {
  role: "head-ro";
  department?: string;
}

// Senior Reporting Officer (SRO)
export interface SRO extends BaseUser {
  role: "sro";
  reportingToId: string; // Head RO ID
  assignedROIds: string[]; // Array of RO IDs
}

// Reporting Officer (RO)
export interface RO extends BaseUser {
  role: "ro";
  reportingToId: string; // SRO ID
  assignedYouthLeaderIds: string[]; // Array of Youth Leader IDs
  assignedVolunteerIds: string[]; // Array of Volunteer IDs
}

// Youth Leader
export interface YouthLeader extends BaseUser {
  role: "youth-leader";
  reportingToId: string; // RO ID
  assignedVolunteerIds: string[]; // Array of Volunteer IDs
}

// Volunteer
export interface Volunteer extends BaseUser {
  role: "volunteer";
  reportingToId: string; // Youth Leader or RO ID
  joinDate: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Union type for all user types
export type User = HeadRO | SRO | RO | YouthLeader | Volunteer;

// User creation request
export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  parentId?: string; // For users being added by superiors
}

// User update request
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  profilePicture?: string;
  status?: UserStatus;
}

// Authentication response
export interface AuthResponse {
  user: BaseUser;
  token: string;
  expiresIn: number;
}

// User invitation (for sending to new users)
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string; // User ID who invited
  invitedAt: Date;
  expiresAt: Date;
  accepted: boolean;
  acceptedAt?: Date;
}
