export const DESTINATION_COUNTRIES = [
  "Australia",
  "Canada",
  "Germany",
  "Netherlands",
  "New Zealand",
  "United Kingdom",
  "United States",
] as const;

export type DestinationCountry = (typeof DESTINATION_COUNTRIES)[number];
