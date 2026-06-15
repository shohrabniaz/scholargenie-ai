export type DegreeLevel = "bsc" | "msc" | "phd" | "other";

export type Profile = {
  id: string;
  full_name: string | null;
  home_country: string;
  degree_level: string;
  field_of_study: string;
  cgpa: number | null;
  ielts_score: number | null;
  pte_score: number | null;
  budget_usd: number | null;
  preferred_countries: string[];
  onboarding_completed: boolean;
  deadline_reminders_enabled: boolean;
  reminder_lead_days: number;
  created_at: string;
  updated_at: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  home_country: string | null;
  degree_level: string | null;
  field_of_study: string | null;
  created_at: string;
};
