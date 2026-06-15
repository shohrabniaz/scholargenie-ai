"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSopDraft } from "@/lib/tools/sop-writer";
import type { Profile } from "@/types/database";

type SopWriterProps = {
  profile: Profile;
};

export function SopWriter({ profile }: SopWriterProps) {
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const text = generateSopDraft(profile, { motivation, experience, goals, whyNow });
    setDraft(text);
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sop-motivation">Why this field?</Label>
          <Textarea
            id="sop-motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="What sparked your interest and keeps you motivated?"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sop-experience">Relevant experience</Label>
          <Textarea
            id="sop-experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Projects, internships, research, coursework…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sop-goals">Goals</Label>
          <Textarea
            id="sop-goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What do you want to study and where do you hope to go?"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sop-why">Why now?</Label>
          <Textarea
            id="sop-why"
            value={whyNow}
            onChange={(e) => setWhyNow(e.target.value)}
            placeholder="Why is this the right time to study abroad?"
          />
        </div>
        <Button type="submit">Generate draft</Button>
      </form>

      {draft ? (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Your SOP draft</p>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {draft}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
