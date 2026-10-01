import { revalidateTag } from "next/cache";
import { createDoc, getAllDocs, getDocById, updateDoc } from "@/utils/firestore";
import { toDate } from "@/utils/aggregation";
import { endOfPktDay, startOfPktDay, toPktDateValue, type CycleCohort } from "@/utils/monthly-cycle";
import { ConflictError, NotFoundError, ValidationError, logger } from "@/utils/errors";
import { FIRST_SYSTEM_COHORT, cohortId, cohortName } from "@/config/cohorts";
import { createActivityLog } from "./activitylog.service";
import type { ApiCohort, Cohort } from "@/types/cohort.types";
import type { UserRole } from "@/types/user.types";

/**
 * Cohorts - YLP 2.0, YLP 3.0, … The latest one is "current": new youth
 * leaders and volunteers join it, monthly tasks follow its months, and only
 * its youth leaders and volunteers can sign in, until its end date. Once it
 * has ended Head RO starts the next cohort.
 */

/** Roles whose access is limited to their own cohort while it runs. */
export const COHORT_ROLES: UserRole[] = ["youth-leader", "volunteer"];

const COLLECTION = "cohorts";
/** The current cohort is read on every authenticated request, so keep it briefly. */
const CACHE_MS = 60 * 1000;
let cache: { cohort: Cohort; at: number } | null = null;

const defaultCohort = (): Cohort => ({
  id: FIRST_SYSTEM_COHORT.id,
  number: FIRST_SYSTEM_COHORT.number,
  name: FIRST_SYSTEM_COHORT.name,
  startDate: startOfPktDay(FIRST_SYSTEM_COHORT.startDate),
  endDate: endOfPktDay(FIRST_SYSTEM_COHORT.endDate),
});

function normalize(stored: Cohort): Cohort {
  return { ...stored, startDate: toDate(stored.startDate) ?? new Date(0), endDate: toDate(stored.endDate) ?? new Date(0) };
}

/** Every cohort, newest first. YLP 2.0 is included even before its doc has been written. */
export async function listCohorts(): Promise<Cohort[]> {
  const stored = (await getAllDocs<Cohort>(COLLECTION)).map(normalize);
  if (!stored.some((cohort) => cohort.id === FIRST_SYSTEM_COHORT.id)) stored.push(defaultCohort());
  return stored.sort((a, b) => b.number - a.number);
}

export async function getCurrentCohort(): Promise<Cohort> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.cohort;
  const [latest] = await listCohorts();
  cache = { cohort: latest, at: Date.now() };
  return latest;
}

export const asCycleCohort = (cohort: Cohort): CycleCohort => ({
  id: cohort.id,
  startDate: toDate(cohort.startDate)!,
  endDate: toDate(cohort.endDate)!,
});

export function toApiCohort(cohort: Cohort, now = new Date()): ApiCohort {
  const start = toDate(cohort.startDate)!;
  const end = toDate(cohort.endDate)!;
  return {
    id: cohort.id,
    number: cohort.number,
    name: cohort.name,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    digitalReach: cohort.digitalReach,
    studentBodyPartnerships: cohort.studentBodyPartnerships,
    isRunning: start <= now && now <= end,
    hasEnded: now > end,
  };
}

const formatPktDate = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" });

/**
 * Why a youth leader or volunteer can't use the portal, or null if they can.
 * Accounts from before cohorts were recorded belong to YLP 2.0.
 */
export async function cohortAccessError(role: UserRole, memberCohortId: string | undefined): Promise<string | null> {
  if (!COHORT_ROLES.includes(role)) return null;
  const current = await getCurrentCohort();
  const ownId = memberCohortId || FIRST_SYSTEM_COHORT.id;
  if (ownId !== current.id) {
    const number = Number(ownId.replace(/^ylp-/, ""));
    return `${Number.isFinite(number) ? cohortName(number) : "Your cohort"} has ended, so your access has closed.`;
  }
  const end = toDate(current.endDate)!;
  if (new Date() > end) return `${current.name} ended on ${formatPktDate(end)}, so your access has closed.`;
  return null;
}

/** Writes the built-in YLP 2.0 record the first time it's changed. */
async function ensureStored(cohort: Cohort) {
  if (await getDocById<Cohort>(COLLECTION, cohort.id)) return;
  await createDoc<Cohort>(COLLECTION, cohort.id, cohort);
}

/** Head RO starts the next cohort once the current one has ended. Dates are "YYYY-MM-DD", Pakistan time. */
export async function startNewCohort(input: { startDate: string; endDate: string }, actorUserId: string): Promise<Cohort> {
  try {
    const current = await getCurrentCohort();
    const currentEnd = toDate(current.endDate)!;
    if (new Date() <= currentEnd) {
      throw new ConflictError(`${current.name} runs until ${formatPktDate(currentEnd)}. Start the next cohort after it ends.`);
    }

    const startDate = startOfPktDay(input.startDate);
    const endDate = endOfPktDay(input.endDate);
    if (startDate <= currentEnd) {
      throw new ValidationError(`The new cohort must start after ${current.name} ended (${formatPktDate(currentEnd)}).`);
    }
    if (endDate <= startDate) throw new ValidationError("The end date must be after the start date.");

    const number = current.number + 1;
    const cohort: Cohort = { id: cohortId(number), number, name: cohortName(number), startDate, endDate, startedBy: actorUserId };
    if (await getDocById<Cohort>(COLLECTION, cohort.id)) throw new ConflictError(`${cohort.name} has already been started.`);

    await ensureStored(current);
    await createDoc<Cohort>(COLLECTION, cohort.id, cohort);
    cache = null;
    revalidateTag("public-stats", "max");

    await createActivityLog({
      userId: actorUserId,
      action: "other",
      description: `Started ${cohort.name} (${toPktDateValue(startDate)} to ${input.endDate})`,
      entityType: "cohort",
      entityId: cohort.id,
    });
    logger.info(`Cohort started: ${cohort.id} by ${actorUserId}`);
    return cohort;
  } catch (error) {
    logger.error("Error starting a new cohort", error);
    throw error;
  }
}

/** Figures the system can't count itself (digital reach, student body partnerships). */
export async function updateCohortFigures(
  id: string,
  figures: { digitalReach?: number; studentBodyPartnerships?: number },
  actorUserId: string
): Promise<Cohort> {
  const cohort = (await listCohorts()).find((c) => c.id === id);
  if (!cohort) throw new NotFoundError("Cohort not found");

  await ensureStored(cohort);
  await updateDoc<Cohort>(COLLECTION, id, figures);
  cache = null;
  // The public pages show these figures.
  revalidateTag("public-stats", "max");

  await createActivityLog({
    userId: actorUserId,
    action: "other",
    description: `Updated ${cohort.name} figures`,
    entityType: "cohort",
    entityId: id,
  });
  return { ...cohort, ...figures };
}
