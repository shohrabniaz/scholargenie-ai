import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildNotificationDrafts } from "@/lib/notifications/generate";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { UserDeadline } from "@/types/deadline";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile?.onboarding_completed) {
    return NextResponse.json({ ok: true, created: 0 });
  }

  const [scholarshipsRes, deadlinesRes, savedRes, existingRes] = await Promise.all([
    supabase.from("scholarships").select("*").returns<Scholarship[]>(),
    supabase.from("user_deadlines").select("*").returns<UserDeadline[]>(),
    supabase
      .from("saved_scholarships")
      .select("scholarships(name, deadline)")
      .returns<{ scholarships: { name: string; deadline: string | null } }[]>(),
    supabase.from("notifications").select("title, body").eq("user_id", user.id),
  ]);

  const savedDeadlines = (savedRes.data ?? [])
    .filter((r) => r.scholarships?.deadline)
    .map((r) => ({
      name: r.scholarships.name,
      deadline: r.scholarships.deadline!,
    }));

  const drafts = buildNotificationDrafts(
    profile,
    scholarshipsRes.data ?? [],
    deadlinesRes.data ?? [],
    savedDeadlines,
  );

  const existing = new Set(
    (existingRes.data ?? []).map((n) => `${n.title}::${n.body}`),
  );

  let created = 0;
  for (const draft of drafts) {
    const key = `${draft.title}::${draft.body}`;
    if (existing.has(key)) continue;

    const { error } = await supabase.from("notifications").insert({
      user_id: user.id,
      title: draft.title,
      body: draft.body,
      href: draft.href,
    });

    if (!error) {
      created += 1;
      existing.add(key);
    }
  }

  return NextResponse.json({ ok: true, created });
}
