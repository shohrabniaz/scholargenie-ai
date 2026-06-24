import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatWithOpenAi } from "@/lib/advisor/llm";
import { isOpenAiConfigured } from "@/lib/env/server";
import { refineSopDraft } from "@/lib/tools/sop-refine";

type RefineBody = {
  draft?: string;
  instruction?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as RefineBody;
  const draft = body.draft?.trim();
  const instruction = body.instruction?.trim() || "Improve clarity and flow while keeping my voice.";

  if (!draft) {
    return NextResponse.json({ error: "Draft is required" }, { status: 400 });
  }

  if (isOpenAiConfigured()) {
    try {
      const reply = await chatWithOpenAi(
        "You refine statements of purpose for graduate school. Keep the student's facts. Return only the revised SOP text.",
        [
          { role: "user", content: `Instruction: ${instruction}\n\nSOP:\n${draft}` },
        ],
      );
      return NextResponse.json({ draft: reply, mode: "openai" });
    } catch {
      // fall through to rules
    }
  }

  const refined = refineSopDraft(draft, instruction);
  return NextResponse.json({ draft: refined, mode: "rules" });
}
