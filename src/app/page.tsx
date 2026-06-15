import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Scholarship finder",
    description: "Fully funded and partial options across Australia, UK, Canada, and more.",
  },
  {
    icon: GraduationCap,
    title: "University matcher",
    description: "Safe, target, and ambitious matches from your GPA, scores, and budget.",
  },
  {
    icon: Users,
    title: "Professor finder",
    description: "Supervisors for MSc and PhD with research fit and outreach drafts.",
  },
  {
    icon: Sparkles,
    title: "AI advisor",
    description: "A personalized roadmap grounded in real scholarship data.",
  },
  {
    icon: Calendar,
    title: "Deadline tracker",
    description: "Reminders for applications, visas, and English tests.",
  },
  {
    icon: BookOpen,
    title: "SOP & CV help",
    description: "Draft statements and analyze your CV before you apply.",
  },
];

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 sm:pt-28">
          <Badge className="mb-6">Free for students</Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
            {APP_NAME} — your calm copilot for studying abroad
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            One profile. Scholarship matches, universities, and professors —
            without searching fifty websites.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#waitlist">Join waitlist</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <p className="text-sm font-medium text-muted">Features</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Everything in one place
            </h2>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="bg-surface p-8 transition-colors hover:bg-background"
                >
                  <feature.icon
                    className="h-5 w-5 text-muted"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <h3 className="mt-4 font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="waitlist" className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <WaitlistForm />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
