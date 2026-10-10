import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, isUuid, parseJson, requireUser } from "@/lib/api/http";

const conversationSchema = z.object({ recipientId: z.string().uuid() });

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("conversation_members")
      .select("conversation_id, joined_at, conversation:conversations!inner(id, created_at)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(100);

    if (error) throw new Error("Could not load conversations.");
    return NextResponse.json({ conversations: data ?? [] });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await parseJson(request, conversationSchema);
    if (!isUuid(body.recipientId)) {
      return NextResponse.json({ error: "Invalid recipient ID." }, { status: 400 });
    }
    if (body.recipientId === user.id) {
      return NextResponse.json({ error: "You cannot start a conversation with yourself." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("create_direct_conversation", {
      recipient_profile_id: body.recipientId
    });

    if (error) {
      if (error.code === "P0002") return NextResponse.json({ error: "Recipient profile not found." }, { status: 404 });
      if (error.code === "28000") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      throw new Error("Could not start conversation.");
    }

    return NextResponse.json({ conversationId: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
