import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, parseJson, positiveInt, requireUser } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/api/rate-limit";

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(3000),
  visibility: z.enum(["public", "network"]).default("public")
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = positiveInt(url.searchParams.get("limit"), 20, 50);
    const page = Math.max(1, positiveInt(url.searchParams.get("page"), 1, 100000));
    const supabase = await createSupabaseServerClient();

    const { data, error, count } = await supabase
      .from("posts")
      .select(
        "id, content, visibility, author_id, created_at, updated_at, author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url, primary_sport, is_verified), media:post_media(id, url, storage_path, media_type, sort_order)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error("Could not load feed.");

    const posts = await Promise.all((data ?? []).map(async (post) => {
      const media = await Promise.all((post.media ?? []).map(async (item) => {
        if (!item.storage_path) return item;
        const { data: signedData, error: signedError } = await supabase
          .storage.from("post-media").createSignedUrl(item.storage_path, 3600);
        return {
          ...item,
          url: signedError ? null : signedData.signedUrl,
          signedUrlExpiresIn: signedError ? null : 3600
        };
      }));
      return { ...post, media };
    }));

    return NextResponse.json({
      posts,
      page,
      limit,
      total: count ?? 0,
      hasMore: (page * limit) < (count ?? 0)
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await parseJson(request, createPostSchema);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        content: body.content,
        visibility: body.visibility
      })
      .select("id, content, visibility, author_id, created_at, updated_at")
      .single();

    if (error) throw new Error("Could not create post.");
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
