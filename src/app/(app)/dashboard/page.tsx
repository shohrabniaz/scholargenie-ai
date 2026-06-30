import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { WeeklyPlanPanel } from "@/components/dashboard/weekly-plan-panel";
import { buildWeeklyPlan } from "@/lib/dashboard/weekly-plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application } from "@/types/application";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { UserDeadline } from "@/types/deadline";

const features = [
  {
    id: "scholarships",
    icon: Search,
    title: "Scholarship matches",
    status: "Live",
    description: "Browse and filter scholarships with match scores.",
    href: "/scholarships",
  },
  {
    id: "universities",
    icon: GraduationCap,
    title: "University matcher",
    status: "Live",
    description: "Safe, target, and ambitious lists from your profile.",
    href: "/universities",
  },
  {
    id: "professors",
    icon: Users,
    title: "Professor finder",
    status: "Live",
    description: "Supervisors with research fit and outreach drafts.",
    href: "/professors",
  },
  {
    id: "advisor",
    icon: Sparkles,
    title: "AI advisor",
    status: "Live",
    description: "Personalized roadmap and chat from your profile.",
    href: "/advisor",
  },
  {
    id: "deadlines",
    icon: Calendar,
    title: "Deadline tracker",
    status: "Live",
    description: "Saved scholarship dates plus custom reminders.",
    href: "/deadlines",
  },
  {
    id: "applications",
    icon: ClipboardList,
    title: "Application tracker",
    status: "Live",
    description: "Track scholarship, university, and visa application status.",
    href: "/applications",
  },
  {
    id: "tools",
    icon: FileText,
    title: "SOP & CV tools",
    status: "Live",
    description: "Draft your statement and analyze your CV.",
    href: "/tools",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const [
    { data: scholarships },
    { data: deadlines },
    { data: applications },
    { data: savedRows },
  ] = await Promise.all([
    supabase.from("scholarships").select("*").returns<Scholarship[]>(),
    supabase.from("user_deadlines").select("*").returns<UserDeadline[]>(),
    supabase.from("applications").select("*").returns<Application[]>(),
    supabase
      .from("saved_scholarships")
      .select("scholarships(name, deadline)")
      .returns<{ scholarships: { name: string; deadline: string | null } }[]>(),
  ]);

  const savedScholarshipDeadlines = (savedRows ?? [])
    .filter((row) => row.scholarships?.deadline)
    .map((row) => ({
      name: row.scholarships.name,
      deadline: row.scholarships.deadline!,
    }));

  const weeklyActions = buildWeeklyPlan(
    profile,
    scholarships ?? [],
    deadlines ?? [],
    savedScholarshipDeadlines,
    applications ?? [],
  );

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Degree", value: profile.degree_level || "—" },
    { label: "Field", value: profile.field_of_study || "—" },
    { label: "CGPA", value: profile.cgpa?.toString() ?? "—" },
    {
      label: "Destinations",
      value:
        profile.preferred_countries.length > 0
          ? profile.preferred_countries.join(", ")
          : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Hi, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your copilot for scholarships, applications, and deadlines this week.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/advisor">AI Advisor</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/scholarships">Scholarships</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/onboarding">Edit profile</Link>
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <WeeklyPlanPanel actions={weeklyActions} />
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <li
            key={stat.label}
            className="rounded-2xl border border-border bg-surface px-4 py-5"
          >
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-sm font-medium capitalize text-foreground">
              {stat.value}
            </p>
          </li>
        ))}
      </ul>

      <section className="mt-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-sm font-medium text-muted">
          Features
        </h2>
        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature.title} id={feature.id}>
              <Link href={feature.href} className="block">
                <article className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-background">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04]">
                    <feature.icon
                      className="h-4 w-4 text-muted"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{feature.title}</h3>
                      <Badge variant="subtle">{feature.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{feature.description}</p>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
