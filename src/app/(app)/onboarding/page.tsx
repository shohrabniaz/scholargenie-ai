import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import type { OnboardingFormData } from "@/lib/validations/profile";
import type { Profile } from "@/types/database";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const defaultValues: Partial<OnboardingFormData> | undefined = profile
    ? {
        full_name: profile.full_name ?? "",
        home_country: profile.home_country,
        degree_level: profile.degree_level as OnboardingFormData["degree_level"],
        field_of_study: profile.field_of_study,
        cgpa: profile.cgpa ?? undefined,
        ielts_score: profile.ielts_score,
        pte_score: profile.pte_score,
        budget_usd: profile.budget_usd ?? undefined,
        preferred_countries: profile.preferred_countries,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <OnboardingWizard
        defaultValues={defaultValues}
        isEdit={profile?.onboarding_completed ?? false}
      />
    </div>
  );
}
