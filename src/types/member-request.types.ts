import { Timestamp } from "firebase/firestore";
import type { TimestampInput } from "@/utils/user-status";
import type { MemberProfile } from "./user.types";

/** Roles that are added by request rather than created directly. */
export type MemberRequestRole = "youth-leader" | "volunteer";

export type MemberRequestStatus = "pending" | "approved" | "rejected";

/**
 * A manager's request to add someone to their team. No account exists until
 * the requester's own manager approves it (an RO's youth leader is approved by
 * their SRO; a youth leader's volunteer by their RO); approval creates the user
 * under the requester and emails their credentials.
 */
export interface MemberRequest {
  id: string;
  role: MemberRequestRole;
  name: string;
  email: string;
  phone?: string;
  region?: string;
  /** The new member's ID: given by the requesting RO for a youth leader; a volunteer's is set on approval. */
  memberId?: string;
  university?: string;
  /** Volunteer requests: their role in the team, typed by the youth leader. */
  teamRole?: string;
  /** Who asked; becomes the new member's manager on approval. */
  requestedBy: string;
  requestedByName: string;
  /** The requester's manager at request time, who must approve it. */
  approverId: string;
  status: MemberRequestStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Timestamp | Date;
  reviewComment?: string;
  /** The created user's id, once approved. */
  createdUserId?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/** A request as the client receives it (timestamps serialized). */
export type ApiMemberRequest = Omit<MemberRequest, "createdAt" | "updatedAt" | "reviewedAt"> & {
  createdAt?: TimestampInput;
  updatedAt?: TimestampInput;
  reviewedAt?: TimestampInput;
  /** The requester's profile and chain, on the approver's list. */
  requesterProfile?: MemberProfile;
};

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone?: string;
  region?: string;
  memberId?: string;
  university?: string;
  teamRole?: string;
}
