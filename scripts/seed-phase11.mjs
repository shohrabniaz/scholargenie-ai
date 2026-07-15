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
  ["Australia Awards Scholarships", "Australia", "fully_funded", "2026-04-30", ["bsc", "msc", "phd"], ["computer science", "cybersecurity", "data science"]],
  ["Destination Australia Scholarship", "Australia", "partial", "2026-11-30", ["bsc", "msc"], ["engineering", "computer science"]],
  ["Monash International Merit Scholarship", "Australia", "merit", "2026-10-15", ["bsc", "msc"], ["computer science", "data science"]],
  ["ANU Chancellor's International Scholarship", "Australia", "merit", "2026-09-01", ["bsc", "msc", "phd"], ["computer science", "ai"]],
  ["Ontario Graduate Scholarship", "Canada", "merit", "2026-10-01", ["msc", "phd"], ["computer science", "engineering"]],
  ["Trudeau Foundation Scholarships", "Canada", "fully_funded", "2026-12-01", ["phd"], ["public policy", "data science"]],
  ["McGill Graduate Excellence Fellowship", "Canada", "merit", "2026-01-15", ["msc", "phd"], ["computer science", "ai"]],
  ["Chevening Scholarships", "United Kingdom", "fully_funded", "2026-11-05", ["msc"], ["cybersecurity", "public policy", "data science"]],
  ["Commonwealth Shared Scholarships", "United Kingdom", "fully_funded", "2026-12-12", ["msc"], ["computer science", "engineering"]],
  ["Imperial College President's Scholarship", "United Kingdom", "merit", "2026-01-20", ["msc", "phd"], ["computer science", "ai"]],
  ["UCL Global Masters Scholarship", "United Kingdom", "partial", "2026-04-01", ["msc"], ["computer science", "data science"]],
  ["Fulbright Foreign Student Program", "United States", "fully_funded", "2026-10-15", ["msc", "phd"], ["computer science", "cybersecurity"]],
  ["Google PhD Fellowship", "United States", "fully_funded", "2026-11-30", ["phd"], ["ai", "machine learning", "computer science"]],
  ["Microsoft Research PhD Fellowship", "United States", "fully_funded", "2026-09-15", ["phd"], ["ai", "cybersecurity"]],
  ["NSF Graduate Research Fellowship", "United States", "fully_funded", "2026-10-20", ["msc", "phd"], ["computer science", "engineering"]],
  ["DAAD Helmut-Schmidt Programme", "Germany", "fully_funded", "2026-07-31", ["msc"], ["public policy", "data science"]],
  ["Deutschlandstipendium", "Germany", "partial", "2026-08-15", ["bsc", "msc"], ["computer science", "engineering"]],
  ["Orange Knowledge Programme", "Netherlands", "fully_funded", "2026-03-30", ["msc"], ["cybersecurity", "data science"]],
  ["Leiden University Excellence Scholarship", "Netherlands", "merit", "2026-02-01", ["msc"], ["computer science", "ai"]],
  ["University of Twente Scholarship", "Netherlands", "merit", "2026-05-01", ["msc"], ["computer science", "cybersecurity"]],
  ["University of Canterbury International Scholarship", "New Zealand", "merit", "2026-08-15", ["bsc", "msc"], ["computer science", "engineering"]],
  ["Victoria University of Wellington Tongarewa", "New Zealand", "partial", "2026-09-01", ["bsc", "msc"], ["computer science", "data science"]],
  ["QS Scholarship for Academic Excellence", "United Kingdom", "merit", "2026-06-30", ["bsc", "msc"], ["computer science", "ai"]],
  ["Joint Japan World Bank Graduate Scholarship", "United States", "fully_funded", "2026-05-12", ["msc"], ["public policy", "data science"]],
  ["ADB-Japan Scholarship Program", "Japan", "fully_funded", "2026-07-01", ["msc"], ["engineering", "computer science"]],
];

const EXTRA_UNIVERSITIES = [
  ["Monash University", "Australia", "Melbourne", 28000, 42000, 3.0, 6.5],
  ["Australian National University", "Australia", "Canberra", 30000, 45000, 3.2, 6.5],
  ["McGill University", "Canada", "Montreal", 22000, 38000, 3.2, 6.5],
  ["University of Waterloo", "Canada", "Waterloo", 28000, 42000, 3.3, 7.0],
  ["Imperial College London", "United Kingdom", "London", 38000, 48000, 3.5, 7.0],
  ["UCL", "United Kingdom", "London", 32000, 42000, 3.3, 6.5],
  ["Carnegie Mellon University", "United States", "Pittsburgh", 52000, 62000, 3.6, 7.0],
  ["Georgia Institute of Technology", "United States", "Atlanta", 32000, 42000, 3.4, 7.0],
  ["Technical University of Munich", "Germany", "Munich", 0, 3000, 3.0, 6.5],
  ["Eindhoven University of Technology", "Netherlands", "Eindhoven", 16000, 20000, 3.0, 6.5],
];

const PROF_TEMPLATES = [
  ["Dr. Amina Rahman", "Monash University", ["cybersecurity", "privacy", "network security"]],
  ["Prof. Daniel Cho", "Australian National University", ["machine learning", "ai", "computer vision"]],
  ["Dr. Sofia Mendes", "McGill University", ["data science", "nlp", "ai"]],
  ["Prof. Helen Park", "University of Waterloo", ["cybersecurity", "cryptography"]],
  ["Dr. Omar Hassan", "Imperial College London", ["ai", "robotics", "machine learning"]],
  ["Prof. Claire Dubois", "UCL", ["data science", "human-computer interaction"]],
  ["Dr. Marcus Lee", "Carnegie Mellon University", ["cybersecurity", "software security"]],
  ["Prof. Priya Nair", "Georgia Institute of Technology", ["machine learning", "data science"]],
  ["Dr. Jonas Weber", "Technical University of Munich", ["ai", "computer science"]],
  ["Prof. Ingrid de Vries", "Eindhoven University of Technology", ["cybersecurity", "embedded systems"]],
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
  for (const [name, country, funding, deadline, degrees, fields] of EXTRA_SCHOLARSHIPS) {
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
        ["computer science", "cybersecurity", "data science", "ai"],
        "https://scholargenie-ai.vercel.app/universities",
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Universities: added ${added}`);

  const { rows: uniRows } = await client.query("select id, name from universities");
  const uniByName = new Map(uniRows.map((u) => [u.name, u.id]));

  added = 0;
  for (const [name, uni, areas] of PROF_TEMPLATES) {
    const ok = await insertIfMissing(
      client,
      "professors",
      name,
      `insert into professors (name, university_id, department, email, research_areas, accepts_msc, accepts_phd)
       values ($1, $2, $3, $4, $5, true, true)`,
      [
        name,
        uniByName.get(uni) ?? null,
        "School of Computing",
        `${name.toLowerCase().replace(/[^a-z]/g, ".")}@university.edu`,
        areas,
      ],
    );
    if (ok) added += 1;
  }
  console.log(`Professors: added ${added}`);

  await client.end();
  console.log("Phase 11 seed complete.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
