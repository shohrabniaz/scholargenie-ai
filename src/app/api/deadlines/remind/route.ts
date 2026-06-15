import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendDeadlineDigestEmail,
  type DeadlineDigestItem,
} from "@/lib/email/deadline-digest";
import {
  getCronSecret,
  getSupabaseServiceRoleKey,
  isResendConfigured,
} from "@/lib/env/server";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { CATEGORY_LABELS, type DeadlineCategory, type UserDeadline } from "@/types/deadline";
import type { Profile } from "@/types/database";
import type { Scholarship } from "@/types/scholarship";

function daysUntil(date: string) {
  return Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

async function collectUpcomingDeadlines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  leadDays: number,
): Promise<DeadlineDigestItem[]> {
  const [savedResult, deadlinesResult] = await Promise.all([
    supabase
      .from("saved_scholarships")
      .select("scholarships(*)")
      .eq("user_id", userId)
      .returns<{ scholarships: Scholarship }[]>(),
    supabase
      .from("user_deadlines")
      .select("*")
      .eq("user_id", userId)
      .returns<UserDeadline[]>(),
  ]);

  const items: DeadlineDigestItem[] = [];

  for (const row of savedResult.data ?? []) {
    const s = row.scholarships;
    if (!s?.deadline) continue;
    const d = daysUntil(s.deadline);
    if (d >= 0 && d <= leadDays) {
      items.push({
        title: s.name,
        due_date: s.deadline,
        category: "Application",
        daysUntil: d,
      });
    }
  }

  for (const d of deadlinesResult.data ?? []) {
    const days = daysUntil(d.due_date);
    if (days >= 0 && days <= leadDays) {
      items.push({
        title: d.title,
        due_date: d.due_date,
        category: CATEGORY_LABELS[d.category as DeadlineCategory],
        daysUntil: days,
      });
    }
  }

  return items.sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );
}

async function sendForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string,
  leadDays: number,
) {
  const items = await collectUpcomingDeadlines(supabase, userId, leadDays);
  if (items.length === 0) return { sent: false, reason: "no_upcoming" as const };
  await sendDeadlineDigestEmail(email, items);
  return { sent: true, count: items.length };
}

export async function POST(request: Request) {
  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "Email reminders are not configured (RESEND_API_KEY missing)" },
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
      .select("id, reminder_lead_days, deadline_reminders_enabled")
      .eq("deadline_reminders_enabled", true)
      .returns<
        Pick<
          Profile,
          "id" | "reminder_lead_days" | "deadline_reminders_enabled"
        >[]
      >();

    let sent = 0;
    let skipped = 0;

    for (const profile of profiles ?? []) {
      const { data: userData } = await admin.auth.admin.getUserById(profile.id);
      const email = userData.user?.email;
      if (!email) {
        skipped += 1;
        continue;
      }

      const result = await sendForUser(
        admin as unknown as Awaited<ReturnType<typeof createClient>>,
        profile.id,
        email,
        profile.reminder_lead_days ?? 7,
      );

      if (result.sent) sent += 1;
      else skipped += 1;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("reminder_lead_days")
    .eq("id", user.id)
    .maybeSingle<Pick<Profile, "reminder_lead_days">>();

  const leadDays = profile?.reminder_lead_days ?? 7;
  const result = await sendForUser(supabase, user.id, user.email, leadDays);

  if (!result.sent) {
    return NextResponse.json({
      ok: true,
      sent: false,
      message: `No deadlines in the next ${leadDays} days.`,
    });
  }

  return NextResponse.json({ ok: true, sent: true, count: result.count });
}
