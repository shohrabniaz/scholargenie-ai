import type { DestinationCountry } from "@/lib/constants/countries";

export type CountryPageSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type CountryPage = {
  slug: string;
  name: DestinationCountry;
  headline: string;
  summary: string;
  highlights: string[];
  /** Optional deep sections — used for fully built country guides */
  sections?: CountryPageSection[];
  scholarshipFilter?: string;
  universityFilter?: string;
};

export const COUNTRY_PAGES: CountryPage[] = [
  {
    slug: "australia",
    name: "Australia",
    headline: "Study in Australia",
    summary:
      "World-class Group of Eight research universities, clear student-visa pathways, and strong scholarships including Australia Awards and RTP — with Temporary Graduate visa options after you finish.",
    highlights: [
      "Australia Awards, RTP, Destination Australia, and university merit awards",
      "Student visa (subclass 500) + Overseas Student Health Cover (OSHC)",
      "Hubs: Melbourne, Sydney, Brisbane, Adelaide, Canberra",
    ],
    scholarshipFilter: "Australia",
    universityFilter: "Australia",
    sections: [
      {
        title: "Why Australia",
        body: "Australia combines English-taught degrees, research strength in CS/cyber/AI/public health, and post-study work rights that many international students use to gain experience after graduation.",
        bullets: [
          "Competitive master’s (1.5–2 years) and PhD research tracks",
          "Clear pathway: offer → CoE → subclass 500 → OSHC",
          "Cities with large international student communities",
        ],
      },
      {
        title: "Scholarships to prioritise",
        body: "Start with government-funded awards, then university RTP/GRS packages and merit scholarships tied to your target school.",
        bullets: [
          "Australia Awards — DFAT fully funded scholarships for eligible countries",
          "Research Training Program (RTP) — tuition + stipend for research degrees",
          "Destination Australia — regional campus support",
          "University packages — Melbourne GRS, ANU Chancellor’s, Monash, Adelaide, Sydney, UNSW",
        ],
      },
      {
        title: "Student visa (subclass 500)",
        body: "Apply online through ImmiAccount after you have a Confirmation of Enrolment (CoE). Demonstrate Genuine Student (GS) intent, funds, and valid OSHC for your stay.",
        bullets: [
          "Offer + CoE from a CRICOS-registered provider",
          "Genuine Student (GS) statement — study plans and ties to home country",
          "OSHC health cover for the full visa period",
          "Proof of funds for tuition and living costs",
          "Biometrics/health exams if requested",
        ],
      },
      {
        title: "Student cities",
        body: "Match campus city to cost of living, industry links, and climate — not only university ranking.",
        bullets: [
          "Melbourne — University of Melbourne, Monash, Deakin; dense startup/research scene",
          "Sydney — UNSW, University of Sydney; strong tech and finance hiring",
          "Brisbane — University of Queensland, QUT; lower cost than Sydney on average",
          "Adelaide — University of Adelaide; competitive scholarships and livable costs",
          "Canberra — ANU; research-heavy environment",
        ],
      },
      {
        title: "Typical costs (indicative)",
        body: "Budget carefully — tuition and rent vary widely by city and degree level.",
        bullets: [
          "Tuition: roughly USD 20k–45k per year for many international master’s",
          "Living: higher in Sydney/Melbourne; often more manageable in Adelaide/Brisbane",
          "OSHC: factor into every visa application",
        ],
      },
      {
        title: "How to use ScholarGenie for Australia",
        body: "Complete onboarding with Australia as a preferred destination so matches, weekly plans, and professor outreach prioritise AU options.",
        bullets: [
          "Filter Scholarships → Country: Australia",
          "University matcher → safe / target / ambitious labels from your GPA & IELTS",
          "Professors → outreach drafts + status tracker",
          "Applications → Australia visa checklist template",
        ],
      },
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    headline: "Study in Canada",
    summary:
      "Affordable quality education, welcoming immigration policies, and co-op friendly programs.",
    highlights: [
      "Vanier and provincial awards",
      "Study permit + PGWP after graduation",
      "Cities: Toronto, Vancouver, Montreal",
    ],
  },
  {
    slug: "germany",
    name: "Germany",
    headline: "Study in Germany",
    summary:
      "Low or no tuition at public universities with excellent engineering and research programs.",
    highlights: [
      "DAAD and university scholarships",
      "Blocked account visa process",
      "Cities: Munich, Berlin, Heidelberg",
    ],
  },
  {
    slug: "netherlands",
    name: "Netherlands",
    headline: "Study in the Netherlands",
    summary:
      "English-taught degrees, innovative tech hubs, and Holland Scholarship options.",
    highlights: [
      "Holland Scholarship and university grants",
      "Residence permit for study",
      "Cities: Amsterdam, Delft, Rotterdam",
    ],
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    headline: "Study in New Zealand",
    summary:
      "Safe campuses, research-led teaching, and Manaaki New Zealand scholarships.",
    highlights: [
      "Manaaki and university excellence awards",
      "Student visa after offer of place",
      "Cities: Auckland, Wellington, Dunedin",
    ],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    headline: "Study in the United Kingdom",
    summary:
      "One-year master's programs, global rankings, and prestigious scholarships.",
    highlights: [
      "Chevening, Commonwealth, and university awards",
      "Student visa with CAS letter",
      "Cities: London, Oxford, Cambridge, Edinburgh",
    ],
  },
  {
    slug: "united-states",
    name: "United States",
    headline: "Study in the United States",
    summary:
      "Leading research universities, diverse campuses, and merit-based funding.",
    highlights: [
      "Fulbright and graduate assistantships",
      "F-1 student visa process",
      "Cities: Boston, San Francisco, New York",
    ],
  },
];

export function getCountryPage(slug: string): CountryPage | undefined {
  return COUNTRY_PAGES.find((c) => c.slug === slug);
}
