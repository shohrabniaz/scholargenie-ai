import { NextResponse } from "next/server";
import { getSupabaseUrl } from "@/lib/supabase/env";

export async function GET() {
  const url = getSupabaseUrl();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, supabase: "missing_env" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${url}/rest/v1/scholarships?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, supabase: "api_error", status: res.status },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      supabase: "reachable",
      site: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    });
  } catch {
    return NextResponse.json(
      { ok: false, supabase: "unreachable" },
      { status: 503 },
    );
  }
}
