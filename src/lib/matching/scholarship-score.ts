import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";

export function computeMatchScore(
  profile: Profile | null,
  scholarship: Scholarship,
): number | null {
  if (!profile?.onboarding_completed) return null;

  let score = 40;

  if (profile.preferred_countries.includes(scholarship.country)) {
    score += 30;
  }

  if (
    scholarship.degree_levels.length === 0 ||
    scholarship.degree_levels.includes(profile.degree_level)
  ) {
    score += 20;
  }

  if (scholarship.fields.length > 0 && profile.field_of_study) {
    const field = profile.field_of_study.toLowerCase();
    const matchesField = scholarship.fields.some(
      (f) => field.includes(f.toLowerCase()) || f.toLowerCase().includes(field),
    );
    if (matchesField) score += 10;
  } else if (scholarship.fields.length === 0) {
    score += 5;
  }

  return Math.min(100, score);
}
