"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AnalyticsEvents, track } from "@/lib/analytics/events";

export type OutreachStatus = "not_sent" | "sent" | "replied" | "interviewing";

const LABELS: Record<OutreachStatus, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  replied: "Replied",
  interviewing: "Interviewing",
};

type OutreachStatusSelectProps = {
  professorId: string;
  initialStatus?: OutreachStatus;
  enabled?: boolean;
};

export function OutreachStatusSelect({
  professorId,
  initialStatus = "not_sent",
  enabled = true,
}: OutreachStatusSelectProps) {
  const [status, setStatus] = useState<OutreachStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  async function onChange(next: OutreachStatus) {
    setStatus(next);
    if (!enabled) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    // Ensure row exists, then update status
    await supabase.from("saved_professors").upsert({
      user_id: user.id,
      professor_id: professorId,
      outreach_status: next,
      outreach_updated_at: new Date().toISOString(),
    });

    track(AnalyticsEvents.outreachStatusChanged, {
      professor_id: professorId,
      status: next,
    });
    setSaving(false);
  }

  return (
    <div className="mt-3 space-y-1.5">
      <Label htmlFor={`outreach-${professorId}`} className="text-xs text-muted">
        Outreach status
      </Label>
      <Select
        id={`outreach-${professorId}`}
        value={status}
        disabled={saving || !enabled}
        onChange={(e) => onChange(e.target.value as OutreachStatus)}
        className="max-w-xs"
      >
        {(Object.keys(LABELS) as OutreachStatus[]).map((key) => (
          <option key={key} value={key}>
            {LABELS[key]}
          </option>
        ))}
      </Select>
    </div>
  );
}
