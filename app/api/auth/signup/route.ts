import { NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, parseJson } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(1).max(100),
  username: z.string().trim().min(3).max(32).regex(/^[a-z0-9_]+$/).optional(),
  role: z.enum(["athlete", "coach", "club", "association"]).default("athlete")
});

export async function POST(request: Request) {
  try {
    const body = await parseJson(request, signupSchema);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.fullName,
          username: body.username,
          role: body.role
        }
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      userId: data.user?.id ?? null,
      email: data.user?.email ?? body.email,
      emailConfirmationRequired: !data.session
    }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
