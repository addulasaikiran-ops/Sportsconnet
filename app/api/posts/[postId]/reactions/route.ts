import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, requireUser } from "@/lib/api/http";

type RouteContext = { params: Promise<{ postId: string }> };
const reactionSchema = z.object({
  reactionType: z.enum(["like", "appreciate", "celebrate"]).default("like")
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    if (!isUuid(postId)) return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });

    const { supabase, user } = await requireUser();
    const body = await parseJson(request, reactionSchema);
    const { data, error } = await supabase
      .from("post_reactions")
      .upsert({
        post_id: postId,
        user_id: user.id,
        reaction_type: body.reactionType
      }, { onConflict: "post_id,user_id" })
      .select("post_id, user_id, reaction_type, created_at")
      .single();

    if (error) throw new Error("Could not save reaction.");
    return NextResponse.json({ reaction: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    if (!isUuid(postId)) return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });

    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) throw new Error("Could not remove reaction.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
