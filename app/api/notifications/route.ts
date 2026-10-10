import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, requireUser } from "@/lib/api/http";

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).max(100).optional(),
  all: z.boolean().optional()
}).refine((data) => data.all === true || (data.ids?.length ?? 0) > 0, {
  message: "Provide notification IDs or set all to true."
});

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("notifications")
      .select("id, actor_id, type, entity_id, body, read_at, created_at, actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url)")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error("Could not load notifications.");
    return NextResponse.json({ notifications: data ?? [] });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await parseJson(request, markReadSchema);
    let query = supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", user.id)
      .is("read_at", null);

    if (body.all !== true && body.ids?.length) query = query.in("id", body.ids);
    const { error, count } = await query.select("id");

    if (error) throw new Error("Could not update notifications.");
    return NextResponse.json({ ok: true, updated: count ?? undefined });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
