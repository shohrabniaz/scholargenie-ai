import { NextResponse } from "next/server";
import { z } from "zod";
import { createConfirmedUser } from "@/lib/supabase/admin";
import { confirmUserEmailViaDb } from "@/lib/supabase/confirm-email";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

async function signUpThenConfirmDb(email: string, password: string) {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return { ok: false as const, reason: "no_supabase" as const };

  const supabase = createClient(url, key);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding` },
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (!lower.includes("already") && !lower.includes("registered")) {
      return { ok: false as const, reason: "signup_failed" as const, message: error.message };
    }
  }

  const confirmed = await confirmUserEmailViaDb(email);
  if (!confirmed.ok) {
    return { ok: false as const, reason: "confirm_failed" as const };
  }

  return { ok: true as const };
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const result = await createConfirmedUser(email, password);

  if (result.ok) {
    return NextResponse.json({ ok: true, existing: result.existing ?? false });
  }

  if (result.reason !== "no_service_role") {
    return NextResponse.json(
      { error: result.message ?? "Could not create account" },
      { status: 400 },
    );
  }

  const fallback = await signUpThenConfirmDb(email, password);
  if (fallback.ok) {
    return NextResponse.json({ ok: true, existing: false });
  }

  return NextResponse.json(
    {
      error: "server_config",
      message:
        "Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_DB_PASSWORD on the server for instant signup.",
    },
    { status: 503 },
  );
}
