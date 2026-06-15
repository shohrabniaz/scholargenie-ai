import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveProfessorButton } from "@/components/professors/save-professor-button";
import { OutreachDraft } from "@/components/professors/outreach-draft";
import type { Profile } from "@/types/database";
import type { ProfessorWithUniversity } from "@/types/professor";

type ProfessorCardProps = {
  professor: ProfessorWithUniversity;
  matchScore?: number | null;
  saved?: boolean;
  profile?: Profile | null;
};

export function ProfessorCard({
  professor,
  matchScore,
  saved = false,
  profile,
}: ProfessorCardProps) {
  const university = professor.universities;

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-background">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground">{professor.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {professor.department ?? "Department not listed"}
                {university
                  ? ` · ${university.name}${university.city ? `, ${university.city}` : ""}, ${university.country}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {matchScore != null ? (
                <Badge variant="subtle">{matchScore}% fit</Badge>
              ) : null}
              {professor.accepts_phd ? <Badge>PhD</Badge> : null}
              {professor.accepts_msc ? <Badge>MSc</Badge> : null}
            </div>
          </div>

          {professor.research_areas.length > 0 ? (
            <p className="mt-3 text-sm text-muted">
              Research: {professor.research_areas.join(" · ")}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {professor.email ? (
              <a
                href={`mailto:${professor.email}`}
                className="font-medium text-foreground hover:underline"
              >
                {professor.email}
              </a>
            ) : null}
            {professor.website ? (
              <Link
                href={professor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
              >
                Profile
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>

          {profile?.onboarding_completed ? (
            <OutreachDraft profile={profile} professor={professor} />
          ) : null}
        </div>
        <SaveProfessorButton professorId={professor.id} initiallySaved={saved} />
      </div>
    </article>
  );
}
