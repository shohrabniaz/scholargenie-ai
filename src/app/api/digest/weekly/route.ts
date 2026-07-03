import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildWeeklyPlan } from "@/lib/dashboard/weekly-plan";
import { sendWeeklyDigestEmail } from "@/lib/email/weekly-digest";
import {
  getCronSecret,
  getSupabaseServiceRoleKey,
  isResendConfigured,
} from "@/lib/env/server";
import { getSupabaseUrl } from "@/lib/supabase/env";
import type { Application } from "@/types/application";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";
import type { UserDeadline } from "@/types/deadline";

type QueryClient = Awaited<ReturnType<typeof createClient>>;

async function buildActionsForUser(supabase: QueryClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (!profile?.onboarding_completed) {
    return null;
  }

  const [
    { data: scholarships },
    { data: deadlines },
    { data: applications },
    { data: savedRows },
  ] = await Promise.all([
    supabase.from("scholarships").select("*").returns<Scholarship[]>(),
    supabase.from("user_deadlines").select("*").eq("user_id", userId).returns<UserDeadline[]>(),
    supabase.from("applications").select("*").eq("user_id", userId).returns<Application[]>(),
    supabase
      .from("saved_scholarships")
      .select("scholarships(name, deadline)")
      .eq("user_id", userId)
      .returns<{ scholarships: { name: string; deadline: string | null } }[]>(),
  ]);

  const savedScholarshipDeadlines = (savedRows ?? [])
    .filter((row) => row.scholarships?.deadline)
    .map((row) => ({
      name: row.scholarships.name,
      deadline: row.scholarships.deadline!,
    }));

  return buildWeeklyPlan(
    profile,
    scholarships ?? [],
    deadlines ?? [],
    savedScholarshipDeadlines,
    applications ?? [],
  );
}

async function sendForUser(supabase: QueryClient, userId: string, email: string) {
  const actions = await buildActionsForUser(supabase, userId);
  if (!actions || actions.length === 0) {
    return { sent: false, reason: "no_actions" as const };
  }
  await sendWeeklyDigestEmail(email, actions);
  return { sent: true, count: actions.length };
}

export async function POST(request: Request) {
  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "Weekly digest email is not configured (RESEND_API_KEY missing)" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const isCron = url.searchParams.get("cron") === "1";
  const cronSecret = getCronSecret();

  if (isCron) {
    const auth = request.headers.get("authorization");
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceKey = getSupabaseServiceRoleKey();
    const supabaseUrl = getSupabaseUrl();
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY required for cron" },
        { status: 503 },
      );
    }

    const admin = createSupabaseClient(supabaseUrl, serviceKey);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id")
      .eq("onboarding_completed", true)
      .eq("deadline_reminders_enabled", true)
      .returns<Pick<Profile, "id">[]>();

    let sent = 0;
    let skipped = 0;

    for (const profile of profiles ?? []) {
      const { data: userData } = await admin.auth.admin.getUserById(profile.id);
      const email = userData.user?.email;
      if (!email) {
        skipped += 1;
        continue;
      }

      try {
        const result = await sendForUser(
          admin as unknown as QueryClient,
          profile.id,
          email,
        );
        if (result.sent) sent += 1;
        else skipped += 1;
      } catch {
        skipped += 1;
      }
    }

    return NextResponse.json({ ok: true, sent, skipped });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendForUser(supabase, user.id, user.email);

  if (!result.sent) {
    return NextResponse.json({
      ok: true,
      sent: false,
      message: "No weekly actions to email yet.",
    });
  }

  return NextResponse.json({ ok: true, sent: true, count: result.count });
}
