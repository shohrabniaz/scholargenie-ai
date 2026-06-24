import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TrackApplicationButton } from "@/components/applications/track-application-button";
import { Badge } from "@/components/ui/badge";
import {
  TIER_LABELS,
  type MatchTier,
  type University,
} from "@/types/university";

type UniversityCardProps = {
  university: University;
  tier: MatchTier | null;
  tracked?: boolean;
};

function formatTuition(min: number | null, max: number | null) {
  if (min == null && max == null) return "Varies";
  if (min != null && max != null) {
    return `$${min.toLocaleString()}–$${max.toLocaleString()} / yr`;
  }
  return `$${(max ?? min)?.toLocaleString()} / yr`;
}

const tierBadgeVariant = (tier: MatchTier) => {
  if (tier === "safe") return "default" as const;
  if (tier === "target") return "subtle" as const;
  return "subtle" as const;
};

export function UniversityCard({ university, tier, tracked = false }: UniversityCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground">{university.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {university.city ? `${university.city}, ` : ""}
            {university.country}
          </p>
        </div>
        {tier ? (
          <Badge variant={tierBadgeVariant(tier)}>{TIER_LABELS[tier]}</Badge>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">Min GPA</dt>
          <dd className="font-medium">{university.min_gpa ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Min IELTS</dt>
          <dd className="font-medium">{university.min_ielts ?? "—"}</dd>
        </div>
        <div className="col-span-2 sm:col-span-2">
          <dt className="text-muted">Tuition</dt>
          <dd className="font-medium">
            {formatTuition(university.tuition_usd_min, university.tuition_usd_max)}
          </dd>
        </div>
      </dl>

      {university.website ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <TrackApplicationButton
            title={university.name}
            kind="university"
            universityId={university.id}
            initiallyTracked={tracked}
          />
          <Link
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            Visit website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <TrackApplicationButton
            title={university.name}
            kind="university"
            universityId={university.id}
            initiallyTracked={tracked}
          />
        </div>
      )}
    </article>
  );
}
