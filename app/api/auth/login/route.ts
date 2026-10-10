import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, parseJson } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128)
});

export async function POST(request: Request) {
  try {
    const body = await parseJson(request, loginSchema);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Email or password was incorrect." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
