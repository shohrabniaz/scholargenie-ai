import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfessorCard } from "@/components/professors/professor-card";
import { ProfessorFilters } from "@/components/professors/professor-filters";
import { computeProfessorScore } from "@/lib/matching/professor-score";
import type { Profile } from "@/types/database";
import type { ProfessorWithUniversity } from "@/types/professor";

type PageProps = {
  searchParams: Promise<{
    country?: string;
    saved?: string;
  }>;
};

export default async function ProfessorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileQuery = user
    ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
    : Promise.resolve({ data: null, error: null });

  const savedQuery = user
    ? supabase.from("saved_professors").select("professor_id").eq("user_id", user.id)
    : Promise.resolve({ data: [], error: null });

  let professorQuery = supabase
    .from("professors")
    .select("*, universities(id, name, country, city)")
    .order("name");

  const [{ data: professors, error }, { data: profile }, { data: savedRows }] =
    await Promise.all([professorQuery.returns<ProfessorWithUniversity[]>(), profileQuery, savedQuery]);

  const savedIds = new Set((savedRows ?? []).map((r) => r.professor_id));

  let items = (professors ?? []).map((p) => ({
    professor: p,
    matchScore: computeProfessorScore(profile, p),
    saved: savedIds.has(p.id),
  }));

  if (params.country) {
    items = items.filter(
      (item) => item.professor.universities?.country === params.country,
    );
  }

  if (params.saved === "1") {
    items = items.filter((item) => item.saved);
  }

  items = items.filter((item) => item.matchScore !== null || !profile?.onboarding_completed);
  items.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Professors</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Find supervisors</h1>
      <p className="mt-2 text-sm text-muted">
        {error
          ? "Could not load professors."
          : `${items.length} result${items.length === 1 ? "" : "s"}${
              profile?.onboarding_completed ? " · sorted by research fit" : ""
            }`}
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="h-[88px] animate-pulse rounded-2xl border border-border bg-surface" />
          }
        >
          <ProfessorFilters showSavedToggle />
        </Suspense>
      </div>

      {!profile?.onboarding_completed ? (
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Complete onboarding to see research fit scores and generate outreach emails.
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {error ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            Failed to load professors.
          </li>
        ) : items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            {params.saved === "1"
              ? "No saved professors yet."
              : "No professors match your filters."}
          </li>
        ) : (
          items.map(({ professor, matchScore, saved }) => (
            <li key={professor.id}>
              <ProfessorCard
                professor={professor}
                matchScore={matchScore}
                saved={saved}
                profile={profile}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
