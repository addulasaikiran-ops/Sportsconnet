import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, positiveInt, requireUser } from "@/lib/api/http";

type RouteContext = { params: Promise<{ opportunityId: string }> };
const applicationSchema = z.object({
  coverNote: z.string().trim().max(2000).default("")
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { opportunityId } = await context.params;
    if (!isUuid(opportunityId)) {
      return NextResponse.json({ error: "Invalid opportunity ID." }, { status: 400 });
    }

    const { supabase } = await requireUser();
    const url = new URL(request.url);
    const limit = positiveInt(url.searchParams.get("limit"), 20, 50);
    const page = Math.max(1, positiveInt(url.searchParams.get("page"), 1, 100000));
    const { data, error, count } = await supabase
      .from("opportunity_applications")
      .select("id, opportunity_id, applicant_id, cover_note, status, created_at, applicant:profiles!opportunity_applications_applicant_id_fkey(id, username, full_name, avatar_url, primary_sport, is_verified)", { count: "exact" })
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error("Could not load applications.");
    return NextResponse.json({ applications: data ?? [], page, limit, total: count ?? 0 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { opportunityId } = await context.params;
    if (!isUuid(opportunityId)) {
      return NextResponse.json({ error: "Invalid opportunity ID." }, { status: 400 });
    }

    const { supabase, user } = await requireUser();
    const body = await parseJson(request, applicationSchema);
    const { data: opportunity, error: opportunityError } = await supabase
      .from("opportunities")
      .select("id, status, deadline")
      .eq("id", opportunityId)
      .maybeSingle();

    if (opportunityError) throw new Error("Could not verify opportunity.");
    if (!opportunity || opportunity.status !== "published") {
      return NextResponse.json({ error: "This opportunity is not accepting applications." }, { status: 404 });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (opportunity.deadline && opportunity.deadline < today) {
      return NextResponse.json({ error: "The application deadline has passed." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("opportunity_applications")
      .insert({
        opportunity_id: opportunityId,
        applicant_id: user.id,
        cover_note: body.coverNote
      })
      .select("id, opportunity_id, applicant_id, cover_note, status, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "You have already applied to this opportunity." }, { status: 409 });
      }
      throw new Error("Could not submit application.");
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
