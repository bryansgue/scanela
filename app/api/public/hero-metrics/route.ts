import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "lib/supabaseServer";

const MAX_RECENT_BUSINESSES = 10;

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const [{ data: recentBusinesses, error: recentError }, { count: activeBusinesses, error: countError }] = await Promise.all([
      supabase
        .from("businesses")
        .select("id, name, logo, created_at")
        .not("logo", "is", null)
        .neq("logo", "")
        .order("created_at", { ascending: false })
        .limit(MAX_RECENT_BUSINESSES),
      supabase.from("businesses").select("id", { count: "exact", head: true }),
    ]);

    if (recentError) throw recentError;
    if (countError) throw countError;

    return NextResponse.json(
      {
        activeBusinesses: activeBusinesses ?? 0,
        latestBusinesses: recentBusinesses ?? [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Hero metrics API error:", error);
    return NextResponse.json(
      {
        activeBusinesses: null,
        latestBusinesses: [],
      },
      { status: 500 }
    );
  }
}
