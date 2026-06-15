import { createClient } from "@/lib/supabase/server";
import { SopWriter } from "@/components/tools/sop-writer";
import type { Profile } from "@/types/database";

export default async function SopPage() {
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
        <p className="text-sm text-muted">Tools</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">SOP Writer</h1>
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Complete onboarding first so we can pre-fill your statement with profile details.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Tools</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">SOP Writer</h1>
      <p className="mt-2 text-sm text-muted">
        Answer a few prompts and get a structured draft to edit in your own voice.
      </p>
      <div className="mt-8">
        <SopWriter profile={profile} />
      </div>
    </div>
  );
}
