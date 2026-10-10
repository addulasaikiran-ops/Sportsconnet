import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, positiveInt, requireUser } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ postId: string }> };
const commentSchema = z.object({ content: z.string().trim().min(1).max(1500) });

export async function GET(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    if (!isUuid(postId)) return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
    const url = new URL(request.url);
    const limit = positiveInt(url.searchParams.get("limit"), 30, 100);
    const page = Math.max(1, positiveInt(url.searchParams.get("page"), 1, 100000));
    const supabase = await createSupabaseServerClient();

    const { data, error, count } = await supabase
      .from("comments")
      .select("id, post_id, author_id, content, created_at, author:profiles!comments_author_id_fkey(id, username, full_name, avatar_url, is_verified)", { count: "exact" })
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error("Could not load comments.");
    return NextResponse.json({ comments: data ?? [], page, limit, total: count ?? 0 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    if (!isUuid(postId)) return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
    const { supabase, user } = await requireUser();
    const body = await parseJson(request, commentSchema);

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: user.id, content: body.content })
      .select("id, post_id, author_id, content, created_at")
      .single();

    if (error) throw new Error("Could not add comment.");
    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
