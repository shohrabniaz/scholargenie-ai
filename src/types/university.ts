export type University = {
  id: string;
  name: string;
  country: string;
  city: string | null;
  website: string | null;
  tuition_usd_min: number | null;
  tuition_usd_max: number | null;
  min_gpa: number | null;
  min_ielts: number | null;
  degree_levels: string[];
  fields: string[];
  created_at: string;
};

export type MatchTier = "safe" | "target" | "ambitious";

export const TIER_LABELS: Record<MatchTier, string> = {
  safe: "Safe match",
  target: "Target match",
  ambitious: "Ambitious match",
};
