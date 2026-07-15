import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = resolve(projectRoot, ".env.local");
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy .env.example and fill in values.");
    process.exit(1);
  }
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

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!password || !url) return null;
  const ref = url.replace("https://", "").replace(".supabase.co", "");
  const region = process.env.SUPABASE_DB_REGION ?? "ap-south-1";
  const pooler = process.env.SUPABASE_DB_POOLER ?? "aws-1";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${pooler}-${region}.pooler.supabase.com:5432/postgres`;
}

async function checkRest(url, key) {
  try {
    const res = await fetch(`${url}/rest/v1/scholarships?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "fetch failed" };
  }
}

async function checkDb(databaseUrl) {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  try {
    await client.connect();
    const { rows } = await client.query(
      "select (select count(*)::int from scholarships) as scholarships, (select count(*)::int from universities) as universities, (select count(*)::int from professors) as professors",
    );
    await client.end();
    return { ok: true, counts: rows[0] };
  } catch (error) {
    try {
      await client.end();
    } catch {
      // ignore
    }
    return { ok: false, error: error instanceof Error ? error.message : "db failed" };
  }
}

async function main() {
  loadEnvFile();

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_DB_PASSWORD",
    "NEXT_PUBLIC_SITE_URL",
    "CRON_SECRET",
  ];
  const optional = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "OPENAI_API_KEY",
    "NEXT_PUBLIC_POSTHOG_KEY",
    "NEXT_PUBLIC_POSTHOG_HOST",
    "VERCEL_TOKEN",
  ];

  console.log("ScholarGenie AI — setup check\n");

  let issues = 0;
  for (const key of required) {
    const ok = Boolean(process.env[key]?.trim());
    console.log(`${ok ? "✓" : "✗"} ${key}${ok ? "" : " (required)"}`);
    if (!ok) issues += 1;
  }

  for (const key of optional) {
    const ok = Boolean(process.env[key]?.trim());
    console.log(`${ok ? "✓" : "○"} ${key}${ok ? "" : " (optional)"}`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("\nConnectivity:");
  const rest = await checkRest(url, key);
  if (rest.ok) {
    console.log(`✓ Supabase REST API (${rest.status})`);
  } else {
    console.log(`✗ Supabase REST API — ${rest.error ?? `HTTP ${rest.status}`}`);
    issues += 1;
    console.log(
      "  → Project may be paused, deleted, or URL is wrong. Open supabase.com/dashboard and restore or create a new project.",
    );
  }

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.log("✗ Database URL could not be built");
    issues += 1;
  } else {
    const db = await checkDb(databaseUrl);
    if (db.ok) {
      console.log(
        `✓ Postgres pooler — scholarships=${db.counts.scholarships}, universities=${db.counts.universities}, professors=${db.counts.professors}`,
      );
    } else {
      console.log(`✗ Postgres pooler — ${db.error}`);
      issues += 1;
      console.log(
        "  → Check SUPABASE_DB_PASSWORD and region (SUPABASE_DB_REGION). Run npm run db:migrate after DB is reachable.",
      );
    }
  }

  console.log("\n" + (issues === 0 ? "All required checks passed." : `${issues} issue(s) to fix.`));
  process.exit(issues === 0 ? 0 : 1);
}

main();
