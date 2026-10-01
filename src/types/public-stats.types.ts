/** Program figures shown on the public Home and Login pages. */
export type ImpactFigures = {
  youthLeaders: number;
  volunteers: number;
  universities: number;
  cities: number;
  webinars: number;
  onsiteWorkshops: number;
  studentBodyPartnerships: number;
  directBeneficiaries: number;
  digitalReach: number;
  certificates: number;
};

export type PublicStats = {
  /** YLP 1.0, fixed (it ran before this system). */
  ylp1: ImpactFigures;
  /** YLP 2.0 onwards, counted from Firestore. */
  live: ImpactFigures;
  /** YLP 1.0 + live. */
  total: ImpactFigures;
  current: { name: string; startDate: string; endDate: string; isRunning: boolean };
  /** False when Firestore couldn't be read; totals are then YLP 1.0 only. */
  isLive: boolean;
  generatedAt: string;
};
