"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { uploadReportPdf } from "@/lib/report-attachments";
import { zodResolver } from "@/lib/zod-resolver";
import { roleTitles } from "@/hooks/useCurrentProfile";
import { Modal } from "@/components/ui/Modal";
import { FieldError, SearchInput, inputClass } from "@/components/Head-of-RO/shared/ListParts";
import { AttachedPdfList, PdfAttachmentPicker, ReviewerFeedback } from "@/components/shared/PdfAttachmentPicker";
import { MAX_REPORT_ATTACHMENTS } from "@/lib/report-attachments";
import type { ReportAttachment } from "@/types/report.types";
import { runWorkflow, withScope, type ActivityScope } from "./activity.api";
import { evidenceFormSchema, usesWorkflow, type ApiActivity, type ApiActivityDetail, type EvidenceForm } from "./activity.types";

type EvidenceModalProps = {
  activity: ApiActivity | null;
  scope: ActivityScope;
  onClose: () => void;
  onSubmitted: (message: string) => void;
};

/**
 * "Submit Evidence": what happened, who took part (sign-ups plus the
 * organizer's own team), and optional PDFs such as an attendance sheet.
 */
export function EvidenceModal({ activity, scope, onClose, onSubmitted }: EvidenceModalProps) {
  const [detail, setDetail] = useState<ApiActivityDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [kept, setKept] = useState<ReportAttachment[]>([]);
  const [search, setSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EvidenceForm>({ resolver: zodResolver(evidenceFormSchema), defaultValues: { summary: "", participantIds: [] } });
  const selected = watch("participantIds");

  useEffect(() => {
    if (!activity) return;
    setDetail(null);
    setLoadError(null);
    setFiles([]);
    // Evidence that was returned keeps its PDFs unless they're removed.
    setKept(activity.evidence?.attachments ?? []);
    setSearch("");
    setSubmitError(null);
    reset({ summary: activity.evidence?.summary ?? "", participantIds: [] });
    let cancelled = false;
    apiFetch<ApiActivityDetail>(withScope(`/api/activities/${activity.id}`, scope))
      .then((loaded) => {
        if (cancelled) return;
        setDetail(loaded);
        // Pre-tick the previous submission, or everyone who signed up.
        const previous = activity.evidence?.participantIds;
        setValue(
          "participantIds",
          previous?.length ? previous : (loaded.candidateList ?? []).filter((person) => person.signedUp).map((person) => person.id)
        );
      })
      .catch((error) => !cancelled && setLoadError(errorMessage(error, "Unable to load participants.")));
    return () => {
      cancelled = true;
    };
  }, [activity, scope, reset, setValue]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (detail?.candidateList ?? []).filter((person) => !q || person.name.toLowerCase().includes(q));
  }, [detail, search]);

  const toggle = (id: string) =>
    setValue("participantIds", selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id], {
      shouldValidate: !!errors.participantIds,
    });

  const onSubmit = handleSubmit(async (values) => {
    if (!activity) return;
    setSubmitError(null);
    try {
      const actingAs = scope.portal !== "head-ro" && scope.selectedId ? { role: scope.portal, id: scope.selectedId } : null;
      const attachments = [...kept];
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading PDF ${index + 1} of ${files.length}...`);
        attachments.push(await uploadReportPdf(file, actingAs));
      }
      setProgress("Submitting evidence...");
      await runWorkflow(
        activity.id,
        { action: "submit-evidence", evidence: { summary: values.summary, participantIds: values.participantIds, attachments } },
        scope
      );
      onSubmitted(
        usesWorkflow(activity)
          ? `Evidence for "${activity.title}" was sent for verification.`
          : `"${activity.title}" is complete.`
      );
    } catch (error) {
      setSubmitError(errorMessage(error, "Unable to submit evidence."));
    } finally {
      setProgress(null);
    }
  });

  return (
    <Modal
      isOpen={!!activity}
      title="Submit evidence"
      description={
        activity && usesWorkflow(activity)
          ? "Your RO verifies it; once verified, every participant receives a certificate."
          : "Once submitted, the activity is completed. Trainings and meetings don't issue certificates."
      }
      onClose={onClose}
      isBusy={isSubmitting}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* An "ongoing" activity with a comment had its evidence returned (the comment is cleared on start). */}
        {activity?.status === "ongoing" && (
          <ReviewerFeedback
            title={`${activity.reviewedByName || "Your reviewer"} returned the evidence`}
            message={activity.reviewComment}
          />
        )}
        <label className="block text-sm font-medium text-gray-700">
          What happened
          <textarea
            rows={4}
            placeholder="Activities carried out, outcomes, anything the reviewer should know..."
            {...register("summary")}
            className={inputClass}
            aria-invalid={!!errors.summary}
          />
          <FieldError message={errors.summary?.message} />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700">
            Participants <span className="font-normal text-gray-400">({selected.length} selected)</span>
          </legend>
          <p className="mt-0.5 text-xs text-gray-400">People who signed up, plus your own team members.</p>
          {!detail && !loadError && <p className="mt-2 text-sm text-gray-400">Loading participants...</p>}
          {loadError && (
            <p role="alert" className="mt-2 text-sm text-red-500">
              {loadError}
            </p>
          )}
          {detail && (detail.candidateList?.length ?? 0) === 0 && (
            <p className="mt-2 text-sm text-gray-400">No one signed up and your team is empty, so there&apos;s no one to credit.</p>
          )}
          {detail && (detail.candidateList?.length ?? 0) > 0 && (
            <>
              {(detail.candidateList?.length ?? 0) > 8 && (
                <div className="mt-2">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search participants by name..." />
                </div>
              )}
              <ul className="mt-2 max-h-56 divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-100">
                {candidates.map((person) => (
                  <li key={person.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selected.includes(person.id)}
                        onChange={() => toggle(person.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-brand"
                      />
                      <span className="flex-1 text-gray-800">{person.name}</span>
                      <span className="text-xs text-gray-400">
                        {roleTitles[person.role]}
                        {person.signedUp ? " · signed up" : ""}
                      </span>
                    </label>
                  </li>
                ))}
                {candidates.length === 0 && <li className="px-3 py-3 text-sm text-gray-400">No one matches your search.</li>}
              </ul>
            </>
          )}
          <FieldError message={errors.participantIds?.message} />
        </fieldset>

        <AttachedPdfList attachments={kept} onChange={setKept} disabled={isSubmitting} />
        <PdfAttachmentPicker
          files={files}
          onChange={setFiles}
          disabled={isSubmitting}
          label={kept.length ? "Add more evidence PDFs" : "Evidence PDFs"}
          maxFiles={MAX_REPORT_ATTACHMENTS - kept.length}
        />

        {progress && isSubmitting && <p className="text-sm text-gray-500">{progress}</p>}
        {submitError && (
          <p role="alert" className="text-sm text-red-500">
            {submitError}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !detail}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit evidence"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
