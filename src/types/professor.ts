import type { University } from "@/types/university";

export type Professor = {
  id: string;
  name: string;
  university_id: string | null;
  department: string | null;
  email: string | null;
  research_areas: string[];
  website: string | null;
  accepts_msc: boolean;
  accepts_phd: boolean;
  created_at: string;
};

export type ProfessorWithUniversity = Professor & {
  universities: Pick<University, "id" | "name" | "country" | "city"> | null;
};
