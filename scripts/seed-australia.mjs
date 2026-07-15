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
  const password = process.env.SUPABASE_DB_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!password || !url) return null;
  const ref = url.replace("https://", "").replace(".supabase.co", "");
  const region = process.env.SUPABASE_DB_REGION ?? "ap-south-1";
  const pooler = process.env.SUPABASE_DB_POOLER ?? "aws-1";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${pooler}-${region}.pooler.supabase.com:5432/postgres`;
}

const FIX_COUNTRIES = [
  ["MEXT Research Scholarship Japan", "Japan"],
  ["ADB-Japan Scholarship Program", "Japan"],
];

const SCHOLARSHIPS = [
  [
    "University of Queensland Destination Scholarship",
    "Australia",
    "merit",
    "2026-10-31",
    ["bsc", "msc"],
    ["computer science", "engineering", "data science"],
  ],
  [
    "QUT International Merit Scholarship",
    "Australia",
    "merit",
    "2026-09-15",
    ["bsc", "msc"],
    ["cybersecurity", "computer science", "ai"],
  ],
  [
    "Deakin Vice-Chancellor's International Scholarship",
    "Australia",
    "merit",
    "2026-11-15",
    ["bsc", "msc", "phd"],
    ["computer science", "data science"],
  ],
  [
    "Endeavour Leadership Program (legacy reference — check current DFAT schemes)",
    "Australia",
    "fully_funded",
    "2026-06-30",
    ["msc", "phd"],
    ["public health", "computer science", "engineering"],
  ],
];

const UNIVERSITIES = [
  ["University of Queensland", "Australia", "Brisbane", 26000, 42000, 3.0, 6.5],
  ["Queensland University of Technology", "Australia", "Brisbane", 24000, 38000, 2.8, 6.5],
  ["RMIT University", "Australia", "Melbourne", 25000, 40000, 2.8, 6.5],
];

const PROFESSORS = [
  ["Prof. Helen Park", "Australian National University", ["ai", "machine learning", "nlp"]],
  ["Dr. Samuel Ortiz", "Deakin University", ["cybersecurity", "networks"]],
  ["Prof. Mei Lin", "University of Queensland", ["data science", "bioinformatics"]],
  ["Dr. Freya Collins", "Queensland University of Technology", ["cybersecurity", "software engineering"]],
  ["Prof. Rajiv Mehta", "RMIT University", ["computer science", "hci"]],
  ["Dr. Olivia Grant", "University of Adelaide", ["public health", "epidemiology"]],
];

async function insertIfMissing(client, table, name, insertSql, values) {
  const { rows } = await client.query(
    `select id from ${table} where name = $1 limit 1`,
    [name],
  );
  if (rows.length > 0) return false;
  await client.query(insertSql, values);
  return true;
}

async function main() {
  loadEnvFile();
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("Missing SUPABASE_DB_PASSWORD");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  for (const [name, country] of FIX_COUNTRIES) {
    const { rowCount } = await client.query(
      `update scholarships set country = $2 where name = $1 and country is distinct from $2`,
      [name, country],
    );
    if (rowCount) console.log(`Fixed country: ${name} → ${country}`);
  }

  let added = 0;
  for (const [name, country, funding, deadline, degrees, fields] of SCHOLARSHIPS) {
    const ok = await insertIfMissing(
      client,
      "scholarships",
      name,
      `insert into scholarships (name, country, funding_type, amount_description, deadline, source_url, degree_levels, fields)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        name,
        country,
        funding,
        "See official page for award details",
        deadline,
        "https://scholargenie-ai.vercel.app/scholarships?country=Australia",
        degrees,
        fields,
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Scholarships added: ${added}`);

  added = 0;
  for (const [name, country, city, min, max, gpa, ielts] of UNIVERSITIES) {
    const ok = await insertIfMissing(
      client,
      "universities",
      name,
      `insert into universities (name, country, city, tuition_usd_min, tuition_usd_max, min_gpa, min_ielts, degree_levels, fields, website)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        name,
        country,
        city,
        min,
        max,
        gpa,
        ielts,
        ["bsc", "msc", "phd"],
        ["computer science", "cybersecurity", "data science", "ai", "engineering"],
        "https://scholargenie-ai.vercel.app/universities?country=Australia",
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Universities added: ${added}`);

  const { rows: uniRows } = await client.query("select id, name from universities");
  const uniByName = new Map(uniRows.map((u) => [u.name, u.id]));

  added = 0;
  for (const [name, uni, areas] of PROFESSORS) {
    const ok = await insertIfMissing(
      client,
      "professors",
      name,
      `insert into professors (name, university_id, department, email, research_areas, accepts_msc, accepts_phd)
       values ($1, $2, $3, $4, $5, true, true)`,
      [
        name,
        uniByName.get(uni) ?? null,
        "Faculty of Science and Engineering",
        `${name.toLowerCase().replace(/[^a-z]/g, ".")}@university.edu`,
        areas,
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Professors added: ${added}`);

  const { rows: counts } = await client.query(`
    select
      (select count(*)::int from scholarships where country = 'Australia') as scholarships,
      (select count(*)::int from universities where country = 'Australia') as universities,
      (select count(*)::int from professors p
         join universities u on u.id = p.university_id
        where u.country = 'Australia') as professors
  `);
  console.log("Australia catalog:", counts[0]);

  await client.end();
  console.log("Australia seed complete.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
