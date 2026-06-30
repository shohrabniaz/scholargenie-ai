import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

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

loadEnvFile();
const token = process.env.VERCEL_TOKEN?.trim();
if (!token) {
  console.error("VERCEL_TOKEN not found in environment or .env.local");
  process.exit(1);
}

execSync("gh secret set VERCEL_TOKEN --body -", {
  cwd: projectRoot,
  input: token,
  stdio: ["pipe", "inherit", "inherit"],
});
execSync('gh variable set VERCEL_DEPLOY_ENABLED --body "true"', {
  cwd: projectRoot,
  stdio: "inherit",
});
console.log("GitHub deploy enabled with VERCEL_TOKEN from .env.local");
