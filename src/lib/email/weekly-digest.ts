import { getResendApiKey, getResendFromEmail } from "@/lib/env/server";
import type { WeeklyAction } from "@/lib/dashboard/weekly-plan";

export function buildWeeklyDigestHtml(actions: WeeklyAction[], siteUrl: string) {
  const rows = actions
    .map(
      (action) =>
        `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;">
            <strong>${action.title}</strong>
            ${action.urgency === "high" ? ' <span style="font-size:11px;background:#18181b;color:#fff;padding:2px 6px;border-radius:999px;">Priority</span>' : ""}
            <div style="color:#71717a;margin-top:4px;">${action.detail}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;">
            <a href="${siteUrl}${action.href}" style="color:#18181b;">Open →</a>
          </td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;color:#18181b;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;">Your week with ScholarGenie AI</h1>
  <p style="color:#71717a;">Three to six focused actions from your matches, deadlines, and applications.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:24px;">
    <a href="${siteUrl}/dashboard" style="color:#18181b;">Open your dashboard →</a>
  </p>
</body>
</html>`;
}

export async function sendWeeklyDigestEmail(to: string, actions: WeeklyAction[]) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const html = buildWeeklyDigestHtml(actions, siteUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromEmail(),
      to: [to],
      subject: `ScholarGenie AI — ${actions.length} action${actions.length === 1 ? "" : "s"} for this week`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }
}
