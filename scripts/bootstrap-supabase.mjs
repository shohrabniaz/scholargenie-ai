#!/usr/bin/env node
/**
 * Create a new Supabase project, update .env.local, migrate, seed, and sync Vercel.
 *
 * Prerequisites:
 *   1. Create a token at https://supabase.com/dashboard/account/tokens
 *   2. Run: $env:SUPABASE_ACCESS_TOKEN="sbp_..."; npm run bootstrap:supabase
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const envPath = resolve(projectRoot, ".env.local");
const siteUrl = "https://scholargenie-ai.vercel.app";
const region = "ap-south-1";

function loadToken() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN.");
    console.error("Create one at https://supabase.com/dashboard/account/tokens");
    console.error('Then run: $env:SUPABASE_ACCESS_TOKEN="sbp_..."; npm run bootstrap:supabase');
    process.exit(1);
  }
  return token;
}

async function api(token, path, options = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : typeof data === "string"
          ? data
          : `HTTP ${res.status}`;
    throw new Error(`${path} failed: ${message}`);
  }
  return data;
}

function generateDbPassword() {
  return randomBytes(24).toString("base64url");
}

function upsertEnvLine(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (regex.test(content)) {
    return content.replace(regex, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

function updateEnvFile(updates) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    content = upsertEnvLine(content, key, value);
  }
  writeFileSync(envPath, content, "utf8");
}

function isActiveStatus(status) {
  const s = String(status ?? "").toUpperCase();
  return (
    s === "ACTIVE_HEALTHY" ||
    s === "ACTIVE" ||
    s === "COMING_UP" ||
    s === "RESTORING" ||
    s === "UNKNOWN"
  );
}

async function waitForHealthy(token, ref) {
  const deadline = Date.now() + 12 * 60 * 1000;
  while (Date.now() < deadline) {
    try {
      const health = await api(token, `/projects/${ref}/health?services=db`);
      const items = Array.isArray(health) ? health : [health];
      const healthy = items.some(
        (h) =>
          h?.status === "ACTIVE_HEALTHY" ||
          h?.healthy === true ||
          h?.name === "db" && String(h?.status ?? "").includes("ACTIVE"),
      );
      if (healthy) return;
    } catch {
      // Project may still be provisioning — also check project status
    }

    try {
      const project = await api(token, `/projects/${ref}`);
      if (String(project.status ?? "").toUpperCase() === "ACTIVE_HEALTHY") {
        return;
      }
      process.stdout.write(`(${project.status ?? "pending"})`);
    } catch {
      process.stdout.write(".");
    }

    await new Promise((r) => setTimeout(r, 15000));
  }
  throw new Error("Project did not become healthy within 12 minutes");
}

async function getApiKeys(token, ref) {
  const keys = await api(token, `/projects/${ref}/api-keys`);
  const list = Array.isArray(keys) ? keys : [];
  const anon =
    list.find((k) => k.name === "anon" || k.tags?.includes?.("anon"))?.api_key ??
    keys?.anon;
  const service =
    list.find((k) => k.name === "service_role" || k.tags?.includes?.("service_role"))
      ?.api_key ?? keys?.service_role;

  if (!anon) {
    throw new Error("Could not fetch anon/publishable API key");
  }
  return { anon, service };
}

async function configureAuth(token, ref) {
  try {
    await api(token, `/projects/${ref}/config/auth`, {
      method: "PATCH",
      body: JSON.stringify({
        site_url: siteUrl,
        uri_allow_list: `${siteUrl}/auth/callback,http://localhost:3000/auth/callback`,
      }),
    });
    console.log("Auth URLs configured.");
  } catch (error) {
    console.warn(
      "Could not auto-configure auth URLs:",
      error instanceof Error ? error.message : error,
    );
    console.warn("Set manually in Supabase → Authentication → URL Configuration.");
  }
}

async function restoreIfPossible(token, ref) {
  try {
    await api(token, `/projects/${ref}/restore`, { method: "POST", body: "{}" });
    console.log(`Requested restore for ${ref}`);
    return true;
  } catch (error) {
    console.log(
      `Could not restore ${ref}:`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

async function createProject(token, org, name, dbPassword) {
  return api(token, "/projects", {
    method: "POST",
    body: JSON.stringify({
      name,
      organization_slug: org.slug ?? org.id,
      db_pass: dbPassword,
      region,
      desired_instance_size: "micro",
    }),
  });
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: projectRoot, stdio: "inherit", shell: true });
}

async function main() {
  const token = loadToken();

  console.log("Fetching organizations...");
  const orgs = await api(token, "/organizations");
  if (!orgs?.length) {
    throw new Error("No Supabase organizations found on this account.");
  }
  const org = orgs[0];
  console.log(`Using organization: ${org.name} (${org.slug ?? org.id})`);

  const projects = await api(token, "/projects");
  console.log(
    `Found ${projects.length} project(s):`,
    projects.map((p) => `${p.name}:${p.status}`).join(", ") || "(none)",
  );

  const dbPassword = generateDbPassword();
  let project = null;
  let passwordKnown = true;

  // Prefer an already-active project named scholargenie-ai
  const existingActive = projects.find(
    (p) =>
      (p.name === "scholargenie-ai" || p.name === "scholargenie-ai-prod") &&
      isActiveStatus(p.status) &&
      String(p.status).toUpperCase() === "ACTIVE_HEALTHY",
  );

  if (existingActive) {
    project = existingActive;
    passwordKnown = false;
    console.log(`Reusing healthy project: ${project.id ?? project.ref}`);
  } else {
    // Try restore inactive scholargenie-ai first
    const inactive = projects.find((p) => p.name === "scholargenie-ai");
    if (inactive && String(inactive.status).toUpperCase().includes("INACTIVE")) {
      const restored = await restoreIfPossible(token, inactive.id ?? inactive.ref);
      if (restored) {
        project = inactive;
        passwordKnown = false;
      }
    }
  }

  if (!project) {
    const name = projects.some((p) => p.name === "scholargenie-ai")
      ? `scholargenie-ai-${Date.now().toString(36).slice(-4)}`
      : "scholargenie-ai";

    console.log(`Creating project "${name}" in ${region}...`);
    try {
      project = await createProject(token, org, name, dbPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Fallback if org slug field differs
      if (message.includes("organization")) {
        project = await api(token, "/projects", {
          method: "POST",
          body: JSON.stringify({
            name,
            organization_id: org.id,
            db_pass: dbPassword,
            region,
          }),
        });
      } else {
        throw error;
      }
    }
  }

  const ref = project.ref ?? project.id;
  console.log(`Project ref: ${ref}`);
  console.log("Waiting for project to become healthy (up to 12 min)...");
  await waitForHealthy(token, ref);
  console.log("\nProject is healthy.");

  const { anon, service } = await getApiKeys(token, ref);
  const supabaseUrl = `https://${ref}.supabase.co`;

  const envUpdates = {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anon,
    SUPABASE_DB_REGION: region,
    SUPABASE_DB_POOLER: "aws-1",
    NEXT_PUBLIC_SITE_URL: siteUrl,
    ...(service ? { SUPABASE_SERVICE_ROLE_KEY: service } : {}),
  };
  if (passwordKnown) {
    envUpdates.SUPABASE_DB_PASSWORD = dbPassword;
  }
  updateEnvFile(envUpdates);
  console.log(`Updated ${envPath}`);

  if (!passwordKnown) {
    console.warn(
      "Reused an existing project — keep existing SUPABASE_DB_PASSWORD or set the known DB password in .env.local before migrations.",
    );
  }

  await configureAuth(token, ref);

  // Reset migrations ledger for a brand-new project
  if (passwordKnown) {
    const ledgerPath = resolve(projectRoot, "supabase/migrations/.migrations_applied.json");
    writeFileSync(ledgerPath, "[]\n", "utf8");
  }

  run("npm run db:migrate");
  run("npm run db:seed");
  run("npm run db:seed-more");
  run("npm run db:seed-phase5");
  run("npm run db:seed-phase11");
  run("npm run check:setup");
  run(`npm run vercel:env ${siteUrl}`);

  console.log(`
Bootstrap complete!

Supabase URL: ${supabaseUrl}
Dashboard:    https://supabase.com/dashboard/project/${ref}

Verify production: ${siteUrl}/api/health
`);
}

main().catch((error) => {
  console.error("\nBootstrap failed:", error.message);
  process.exit(1);
});
