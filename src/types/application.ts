export type ApplicationKind = "scholarship" | "university" | "visa" | "other";

export type ApplicationStatus =
  | "researching"
  | "preparing"
  | "submitted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type Application = {
  id: string;
  user_id: string;
  title: string;
  kind: ApplicationKind;
  status: ApplicationStatus;
  notes: string | null;
  scholarship_id: string | null;
  university_id: string | null;
  checklist: unknown;
  created_at: string;
  updated_at: string;
};

export const KIND_LABELS: Record<ApplicationKind, string> = {
  scholarship: "Scholarship",
  university: "University",
  visa: "Visa",
  other: "Other",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  researching: "Researching",
  preparing: "Preparing",
  submitted: "Submitted",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "researching",
  "preparing",
  "submitted",
  "interview",
  "accepted",
  "rejected",
  "withdrawn",
];
