import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Button } from "@/components/ui/button";
import { COUNTRY_PAGES } from "@/lib/constants/country-pages";

export const metadata: Metadata = {
  title: "Study abroad guides by country",
  description:
    "Free country guides for Australia, Canada, Germany, Netherlands, New Zealand, the UK, and the US — scholarships, visas, and next steps.",
};

export default function CountriesIndexPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted">Study abroad guides</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Where do you want to study?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Short guides for top destinations — funding, visa pathways, and how ScholarGenie
          can match you to scholarships and universities.
        </p>

        <ul className="mt-10 space-y-3">
          {COUNTRY_PAGES.map((country) => (
            <li key={country.slug}>
              <Link
                href={`/countries/${country.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:bg-foreground/[0.04]"
              >
                <div>
                  <p className="font-medium text-foreground">{country.headline}</p>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{country.summary}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button asChild>
            <Link href="/signup">
              Create your free profile
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
