import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, target_value, weightage } = body;

    const { error } = await supabaseServer
      .from("goals")
      .update({
        target_value,
        weightage,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update goal",
      },
      { status: 500 }
    );
  }
}