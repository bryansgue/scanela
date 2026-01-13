import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "lib/supabaseServer";
import { normalizeLogoUrl } from "@/lib/logoUtils";

const MAX_RECENT_BUSINESSES = 10;
const FETCH_MULTIPLIER = 3;

type MenuRow = {
  menu_data?: {
    businessLogo?: string | null;
  } | null;
};

type BusinessRow = {
  id: number;
  name: string;
  logo?: string | null;
  created_at: string;
  menus?: MenuRow[] | null;
};

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const [{ data: recentBusinesses, error: recentError }, { count: activeBusinesses, error: countError }] = await Promise.all([
      supabase
        .from("businesses")
        .select(
          `id, name, logo, created_at, menus ( menu_data )`
        )
        .order("created_at", { ascending: false })
        .limit(MAX_RECENT_BUSINESSES * FETCH_MULTIPLIER),
      supabase.from("businesses").select("id", { count: "exact", head: true }),
    ]);

    if (recentError) throw recentError;
    if (countError) throw countError;

    const sanitizedBusinesses = (recentBusinesses as BusinessRow[] | null | undefined)
      ?.map((business) => {
        if (!business) return null;

        const menuLogos = Array.isArray(business.menus)
          ? business.menus
              .map((menu) => menu?.menu_data?.businessLogo)
              .filter((value): value is string => typeof value === "string")
          : [];

        const firstValidMenuLogo = menuLogos.find((logo) => normalizeLogoUrl(logo));
        const normalizedLogo =
          normalizeLogoUrl(firstValidMenuLogo ?? null) ??
          normalizeLogoUrl(typeof business.logo === "string" ? business.logo : null);

        if (!normalizedLogo) return null;

        return {
          id: business.id,
          name: business.name,
          created_at: business.created_at,
          logo: normalizedLogo,
        };
      })
      .filter((business): business is NonNullable<typeof business> => Boolean(business))
      .slice(0, MAX_RECENT_BUSINESSES);

    return NextResponse.json(
      {
        activeBusinesses: activeBusinesses ?? 0,
        latestBusinesses: sanitizedBusinesses ?? [],
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
