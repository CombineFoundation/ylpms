"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { usePagedList } from "@/hooks/usePagedList";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { usePortalScope } from "@/hooks/usePortalScope";
import type { ScopedRole } from "@/utils/portal-scope";
import { ActionErrorBanner, FilterPills, LoadMoreButton, PageHeader } from "@/components/Head-of-RO/shared/ListParts";
import { ActivityCard, type ActivityAction } from "./ActivityCard";
import { ActivityFormModal } from "./ActivityFormModal";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { EvidenceModal } from "./EvidenceModal";
import { WorkflowConfirm, type ConfirmableAction } from "./WorkflowConfirm";
import { WorkflowSteps } from "./WorkflowSteps";
import { saveActivity, setAttendance, withScope, type ActivityScope } from "./activity.api";
import type { ActivityForm, ActivityPortal, ApiActivity } from "./activity.types";

type Tab = { value: string; label: string; view: "all" | "mine" | "joined" | "review"; when: "upcoming" | "past" };

const upcoming: Tab = { value: "upcoming", label: "Upcoming", view: "all", when: "upcoming" };
const past: Tab = { value: "past", label: "Past", view: "all", when: "past" };
const review: Tab = { value: "review", label: "Awaiting my review", view: "review", when: "upcoming" };
const mine: Tab = { value: "mine", label: "Organized by me", view: "mine", when: "upcoming" };

const TABS: Record<ActivityPortal, Tab[]> = {
  "head-ro": [upcoming, review, mine, past],
  sro: [upcoming, review, mine, past],
  ro: [review, upcoming, mine, { value: "joined", label: "Signed up", view: "joined", when: "upcoming" }, past],
  "youth-leader": [{ ...mine, label: "My activities" }, upcoming, { value: "joined", label: "Signed up", view: "joined", when: "upcoming" }, past],
  volunteer: [upcoming, { value: "joined", label: "Signed up", view: "joined", when: "upcoming" }, past],
};

const COPY: Record<ActivityPortal, { title: string; description: string; empty: Record<string, string> }> = {
  "head-ro": {
    title: "Activities",
    description: "Every activity across the program. Approve youth leaders' proposals and verify their evidence.",
    empty: { upcoming: "No upcoming activities. Create the next one.", review: "Nothing is waiting for your review." },
  },
  sro: {
    title: "Activities",
    description: "Activities across your team, and ones you organize. Youth leaders' proposals and evidence can be reviewed here.",
    empty: { upcoming: "No upcoming activities.", review: "Nothing from your team is waiting for review." },
  },
  ro: {
    title: "Activities",
    description:
      "Review and approve your youth leaders' activities, verify their evidence to issue certificates, and run your own activities.",
    empty: {
      upcoming: "No upcoming activities.",
      review: "None of your youth leaders' activities need your review.",
      mine: "You haven't organized any activities yet. Start with “New activity”.",
    },
  },
  "youth-leader": {
    title: "Activities",
    description: "Plan activities, get them approved by your RO, conduct them, and submit evidence so participants earn certificates.",
    empty: { mine: "You haven't created any activities yet. Start with “New activity”.", joined: "You haven't signed up for anything." },
  },
  volunteer: {
    title: "Activities",
    description: "Sign up for upcoming activities. You'll receive a certificate once an activity you took part in is verified.",
    empty: { upcoming: "No activities are open for sign-up right now.", joined: "You haven't signed up for any upcoming activities." },
  },
};

/** The activity / events board for any portal (Head RO, SRO, RO, youth leader, volunteer). */
export function ActivityBoard({ portal }: { portal: ActivityPortal }) {
  return portal === "head-ro" ? <HeadROBoard /> : <ScopedBoard portal={portal} />;
}

function HeadROBoard() {
  const { profile } = useCurrentProfile();
  const scope = useMemo<ActivityScope>(() => ({ portal: "head-ro", selectedId: null }), []);
  return <BoardView scope={scope} isReady={!!profile} scopeError={null} />;
}

function ScopedBoard({ portal }: { portal: ScopedRole }) {
  const { selectedId, isReady, error } = usePortalScope(portal);
  const scope = useMemo<ActivityScope>(() => ({ portal, selectedId }), [portal, selectedId]);
  return <BoardView scope={scope} isReady={isReady} scopeError={error} />;
}

