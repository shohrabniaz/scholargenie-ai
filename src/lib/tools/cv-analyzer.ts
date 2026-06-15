export type CvCheck = {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
};

const ACTION_VERBS = [
  "developed",
  "designed",
  "implemented",
  "led",
  "managed",
  "built",
  "created",
  "analyzed",
  "researched",
  "published",
  "optimized",
  "coordinated",
];

export function analyzeCv(text: string): { score: number; checks: CvCheck[] } {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = trimmed.split("\n").filter((l) => l.trim());

  const checks: CvCheck[] = [
    {
      id: "length",
      label: "Reasonable length",
      passed: wordCount >= 150 && wordCount <= 900,
      tip:
        wordCount < 150
          ? "Your CV looks short — aim for 300–600 words for graduate applications."
          : wordCount > 900
            ? "Consider trimming to 1–2 pages. Focus on the most relevant experience."
            : "Good length for a graduate CV.",
    },
    {
      id: "email",
      label: "Contact email present",
      passed: /[\w.-]+@[\w.-]+\.\w+/.test(trimmed),
      tip: "Add a professional email address at the top of your CV.",
    },
    {
      id: "education",
      label: "Education section",
      passed: /education|university|bachelor|master|b\.?sc|m\.?sc|gpa|cgpa/i.test(
        trimmed,
      ),
      tip: "Include an Education section with degree, institution, and GPA/CGPA.",
    },
    {
      id: "experience",
      label: "Experience or projects",
      passed: /experience|project|intern|research|employment|work/i.test(trimmed),
      tip: "Add Experience, Research, or Projects sections with measurable outcomes.",
    },
    {
      id: "skills",
      label: "Skills section",
      passed: /skills|technical|programming|languages/i.test(trimmed),
      tip: "List technical skills relevant to your field (tools, languages, methods).",
    },
    {
      id: "action-verbs",
      label: "Strong action verbs",
      passed: ACTION_VERBS.some((v) => lower.includes(v)),
      tip: 'Start bullet points with verbs like "Developed", "Led", "Implemented", or "Researched".',
    },
    {
      id: "bullets",
      label: "Structured bullet points",
      passed: lines.some((l) => /^[\s]*[-•*]/.test(l)),
      tip: "Use bullet points for experience items — easier to scan than long paragraphs.",
    },
    {
      id: "numbers",
      label: "Quantified achievements",
      passed: /\d+%|\d+\+|\d+ (users|students|projects|papers)/i.test(trimmed),
      tip: "Add numbers where possible: team size, performance gains, users impacted, papers published.",
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}
