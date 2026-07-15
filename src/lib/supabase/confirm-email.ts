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
    // Only touch email_confirmed_at — confirmed_at is a legacy generated column
    // on many Supabase projects and breaks updates when set directly.
    const { rowCount } = await client.query(
      `update auth.users
       set email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
       where lower(email) = lower($1)`,
      [email],
    );

    if (!rowCount) {
      return { ok: false as const, reason: "not_found" as const };
    }

    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      reason: "query_failed" as const,
      message: error instanceof Error ? error.message : "DB confirm failed",
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export function canConfirmEmail() {
  return Boolean(getSupabaseServiceRoleKey() || getDatabaseUrl());
}

export async function findUserIdByEmail(email: string) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { rows } = await client.query<{ id: string }>(
      `select id::text from auth.users where lower(email) = lower($1) limit 1`,
      [email],
    );
    return rows[0]?.id ?? null;
  } catch {
    return null;
  } finally {
    await client.end().catch(() => undefined);
  }
}
