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

  const email = parsed.data.email;

  const adminResult = await confirmUserEmail(email);
  if (adminResult.ok) {
    return NextResponse.json({
      ok: true,
      alreadyConfirmed: adminResult.alreadyConfirmed ?? false,
    });
  }

  if (adminResult.reason !== "no_service_role" && adminResult.reason !== "not_found") {
    return NextResponse.json(
      { error: adminResult.message ?? "Could not verify email" },
      { status: 400 },
    );
  }

  const dbResult = await confirmUserEmailViaDb(email);
  if (dbResult.ok) {
    return NextResponse.json({ ok: true });
  }

  if (dbResult.reason === "not_found" || adminResult.reason === "not_found") {
    return NextResponse.json({ error: "No account found for that email." }, { status: 404 });
  }

  return NextResponse.json(
    {
      error: "server_config",
      message:
        "Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_DB_PASSWORD on the server to enable instant verification.",
    },
    { status: 503 },
  );
}
