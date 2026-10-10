import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { apiErrorResponse, isUuid, requireUser } from "@/lib/api/http";
import { enforceRateLimit } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const avatarTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};
const postTypes: Record<string, { extension: string; mediaType: "image" | "video" }> = {
  "image/jpeg": { extension: "jpg", mediaType: "image" },
  "image/png": { extension: "png", mediaType: "image" },
  "image/webp": { extension: "webp", mediaType: "image" },
  "image/gif": { extension: "gif", mediaType: "image" },
  "video/mp4": { extension: "mp4", mediaType: "video" },
  "video/webm": { extension: "webm", mediaType: "video" },
  "video/quicktime": { extension: "mov", mediaType: "video" }
};

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const limited = await enforceRateLimit(request, { name: "upload", limit: 10, window: "1 h", scope: "user", key: user.id });
    if (limited) return limited;
    const form = await request.formData();
    const kind = form.get("kind");
    const candidate = form.get("file");
    const postId = form.get("postId");

    if (!(candidate instanceof File)) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }

    const file = candidate;
    if (kind === "avatar") {
      const extension = avatarTypes[file.type];
      if (!extension) {
        return NextResponse.json({ error: "Avatar must be a JPEG, PNG, WebP, or GIF image." }, { status: 400 });
      }
      if (file.size < 1 || file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Avatar files must be 5 MB or smaller." }, { status: 413 });
      }

      const path = `${user.id}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false
      });
      if (uploadError) throw new Error("Could not upload avatar.");

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicData.publicUrl })
        .eq("id", user.id);
      if (profileError) {
        await supabase.storage.from("avatars").remove([path]);
        throw new Error("Avatar uploaded, but the profile could not be updated.");
      }

      return NextResponse.json({ kind: "avatar", path, url: publicData.publicUrl }, { status: 201 });
    }

    if (kind !== "post-media" || typeof postId !== "string" || !isUuid(postId)) {
      return NextResponse.json({ error: "Choose avatar or post-media and provide a valid postId for post media." }, { status: 400 });
    }

    const mediaConfig = postTypes[file.type];
    if (!mediaConfig) {
      return NextResponse.json({ error: "Post media must be a supported image or video format." }, { status: 400 });
    }
    if (file.size < 1 || file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "Post media files must be 100 MB or smaller." }, { status: 413 });
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .eq("author_id", user.id)
      .maybeSingle();
    if (postError) throw new Error("Could not verify post ownership.");
    if (!post) return NextResponse.json({ error: "Post not found or not owned by you." }, { status: 404 });

    const path = `${user.id}/${postId}/${randomUUID()}.${mediaConfig.extension}`;
    const { error: uploadError } = await supabase.storage.from("post-media").upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false
    });
    if (uploadError) throw new Error("Could not upload post media.");

    const { data: media, error: mediaError } = await supabase
      .from("post_media")
      .insert({
        post_id: postId,
        url: path,
        storage_path: path,
        media_type: mediaConfig.mediaType
      })
      .select("id, post_id, url, media_type, sort_order, created_at")
      .single();

    if (mediaError) {
      await supabase.storage.from("post-media").remove([path]);
      throw new Error("Media uploaded, but it could not be attached to the post.");
    }

    const { data: signed, error: signedError } = await supabase
      .storage.from("post-media").createSignedUrl(path, 3600);
    if (signedError) {
      return NextResponse.json({ media, path, signedUrl: null }, { status: 201 });
    }

    return NextResponse.json({ media, path, signedUrl: signed.signedUrl }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
