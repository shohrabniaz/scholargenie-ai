"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSopDraft } from "@/lib/tools/sop-writer";
import { createClient } from "@/lib/supabase/client";
import { AnalyticsEvents, track } from "@/lib/analytics/events";
import type { Profile } from "@/types/database";

type SopDraftRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type SopWriterProps = {
  profile: Profile;
  initialDrafts?: SopDraftRow[];
};

export function SopWriter({ profile, initialDrafts = [] }: SopWriterProps) {
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("Make the opening stronger and tighten the conclusion.");
  const [refining, setRefining] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SopDraftRow[]>(initialDrafts);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const text = generateSopDraft(profile, { motivation, experience, goals, whyNow });
    setDraft(text);
  }

  async function handleRefine() {
    if (!draft || refining) return;
    setRefining(true);
    try {
      const res = await fetch("/api/tools/sop/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, instruction: refinePrompt }),
      });
      const data = (await res.json()) as { draft?: string; error?: string };
      if (!res.ok || !data.draft) throw new Error(data.error ?? "Refine failed");
      setDraft(data.draft);
    } finally {
      setRefining(false);
    }
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!draft || saving) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const title = `SOP · ${new Date().toLocaleDateString()}`;
    const { data, error } = await supabase
      .from("sop_drafts")
      .insert({ user_id: user.id, title, content: draft })
      .select("id, title, content, created_at")
      .single();

    if (!error && data) {
      setHistory((prev) => [data as SopDraftRow, ...prev]);
      track(AnalyticsEvents.sopDraftSaved, { length: draft.length });
    }
    setSaving(false);
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save version"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {draft}
          </pre>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <Label htmlFor="sop-refine">Refine with AI</Label>
            <Textarea
              id="sop-refine"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              rows={2}
            />
            <Button type="button" size="sm" onClick={handleRefine} disabled={refining}>
              {refining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              )}
              Refine draft
            </Button>
          </div>
        </div>
      ) : null}

      {history.length > 0 ? (
        <section aria-labelledby="sop-history-heading">
          <h2 id="sop-history-heading" className="text-sm font-medium text-muted">
            Version history
          </h2>
          <ul className="mt-3 space-y-2">
            {history.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setDraft(row.content)}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-background"
                >
                  <p className="text-sm font-medium text-foreground">{row.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(row.created_at).toLocaleString()} ·{" "}
                    {row.content.slice(0, 80)}…
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
