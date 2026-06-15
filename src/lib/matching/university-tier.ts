import type { Profile } from "@/types/database";
import type { MatchTier, University } from "@/types/university";

export function computeUniversityTier(
  profile: Profile | null,
  university: University,
): MatchTier | null {
  if (!profile?.onboarding_completed) return null;

  const cgpa = profile.cgpa;
  const ielts = profile.ielts_score;
  const budget = profile.budget_usd;
  const minGpa = university.min_gpa ?? 2.5;
  const minIelts = university.min_ielts ?? 6.0;

  if (
    university.degree_levels.length > 0 &&
    !university.degree_levels.includes(profile.degree_level)
  ) {
    return null;
  }

  if (cgpa == null) return null;

  const gpaGap = cgpa - minGpa;
  const ieltsGap = ielts != null ? ielts - minIelts : 0;
  const hasIelts = ielts != null;

  const tuitionOk =
    budget == null ||
    budget === 0 ||
    university.tuition_usd_max == null ||
    university.tuition_usd_max <= budget;

  if (gpaGap >= 0.2 && (!hasIelts || ieltsGap >= 0.5) && tuitionOk) {
    return "safe";
  }

  if (gpaGap >= 0 && (!hasIelts || ieltsGap >= 0) && tuitionOk) {
    return "target";
  }

  if (gpaGap >= -0.3 && (!hasIelts || ieltsGap >= -0.5)) {
    return "ambitious";
  }

  return null;
}

export function tierSortOrder(tier: MatchTier | null): number {
  if (tier === "safe") return 3;
  if (tier === "target") return 2;
  if (tier === "ambitious") return 1;
  return 0;
}
