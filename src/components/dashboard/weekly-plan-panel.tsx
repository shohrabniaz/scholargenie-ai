import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WeeklyAction } from "@/lib/dashboard/weekly-plan";

type WeeklyPlanPanelProps = {
  actions: WeeklyAction[];
};

export function WeeklyPlanPanel({ actions }: WeeklyPlanPanelProps) {
  return (
    <section aria-labelledby="weekly-plan-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="weekly-plan-heading" className="text-sm font-medium text-muted">
            This week
          </h2>
          <p className="mt-1 text-sm text-muted">
            Prioritized actions from your matches, deadlines, and applications.
          </p>
        </div>
        <Link
          href="/advisor"
          className="hidden text-xs text-muted transition-colors hover:text-foreground sm:inline"
        >
          Ask advisor
        </Link>
      </div>

      <ol className="mt-4 space-y-2">
        {actions.map((action) => (
          <li key={`${action.title}-${action.detail}`}>
            <Link
              href={action.href}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-background"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  {action.urgency === "high" ? (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                      Priority
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted line-clamp-2">{action.detail}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
