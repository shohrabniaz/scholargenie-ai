import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UniversityCompareClient } from "@/components/universities/university-compare-client";
import type { Profile } from "@/types/database";
import type { University } from "@/types/university";

type PageProps = {
  searchParams: Promise<{ ids?: string }>;
};

export default async function UniversityComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: universities }, profileResult] = await Promise.all([
    supabase.from("universities").select("*").order("name").returns<University[]>(),
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
      : Promise.resolve({ data: null }),
  ]);

  const initialIds = (params.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="page-shell-wide">
      <p className="text-sm text-muted">
        <Link href="/universities" className="hover:text-foreground">
          Universities
        </Link>{" "}
        / Compare
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Compare universities</h1>
      <p className="mt-2 text-sm text-muted">
        Side-by-side GPA, IELTS, tuition, and your match tier for up to 3 schools.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />}>
          <UniversityCompareClient
            universities={universities ?? []}
            profile={profileResult.data}
            initialIds={initialIds}
          />
        </Suspense>
      </div>
    </div>
  );
}
