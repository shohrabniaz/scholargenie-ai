import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

function loadEnvFile() {
  try {
    const envPath = resolve(projectRoot, ".env.local");
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
  } catch {
    // optional
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

async function main() {
  loadEnvFile();

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("Missing SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }

  const migrationsDir = resolve(projectRoot, "supabase/migrations");
  const ledgerPath = resolve(migrationsDir, ".migrations_applied.json");
  const applied = existsSync(ledgerPath)
    ? JSON.parse(readFileSync(ledgerPath, "utf8"))
    : [];

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connecting to Supabase Postgres...");
  await client.connect();

  const newlyApplied = [];

  for (const file of files) {
    if (applied.includes(file)) {
      console.log(`Skipping ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(resolve(migrationsDir, file), "utf8");
    console.log(`Running ${file}...`);
    try {
      await client.query(sql);
      newlyApplied.push(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("already exists")) {
        console.warn(`Skipping ${file}: objects already exist`);
        newlyApplied.push(file);
        continue;
      }
      throw error;
    }
  }

  await client.end();

  if (newlyApplied.length > 0) {
    const all = [...new Set([...applied, ...newlyApplied])].sort();
    writeFileSync(ledgerPath, JSON.stringify(all, null, 2));
  }

  console.log("Migrations complete.");
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
