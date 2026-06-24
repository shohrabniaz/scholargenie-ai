import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const envPath = resolve(projectRoot, ".env.local");

const SYNC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_PASSWORD",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

function parseEnvFile(path) {
  const vars = {};
  if (!existsSync(path)) return vars;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function upsertEnv(key, value) {
  for (const target of ["production", "preview", "development"]) {
    spawnSync("npx", ["vercel", "env", "rm", key, target, "--yes"], {
      cwd: projectRoot,
      stdio: "pipe",
      shell: true,
    });

    const add = spawnSync("npx", ["vercel", "env", "add", key, target], {
      cwd: projectRoot,
      input: value,
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    if (add.status !== 0) {
      const err = add.stderr?.toString() || add.stdout?.toString();
      console.error(`Failed to set ${key} (${target}):`, err);
      process.exit(1);
    }
    console.log(`Set ${key} → ${target}`);
  }
}

const vars = parseEnvFile(envPath);
const siteUrl = process.argv[2];

for (const key of SYNC_KEYS) {
  let value = vars[key];
  if (key === "NEXT_PUBLIC_SITE_URL" && siteUrl) {
    value = siteUrl;
  }
  if (!value) {
    console.warn(`Skipping ${key} (not set)`);
    continue;
  }
  upsertEnv(key, value);
}

console.log("Vercel env sync complete.");
