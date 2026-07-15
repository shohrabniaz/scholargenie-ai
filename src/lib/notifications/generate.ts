import { computeMatchScore } from "@/lib/matching/scholarship-score";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { UserDeadline } from "@/types/deadline";

function daysUntil(date: string) {
  return Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

export type NotificationDraft = {
  title: string;
  body: string;
  href: string;
};

export function buildNotificationDrafts(
  profile: Profile,
  scholarships: Scholarship[],
  deadlines: UserDeadline[],
  savedScholarshipDeadlines: { name: string; deadline: string }[],
  savedScholarshipIds: string[] = [],
): NotificationDraft[] {
  const drafts: NotificationDraft[] = [];
  const alertsEnabled = profile.match_alerts_enabled !== false;
  const savedSet = new Set(savedScholarshipIds);

  if (alertsEnabled) {
    const top = scholarships
      .map((s) => ({ s, score: computeMatchScore(profile, s) ?? 0 }))
      .filter((t) => t.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    for (const { s, score } of top) {
      // Prefer alerting on high matches that aren't saved yet
      if (savedSet.has(s.id) && score < 85) continue;
      drafts.push({
        title: savedSet.has(s.id)
          ? `${score}% match — still on your list`
          : `New ${score}% scholarship match`,
        body: s.name,
        href: "/scholarships",
      });
    }
  }

  for (const row of savedScholarshipDeadlines) {
    const d = daysUntil(row.deadline);
    if (d >= 0 && d <= 14) {
      drafts.push({
        title: d === 0 ? "Deadline today" : `Deadline in ${d} days`,
        body: row.name,
        href: "/deadlines",
      });
    }
  }

  for (const d of deadlines) {
    const days = daysUntil(d.due_date);
    if (days >= 0 && days <= 7) {
      drafts.push({
        title: days === 0 ? "Reminder today" : `Reminder in ${days} days`,
        body: d.title,
        href: "/deadlines",
      });
    }
  }

  return drafts.slice(0, 10);
}
