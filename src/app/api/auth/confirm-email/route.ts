import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmUserEmail } from "@/lib/supabase/admin";
import { confirmUserEmailViaDb } from "@/lib/supabase/confirm-email";

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

  const adminResult = await confirmUserEmail(email);
  if (adminResult.ok) {
    return NextResponse.json({
      ok: true,
      alreadyConfirmed: adminResult.alreadyConfirmed ?? false,
      method: "admin",
    });
  }

  const dbResult = await confirmUserEmailViaDb(email);
  if (dbResult.ok) {
    return NextResponse.json({ ok: true, method: "db" });
  }

  return NextResponse.json(
    {
      error: "confirm_failed",
      message:
        adminResult.message ??
        dbResult.message ??
        "Could not verify this email. Try the ScholarGenie verification email, or check that SUPABASE_SERVICE_ROLE_KEY is set.",
    },
    { status: 500 },
  );
}
