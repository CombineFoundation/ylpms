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

/**
 * Who was selected for YLP 2.0, as announced by Combine Foundation. Shown in the
 * landing page's cohort section. The `share` percentages are the published
 * figures, shown as-is (not recalculated); `bar` is each bar's length relative
 * to the largest region.
 */
export const YLP_2_SELECTION = {
  youthLeaders: 96,
  universities: 61,
  cities: 36,
  /** 10 Reporting Officers, 3 Senior Reporting Officers and 1 Head of Reporting Officers. */
  reportingTeam: { ros: 10, sros: 3, headRos: 1 },
  regions: [
    { name: "Punjab", count: 36, share: "37.50%", bar: 100 },
    { name: "Sindh", count: 35, share: "36.45%", bar: 97.2 },
    { name: "Islamabad", count: 10, share: "10.41%", bar: 27.8 },
    { name: "Khyber Pakhtunkhwa", count: 9, share: "9.38%", bar: 25 },
    { name: "Balochistan", count: 5, share: "5.20%", bar: 13.9 },
    { name: "Gilgit", count: 1, share: "1.04%", bar: 2.8 },
  ],
  gender: {
    female: { count: 56, share: "58.33%", bar: 58.33 },
    male: { count: 40, share: "41.66%", bar: 41.67 },
  },
  faith: {
    muslim: { count: 93, share: "96.87%", bar: 96.88 },
    hinduAndChristian: { count: 3, share: "3.12%", bar: 3.12 },
  },
} as const;

export const cohortId = (number: number) => `ylp-${number}`;
export const cohortName = (number: number) => `YLP ${number}.0`;
