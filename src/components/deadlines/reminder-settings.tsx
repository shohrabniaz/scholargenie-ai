"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Profile } from "@/types/database";

type ReminderSettingsProps = {
  profile: Pick<Profile, "deadline_reminders_enabled" | "reminder_lead_days">;
  emailConfigured: boolean;
};

export function ReminderSettings({
  profile,
  emailConfigured,
}: ReminderSettingsProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(profile.deadline_reminders_enabled);
  const [leadDays, setLeadDays] = useState(profile.reminder_lead_days ?? 7);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function savePrefs(nextEnabled: boolean, nextLeadDays: number) {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({
        deadline_reminders_enabled: nextEnabled,
        reminder_lead_days: nextLeadDays,
      })
      .eq("id", user.id);

    setSaving(false);
    router.refresh();
  }

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    await savePrefs(next, leadDays);
  }

  async function handleLeadDaysChange(value: string) {
    const next = Number(value);
    setLeadDays(next);
    await savePrefs(enabled, next);
  }

  async function sendNow() {
    setSending(true);
    setMessage(null);

    const res = await fetch("/api/deadlines/remind", { method: "POST" });
    const data = (await res.json()) as {
      sent?: boolean;
      count?: number;
      message?: string;
      error?: string;
    };

    if (!res.ok) {
      setMessage(data.error ?? "Could not send email.");
    } else if (data.sent) {
      setMessage(`Sent ${data.count} deadline${data.count === 1 ? "" : "s"} to your inbox.`);
    } else {
      setMessage(data.message ?? "No upcoming deadlines to email.");
    }

    setSending(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">Email reminders</p>
          <p className="mt-1 text-sm text-muted">
            {emailConfigured
              ? "Daily digest for deadlines within your chosen window."
              : "Add RESEND_API_KEY to enable email reminders."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={!emailConfigured || saving}
          onClick={handleToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled && emailConfigured ? "bg-foreground" : "bg-foreground/20"
          } disabled:opacity-40`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
              enabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {emailConfigured ? (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-[140px] space-y-1.5">
            <Label htmlFor="lead-days">Remind me</Label>
            <Select
              id="lead-days"
              value={String(leadDays)}
              disabled={saving}
              onChange={(e) => handleLeadDaysChange(e.target.value)}
            >
              <option value="3">3 days before</option>
              <option value="7">7 days before</option>
              <option value="14">14 days before</option>
              <option value="30">30 days before</option>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sending}
            onClick={sendNow}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            Email me now
          </Button>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
