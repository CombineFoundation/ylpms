// User roles in the hierarchy
export type UserRole = 
  | "developer"
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
  /** Program ID entered at creation (upper-case, unique). Older accounts may not have one. */
  memberId?: string;
  /** University (students) or institution; counted on the public site. */
  university?: string;
  /** Youth leaders and volunteers: the cohort they joined (e.g. "ylp-2"); none means YLP 2.0. */
  cohortId?: string;
  region?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
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
  region?: string;
  role: UserRole;
  phone?: string;
  parentId?: string; // For users being added by superiors
  memberId?: string;
  university?: string;
}

// User update request
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  region?: string;
  profilePicture?: string;
  status?: UserStatus;
  memberId?: string;
  university?: string;
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
