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

export type TopScholarshipMatch = {
  scholarship: Scholarship;
  score: number;
};

function daysUntil(date: string) {
  return Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function checklistProgress(app: Application): { percent: number; nextItem: string | null } {
  const items = parseChecklist(app.checklist, app.kind);
  if (items.length === 0) return { percent: 0, nextItem: null };
  const done = items.filter((item) => item.done).length;
  const next = items.find((item) => !item.done);
  return {
    percent: Math.round((done / items.length) * 100),
    nextItem: next?.label ?? null,
  };
}

export function getTopScholarshipMatches(
  profile: Profile,
  scholarships: Scholarship[],
  limit = 3,
): TopScholarshipMatch[] {
  return scholarships
    .map((scholarship) => ({
      scholarship,
      score: computeMatchScore(profile, scholarship) ?? 0,
    }))
    .filter((row) => row.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildWeeklyPlan(
  profile: Profile,
  scholarships: Scholarship[],
  deadlines: UserDeadline[],
  savedScholarshipDeadlines: { name: string; deadline: string }[],
  applications: Application[],
): WeeklyAction[] {
  const actions: WeeklyAction[] = [];

  // Priority 1: deadlines within 14 days
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

  // Priority 2: incomplete checklist items (progress coach)
  const preparing = applications.filter(
    (app) =>
      app.status === "preparing" ||
      app.status === "researching" ||
      app.status === "submitted",
  );

  for (const app of preparing) {
    const { percent, nextItem } = checklistProgress(app);
    if (percent < 100 && nextItem) {
      actions.push({
        title: percent === 0 ? "Start application checklist" : `Next: ${nextItem}`,
        detail: `${app.title} (${percent}% done)`,
        href: "/applications",
        urgency: percent < 40 ? "high" : "medium",
      });
    }
  }

  const topMatches = getTopScholarshipMatches(profile, scholarships, 3);

  for (const { scholarship, score } of topMatches) {
    actions.push({
      title: `${score}% scholarship match`,
      detail: scholarship.name,
      href: "/scholarships",
      urgency: score >= 80 ? "high" : "medium",
    });
  }

  // Priority: track first app / outreach
  if (applications.length === 0 && topMatches.length > 0) {
    actions.push({
      title: "Track your first application",
      detail: `Start with ${topMatches[0].scholarship.name}`,
      href: "/scholarships",
      urgency: "high",
    });
  }

  actions.push({
    title: "Email 2–3 professors",
    detail: "Use outreach drafts on Professors — mark Sent when you hit send",
    href: "/professors",
    urgency: "medium",
  });

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
