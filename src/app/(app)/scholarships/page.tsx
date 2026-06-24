import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ScholarshipCard } from "@/components/scholarships/scholarship-card";
import { ScholarshipFilters } from "@/components/scholarships/scholarship-filters";
import { computeMatchScore } from "@/lib/matching/scholarship-score";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";

type PageProps = {
  searchParams: Promise<{
    country?: string;
    funding?: string;
    degree?: string;
    saved?: string;
  }>;
};

export default async function ScholarshipsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileQuery = user
    ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
    : Promise.resolve({ data: null, error: null });

  const savedQuery = user
    ? supabase
        .from("saved_scholarships")
        .select("scholarship_id")
        .eq("user_id", user.id)
    : Promise.resolve({ data: [], error: null });

  const trackedQuery = user
    ? supabase
        .from("applications")
        .select("scholarship_id")
        .eq("user_id", user.id)
        .not("scholarship_id", "is", null)
    : Promise.resolve({ data: [], error: null });

  let scholarshipQuery = supabase
    .from("scholarships")
    .select("*")
    .order("deadline", { ascending: true, nullsFirst: false });

  if (params.country) scholarshipQuery = scholarshipQuery.eq("country", params.country);
  if (params.funding) scholarshipQuery = scholarshipQuery.eq("funding_type", params.funding);
  if (params.degree) scholarshipQuery = scholarshipQuery.contains("degree_levels", [params.degree]);

  const [
    { data: scholarships, error: scholarshipsError },
    { data: profile },
    { data: savedRows },
    { data: trackedRows },
  ] = await Promise.all([
    scholarshipQuery.returns<Scholarship[]>(),
    profileQuery,
    savedQuery,
    trackedQuery,
  ]);

  const savedIds = new Set((savedRows ?? []).map((r) => r.scholarship_id));
  const trackedIds = new Set(
    (trackedRows ?? []).map((r) => r.scholarship_id).filter(Boolean) as string[],
  );

  let items = (scholarships ?? []).map((s) => ({
    scholarship: s,
    matchScore: computeMatchScore(profile, s),
    saved: savedIds.has(s.id),
    tracked: trackedIds.has(s.id),
  }));

  if (params.saved === "1") {
    items = items.filter((item) => item.saved);
  }

  items.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Scholarships</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Find funding</h1>
      <p className="mt-2 text-sm text-muted">
        {scholarshipsError
          ? "Could not load scholarships. Check your connection and try again."
          : `${items.length} result${items.length === 1 ? "" : "s"}${
              profile?.onboarding_completed ? " · sorted by match" : ""
            }${params.saved === "1" ? " · saved only" : ""}`}
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="h-[88px] animate-pulse rounded-2xl border border-border bg-surface" />
          }
        >
          <ScholarshipFilters showSavedToggle />
        </Suspense>
      </div>

      <ul className="mt-6 space-y-3">
        {scholarshipsError ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            Failed to load scholarships.
          </li>
        ) : items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            {params.saved === "1"
              ? "No saved scholarships yet. Bookmark ones you like."
              : "No scholarships match your filters."}
          </li>
        ) : (
          items.map(({ scholarship, matchScore, saved, tracked }) => (
            <li key={scholarship.id}>
              <ScholarshipCard
                scholarship={scholarship}
                matchScore={matchScore}
                saved={saved}
                tracked={tracked}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
