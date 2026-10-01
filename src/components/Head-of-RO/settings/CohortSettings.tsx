"use client";

import { useEffect, useState } from "react";
import { CalendarRange } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { Modal } from "@/components/ui/Modal";
import { inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { formatProgramDate } from "@/utils/impact-format";
import { cohortName } from "@/config/cohorts";
import type { ApiCohort } from "@/types/cohort.types";

const cardClass = "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm";
const buttonClass =
  "rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

/** "YYYY-MM-DD" in Pakistan time. */
const pktDateValue = (date: Date) => new Date(date.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);

function addMonths(dateValue: string, months: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, day)).toISOString().slice(0, 10);
}

/**
 * Head RO: the current cohort, the figures the system can't count itself
 * (shown on the public site), and starting the next cohort once this one ends.
 */
export function CohortSettings() {
  const [cohorts, setCohorts] = useState<ApiCohort[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [figures, setFigures] = useState({ digitalReach: "", studentBodyPartnerships: "" });
  const [isSavingFigures, setIsSavingFigures] = useState(false);
  const [figuresMessage, setFiguresMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [startError, setStartError] = useState<string | null>(null);
  const [isSubmittingStart, setIsSubmittingStart] = useState(false);

  const current = cohorts?.[0] ?? null;

  useEffect(() => {
    apiFetch<ApiCohort[]>("/api/cohorts")
      .then(setCohorts)
      .catch((error) => setLoadError(errorMessage(error, "Unable to load cohorts.")));
  }, []);

  useEffect(() => {
    if (!current) return;
    setFigures({
      digitalReach: current.digitalReach ? String(current.digitalReach) : "",
      studentBodyPartnerships: current.studentBodyPartnerships ? String(current.studentBodyPartnerships) : "",
    });
  }, [current]);

  const toNumber = (value: string) => (value.trim() === "" ? 0 : Number(value));
  const figuresInvalid = [figures.digitalReach, figures.studentBodyPartnerships].some(
    (value) => value.trim() !== "" && !(Number.isInteger(Number(value)) && Number(value) >= 0)
  );

  const saveFigures = async () => {
    if (!current || figuresInvalid) return;
    setIsSavingFigures(true);
    setFiguresMessage(null);
    try {
      const updated = await apiFetch<ApiCohort>(`/api/cohorts/${current.id}`, {
        method: "PATCH",
        body: {
          digitalReach: toNumber(figures.digitalReach),
          studentBodyPartnerships: toNumber(figures.studentBodyPartnerships),
        },
      });
      setCohorts((list) => list && list.map((cohort) => (cohort.id === updated.id ? updated : cohort)));
      setFiguresMessage({ text: "Saved. The public site updates within a few minutes.", isError: false });
    } catch (error) {
      setFiguresMessage({ text: errorMessage(error, "Unable to save these figures."), isError: true });
    } finally {
      setIsSavingFigures(false);
    }
  };

  const openStart = () => {
    const today = pktDateValue(new Date());
    setDates({ startDate: today, endDate: addMonths(today, 6) });
    setStartError(null);
    setIsStarting(true);
  };

  const startCohort = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingStart(true);
    setStartError(null);
    try {
      const created = await apiFetch<ApiCohort>("/api/cohorts", { method: "POST", body: dates });
      setCohorts((list) => [created, ...(list ?? [])]);
      setIsStarting(false);
    } catch (error) {
      setStartError(errorMessage(error, "Unable to start the new cohort."));
    } finally {
      setIsSubmittingStart(false);
    }
  };

  const statusLabel = !current
    ? ""
    : current.hasEnded
      ? "Ended"
      : current.isRunning
        ? "Running"
        : `Starts ${formatProgramDate(current.startDate)}`;

  return (
    <section className={cardClass} aria-labelledby="cohort-heading">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-3">
        <CalendarRange size={18} className="text-brand" />
        <h3 id="cohort-heading" className="text-lg font-semibold text-gray-800">
          Program Cohort
        </h3>
      </div>
      <div className="space-y-5 p-5">
        {loadError && (
          <p role="alert" className="text-sm text-red-500">
            {loadError}
          </p>
        )}
        {!cohorts && !loadError && <p className="text-sm text-gray-400">Loading cohort...</p>}

        {current && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-gray-900">{current.name}</p>
                <p className="text-sm text-gray-500">
                  {formatProgramDate(current.startDate)} – {formatProgramDate(current.endDate)}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  current.hasEnded ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {statusLabel}
              </span>
            </div>

            {current.hasEnded ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p>
                  {current.name} has ended. Youth leaders and volunteers can no longer sign in. Start{" "}
                  {cohortName(current.number + 1)} to add a new group.
                </p>
                <button type="button" onClick={openStart} className={`${buttonClass} mt-3`}>
                  Start {cohortName(current.number + 1)}
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Youth leaders and volunteers can sign in until the end of {formatProgramDate(current.endDate)}. You can start{" "}
                {cohortName(current.number + 1)} after that.
              </p>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Figures for the public site ({current.name})</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm text-gray-600">
                  Digital reach
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={figures.digitalReach}
                    onChange={(event) => setFigures((f) => ({ ...f, digitalReach: event.target.value }))}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm text-gray-600">
                  Student body partnerships
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={figures.studentBodyPartnerships}
                    onChange={(event) => setFigures((f) => ({ ...f, studentBodyPartnerships: event.target.value }))}
                    className={inputClass}
                  />
                </label>
              </div>
              {figuresInvalid && <p className="mt-1 text-xs text-red-500">Enter whole numbers of 0 or more.</p>}
              {figuresMessage && (
                <p role={figuresMessage.isError ? "alert" : "status"} className={`mt-2 text-sm ${figuresMessage.isError ? "text-red-500" : "text-emerald-600"}`}>
                  {figuresMessage.text}
                </p>
              )}
              <button type="button" onClick={saveFigures} disabled={isSavingFigures || figuresInvalid} className={`${buttonClass} mt-3`}>
                {isSavingFigures ? "Saving..." : "Save figures"}
              </button>
            </div>

            {cohorts && cohorts.length > 1 && (
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Earlier cohorts</p>
                <ul className="space-y-1 text-sm text-gray-500">
                  {cohorts.slice(1).map((cohort) => (
                    <li key={cohort.id}>
                      {cohort.name}: {formatProgramDate(cohort.startDate)} – {formatProgramDate(cohort.endDate)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {current && (
        <Modal
          isOpen={isStarting}
          title={`Start ${cohortName(current.number + 1)}`}
          description="New youth leaders and volunteers will join this cohort, and monthly tasks restart at Month 1. Dates are Pakistan time."
          onClose={() => setIsStarting(false)}
          isBusy={isSubmittingStart}
        >
          <form onSubmit={startCohort} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Starts
                <input
                  type="date"
                  required
                  value={dates.startDate}
                  onChange={(event) => setDates((d) => ({ ...d, startDate: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Ends (last day)
                <input
                  type="date"
                  required
                  value={dates.endDate}
                  onChange={(event) => setDates((d) => ({ ...d, endDate: event.target.value }))}
                  className={inputClass}
                />
              </label>
            </div>
            {startError && (
              <p role="alert" className="text-sm text-red-500">
                {startError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsStarting(false)}
                disabled={isSubmittingStart}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSubmittingStart || !dates.startDate || !dates.endDate} className={buttonClass}>
                {isSubmittingStart ? "Starting..." : `Start ${cohortName(current.number + 1)}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
