"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCv } from "@/lib/tools/cv-analyzer";

export function CvAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeCv> | null>(null);

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setResult(analyzeCv(text));
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cv-text">Paste your CV</Label>
          <Textarea
            id="cv-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste plain text from your CV or resume…"
            rows={12}
            required
          />
        </div>
        <Button type="submit">Analyze</Button>
      </form>

      {result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">CV score</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{result.score}%</p>
            <p className="mt-2 text-sm text-muted">
              {result.checks.filter((c) => c.passed).length} of {result.checks.length}{" "}
              checks passed
            </p>
          </div>

          <ul className="space-y-2">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      check.passed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    aria-hidden
                  />
                  <p className="font-medium text-foreground">{check.label}</p>
                </div>
                <p className="mt-2 text-sm text-muted">{check.tip}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
