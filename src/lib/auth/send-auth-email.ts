import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildPasswordResetEmailHtml,
  buildVerificationEmailHtml,
  buildWelcomeEmailHtml,
} from "@/lib/email/auth-templates";
import { sendResendEmail } from "@/lib/email/resend";
import { isResendConfigured } from "@/lib/env/server";
import { APP_NAME } from "@/lib/brand";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://scholargenie-ai.vercel.app";
}

function callbackUrl(next: string) {
  const base = siteUrl().replace(/\/$/, "");
  const path = next.startsWith("/") ? next : `/${next}`;
  return `${base}/auth/callback?next=${encodeURIComponent(path)}`;
}

export function canSendBrandedAuthEmail() {
  return isResendConfigured() && Boolean(createAdminClient());
}

export async function sendPasswordResetEmail(email: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, reason: "no_service_role" as const };
  }
  if (!isResendConfigured()) {
    return { ok: false as const, reason: "no_resend" as const };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: callbackUrl("/reset-password"),
    },
  });

  if (error || !data?.properties?.action_link) {
    // Don't reveal whether the account exists
    return { ok: true as const, silent: true as const };
  }

  const actionUrl = data.properties.action_link;
  const sent = await sendResendEmail({
    to: email,
    subject: `${APP_NAME} — reset your password`,
    html: buildPasswordResetEmailHtml(actionUrl, siteUrl()),
    text: `Reset your ${APP_NAME} password: ${actionUrl}`,
  });

  if (!sent.ok) {
    return { ok: false as const, reason: sent.reason, message: sent.message };
  }

  return { ok: true as const };
}

export async function sendVerificationEmail(email: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, reason: "no_service_role" as const };
  }
  if (!isResendConfigured()) {
    return { ok: false as const, reason: "no_resend" as const };
  }

  // Prefer magic link — works for existing unconfirmed users without requiring password
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: callbackUrl("/onboarding"),
    },
  });

  let actionUrl = data?.properties?.action_link;
  if (error || !actionUrl) {
    const invite = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: callbackUrl("/onboarding"),
      },
    });
    actionUrl = invite.data?.properties?.action_link ?? undefined;
    if (invite.error || !actionUrl) {
      return {
        ok: false as const,
        reason: "link_failed" as const,
        message:
          error?.message ??
          invite.error?.message ??
          "Could not create verification link",
      };
    }
  }

  const sent = await sendResendEmail({
    to: email,
    subject: `${APP_NAME} — verify your email`,
    html: buildVerificationEmailHtml(actionUrl, siteUrl()),
    text: `Verify your ${APP_NAME} email: ${actionUrl}`,
  });

  if (!sent.ok) {
    return { ok: false as const, reason: sent.reason, message: sent.message };
  }

  return { ok: true as const };
}

export async function sendWelcomeEmail(email: string) {
  if (!isResendConfigured()) {
    return { ok: false as const, reason: "no_resend" as const };
  }

  const sent = await sendResendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}`,
    html: buildWelcomeEmailHtml(siteUrl()),
    text: `Welcome to ${APP_NAME}. Complete your profile: ${siteUrl()}/onboarding`,
  });

  if (!sent.ok) {
    return { ok: false as const, reason: sent.reason, message: sent.message };
  }

  return { ok: true as const };
}
