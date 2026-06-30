import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const projectJsonPath = resolve(projectRoot, ".vercel", "project.json");

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

function gh(args) {
  execSync(`gh ${args}`, { stdio: "inherit", cwd: projectRoot });
}

function main() {
  const { orgId, projectId } = readProjectIds();

  console.log("Configuring GitHub Actions deploy secrets…");
  gh(`secret set VERCEL_ORG_ID --body "${orgId}"`);
  gh(`secret set VERCEL_PROJECT_ID --body "${projectId}"`);

  const token = process.env.VERCEL_TOKEN?.trim();
  if (token) {
    gh(`secret set VERCEL_TOKEN --body "${token}"`);
    console.log("Set VERCEL_TOKEN from environment.");
    console.log("\nEnabling GitHub deploy variable…");
    gh('variable set VERCEL_DEPLOY_ENABLED --body "true"');
  } else {
    console.log("\nNext: create a token at https://vercel.com/account/tokens");
    console.log("Then run:");
    console.log('  $env:VERCEL_TOKEN="your-token"; node scripts/setup-github-deploy.mjs');
    console.log("Or: gh secret set VERCEL_TOKEN");
    console.log("\nLeaving VERCEL_DEPLOY_ENABLED unset (Vercel Git deploys still work).");
  }

  console.log("\nDone. Push to master to trigger CI/CD.");
  console.log("Repo: https://github.com/shohrabniaz/scholargenie-ai/actions");
}

main();
