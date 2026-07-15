import Link from "next/link";

import type { ScoreGap, ScoreGapSummary } from "@/lib/matching/score-gap";

type ScoreGapPanelProps = {
  gaps: ScoreGap[];
  summary?: ScoreGapSummary;
};

export function ScoreGapPanel({ gaps, summary = null }: ScoreGapPanelProps) {
  if (gaps.length === 0 && !summary) return null;

  return (
    <section aria-labelledby="score-gap-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="score-gap-heading" className="text-sm font-medium text-muted">
            Score gaps
          </h2>
          <p className="mt-1 text-sm text-muted">
            Where your profile falls short of university minimums — and by how much.
          </p>
        </div>
        <Link
          href="/universities"
          className="text-xs text-muted transition-colors hover:text-foreground"
        >
          Universities
        </Link>
      </div>

      {summary ? (
        <div className="mt-4 rounded-2xl border border-border bg-foreground px-4 py-3 text-background">
          <p className="text-sm font-medium">{summary.headline}</p>
          <p className="mt-1 text-xs text-background/70">{summary.detail}</p>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2">
        {gaps.map((gap) => (
          <li
            key={`${gap.universityName}-${gap.kind}`}
            className="rounded-2xl border border-border bg-surface px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">{gap.universityName}</p>
            <p className="mt-1 text-sm text-muted">{gap.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
