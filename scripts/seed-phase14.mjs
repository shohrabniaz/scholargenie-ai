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

/** Phase 14: Business + Public Health curriculum slices */
const SCHOLARSHIPS = [
  [
    "Chevening Business Leadership Award",
    "UK",
    "fully_funded",
    "2026-11-05",
    ["msc"],
    ["business", "management", "public policy"],
  ],
  [
    "Erasmus Mundus Joint Masters — Public Health",
    "Europe",
    "fully_funded",
    "2026-01-15",
    ["msc"],
    ["public health", "epidemiology"],
  ],
  [
    "Fulbright Business / MBA Enrichment",
    "USA",
    "fully_funded",
    "2026-10-15",
    ["msc", "phd"],
    ["business", "finance", "management"],
  ],
  [
    "DAAD Public Health Study Scholarships",
    "Germany",
    "fully_funded",
    "2026-10-31",
    ["msc", "phd"],
    ["public health", "health policy"],
  ],
  [
    "Australia Awards — Public Health Stream",
    "Australia",
    "fully_funded",
    "2026-04-30",
    ["msc", "phd"],
    ["public health", "global health"],
  ],
  [
    "Rotterdam School of Management Excellence Scholarship",
    "Netherlands",
    "merit",
    "2026-02-01",
    ["msc"],
    ["business", "management", "finance"],
  ],
];

const UNIVERSITIES = [
  ["London School of Hygiene & Tropical Medicine", "UK", "London", 22000, 32000, 3.0, 7.0],
  ["Johns Hopkins Bloomberg School of Public Health", "USA", "Baltimore", 40000, 65000, 3.3, 7.0],
  ["Rotterdam School of Management, Erasmus University", "Netherlands", "Rotterdam", 18000, 28000, 3.0, 6.5],
  ["HEC Paris", "France", "Jouy-en-Josas", 35000, 55000, 3.2, 7.0],
  ["University of Melbourne — Melbourne Business School", "Australia", "Melbourne", 28000, 45000, 3.0, 6.5],
  ["Karolinska Institutet", "Sweden", "Stockholm", 15000, 22000, 3.0, 6.5],
];

const PROFESSORS = [
  ["Prof. Amira Hassan", "London School of Hygiene & Tropical Medicine", ["public health", "epidemiology"]],
  ["Dr. Chen Wei", "Johns Hopkins Bloomberg School of Public Health", ["global health", "health systems"]],
  ["Prof. Lars Bergman", "Karolinska Institutet", ["public health", "biostatistics"]],
  ["Dr. Sophie Laurent", "HEC Paris", ["business", "strategy", "innovation"]],
  ["Prof. Mark Visser", "Rotterdam School of Management, Erasmus University", ["finance", "business analytics"]],
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
        "https://scholargenie-ai.vercel.app/scholarships",
        degrees,
        fields,
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Scholarships: added ${added}`);

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
        ["business", "public health", "management", "epidemiology", "global health"],
        "https://scholargenie-ai.vercel.app/universities",
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Universities: added ${added}`);

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
        areas.includes("business") || areas.includes("finance")
          ? "Business School"
          : "School of Public Health",
        `${name.toLowerCase().replace(/[^a-z]/g, ".")}@university.edu`,
        areas,
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Professors: added ${added}`);

  await client.end();
  console.log("Phase 14 Business / Public Health seed complete.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
