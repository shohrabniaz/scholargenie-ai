import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey } from "@/lib/env/server";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { findUserIdByEmail } from "@/lib/supabase/confirm-email";

export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function resolveUserId(email: string) {
  const byDb = await findUserIdByEmail(email);
  if (byDb) return byDb;

  const admin = createAdminClient();
  if (!admin) return null;

  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return null;
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match) return match.id;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

export async function confirmUserEmail(email: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, reason: "no_service_role" as const };
  }

  const userId = await resolveUserId(email);
  if (!userId) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const { data: existing, error: getError } =
    await admin.auth.admin.getUserById(userId);

  if (getError || !existing.user) {
    return {
      ok: false as const,
      reason: "get_failed" as const,
      message: getError?.message,
    };
  }

  if (existing.user.email_confirmed_at) {
    return { ok: true as const, alreadyConfirmed: true };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (updateError) {
    return {
      ok: false as const,
      reason: "update_failed" as const,
      message: updateError.message,
    };
  }

  return { ok: true as const, alreadyConfirmed: false };
}

export async function createConfirmedUser(email: string, password: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, reason: "no_service_role" as const };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("already") || lower.includes("registered")) {
      const confirmed = await confirmUserEmail(email);
      if (confirmed.ok) {
        return { ok: true as const, existing: true };
      }
      return {
        ok: false as const,
        reason: "create_failed" as const,
        message: error.message,
      };
    }
    return {
      ok: false as const,
      reason: "create_failed" as const,
      message: error.message,
    };
  }

  return { ok: true as const, existing: false, userId: data.user.id };
}
