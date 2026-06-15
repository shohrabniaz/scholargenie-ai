import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

function loadEnvFile() {
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

async function insertIfMissing(client, table, nameColumn, row, insertSql, values) {
  const { rows } = await client.query(
    `select id from ${table} where ${nameColumn} = $1 limit 1`,
    [row[nameColumn] ?? row.name],
  );
  if (rows.length > 0) {
    return false;
  }
  await client.query(insertSql, values);
  return true;
}

async function main() {
  loadEnvFile();

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("Missing SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  let added = 0;

  const scholarships = JSON.parse(
    readFileSync(resolve(__dirname, "data/scholarships-extra.json"), "utf8"),
  );
  for (const s of scholarships) {
    const inserted = await insertIfMissing(
      client,
      "scholarships",
      "name",
      s,
      `insert into scholarships (
        name, country, university, degree_levels, fields,
        funding_type, amount_description, deadline, eligibility, source_url
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        s.name,
        s.country,
        s.university,
        s.degree_levels,
        s.fields,
        s.funding_type,
        s.amount_description,
        s.deadline,
        s.eligibility,
        s.source_url,
      ],
    );
    if (inserted) added += 1;
  }
  console.log(`Scholarships: added ${added} new rows.`);

  added = 0;
  const universities = JSON.parse(
    readFileSync(resolve(__dirname, "data/universities-extra.json"), "utf8"),
  );
  for (const u of universities) {
    const inserted = await insertIfMissing(
      client,
      "universities",
      "name",
      u,
      `insert into universities (
        name, country, city, website, tuition_usd_min, tuition_usd_max,
        min_gpa, min_ielts, degree_levels, fields
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        u.name,
        u.country,
        u.city,
        u.website,
        u.tuition_usd_min,
        u.tuition_usd_max,
        u.min_gpa,
        u.min_ielts,
        u.degree_levels,
        u.fields,
      ],
    );
    if (inserted) added += 1;
  }
  console.log(`Universities: added ${added} new rows.`);

  const { rows: uniRows } = await client.query(
    "select id, name from universities",
  );
  const uniByName = new Map(uniRows.map((u) => [u.name, u.id]));

  added = 0;
  const professors = JSON.parse(
    readFileSync(resolve(__dirname, "data/professors-extra.json"), "utf8"),
  );
  for (const p of professors) {
    const inserted = await insertIfMissing(
      client,
      "professors",
      "name",
      p,
      `insert into professors (
        name, university_id, department, email, research_areas,
        website, accepts_msc, accepts_phd
      ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        p.name,
        uniByName.get(p.university_name) ?? null,
        p.department,
        p.email,
        p.research_areas,
        p.website,
        p.accepts_msc,
        p.accepts_phd,
      ],
    );
    if (inserted) added += 1;
  }
  console.log(`Professors: added ${added} new rows.`);

  await client.end();
  console.log("Expand seed complete.");
}

main().catch((error) => {
  console.error("Expand seed failed:", error.message);
  process.exit(1);
});
