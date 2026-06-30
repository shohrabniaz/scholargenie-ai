import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const projectJsonPath = resolve(projectRoot, ".vercel", "project.json");
const TOKEN_NAME = "ScholarGenie GitHub Actions";

function readProjectIds() {
  if (!existsSync(projectJsonPath)) {
    console.error("Missing .vercel/project.json — run: npx vercel link");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(projectJsonPath, "utf8"));
  if (!data.orgId || !data.projectId) {
    console.error("Invalid .vercel/project.json — missing orgId or projectId");
    process.exit(1);
  }
  return { orgId: data.orgId, projectId: data.projectId };
}

function gh(args, input) {
  execSync(`gh ${args}`, {
    cwd: projectRoot,
    stdio: input ? ["pipe", "inherit", "inherit"] : "inherit",
    input,
  });
}

function resolveVercelToken() {
  const fromEnv = process.env.VERCEL_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  try {
    const output = execSync(
      `npx vercel tokens add "${TOKEN_NAME}" --format json --non-interactive`,
      { cwd: projectRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
    const parsed = JSON.parse(output.trim());
    return parsed.token ?? parsed.value ?? null;
  } catch {
    return null;
  }
}

function main() {
  const { orgId, projectId } = readProjectIds();

  console.log("Configuring GitHub Actions deploy secrets…");
  gh(`secret set VERCEL_ORG_ID --body "${orgId}"`);
  gh(`secret set VERCEL_PROJECT_ID --body "${projectId}"`);

  const token = resolveVercelToken();
  if (token) {
    gh("secret set VERCEL_TOKEN --body -", token);
    console.log("Set VERCEL_TOKEN.");
    console.log("Enabling GitHub deploy variable…");
    gh('variable set VERCEL_DEPLOY_ENABLED --body "true"');
  } else {
    console.log("\nCould not create VERCEL_TOKEN automatically.");
    console.log("Vercel OAuth login cannot mint tokens — use a classic token instead:");
    console.log("  1. https://vercel.com/account/tokens → Create Token");
    console.log("  2. Add to .env.local: VERCEL_TOKEN=...");
    console.log("  3. npm run setup:github-deploy");
  }

  console.log("\nDone. Push to master to trigger CI/CD.");
  console.log("Repo: https://github.com/shohrabniaz/scholargenie-ai/actions");
}

main();
