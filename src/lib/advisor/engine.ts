import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { University } from "@/types/university";
import { computeMatchScore } from "@/lib/matching/scholarship-score";
import { computeUniversityTier } from "@/lib/matching/university-tier";

export type RoadmapStep = {
  title: string;
  detail: string;
};

export function generateRoadmap(
  profile: Profile,
  scholarships: Scholarship[],
  universities: University[],
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];

  const topScholarships = scholarships
    .map((s) => ({ s, score: computeMatchScore(profile, s) ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const safeUnis = universities.filter(
    (u) => computeUniversityTier(profile, u) === "safe",
  ).length;
  const targetUnis = universities.filter(
    (u) => computeUniversityTier(profile, u) === "target",
  ).length;

  steps.push({
    title: "Shortlist destinations",
    detail: `Focus on ${profile.preferred_countries.join(", ")} for your ${profile.degree_level.toUpperCase()} in ${profile.field_of_study}.`,
  });

  if (profile.ielts_score == null && profile.pte_score == null) {
    steps.push({
      title: "Book an English test",
      detail:
        "Most programs require IELTS 6.5+ or PTE 58+. Schedule a test at least 3 months before deadlines.",
    });
  }

  steps.push({
    title: "Build your university list",
    detail: `${safeUnis} safe and ${targetUnis} target universities match your profile. Apply to 2–3 safe, 3–4 target, and 1–2 ambitious options.`,
  });

  if (topScholarships.length > 0) {
    const names = topScholarships.map((t) => t.s.name).join(", ");
    steps.push({
      title: "Apply for scholarships early",
      detail: `Top matches: ${names}. Fully funded awards are competitive — submit 8–12 weeks before the deadline.`,
    });
  }

  if (profile.degree_level === "phd" || profile.degree_level === "msc") {
    steps.push({
      title: "Contact supervisors",
      detail:
        "Email 5–8 professors whose research fits your field. Attach a one-page CV and mention a specific paper or project.",
    });
  }

  steps.push({
    title: "Prepare documents",
    detail:
      "Draft your SOP, request 2–3 recommendation letters, and update your CV. Use the Tools section to get started.",
  });

  steps.push({
    title: "Track every deadline",
    detail:
      "Save scholarships and add visa, test, and application dates to your deadline tracker so nothing slips.",
  });

  return steps;
}

export type AdvisorMessage = {
  role: "user" | "assistant";
  content: string;
};

export function respondToMessage(
  message: string,
  profile: Profile,
  scholarships: Scholarship[],
  universities: University[],
): string {
  const lower = message.toLowerCase();

  if (lower.includes("scholarship") || lower.includes("funding")) {
    const top = scholarships
      .map((s) => ({ s, score: computeMatchScore(profile, s) ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (top.length === 0) {
      return "Browse the Scholarships page and complete your profile for personalized match scores.";
    }

    return `Your top scholarship matches:\n\n${top
      .map(
        (t, i) =>
          `${i + 1}. **${t.s.name}** (${t.s.country}) — ${t.score}% match${t.s.deadline ? `, deadline ${t.s.deadline}` : ""}`,
      )
      .join("\n")}\n\nSave the ones you like and check the Deadlines page for upcoming dates.`;
  }

  if (lower.includes("universit") || lower.includes("college")) {
    const tiers = ["safe", "target", "ambitious"] as const;
    const summary = tiers
      .map((tier) => {
        const count = universities.filter(
          (u) => computeUniversityTier(profile, u) === tier,
        ).length;
        return `${count} ${tier}`;
      })
      .join(", ");

    return `Based on your CGPA (${profile.cgpa ?? "not set"}) and budget, you have ${summary} university matches.\n\nOpen Universities to filter by country and tier. Aim for a balanced list across all three tiers.`;
  }

  if (lower.includes("professor") || lower.includes("supervisor")) {
    return `For ${profile.degree_level === "phd" ? "PhD" : "MSc"} applications in ${profile.field_of_study}, visit Professors to find supervisors with research fit scores.\n\nEmail 5–8 professors with a tailored message — use the outreach draft on each card.`;
  }

  if (lower.includes("ielts") || lower.includes("pte") || lower.includes("english")) {
    if (profile.ielts_score) {
      return `Your IELTS score is ${profile.ielts_score}. Most programs ask for 6.5 overall (no band below 6.0). Competitive scholarships often want 7.0+.`;
    }
    return "Book IELTS or PTE at least 3 months before your earliest application deadline. Target 6.5+ for most programs, 7.0+ for competitive funding.";
  }

  if (lower.includes("sop") || lower.includes("statement")) {
    return "Use Tools → SOP Writer to generate a structured outline with your profile details pre-filled. Customize every paragraph — admissions committees spot generic essays.";
  }

  if (lower.includes("cv") || lower.includes("resume")) {
    return "Paste your CV into Tools → CV Analyzer for a quick checklist: sections, length, action verbs, and formatting tips.";
  }

  if (lower.includes("deadline") || lower.includes("timeline")) {
    const withDeadlines = scholarships.filter((s) => s.deadline).length;
    return `You have ${withDeadlines} scholarships with known deadlines in our database. Open Deadlines to see saved scholarship dates and add your own visa and test reminders.`;
  }

  if (lower.includes("roadmap") || lower.includes("plan") || lower.includes("start")) {
    const steps = generateRoadmap(profile, scholarships, universities);
    return `Here is your study-abroad roadmap:\n\n${steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.detail}`).join("\n\n")}`;
  }

  return `I can help with scholarships, universities, professors, deadlines, SOPs, and CVs — all based on your profile (${profile.degree_level} in ${profile.field_of_study}, targeting ${profile.preferred_countries.join(", ")}).\n\nTry asking: "What scholarships match me?" or "Give me a roadmap."`;
}
