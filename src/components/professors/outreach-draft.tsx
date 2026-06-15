"use client";

import { useState } from "react";
import { Copy, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";
import type { ProfessorWithUniversity } from "@/types/professor";
import { generateOutreachDraft } from "@/lib/professors/outreach-draft";

type OutreachDraftProps = {
  profile: Profile;
  professor: ProfessorWithUniversity;
};

export function OutreachDraft({ profile, professor }: OutreachDraftProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const draft = generateOutreachDraft(profile, professor);

  async function handleCopy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Mail className="h-3.5 w-3.5" aria-hidden />
        Draft email
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">Outreach draft</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </div>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground">
        {draft}
      </pre>
    </div>
  );
}
