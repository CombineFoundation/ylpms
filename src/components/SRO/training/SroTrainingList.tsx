"use client";

import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { TrainingList } from "@/components/Head-of-RO/training/TrainingList";

/** SRO Training Portal: manage your own resources and browse what's published to SROs. */
export function SroTrainingList() {
  const { profile } = useCurrentProfile();

  if (!profile) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading">
        <div className="h-7 w-56 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-44 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // A developer has full access, so they manage every resource like the Head RO does.
  return profile.role === "developer" ? <TrainingList /> : <TrainingList authorId={profile.id} />;
}
