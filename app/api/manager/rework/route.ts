import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { goalSheetId } = await req.json();

    const { error } = await supabaseServer
      .from("goal_sheets")
      .update({
        status: "rework",
        locked: false,
      })
      .eq("id", goalSheetId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Rework failed" },
      { status: 500 }
    );
  }
}