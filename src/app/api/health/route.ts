import { NextResponse } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

async function countRows(url: string, key: string, table: string) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
    next: { revalidate: 60 },
  });
  const range = res.headers.get("content-range");
  const total = range?.split("/")[1];
  return total ? Number(total) : null;
}

export async function GET() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey()?.trim();

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, supabase: "missing_env" },
      { status: 503 },
    );
  }

  try {
    const probe = await fetch(`${url}/rest/v1/scholarships?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });

    if (!probe.ok) {
      return NextResponse.json(
        { ok: false, supabase: "api_error", status: probe.status },
        { status: 503 },
      );
    }

    const [scholarships, universities, professors] = await Promise.all([
      countRows(url, key, "scholarships"),
      countRows(url, key, "universities"),
      countRows(url, key, "professors"),
    ]);

    return NextResponse.json({
      ok: true,
      supabase: "reachable",
      site: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      counts: { scholarships, universities, professors },
    });
  } catch {
    return NextResponse.json(
      { ok: false, supabase: "unreachable" },
      { status: 503 },
    );
  }
}
