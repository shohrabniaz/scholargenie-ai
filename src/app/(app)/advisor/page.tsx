import { createClient } from "@/lib/supabase/server";
import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { generateRoadmap } from "@/lib/advisor/engine";
import { isOpenAiConfigured } from "@/lib/env/server";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { University } from "@/types/university";

export default async function AdvisorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
    : { data: null };

  if (!profile?.onboarding_completed) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-muted">AI Advisor</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your copilot</h1>
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Complete your profile in onboarding first so the advisor can personalize
          recommendations.
        </p>
      </div>
    );
  }

  const [{ data: scholarships }, { data: universities }, { data: savedMessages }] =
    await Promise.all([
    supabase.from("scholarships").select("*").returns<Scholarship[]>(),
    supabase.from("universities").select("*").returns<University[]>(),
    supabase
      .from("advisor_messages")
      .select("role, content")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true })
      .limit(40),
  ]);

  const roadmap = generateRoadmap(
    profile,
    scholarships ?? [],
    universities ?? [],
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">AI Advisor</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your copilot</h1>
      <p className="mt-2 text-sm text-muted">
        Personalized roadmap and chat grounded in your profile and our data.
      </p>

      <div className="mt-8">
        <AdvisorChat
          profile={profile}
          initialRoadmap={roadmap}
          llmEnabled={isOpenAiConfigured()}
          initialMessages={(savedMessages ?? []).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }))}
        />
      </div>
    </div>
  );
}
