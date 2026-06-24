import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey } from "@/lib/env/server";
import { getSupabaseUrl } from "@/lib/supabase/env";

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

export async function confirmUserEmail(email: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, reason: "no_service_role" as const };
  }

  const { data: listData, error: listError } =
    await admin.auth.admin.listUsers({ perPage: 1000 });

  if (listError) {
    return { ok: false as const, reason: "list_failed" as const, message: listError.message };
  }

  const user = listData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!user) {
    return { ok: false as const, reason: "not_found" as const };
  }

  if (user.email_confirmed_at) {
    return { ok: true as const, alreadyConfirmed: true };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  if (updateError) {
    return { ok: false as const, reason: "update_failed" as const, message: updateError.message };
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
    }
    return { ok: false as const, reason: "create_failed" as const, message: error.message };
  }

  return { ok: true as const, existing: false, userId: data.user.id };
}