function BoardView({ scope, isReady, scopeError }: { scope: ActivityScope; isReady: boolean; scopeError: string | null }) {
  const { portal } = scope;
  const tabs = TABS[portal];
  const copy = COPY[portal];
  const canCreate = portal !== "volunteer";
  const [tabValue, setTabValue] = useState(tabs[0].value);
  const tab = tabs.find((t) => t.value === tabValue) ?? tabs[0];

  const list = usePagedList<ApiActivity>(
    (page) => withScope(`/api/events?view=${tab.view}&when=${tab.when}&pageSize=24&pageNumber=${page}`, scope),
    `activities:${portal}:${tab.value}:${scope.selectedId ?? ""}`,
    "Unable to load activities.",
    isReady
  );

  const [formState, setFormState] = useState<{ editing: ApiActivity | null } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [evidenceFor, setEvidenceFor] = useState<ApiActivity | null>(null);
  const [confirming, setConfirming] = useState<{ action: ConfirmableAction; activity: ApiActivity } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = async (values: ActivityForm) => {
    setFormError(null);
    try {
      await saveActivity(values, formState?.editing?.id ?? null, scope);
      const created = !formState?.editing;
      setFormState(null);
      if (created && portal === "youth-leader") {
        setNotice(`"${values.title}" was saved as a draft. Submit it for approval when it's ready.`);
      }
      if (created && tab.view !== "mine" && tabs.some((t) => t.view === "mine")) setTabValue("mine");
      else list.reload();
    } catch (error) {
      setFormError(errorMessage(error, "Unable to save this activity."));
    }
  };

  const toggleAttendance = async (activity: ApiActivity, join: boolean) => {
    setBusyId(activity.id);
    setActionError(null);
    try {
      await setAttendance(activity.id, join, scope);
      setNotice(join ? `You're signed up for "${activity.title}".` : `You withdrew from "${activity.title}".`);
      list.reload();
    } catch (error) {
      setActionError(errorMessage(error, "Unable to update your sign-up."));
    } finally {
      setBusyId(null);
    }
  };

  const onAction = (action: ActivityAction, activity: ApiActivity) => {
    setActionError(null);
    if (action === "view") setViewingId(activity.id);
    else if (action === "edit") {
      setFormError(null);
      setFormState({ editing: activity });
    } else if (action === "evidence") setEvidenceFor(activity);
    else if (action === "join" || action === "leave") toggleAttendance(activity, action === "join");
    else setConfirming({ action, activity });
  };

  const emptyText = copy.empty[tab.value] ?? (tab.when === "past" ? "No past activities yet." : "Nothing here yet.");

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          canCreate && (
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setFormState({ editing: null });
              }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Plus size={15} />
              New activity
            </button>
          )
        }
      />

      {(portal === "youth-leader" || portal === "ro") && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Activity workflow</h2>
          <WorkflowSteps />
          {portal === "ro" && (
            <p className="mt-2 text-xs text-gray-400">
              Your youth leaders submit activities to you: approve or send them back, then verify their evidence to issue
              certificates. Activities you create are approved straight away and complete when you submit their evidence.
            </p>
          )}
        </div>
      )}

      <FilterPills label="Show" options={tabs} value={tab.value} onChange={setTabValue} />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}
      <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />

      {scopeError && (
        <p role="alert" className="text-sm text-red-500">
          {scopeError}
        </p>
      )}
      {!scopeError && list.isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-pulse" aria-busy="true" aria-label="Loading activities">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-44 rounded-xl bg-slate-200" />
          ))}
        </div>
      )}
      {!scopeError && !list.isLoading && list.error && (
        <p role="alert" className="text-sm text-red-500">
          {list.error}{" "}
          <button type="button" onClick={list.reload} className="font-medium text-brand hover:underline">
            Retry
          </button>
        </p>
      )}
      {!scopeError && !list.isLoading && !list.error && list.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-400">{emptyText}</p>
      )}
      {!scopeError && !list.isLoading && !list.error && list.items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {list.items.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} isBusy={busyId === activity.id} onAction={onAction} />
            ))}
          </div>
          <LoadMoreButton hasMore={list.hasMore} isLoadingMore={list.isLoadingMore} onClick={list.loadMore} shownCount={list.items.length} />
        </div>
      )}

      <ActivityFormModal
        isOpen={!!formState}
        editing={formState?.editing ?? null}
        needsApproval={portal === "youth-leader"}
        error={formError}
        onClose={() => setFormState(null)}
        onSubmit={handleSave}
      />
      <ActivityDetailModal activityId={viewingId} scope={scope} onClose={() => setViewingId(null)} />
      <EvidenceModal
        activity={evidenceFor}
        scope={scope}
        onClose={() => setEvidenceFor(null)}
        onSubmitted={(message) => {
          setEvidenceFor(null);
          setNotice(message);
          list.reload();
        }}
      />
      <WorkflowConfirm
        pending={confirming}
        scope={scope}
        onCancel={() => setConfirming(null)}
        onDone={(message) => {
          setConfirming(null);
          if (message) setNotice(message);
          list.reload();
        }}
      />
    </div>
  );
}
