"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmailWeeklyPlanButtonProps = {
  emailConfigured: boolean;
};

export function EmailWeeklyPlanButton({
  emailConfigured,
}: EmailWeeklyPlanButtonProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendNow() {
    setSending(true);
    setMessage(null);

    const res = await fetch("/api/digest/weekly", { method: "POST" });
    const data = (await res.json()) as {
      sent?: boolean;
      count?: number;
      message?: string;
      error?: string;
    };

    if (!res.ok) {
      setMessage(data.error ?? "Could not send email.");
    } else if (data.sent) {
      setMessage(`Sent ${data.count} action${data.count === 1 ? "" : "s"} to your inbox.`);
    } else {
      setMessage(data.message ?? "No actions to email.");
    }

    setSending(false);
  }

  if (!emailConfigured) {
    return (
      <p className="text-xs text-muted">
        Add RESEND_API_KEY to email this plan weekly.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={sending}
        onClick={sendNow}
      >
        {sending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Mail className="h-3.5 w-3.5" aria-hidden />
        )}
        Email this plan
      </Button>
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </div>
  );
}
