import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, requireUser } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ opportunityId: string }> };
const updateSchema = z.object({
  title: z.string().trim().min(5).max(160).optional(),
  organization: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  sport: z.string().trim().min(2).max(80).optional(),
  type: z.enum(["trial", "scholarship", "scouting", "camp", "training_program", "competition", "other"]).optional(),
  location: z.string().max(180).optional(),
  deadline: z.string().date().nullable().optional(),
  status: z.enum(["draft", "published", "closed"]).optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one opportunity field to update."
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { opportunityId } = await context.params;
    if (!isUuid(opportunityId)) return NextResponse.json({ error: "Invalid opportunity ID." }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, created_by, title, organization, description, sport, type, location, deadline, status, created_at, updated_at, creator:profiles!opportunities_created_by_fkey(id, username, full_name, avatar_url, is_verified)")
      .eq("id", opportunityId)
      .maybeSingle();

    if (error) throw new Error("Could not load opportunity.");
    if (!data) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
    return NextResponse.json({ opportunity: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { opportunityId } = await context.params;
    if (!isUuid(opportunityId)) return NextResponse.json({ error: "Invalid opportunity ID." }, { status: 400 });
    const { supabase } = await requireUser();
    const body = await parseJson(request, updateSchema);
    const { data, error } = await supabase
      .from("opportunities")
      .update(body)
      .eq("id", opportunityId)
      .select("id, created_by, title, organization, description, sport, type, location, deadline, status, created_at, updated_at")
      .maybeSingle();

    if (error) throw new Error("Could not update opportunity.");
    if (!data) return NextResponse.json({ error: "Opportunity not found or you are not its owner." }, { status: 404 });
    return NextResponse.json({ opportunity: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { opportunityId } = await context.params;
    if (!isUuid(opportunityId)) return NextResponse.json({ error: "Invalid opportunity ID." }, { status: 400 });
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", opportunityId)
      .select("id")
      .maybeSingle();

    if (error) throw new Error("Could not delete opportunity.");
    if (!data) return NextResponse.json({ error: "Opportunity not found or you are not its owner." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
