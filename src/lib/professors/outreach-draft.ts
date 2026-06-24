import type { Profile } from "@/types/database";
import type { ProfessorWithUniversity } from "@/types/professor";

function overlapScore(profileField: string, area: string): number {
  const field = profileField.toLowerCase();
  const research = area.toLowerCase();
  if (field === research) return 3;
  if (field.includes(research) || research.includes(field)) return 2;
  const fieldTokens = field.split(/\W+/).filter(Boolean);
  const researchTokens = research.split(/\W+/).filter(Boolean);
  const shared = fieldTokens.filter((t) => researchTokens.includes(t));
  return shared.length;
}

function pickResearchHook(profile: Profile, professor: ProfessorWithUniversity): string {
  const areas = professor.research_areas.length
    ? professor.research_areas
    : [profile.field_of_study];

  const ranked = [...areas].sort(
    (a, b) => overlapScore(profile.field_of_study, b) - overlapScore(profile.field_of_study, a),
  );

  const top = ranked[0] ?? profile.field_of_study;
  const second = ranked[1];

  if (second && overlapScore(profile.field_of_study, second) > 0) {
    return `${top} and ${second}`;
  }

  return top;
}

export function generateOutreachDraft(
  profile: Profile,
  professor: ProfessorWithUniversity,
) {
  const university = professor.universities?.name ?? "your university";
  const country = professor.universities?.country;
  const areas = pickResearchHook(profile, professor);
  const degree =
    profile.degree_level === "phd"
      ? "PhD"
      : profile.degree_level === "msc"
        ? "MSc"
        : "graduate";
  const lastName = professor.name.split(" ").pop() ?? professor.name;
  const budgetNote =
    profile.budget_usd && profile.budget_usd < 25000
      ? "I am actively seeking funded opportunities and assistantships."
      : "I am prepared to discuss funding options that align with your group's projects.";

  return `Subject: Prospective ${degree} student — ${profile.field_of_study} (${areas})

Dear Professor ${lastName},

I hope you are doing well. My name is ${profile.full_name ?? "Student"}, and I am applying for a ${degree} in ${profile.field_of_study} at ${university}${country ? ` (${country})` : ""}.

Your group's work on ${areas} strongly matches my background in ${profile.field_of_study}. In particular, I would like to explore how my experience with [add one project or result] could contribute to your ongoing work on ${areas.split(" and ")[0]}.

Quick background:
- Home country: ${profile.home_country}
- CGPA: ${profile.cgpa ?? "N/A"}${profile.ielts_score ? `\n- IELTS: ${profile.ielts_score}` : ""}${profile.pte_score ? `\n- PTE: ${profile.pte_score}` : ""}
- ${budgetNote}

Would you have 15 minutes for a brief call this month, or could you advise whether you are accepting ${profile.degree_level === "phd" ? "doctoral" : "master's"} students for the upcoming intake? I can share my CV and a one-page research summary.

Thank you for your time.

Best regards,
${profile.full_name ?? "Student"}`;
}
