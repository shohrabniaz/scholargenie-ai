"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MatchAlertsToggleProps = {
  initiallyEnabled?: boolean;
};

export function MatchAlertsToggle({
  initiallyEnabled = true,
}: MatchAlertsToggleProps) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ match_alerts_enabled: next })
        .eq("id", user.id);
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">Match alerts</p>
        <p className="mt-0.5 text-xs text-muted">
          In-app notifications when scholarships score ≥70% for your profile.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={saving}
        onClick={toggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-foreground" : "bg-foreground/20"
        } disabled:opacity-40`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            enabled ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
