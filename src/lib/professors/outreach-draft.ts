import type { Profile } from "@/types/database";
import type { ProfessorWithUniversity } from "@/types/professor";

export function generateOutreachDraft(
  profile: Profile,
  professor: ProfessorWithUniversity,
) {
  const university = professor.universities?.name ?? "your university";
  const areas = professor.research_areas.slice(0, 2).join(" and ") || "your research";
  const degree =
    profile.degree_level === "phd"
      ? "PhD"
      : profile.degree_level === "msc"
        ? "MSc"
        : "graduate";

  return `Subject: Prospective ${degree} student — ${profile.field_of_study}

Dear Professor ${professor.name.split(" ").pop()},

I hope this email finds you well. My name is ${profile.full_name ?? "Student"}, and I am writing to express my interest in pursuing a ${degree} in ${profile.field_of_study} at ${university}.

I was particularly drawn to your work in ${areas}, which aligns closely with my background and goals. I am especially interested in [briefly describe one specific paper or project].

Brief background:
- Home country: ${profile.home_country}
- CGPA: ${profile.cgpa ?? "N/A"}${profile.ielts_score ? `\n- IELTS: ${profile.ielts_score}` : ""}

I would appreciate the opportunity to discuss potential supervision for ${profile.degree_level === "phd" ? "a doctoral" : "a master's"} project. I have attached my CV and would be happy to share a research proposal if helpful.

Thank you for your time and consideration.

Best regards,
${profile.full_name ?? "Student"}`;
}
