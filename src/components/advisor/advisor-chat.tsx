"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdvisorMessage, RoadmapStep } from "@/lib/advisor/engine";
import type { Profile } from "@/types/database";

type AdvisorChatProps = {
  profile: Profile;
  initialRoadmap: RoadmapStep[];
  llmEnabled: boolean;
};

export function AdvisorChat({
  profile,
  initialRoadmap,
  llmEnabled,
}: AdvisorChatProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      role: "assistant",
      content: `Hi ${profile.full_name?.split(" ")[0] ?? "there"}! I'm your ScholarGenie AI advisor.${llmEnabled ? " I'm powered by GPT and know your profile plus our scholarship data." : ""}\n\nAsk me about funding, universities, professors, deadlines, or say "give me a roadmap."`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"openai" | "rules" | null>(
    llmEnabled ? "openai" : "rules",
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: AdvisorMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await res.json()) as {
        reply?: string;
        mode?: "openai" | "rules";
        error?: string;
      };

      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? "Chat failed");
      }

      setMode(data.mode ?? "rules");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply! },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't respond right now. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function askSuggestion(question: string) {
    setInput(question);
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading" className="text-sm font-medium text-muted">
          Your roadmap
        </h2>
        <ol className="mt-4 space-y-3">
          {initialRoadmap.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <p className="text-xs text-muted">Step {i + 1}</p>
              <p className="mt-1 font-medium text-foreground">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="chat-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="chat-heading" className="text-sm font-medium text-muted">
            Chat
          </h2>
          {mode ? (
            <span className="text-xs text-muted">
              {mode === "openai" ? "GPT powered" : "Rule-based (add OPENAI_API_KEY for GPT)"}
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "What scholarships match me?",
            "University tiers?",
            "Give me a roadmap",
            "Help with my SOP",
          ].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => askSuggestion(q)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "ml-8 bg-foreground/[0.06] text-foreground"
                  : "mr-8 bg-background text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {loading ? (
            <div className="mr-8 flex items-center gap-2 rounded-xl bg-background px-4 py-3 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Thinking…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about scholarships, universities, deadlines…"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="sm" disabled={loading} aria-label="Send message">
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </form>
      </section>
    </div>
  );
}
