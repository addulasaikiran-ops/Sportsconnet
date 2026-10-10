import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, parseJson, positiveInt, requireUser } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const opportunitySchema = z.object({
  title: z.string().trim().min(5).max(160),
  organization: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(5000),
  sport: z.string().trim().min(2).max(80),
  type: z.enum(["trial", "scholarship", "scouting", "camp", "training_program", "competition", "other"]),
  location: z.string().max(180).default(""),
  deadline: z.string().date().nullable().optional(),
  status: z.enum(["draft", "published"]).default("published")
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = positiveInt(url.searchParams.get("limit"), 20, 50);
    const page = Math.max(1, positiveInt(url.searchParams.get("page"), 1, 100000));
    const sport = url.searchParams.get("sport");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("q")?.trim().slice(0, 100);
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("opportunities")
      .select("id, created_by, title, organization, description, sport, type, location, deadline, status, created_at, creator:profiles!opportunities_created_by_fkey(id, username, full_name, avatar_url, is_verified)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (sport) query = query.ilike("sport", sport.slice(0, 80));
    if (type && ["trial", "scholarship", "scouting", "camp", "training_program", "competition", "other"].includes(type)) {
      query = query.eq("type", type);
    }
    if (search) query = query.or("title.ilike.%"+search.replace(/[^a-zA-Z0-9 _-]/g, " ")+"%,organization.ilike.%"+search.replace(/[,%()]/g, " ")+"%");

    const { data, error, count } = await query;
    if (error) throw new Error("Could not load opportunities.");
    return NextResponse.json({
      opportunities: data ?? [],
      page,
      limit,
      total: count ?? 0,
      hasMore: page * limit < (count ?? 0)
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await parseJson(request, opportunitySchema);

    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        created_by: user.id,
        title: body.title,
        organization: body.organization,
        description: body.description,
        sport: body.sport,
        type: body.type,
        location: body.location,
        deadline: body.deadline ?? null,
        status: body.status
      })
      .select("id, created_by, title, organization, description, sport, type, location, deadline, status, created_at")
      .single();

    if (error) throw new Error("Could not create opportunity.");
    return NextResponse.json({ opportunity: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
