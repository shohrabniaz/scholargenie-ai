"use client";

import Link from "next/link";
import { TrackApplicationButton } from "@/components/applications/track-application-button";
import type { TopScholarshipMatch } from "@/lib/dashboard/weekly-plan";

type TopMatchesPanelProps = {
  matches: TopScholarshipMatch[];
  trackedIds: string[];
};

export function TopMatchesPanel({ matches, trackedIds }: TopMatchesPanelProps) {
  if (matches.length === 0) return null;

  const tracked = new Set(trackedIds);

  return (
    <section aria-labelledby="top-matches-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="top-matches-heading" className="text-sm font-medium text-muted">
            Top matches
          </h2>
          <p className="mt-1 text-sm text-muted">
            Your best scholarship fits — track one to start this week.
          </p>
        </div>
        <Link
          href="/scholarships"
          className="text-xs text-muted transition-colors hover:text-foreground"
        >
          See all
        </Link>
      </div>

      <ul className="mt-4 space-y-2">
        {matches.map(({ scholarship, score }) => (
          <li
            key={scholarship.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{scholarship.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {score}% match · {scholarship.country}
              </p>
            </div>
            <TrackApplicationButton
              title={scholarship.name}
              kind="scholarship"
              scholarshipId={scholarship.id}
              initiallyTracked={tracked.has(scholarship.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
