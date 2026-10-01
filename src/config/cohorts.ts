/**
 * Program cohorts. YLP 1.0 ran before this system existed, so its results are
 * fixed here; YLP 2.0 onwards is counted live from Firestore (see
 * src/services/public-stats.service.ts) and stored in the `cohorts` collection.
 */

/** YLP 1.0: 15 Jan 2026 – 15 Jul 2026. Figures supplied by Combine Foundation. */
export const YLP_1 = {
  name: "YLP 1.0",
  startDate: "2026-01-15",
  endDate: "2026-07-15",
  youthLeaders: 60,
  volunteers: 315,
  universities: 28,
  cities: 10,
  webinars: 29,
  onsiteWorkshops: 19,
  studentBodyPartnerships: 8,
  directBeneficiaries: 784,
  digitalReach: 5000,
  /** Issued to participants; volunteer and youth leader certificates aren't included. */
  certificates: 325,
} as const;

/**
 * The first cohort run in this system. Used until Head RO starts another one,
 * and for accounts created before cohorts were recorded on users.
 */
export const FIRST_SYSTEM_COHORT = {
  id: "ylp-2",
  number: 2,
  name: "YLP 2.0",
  /** Pakistan-time calendar days, inclusive. */
  startDate: "2026-09-15",
  endDate: "2027-03-15",
} as const;

export const cohortId = (number: number) => `ylp-${number}`;
export const cohortName = (number: number) => `YLP ${number}.0`;
