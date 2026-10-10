import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/types";

/**
 * Returns the signed-in user's profile for server rendering, or null when the
 * visitor is signed out or Supabase is not configured. Deduplicated per request.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role, primary_sport, location, bio, is_verified")
      .eq("id", auth.user.id)
      .maybeSingle();
    return (data as Viewer | null) ?? null;
  } catch {
    return null;
  }
});

/** Server-side Supabase client that never throws on missing configuration. */
export async function getOptionalSupabase() {
  try {
    return await createSupabaseServerClient();
  } catch {
    return null;
  }
}
