import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      });
    }

    return NextResponse.json({
      success: true,
      role: user.role,
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Login failed",
    });
  }
}