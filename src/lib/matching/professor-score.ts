import type { Profile } from "@/types/database";
import type { ProfessorWithUniversity } from "@/types/professor";

function normalizeField(value: string) {
  return value.toLowerCase().trim();
}

function fieldOverlap(profileField: string, areas: string[]) {
  const field = normalizeField(profileField);
  return areas.some(
    (area) =>
      field.includes(normalizeField(area)) ||
      normalizeField(area).includes(field),
  );
}

export function computeProfessorScore(
  profile: Profile | null,
  professor: ProfessorWithUniversity,
): number | null {
  if (!profile?.onboarding_completed) return null;

  if (profile.degree_level === "msc" && !professor.accepts_msc) return null;
  if (profile.degree_level === "phd" && !professor.accepts_phd) return null;

  let score = 30;

  if (fieldOverlap(profile.field_of_study, professor.research_areas)) {
    score += 40;
  }

  const country = professor.universities?.country;
  if (country && profile.preferred_countries.includes(country)) {
    score += 20;
  }

  if (profile.degree_level === "phd" || profile.degree_level === "msc") {
    score += 10;
  }

  return Math.min(score, 100);
}
