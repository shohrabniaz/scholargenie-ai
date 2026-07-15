import type { Profile } from "@/types/database";
import type { University } from "@/types/university";

export type ScoreGap = {
  universityName: string;
  country: string;
  kind: "ielts" | "gpa" | "budget";
  message: string;
  gap: number;
};

export type ScoreGapSummary = {
  headline: string;
  detail: string;
} | null;

function collectGaps(profile: Profile, universities: University[]): ScoreGap[] {
  const preferred = new Set(
    (profile.preferred_countries ?? []).map((c) => c.toLowerCase()),
  );

  const candidates = universities.filter((u) => {
    if (preferred.size === 0) return true;
    return preferred.has(u.country.toLowerCase());
  });

  const gaps: ScoreGap[] = [];

  for (const uni of candidates) {
    if (
      profile.ielts_score != null &&
      uni.min_ielts != null &&
      profile.ielts_score < uni.min_ielts
    ) {
      const gap = Number((uni.min_ielts - profile.ielts_score).toFixed(1));
      gaps.push({
        universityName: uni.name,
        country: uni.country,
        kind: "ielts",
        gap,
        message: `Raise IELTS by ${gap} (you have ${profile.ielts_score}, need ${uni.min_ielts})`,
      });
    }

    if (profile.cgpa != null && uni.min_gpa != null && profile.cgpa < uni.min_gpa) {
      const gap = Number((uni.min_gpa - profile.cgpa).toFixed(2));
      gaps.push({
        universityName: uni.name,
        country: uni.country,
        kind: "gpa",
        gap,
        message: `CGPA short ${gap} (you have ${profile.cgpa}, need ${uni.min_gpa})`,
      });
    }

    if (
      profile.budget_usd != null &&
      uni.tuition_usd_min != null &&
      profile.budget_usd < uni.tuition_usd_min
    ) {
      const gap = uni.tuition_usd_min - profile.budget_usd;
      gaps.push({
        universityName: uni.name,
        country: uni.country,
        kind: "budget",
        gap,
        message: `Budget short ~$${gap.toLocaleString()} vs min tuition`,
      });
    }
  }

  return gaps.sort((a, b) => a.gap - b.gap);
}

export function summarizeScoreGaps(gaps: ScoreGap[]): ScoreGapSummary {
  const ielts = gaps.filter((g) => g.kind === "ielts");
  if (ielts.length === 0) return null;
  const maxGap = Math.max(...ielts.map((g) => g.gap));
  return {
    headline: `You need +${maxGap} IELTS for ${ielts.length} target universit${ielts.length === 1 ? "y" : "ies"}`,
    detail: "Raise your English score to unlock more safe and target schools.",
  };
}

/** Display rows (truncated) plus an IELTS headline from the full set. */
export function analyzeScoreGaps(
  profile: Profile,
  universities: University[],
  displayLimit = 5,
): { gaps: ScoreGap[]; summary: ScoreGapSummary } {
  const all = collectGaps(profile, universities);
  return {
    gaps: all.slice(0, displayLimit),
    summary: summarizeScoreGaps(all),
  };
}

export function buildScoreGaps(
  profile: Profile,
  universities: University[],
  limit = 5,
): ScoreGap[] {
  return analyzeScoreGaps(profile, universities, limit).gaps;
}
