export type DeadlineCategory = "application" | "visa" | "test" | "other";

export type UserDeadline = {
  id: string;
  user_id: string;
  title: string;
  due_date: string;
  category: DeadlineCategory;
  notes: string | null;
  scholarship_id: string | null;
  created_at: string;
};

export const CATEGORY_LABELS: Record<DeadlineCategory, string> = {
  application: "Application",
  visa: "Visa",
  test: "English test",
  other: "Other",
};
