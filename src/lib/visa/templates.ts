export type VisaTemplate = {
  country: string;
  steps: { title: string; detail: string }[];
};

export const VISA_TEMPLATES: VisaTemplate[] = [
  {
    country: "Australia",
    steps: [
      { title: "Receive CoE", detail: "Get Confirmation of Enrolment from your university." },
      { title: "Create ImmiAccount", detail: "Apply for Student visa (subclass 500) online." },
      { title: "GTE statement", detail: "Write a Genuine Temporary Entrant statement." },
      { title: "Health insurance (OSHC)", detail: "Purchase Overseas Student Health Cover." },
      { title: "Biometrics", detail: "Attend biometrics if requested." },
    ],
  },
  {
    country: "Canada",
    steps: [
      { title: "Letter of acceptance", detail: "Obtain LOA from a DLI institution." },
      { title: "Study permit", detail: "Apply via IRCC portal with PAL if required." },
      { title: "Proof of funds", detail: "Show tuition + $20,635 CAD living costs (2024 guideline)." },
      { title: "Medical exam", detail: "Complete if staying 6+ months in some regions." },
    ],
  },
  {
    country: "United Kingdom",
    steps: [
      { title: "CAS letter", detail: "Receive Confirmation of Acceptance for Studies." },
      { title: "Student visa", detail: "Apply online; pay IHS surcharge." },
      { title: "TB test", detail: "Required for applicants from listed countries." },
      { title: "Financial evidence", detail: "28-day bank statement for tuition + living costs." },
    ],
  },
  {
    country: "United States",
    steps: [
      { title: "I-20", detail: "Receive from university after admission." },
      { title: "SEVIS fee", detail: "Pay I-901 fee before visa interview." },
      { title: "DS-160", detail: "Complete visa application form." },
      { title: "Interview", detail: "Attend embassy F-1 visa interview." },
    ],
  },
  {
    country: "Germany",
    steps: [
      { title: "Admission letter", detail: "Zulassungsbescheid from university." },
      { title: "Blocked account", detail: "Sperrkonto with ~€11,904/year (2024)." },
      { title: "Health insurance", detail: "Public or private coverage for students." },
      { title: "National visa", detail: "Apply at German embassy for entry visa." },
    ],
  },
];
