import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiErrorResponse, positiveInt } from "@/lib/api/http";
import { enforceRateLimit } from "@/lib/api/rate-limit";

export async function GET(request: Request) {
  try {
    const limited = await enforceRateLimit(request, { name: "profile-search", limit: 60, window: "1 m", scope: "ip", key: "" });
    if (limited) return limited;
    const url = new URL(request.url);
    const limit = positiveInt(url.searchParams.get("limit"), 20, 50);
    const page = Math.max(1, positiveInt(url.searchParams.get("page"), 1, 100000));
    const search = url.searchParams.get("q")?.trim().replace(/[^a-zA-Z0-9 _-]/g, " ").slice(0, 80);
    const sport = url.searchParams.get("sport")?.trim().slice(0, 80);
    const role = url.searchParams.get("role");
    const location = url.searchParams.get("location")?.trim().slice(0, 120);
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("profiles")
      .select("id, username, full_name, role, bio, location, primary_sport, avatar_url, is_verified, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or("full_name.ilike.%"+search+"%,username.ilike.%"+search+"%,primary_sport.ilike.%"+search+"%");
    }
    if (sport) query = query.ilike("primary_sport", sport);
    if (location) query = query.ilike("location", "%"+location+"%");
    if (role && ["athlete", "coach", "club", "association"].includes(role)) query = query.eq("role", role);

    const { data, error, count } = await query;
    if (error) throw new Error("Could not discover profiles.");

    return NextResponse.json({
      profiles: data ?? [],
      page,
      limit,
      total: count ?? 0,
      hasMore: page * limit < (count ?? 0)
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
