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

const EXTRA_SCHOLARSHIPS = [
  ["New Zealand Manaaki Scholarship", "New Zealand", "fully_funded", "2026-08-01"],
  ["DAAD Study Scholarships Germany", "Germany", "fully_funded", "2026-06-15"],
  ["Holland Scholarship", "Netherlands", "partial", "2026-05-01"],
  ["Erasmus Mundus Joint Masters", "Netherlands", "fully_funded", "2026-01-15"],
  ["University of Auckland International Excellence", "New Zealand", "merit", "2026-10-01"],
  ["UBC International Leader of Tomorrow", "Canada", "merit", "2026-11-15"],
  ["Gates Cambridge Scholarship", "United Kingdom", "fully_funded", "2026-10-10"],
  ["Rhodes Scholarship", "United Kingdom", "fully_funded", "2026-08-31"],
  ["Fulbright Canada", "Canada", "fully_funded", "2026-09-15"],
  ["AAUW International Fellowship", "United States", "merit", "2026-11-01"],
  ["Stanford Knight-Hennessy", "United States", "fully_funded", "2026-10-08"],
  ["ETH Excellence Scholarship", "Germany", "merit", "2026-12-15"],
  ["TU Delft Justus & Louise van Effen", "Netherlands", "fully_funded", "2026-02-01"],
  ["University of Sydney VC Scholarship", "Australia", "merit", "2026-09-30"],
  ["Australia RTP Scholarship", "Australia", "fully_funded", "2026-04-30"],
  ["MEXT Research Scholarship Japan", "Australia", "fully_funded", "2026-05-31"],
  ["Swedish Institute Scholarships", "Germany", "fully_funded", "2026-02-10"],
  ["Eiffel Excellence Scholarship", "Germany", "fully_funded", "2026-01-08"],
  ["British Council GREAT Scholarships", "United Kingdom", "partial", "2026-04-15"],
  ["University of Toronto Lester B. Pearson", "Canada", "fully_funded", "2026-11-07"],
];

const EXTRA_UNIVERSITIES = [
  ["University of Auckland", "New Zealand", "Auckland", 26000, 38000, 2.9, 6.5],
  ["TU Delft", "Netherlands", "Delft", 18000, 22000, 3.0, 6.5],
  ["University of Amsterdam", "Netherlands", "Amsterdam", 16000, 20000, 3.0, 6.5],
  ["LMU Munich", "Germany", "Munich", 0, 3000, 3.0, 6.5],
  ["Heidelberg University", "Germany", "Heidelberg", 0, 3500, 3.1, 6.5],
  ["University of Otago", "New Zealand", "Dunedin", 24000, 35000, 2.8, 6.0],
  ["University of Alberta", "Canada", "Edmonton", 20000, 32000, 3.0, 6.5],
  ["University of Oxford", "United Kingdom", "Oxford", 45000, 55000, 3.6, 7.0],
  ["University of Cambridge", "United Kingdom", "Cambridge", 44000, 54000, 3.7, 7.0],
  ["Harvard University", "United States", "Cambridge", 55000, 60000, 3.8, 7.0],
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

  let added = 0;
  for (const [name, country, funding, deadline] of EXTRA_SCHOLARSHIPS) {
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
        "https://scholargenie-ai.vercel.app/scholarships",
        ["bsc", "msc", "phd"],
        ["computer science", "engineering"],
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Scholarships: added ${added}`);

  added = 0;
  for (const [name, country, city, min, max, gpa, ielts] of EXTRA_UNIVERSITIES) {
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
        ["computer science", "engineering", "data science"],
        "https://scholargenie-ai.vercel.app/universities",
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Universities: added ${added}`);

  const { rows: uniRows } = await client.query("select id, name from universities");
  const uniByName = new Map(uniRows.map((u) => [u.name, u.id]));

  const profTemplates = [
    ["Dr. Nina Kowalski", "TU Delft", "Cybersecurity"],
    ["Prof. Lars Berg", "LMU Munich", "Data Science"],
    ["Dr. Emma Walsh", "University of Auckland", "Computer Science"],
    ["Prof. Raj Patel", "University of Alberta", "Machine Learning"],
    ["Dr. Yuki Tanaka", "University of Amsterdam", "AI"],
  ];

  added = 0;
  for (const [name, uni, field] of profTemplates) {
    const ok = await insertIfMissing(
      client,
      "professors",
      name,
      `insert into professors (name, university_id, department, email, research_areas, accepts_msc, accepts_phd)
       values ($1, $2, $3, $4, $5, true, true)`,
      [
        name,
        uniByName.get(uni) ?? null,
        "Faculty of Science",
        `${name.toLowerCase().replace(/[^a-z]/g, ".")}@university.edu`,
        [field.toLowerCase(), "computer science"],
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Professors: added ${added}`);

  await client.end();
  console.log("Phase 5 seed complete.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
