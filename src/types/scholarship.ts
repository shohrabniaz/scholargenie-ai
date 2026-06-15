export type Scholarship = {
  id: string;
  name: string;
  country: string;
  university: string | null;
  degree_levels: string[];
  fields: string[];
  funding_type: "fully_funded" | "partial" | "merit" | "need_based";
  amount_description: string | null;
  deadline: string | null;
  eligibility: string | null;
  source_url: string;
  created_at: string;
};

export type FundingType = Scholarship["funding_type"];

export const FUNDING_LABELS: Record<FundingType, string> = {
  fully_funded: "Fully funded",
  partial: "Partial",
  merit: "Merit-based",
  need_based: "Need-based",
};
