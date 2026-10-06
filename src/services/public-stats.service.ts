import "server-only";
import { unstable_cache } from "next/cache";
import { selectFields, selectFieldsWithIds } from "@/utils/firestore";
import { logger } from "@/utils/errors";
import { FIRST_SYSTEM_COHORT, YLP_1 } from "@/config/cohorts";
import { endOfPktDay, startOfPktDay } from "@/utils/monthly-cycle";
import { listCohorts, toApiCohort } from "./cohort.service";
import type { CertificateStatus } from "@/types/certificate.types";
import type { ActivityMode, ActivityStatus } from "@/types/activity.types";
import type { UserRole } from "@/types/user.types";
import type { ImpactFigures, PublicStats } from "@/types/public-stats.types";

/**
 * Public Stats - the impact figures on the Home and Login pages: YLP 1.0's
 * fixed results plus live counts for YLP 2.0 onwards. Only totals leave the
 * server, never names or emails. Cached for 10 minutes.
 *
 * - Every account counts, active or not (developer test accounts don't).
 * - Activities count once their evidence has been submitted (held), split
 *   into webinars (online) and onsite workshops (everything held in person).
 * - Direct beneficiaries: everyone who took part in a held activity, plus every
 *   volunteer, youth leader and RO, each person once.
 * - Universities: distinct HEC universities on profiles. Cities: distinct
 *   cities of youth leaders and volunteers (their region field). Both are
 *   added to YLP 1.0's fixed counts.
 * - Certificates: every issued certificate, including youth leaders' and
 *   volunteers' (YLP 1.0's fixed figure counted participants only).
 * - Digital reach and student body partnerships: entered per cohort by Head RO.
 */

const HELD_STATUSES: ActivityStatus[] = ["evidence-submitted", "completed"];
const BENEFICIARY_ROLES: UserRole[] = ["volunteer", "youth-leader", "ro"];
const CITY_ROLES: UserRole[] = ["volunteer", "youth-leader"];

type UserRow = { role?: UserRole; university?: string; region?: string };
type ActivityRow = { status?: ActivityStatus; mode?: ActivityMode; evidence?: { participantIds?: string[] } };
type CertificateRow = { status?: CertificateStatus };
type UserIdRow = UserRow & { id: string };

/** "  NED  University " and "ned university" are the same place. */
const normalizeName = (value?: string) => value?.trim().replace(/\s+/g, " ").toLowerCase() || "";

const ylp1Figures = (): ImpactFigures => ({
  youthLeaders: YLP_1.youthLeaders,
  volunteers: YLP_1.volunteers,
  universities: YLP_1.universities,
  cities: YLP_1.cities,
  webinars: YLP_1.webinars,
  onsiteWorkshops: YLP_1.onsiteWorkshops,
  studentBodyPartnerships: YLP_1.studentBodyPartnerships,
  directBeneficiaries: YLP_1.directBeneficiaries,
  digitalReach: YLP_1.digitalReach,
  certificates: YLP_1.certificates,
});

const emptyFigures = (): ImpactFigures => ({
  youthLeaders: 0,
  volunteers: 0,
  universities: 0,
  cities: 0,
  webinars: 0,
  onsiteWorkshops: 0,
  studentBodyPartnerships: 0,
  directBeneficiaries: 0,
  digitalReach: 0,
  certificates: 0,
});

function addFigures(a: ImpactFigures, b: ImpactFigures): ImpactFigures {
  return Object.fromEntries(
    (Object.keys(a) as (keyof ImpactFigures)[]).map((key) => [key, a[key] + b[key]])
  ) as ImpactFigures;
}

async function selectUsers(): Promise<UserIdRow[]> {
  return selectFieldsWithIds<UserRow>("users", [{ field: "role", operator: "!=", value: "developer" }], ["role", "university", "region"]);
}

async function countLive(): Promise<{ live: ImpactFigures; current: PublicStats["current"] }> {
  const [users, activities, certificates, cohorts] = await Promise.all([
    selectUsers(),
    selectFields<ActivityRow>("events", [{ field: "status", operator: "in", value: HELD_STATUSES }], ["status", "mode", "evidence.participantIds"]),
    selectFields<CertificateRow>("certificates", [{ field: "status", operator: "==", value: "issued" }], ["status"]),
    listCohorts(),
  ]);

  const beneficiaries = new Set<string>();
  users.forEach((user) => user.role && BENEFICIARY_ROLES.includes(user.role) && beneficiaries.add(user.id));
  activities.forEach((activity) => activity.evidence?.participantIds?.forEach((id) => beneficiaries.add(id)));

  const distinct = (values: (string | undefined)[]) => new Set(values.map(normalizeName).filter(Boolean)).size;
  const webinars = activities.filter((activity) => activity.mode === "online").length;

  const live: ImpactFigures = {
    youthLeaders: users.filter((user) => user.role === "youth-leader").length,
    volunteers: users.filter((user) => user.role === "volunteer").length,
    universities: distinct(users.map((user) => user.university)),
    cities: distinct(users.filter((user) => user.role && CITY_ROLES.includes(user.role)).map((user) => user.region)),
    webinars,
    onsiteWorkshops: activities.length - webinars,
    studentBodyPartnerships: cohorts.reduce((sum, cohort) => sum + (cohort.studentBodyPartnerships ?? 0), 0),
    directBeneficiaries: beneficiaries.size,
    digitalReach: cohorts.reduce((sum, cohort) => sum + (cohort.digitalReach ?? 0), 0),
    certificates: certificates.length,
  };

  const latest = toApiCohort(cohorts[0]);
  return {
    live,
    current: { name: latest.name, startDate: latest.startDate, endDate: latest.endDate, isRunning: latest.isRunning },
  };
}

const cachedLive = unstable_cache(countLive, ["public-stats"], { revalidate: 600, tags: ["public-stats"] });

/** Never throws: if Firestore can't be read, the pages fall back to YLP 1.0's figures. */
export async function getPublicStats(): Promise<PublicStats> {
  const ylp1 = ylp1Figures();
  try {
    const { live, current } = await cachedLive();
    return { ylp1, live, total: addFigures(ylp1, live), current, isLive: true, generatedAt: new Date().toISOString() };
  } catch (error) {
    logger.error("Unable to load public stats", error);
    const start = startOfPktDay(FIRST_SYSTEM_COHORT.startDate);
    const end = endOfPktDay(FIRST_SYSTEM_COHORT.endDate);
    const now = new Date();
    return {
      ylp1,
      live: emptyFigures(),
      total: ylp1,
      current: {
        name: FIRST_SYSTEM_COHORT.name,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isRunning: start <= now && now <= end,
      },
      isLive: false,
      generatedAt: now.toISOString(),
    };
  }
}
