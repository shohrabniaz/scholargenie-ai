import type { ApplicationKind } from "@/types/application";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

const BASE_ITEMS: ChecklistItem[] = [
  { id: "sop", label: "Statement of purpose", done: false },
  { id: "cv", label: "CV / resume", done: false },
  { id: "transcripts", label: "Academic transcripts", done: false },
  { id: "lor", label: "Recommendation letters (2–3)", done: false },
  { id: "english", label: "IELTS / PTE score report", done: false },
];

const SCHOLARSHIP_EXTRA: ChecklistItem[] = [
  { id: "scholarship-form", label: "Scholarship application form", done: false },
];

const UNIVERSITY_EXTRA: ChecklistItem[] = [
  { id: "uni-form", label: "University application portal submitted", done: false },
  { id: "fee", label: "Application fee paid", done: false },
];

const VISA_EXTRA: ChecklistItem[] = [
  { id: "coe", label: "Confirmation of enrolment (CoE/CAS/I-20)", done: false },
  { id: "funds", label: "Proof of funds", done: false },
  { id: "visa-form", label: "Visa application submitted", done: false },
  { id: "biometrics", label: "Biometrics appointment", done: false },
];

export function defaultChecklist(kind: ApplicationKind): ChecklistItem[] {
  const items = [...BASE_ITEMS];
  if (kind === "scholarship") items.push(...SCHOLARSHIP_EXTRA);
  if (kind === "university") items.push(...UNIVERSITY_EXTRA);
  if (kind === "visa") items.push(...VISA_EXTRA);
  return items;
}

export function parseChecklist(raw: unknown, kind: ApplicationKind): ChecklistItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return defaultChecklist(kind);
  }
  return raw as ChecklistItem[];
}
