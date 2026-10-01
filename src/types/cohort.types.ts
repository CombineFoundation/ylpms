import type { Timestamp } from "firebase/firestore";

/**
 * One run of the Youth Leadership Program (YLP 2.0, YLP 3.0, …). Youth
 * leaders and volunteers belong to the cohort they joined in, and can only
 * sign in while it's running. Head RO starts the next one once it ends.
 */
export interface Cohort {
  /** "ylp-2", "ylp-3", … */
  id: string;
  /** 2 for YLP 2.0. */
  number: number;
  /** "YLP 2.0" */
  name: string;
  /** Midnight (Pakistan time) on the first day. */
  startDate: Timestamp | Date;
  /** End of the last day (Pakistan time); youth leader and volunteer access closes after it. */
  endDate: Timestamp | Date;
  /** Figures that aren't tracked in the system, entered by Head RO. */
  digitalReach?: number;
  studentBodyPartnerships?: number;
  startedBy?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/** A cohort as the API returns it, with dates as ISO strings. */
export type ApiCohort = Omit<Cohort, "startDate" | "endDate" | "createdAt" | "updatedAt"> & {
  startDate: string;
  endDate: string;
  /** Running now (started and not yet ended). */
  isRunning: boolean;
  hasEnded: boolean;
};
