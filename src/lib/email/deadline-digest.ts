import { getResendApiKey, getResendFromEmail } from "@/lib/env/server";

export type DeadlineDigestItem = {
  title: string;
  due_date: string;
  category: string;
  daysUntil: number;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildDeadlineDigestHtml(
  items: DeadlineDigestItem[],
  siteUrl: string,
) {
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.title}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${formatDate(item.due_date)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.category}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.daysUntil <= 0 ? "Due now" : `In ${item.daysUntil} days`}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;color:#18181b;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;">Upcoming deadlines</h1>
  <p style="color:#71717a;">From ScholarGenie AI — your study-abroad copilot.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
    <thead>
      <tr style="text-align:left;color:#71717a;">
        <th>Item</th><th>Date</th><th>Type</th><th>When</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:24px;">
    <a href="${siteUrl}/deadlines" style="color:#18181b;">View all deadlines →</a>
  </p>
</body>
</html>`;
}

export async function sendDeadlineDigestEmail(
  to: string,
  items: DeadlineDigestItem[],
) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const html = buildDeadlineDigestHtml(items, siteUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromEmail(),
      to: [to],
      subject: `ScholarGenie AI — ${items.length} upcoming deadline${items.length === 1 ? "" : "s"}`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }
}
