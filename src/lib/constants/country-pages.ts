import type { DestinationCountry } from "@/lib/constants/countries";

export type CountryPage = {
  slug: string;
  name: DestinationCountry;
  headline: string;
  summary: string;
  highlights: string[];
};

export const COUNTRY_PAGES: CountryPage[] = [
  {
    slug: "australia",
    name: "Australia",
    headline: "Study in Australia",
    summary:
      "World-class universities, post-study work rights, and strong scholarships for international students.",
    highlights: [
      "RTP and university merit scholarships",
      "Subclass 500 student visa pathway",
      "Cities: Melbourne, Sydney, Brisbane",
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
