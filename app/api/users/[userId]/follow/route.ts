import { NextResponse } from "next/server";
import { apiErrorResponse, isUuid, requireUser } from "@/lib/api/http";

type RouteContext = { params: Promise<{ userId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    if (!isUuid(userId)) return NextResponse.json({ error: "Invalid profile ID." }, { status: 400 });

    const { supabase, user } = await requireUser();
    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot follow your own profile." }, { status: 400 });
    }

    const { error } = await supabase
      .from("follows")
      .upsert(
        { follower_id: user.id, following_id: userId },
        { onConflict: "follower_id,following_id", ignoreDuplicates: true }
      );

    if (error) {
      if (error.code === "23503") return NextResponse.json({ error: "Profile not found." }, { status: 404 });
      throw new Error("Could not follow this profile.");
    }

    return NextResponse.json({ following: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    if (!isUuid(userId)) return NextResponse.json({ error: "Invalid profile ID." }, { status: 400 });

    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", userId);

    if (error) throw new Error("Could not unfollow this profile.");
    return NextResponse.json({ following: false });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
