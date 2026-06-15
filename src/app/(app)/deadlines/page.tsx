import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeadlinesClient } from "@/components/deadlines/deadlines-client";
import { ReminderSettings } from "@/components/deadlines/reminder-settings";
import { Button } from "@/components/ui/button";
import { isResendConfigured } from "@/lib/env/server";
import type { UserDeadline } from "@/types/deadline";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";

export default async function DeadlinesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [deadlinesResult, savedResult, profileResult] = await Promise.all([
    supabase
      .from("user_deadlines")
      .select("*")
      .order("due_date", { ascending: true })
      .returns<UserDeadline[]>(),
    supabase
      .from("saved_scholarships")
      .select("scholarship_id, scholarships(*)")
      .returns<{ scholarship_id: string; scholarships: Scholarship }[]>(),
    user
      ? supabase
          .from("profiles")
          .select("deadline_reminders_enabled, reminder_lead_days")
          .eq("id", user.id)
          .maybeSingle<
            Pick<Profile, "deadline_reminders_enabled" | "reminder_lead_days">
          >()
      : Promise.resolve({ data: null }),
  ]);

  const savedScholarships = (savedResult.data ?? []).map((row) => ({
    scholarship: row.scholarships,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Deadlines</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Stay on track</h1>
      <p className="mt-2 text-sm text-muted">
        Saved scholarship deadlines plus your own reminders.
      </p>

      {savedScholarships.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Bookmark scholarships on the{" "}
          <Link href="/scholarships" className="font-medium text-foreground hover:underline">
            Scholarships
          </Link>{" "}
          page to see their deadlines here automatically.
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        {profileResult.data ? (
          <ReminderSettings
            profile={profileResult.data}
            emailConfigured={isResendConfigured()}
          />
        ) : null}
        <DeadlinesClient
          userDeadlines={deadlinesResult.data ?? []}
          savedScholarships={savedScholarships}
        />
      </div>

      <div className="mt-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/scholarships">Browse scholarships</Link>
        </Button>
      </div>
    </div>
  );
}
