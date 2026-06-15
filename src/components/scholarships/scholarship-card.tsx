import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveScholarshipButton } from "@/components/scholarships/save-scholarship-button";
import { FUNDING_LABELS, type Scholarship } from "@/types/scholarship";

type ScholarshipCardProps = {
  scholarship: Scholarship;
  matchScore?: number | null;
  saved?: boolean;
};

function formatDeadline(deadline: string | null) {
  if (!deadline) return "Rolling";
  return new Date(deadline).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ScholarshipCard({
  scholarship,
  matchScore,
  saved = false,
}: ScholarshipCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-background">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground">{scholarship.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {scholarship.country}
                {scholarship.university ? ` · ${scholarship.university}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {matchScore != null ? (
                <Badge variant="subtle">{matchScore}% match</Badge>
              ) : null}
              <Badge>{FUNDING_LABELS[scholarship.funding_type]}</Badge>
            </div>
          </div>

          {scholarship.amount_description ? (
            <p className="mt-3 text-sm text-foreground">
              {scholarship.amount_description}
            </p>
          ) : null}

          {scholarship.eligibility ? (
            <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
              {scholarship.eligibility}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-muted">
              Deadline: {formatDeadline(scholarship.deadline)}
            </span>
            <Link
              href={scholarship.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              Official page
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
        <SaveScholarshipButton
          scholarshipId={scholarship.id}
          initiallySaved={saved}
        />
      </div>
    </article>
  );
}
