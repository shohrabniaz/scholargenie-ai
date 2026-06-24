import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { UniversityCard } from "@/components/universities/university-card";
import { UniversityFilters } from "@/components/universities/university-filters";
import {
  computeUniversityTier,
  tierSortOrder,
} from "@/lib/matching/university-tier";
import type { Profile } from "@/types/database";
import type { University } from "@/types/university";

type PageProps = {
  searchParams: Promise<{
    country?: string;
    tier?: string;
  }>;
};

export default async function UniversitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("universities").select("*").order("name");

  if (params.country) query = query.eq("country", params.country);

  const [{ data: universities, error }, profileResult, trackedResult] = await Promise.all([
    query.returns<University[]>(),
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
      : Promise.resolve({ data: null, error: null }),
    user
      ? supabase
          .from("applications")
          .select("university_id")
          .eq("user_id", user.id)
          .not("university_id", "is", null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const profile = profileResult.data;
  const trackedIds = new Set(
    (trackedResult.data ?? []).map((r) => r.university_id).filter(Boolean) as string[],
  );

  let items = (universities ?? []).map((u) => ({
    university: u,
    tier: computeUniversityTier(profile, u),
    tracked: trackedIds.has(u.id),
  }));

  if (profile?.preferred_countries.length) {
    items = items.filter(
      (item) =>
        profile.preferred_countries.includes(item.university.country) ||
        item.tier != null,
    );
  }

  if (params.tier && ["safe", "target", "ambitious"].includes(params.tier)) {
    items = items.filter((item) => item.tier === params.tier);
  }

  items.sort((a, b) => tierSortOrder(b.tier) - tierSortOrder(a.tier));

  const tierCounts = {
    safe: items.filter((i) => i.tier === "safe").length,
    target: items.filter((i) => i.tier === "target").length,
    ambitious: items.filter((i) => i.tier === "ambitious").length,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Universities</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Find your fit</h1>
      <p className="mt-2 text-sm text-muted">
        {error
          ? "Could not load universities."
          : profile?.onboarding_completed
            ? `${items.length} universities · ${tierCounts.safe} safe · ${tierCounts.target} target · ${tierCounts.ambitious} ambitious`
            : `${items.length} universities · complete your profile for match tiers`}
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="h-[88px] animate-pulse rounded-2xl border border-border bg-surface" />
          }
        >
          <UniversityFilters />
        </Suspense>
      </div>

      {!profile?.onboarding_completed ? (
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Finish onboarding to see safe, target, and ambitious labels based on your
          GPA, IELTS, and budget.
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {error ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            Failed to load universities.
          </li>
        ) : items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            No universities match your filters.
          </li>
        ) : (
          items.map(({ university, tier, tracked }) => (
            <li key={university.id}>
              <UniversityCard university={university} tier={tier} tracked={tracked} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
