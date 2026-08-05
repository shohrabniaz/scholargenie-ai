import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = resolve(projectRoot, ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function projectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return url.replace("https://", "").replace(".supabase.co", "");
}

async function main() {
  loadEnvFile();

  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const ref = projectRef();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "AbroadGenie AI <onboarding@resend.dev>";

  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN (supabase.com/dashboard/account/tokens)");
    process.exit(1);
  }
  if (!resendKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  if (!ref) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  // Parse "Name <email@domain>" or bare email
  const match = from.match(/^(.*?)\s*<([^>]+)>$/);
  const senderName = match?.[1]?.trim() || "AbroadGenie AI";
  const adminEmail = match?.[2]?.trim() || from;

  const payload = {
    external_email_enabled: true,
    mailer_autoconfirm: false,
    smtp_admin_email: adminEmail,
    smtp_host: "smtp.resend.com",
    smtp_port: "465",
    smtp_user: "resend",
    smtp_pass: resendKey,
    smtp_sender_name: senderName,
  };

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    console.error(`Failed to configure SMTP (${res.status}): ${text}`);
    process.exit(1);
  }

  console.log("Supabase Auth SMTP configured via Resend.");
  console.log(`Sender: ${senderName} <${adminEmail}>`);
  console.log(
    "Auth emails (reset/verify) will show as AbroadGenie, not Supabase.",
  );
  console.log(
    "Tip: verify your domain in Resend for production (onboarding@resend.dev is test-only).",
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
