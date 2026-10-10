import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, positiveInt, requireUser } from "@/lib/api/http";
import { enforceRateLimit } from "@/lib/api/rate-limit";

type RouteContext = { params: Promise<{ conversationId: string }> };
const messageSchema = z.object({ content: z.string().trim().min(1).max(4000) });

export async function GET(request: Request, context: RouteContext) {
  try {
    const { conversationId } = await context.params;
    if (!isUuid(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
    }

    const { supabase } = await requireUser();
    const url = new URL(request.url);
    const limit = positiveInt(url.searchParams.get("limit"), 50, 100);
    const page = Math.max(1, positiveInt(url.searchParams.get("page"), 1, 100000));
    const { data, error, count } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at", { count: "exact" })
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error("Could not load messages.");
    return NextResponse.json({ messages: data ?? [], page, limit, total: count ?? 0 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { conversationId } = await context.params;
    if (!isUuid(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
    }

    const { supabase, user } = await requireUser();
    const limited = await enforceRateLimit(request, { name: "message-send", limit: 30, window: "1 m", scope: "user", key: user.id });
    if (limited) return limited;
    const body = await parseJson(request, messageSchema);
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content: body.content })
      .select("id, conversation_id, sender_id, content, created_at")
      .single();

    if (error) {
      if (error.code === "42501") return NextResponse.json({ error: "You are not a member of this conversation." }, { status: 403 });
      throw new Error("Could not send message.");
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
