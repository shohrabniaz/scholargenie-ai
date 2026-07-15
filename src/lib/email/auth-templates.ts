import { APP_NAME } from "@/lib/brand";

function shell(title: string, bodyHtml: string, siteUrl: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 24px;font-size:14px;font-weight:600;letter-spacing:-0.02em;">${APP_NAME}</p>
    <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:28px 24px;">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#71717a;line-height:1.5;">
      You’re receiving this because you use ${APP_NAME}.
      <a href="${siteUrl}" style="color:#18181b;">Open the app</a>
    </p>
  </div>
</body>
</html>`;
}

export function buildVerificationEmailHtml(actionUrl: string, siteUrl: string) {
  return shell(
    "Verify your email",
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;">
      Welcome to ${APP_NAME}. Confirm your email to start matching scholarships, universities, and professors.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${actionUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:500;">
        Verify email
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#a1a1aa;word-break:break-all;">
      Or paste this link:<br/>${actionUrl}
    </p>`,
    siteUrl,
  );
}

export function buildPasswordResetEmailHtml(actionUrl: string, siteUrl: string) {
  return shell(
    "Reset your password",
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;">
      We received a request to reset your ${APP_NAME} password. This link expires soon.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${actionUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:500;">
        Choose a new password
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#a1a1aa;word-break:break-all;">
      If you didn’t ask for this, you can ignore this email.<br/><br/>
      Or paste this link:<br/>${actionUrl}
    </p>`,
    siteUrl,
  );
}

export function buildWelcomeEmailHtml(siteUrl: string) {
  return shell(
    "You’re in",
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;">
      Your ${APP_NAME} account is ready. Complete your profile to unlock scholarship matches and this week’s plan.
    </p>
    <p style="margin:0;">
      <a href="${siteUrl}/onboarding" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:500;">
        Complete profile
      </a>
    </p>`,
    siteUrl,
  );
}
