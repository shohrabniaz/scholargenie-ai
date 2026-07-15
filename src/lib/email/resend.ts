import { getResendApiKey, getResendFromEmail } from "@/lib/env/server";

export async function sendResendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false as const, reason: "no_resend" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromEmail(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false as const,
      reason: "send_failed" as const,
      message: `Resend failed (${response.status}): ${body}`,
    };
  }

  return { ok: true as const };
}
