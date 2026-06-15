import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { respondToMessage } from "@/lib/advisor/engine";
import { buildAdvisorSystemPrompt } from "@/lib/advisor/prompt";
import { chatWithOpenAi } from "@/lib/advisor/llm";
import { isOpenAiConfigured } from "@/lib/env/server";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { University } from "@/types/university";

type ChatBody = {
  messages?: { role: "user" | "assistant"; content: string }[];
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ChatBody;
  const messages = body.messages ?? [];

  if (messages.length === 0 || messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile?.onboarding_completed) {
    return NextResponse.json(
      { error: "Complete onboarding first" },
      { status: 400 },
    );
  }

  const [{ data: scholarships }, { data: universities }] = await Promise.all([
    supabase.from("scholarships").select("*").returns<Scholarship[]>(),
    supabase.from("universities").select("*").returns<University[]>(),
  ]);

  const lastUserMessage = messages.at(-1)!.content;

  if (isOpenAiConfigured()) {
    try {
      const systemPrompt = buildAdvisorSystemPrompt(
        profile,
        scholarships ?? [],
        universities ?? [],
      );
      const reply = await chatWithOpenAi(systemPrompt, messages);
      return NextResponse.json({ reply, mode: "openai" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "LLM error";
      const fallback = respondToMessage(
        lastUserMessage,
        profile,
        scholarships ?? [],
        universities ?? [],
      );
      return NextResponse.json({
        reply: fallback,
        mode: "rules",
        warning: message,
      });
    }
  }

  const reply = respondToMessage(
    lastUserMessage,
    profile,
    scholarships ?? [],
    universities ?? [],
  );

  return NextResponse.json({ reply, mode: "rules" });
}
