import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { University } from "@/types/university";
import { computeMatchScore } from "@/lib/matching/scholarship-score";
import { computeUniversityTier } from "@/lib/matching/university-tier";

export function buildAdvisorSystemPrompt(
  profile: Profile,
  scholarships: Scholarship[],
  universities: University[],
) {
  const topScholarships = scholarships
    .map((s) => ({ s, score: computeMatchScore(profile, s) ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const tierCounts = {
    safe: universities.filter((u) => computeUniversityTier(profile, u) === "safe")
      .length,
    target: universities.filter(
      (u) => computeUniversityTier(profile, u) === "target",
    ).length,
    ambitious: universities.filter(
      (u) => computeUniversityTier(profile, u) === "ambitious",
    ).length,
  };

  const scholarshipLines = topScholarships
    .map(
      (t) =>
        `- ${t.s.name} (${t.s.country}, ${t.s.funding_type}) — ${t.score}% match${t.s.deadline ? `, deadline ${t.s.deadline}` : ""}`,
    )
    .join("\n");

  return `You are ScholarGenie AI, a helpful study-abroad copilot for international students.

STUDENT PROFILE:
- Name: ${profile.full_name ?? "Student"}
- Home country: ${profile.home_country}
- Degree: ${profile.degree_level}
- Field: ${profile.field_of_study}
- CGPA: ${profile.cgpa ?? "not set"}
- IELTS: ${profile.ielts_score ?? "not set"}
- PTE: ${profile.pte_score ?? "not set"}
- Budget (USD/year): ${profile.budget_usd ?? "not set"}
- Preferred countries: ${profile.preferred_countries.join(", ")}

UNIVERSITY MATCH SUMMARY: ${tierCounts.safe} safe, ${tierCounts.target} target, ${tierCounts.ambitious} ambitious matches in our database.

TOP SCHOLARSHIP MATCHES:
${scholarshipLines || "(none loaded)"}

RULES:
- Give practical, encouraging advice for studying abroad.
- Reference the student's profile and data above when relevant.
- Be concise (2–4 short paragraphs max unless asked for a roadmap).
- Do not invent specific scholarship names beyond the list above.
- For legal/visa questions, remind them to verify with official sources.
- App features: Scholarships, Universities, Professors, Deadlines, SOP Writer, CV Analyzer.`;
}
