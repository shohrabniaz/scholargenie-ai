import pg from "pg";
import { getSupabaseServiceRoleKey } from "@/lib/env/server";
import { getSupabaseUrl } from "@/lib/supabase/env";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  const url = getSupabaseUrl();
  if (!password || !url) return null;

  const ref = url.replace("https://", "").replace(".supabase.co", "");
  const region = process.env.SUPABASE_DB_REGION ?? "ap-south-1";
  const pooler = process.env.SUPABASE_DB_POOLER ?? "aws-1";

  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${pooler}-${region}.pooler.supabase.com:5432/postgres`;
}

export async function confirmUserEmailViaDb(email: string) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return { ok: false as const, reason: "no_db" as const };
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { rowCount } = await client.query(
      `update auth.users
       set email_confirmed_at = coalesce(email_confirmed_at, now()),
           confirmed_at = coalesce(confirmed_at, now())
       where lower(email) = lower($1)`,
      [email],
    );

    if (!rowCount) {
      return { ok: false as const, reason: "not_found" as const };
    }

    return { ok: true as const };
  } finally {
    await client.end();
  }
}

export function canConfirmEmail() {
  return Boolean(getSupabaseServiceRoleKey() || getDatabaseUrl());
}
