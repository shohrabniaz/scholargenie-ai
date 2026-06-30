import { parseChecklist } from "@/lib/applications/checklist";
import { computeMatchScore } from "@/lib/matching/scholarship-score";
import type { Application } from "@/types/application";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { UserDeadline } from "@/types/deadline";

export type WeeklyAction = {
  title: string;
  detail: string;
  href: string;
  urgency: "high" | "medium";
};

function daysUntil(date: string) {
  return Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function checklistProgress(app: Application): number {
  const items = parseChecklist(app.checklist, app.kind);
  if (items.length === 0) return 0;
  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

export function buildWeeklyPlan(
  profile: Profile,
  scholarships: Scholarship[],
  deadlines: UserDeadline[],
  savedScholarshipDeadlines: { name: string; deadline: string }[],
  applications: Application[],
): WeeklyAction[] {
  const actions: WeeklyAction[] = [];

  const allDeadlines = [
    ...savedScholarshipDeadlines.map((row) => ({
      title: row.name,
      date: row.deadline,
      href: "/deadlines",
    })),
    ...deadlines.map((row) => ({
      title: row.title,
      date: row.due_date,
      href: "/deadlines",
    })),
  ]
    .map((row) => ({ ...row, days: daysUntil(row.date) }))
    .filter((row) => row.days >= 0 && row.days <= 14)
    .sort((a, b) => a.days - b.days);

  for (const row of allDeadlines.slice(0, 3)) {
    actions.push({
      title: row.days === 0 ? "Deadline today" : `Deadline in ${row.days} days`,
      detail: row.title,
      href: row.href,
      urgency: row.days <= 7 ? "high" : "medium",
    });
  }

  const topMatches = scholarships
    .map((scholarship) => ({
      scholarship,
      score: computeMatchScore(profile, scholarship) ?? 0,
    }))
    .filter((row) => row.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  for (const { scholarship, score } of topMatches) {
    actions.push({
      title: `${score}% scholarship match`,
      detail: scholarship.name,
      href: "/scholarships",
      urgency: score >= 80 ? "high" : "medium",
    });
  }

  const preparing = applications.filter(
    (app) => app.status === "preparing" || app.status === "researching",
  );

  for (const app of preparing.slice(0, 2)) {
    const progress = checklistProgress(app);
    if (progress < 100) {
      actions.push({
        title: progress === 0 ? "Start application checklist" : `Checklist ${progress}% complete`,
        detail: app.title,
        href: "/applications",
        urgency: progress < 40 ? "high" : "medium",
      });
    }
  }

  if (applications.length === 0 && topMatches.length > 0) {
    actions.push({
      title: "Track your first application",
      detail: `Start with ${topMatches[0].scholarship.name}`,
      href: "/scholarships",
      urgency: "medium",
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: "Talk to your AI advisor",
      detail: "Get a personalized roadmap for this week",
      href: "/advisor",
      urgency: "medium",
    });
  }

  const seen = new Set<string>();
  return actions
    .filter((action) => {
      const key = `${action.title}::${action.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}
