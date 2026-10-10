import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiErrorResponse, isUuid } from "@/lib/api/http";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const field = isUuid(userId) ? "id" : "username";
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, bio, location, primary_sport, avatar_url, is_verified, created_at")
      .eq(field, userId)
      .maybeSingle();

    if (error) throw new Error("Could not load profile.");
    if (!data) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ profile: data }, {\n      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" }\n    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
