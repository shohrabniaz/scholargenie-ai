import { NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/auth/send-auth-email";
import { confirmUserEmail } from "@/lib/supabase/admin";
import { confirmUserEmailViaDb } from "@/lib/supabase/confirm-email";

const bodySchema = z.object({
  email: z.email(),
  mode: z.enum(["email", "instant"]).optional().default("email"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  if (parsed.data.mode === "instant") {
    const adminResult = await confirmUserEmail(email);
    if (adminResult.ok) {
      return NextResponse.json({ ok: true, method: "admin" });
    }

    const dbResult = await confirmUserEmailViaDb(email);
    if (dbResult.ok) {
      return NextResponse.json({ ok: true, method: "db" });
    }

    return NextResponse.json(
      {
        error:
          adminResult.message ??
          "Could not verify email. Add SUPABASE_SERVICE_ROLE_KEY or try the emailed link.",
      },
      { status: 500 },
    );
  }

  const sent = await sendVerificationEmail(email);
  if (sent.ok) {
    return NextResponse.json({ ok: true, channel: "abroadgenie" });
  }

  // If Resend isn't ready, fall back to instant confirm so login isn't blocked
  if (sent.reason === "no_resend" || sent.reason === "no_service_role") {
    const adminResult = await confirmUserEmail(email);
    if (adminResult.ok) {
      return NextResponse.json({
        ok: true,
        method: "instant",
        note: "Verified instantly. Add RESEND_API_KEY to send AbroadGenie verification emails.",
      });
    }
    const dbResult = await confirmUserEmailViaDb(email);
    if (dbResult.ok) {
      return NextResponse.json({
        ok: true,
        method: "instant",
        note: "Verified instantly. Add RESEND_API_KEY to send AbroadGenie verification emails.",
      });
    }
  }

  return NextResponse.json(
    { error: sent.message ?? "Could not send verification email" },
    { status: 500 },
  );
}
