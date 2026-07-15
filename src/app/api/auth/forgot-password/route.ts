import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { sendPasswordResetEmail } from "@/lib/auth/send-auth-email";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const bodySchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Prefer ScholarGenie-branded Resend mail (never "from Supabase")
  const branded = await sendPasswordResetEmail(email);
  if (branded.ok) {
    return NextResponse.json({
      ok: true,
      channel: "scholargenie",
    });
  }

  if (branded.reason === "no_resend" || branded.reason === "no_service_role") {
    const url = getSupabaseUrl();
    const key = getSupabasePublishableKey();
    if (!url || !key) {
      return NextResponse.json(
        {
          error:
            "Password reset is not configured. Add RESEND_API_KEY (recommended) or Supabase keys.",
        },
        { status: 503 },
      );
    }

    const supabase = createClient(url, key);
    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "https://scholargenie-ai.vercel.app";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${site}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, channel: "supabase" });
  }

  return NextResponse.json(
    { error: branded.message ?? "Could not send reset email" },
    { status: 500 },
  );
}
