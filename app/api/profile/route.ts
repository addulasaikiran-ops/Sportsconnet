import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, parseJson, requireUser } from "@/lib/api/http";

const profileUpdateSchema = z.object({
  username: z.string().trim().min(3).max(50).regex(/^[a-z0-9_]+$/).optional(),
  full_name: z.string().trim().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(120).optional(),
  primary_sport: z.string().max(80).optional(),
  avatar_url: z.string().url().max(2048).nullable().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one profile field to update."
});

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, bio, location, primary_sport, avatar_url, is_verified, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw new Error("Could not load profile.");
    if (!data) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ profile: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await parseJson(request, profileUpdateSchema);
    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select("id, username, full_name, role, bio, location, primary_sport, avatar_url, is_verified, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
      }
      throw new Error("Could not update profile.");
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
