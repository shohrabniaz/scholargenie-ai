import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Button } from "@/components/ui/button";
import { COUNTRY_PAGES, getCountryPage } from "@/lib/constants/country-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COUNTRY_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getCountryPage(slug);
  if (!page) return { title: "Country guide" };

  return {
    title: `${page.headline} | ScholarGenie AI`,
    description: page.summary,
  };
}

export default async function CountryGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getCountryPage(slug);
  if (!page) notFound();

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted">Study abroad guide</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {page.headline}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{page.summary}</p>

        <ul className="mt-8 space-y-3">
          {page.highlights.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup">
              Match scholarships in {page.name}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/scholarships">Browse scholarships</Link>
          </Button>
        </div>

        <nav className="mt-16 border-t border-border pt-8" aria-label="Other countries">
          <p className="text-sm font-medium text-muted">Explore more destinations</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {COUNTRY_PAGES.filter((c) => c.slug !== slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/countries/${c.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <MarketingFooter />
    </>
  );
}
