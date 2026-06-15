import { z } from "zod";

export const DEGREE_OPTIONS = [
  { value: "bsc", label: "Bachelor's (BSc / BA)" },
  { value: "msc", label: "Master's (MSc / MA)" },
  { value: "phd", label: "PhD / Doctorate" },
  { value: "other", label: "Other" },
] as const;

export const COUNTRY_OPTIONS = [
  "Australia",
  "Canada",
  "United Kingdom",
  "United States",
  "Germany",
  "New Zealand",
  "Netherlands",
  "Sweden",
  "Other",
] as const;

export const HOME_COUNTRY_OPTIONS = [
  "Bangladesh",
  "India",
  "Pakistan",
  "Nepal",
  "Sri Lanka",
  "Other",
] as const;

export const onboardingSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  home_country: z.string().min(1, "Select your home country"),
  degree_level: z.enum(["bsc", "msc", "phd", "other"]),
  field_of_study: z.string().min(2, "Enter your field of study"),
  cgpa: z
    .number({ error: "Enter your CGPA" })
    .min(0, "CGPA must be at least 0")
    .max(4, "CGPA is usually on a 4.0 scale"),
  ielts_score: z
    .number()
    .min(0)
    .max(9)
    .optional()
    .nullable(),
  pte_score: z
    .number()
    .int()
    .min(10)
    .max(90)
    .optional()
    .nullable(),
  budget_usd: z
    .number({ error: "Enter your annual budget in USD" })
    .int()
    .min(0),
  preferred_countries: z
    .array(z.string())
    .min(1, "Select at least one destination country"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const waitlistSchema = z.object({
  email: z.email("Enter a valid email"),
  home_country: z.string().optional(),
  degree_level: z.string().optional(),
  field_of_study: z.string().optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
