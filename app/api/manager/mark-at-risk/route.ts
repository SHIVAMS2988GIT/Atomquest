import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const updateId = body.updateId;
    const managerComment = body.managerComment;

    const { data, error } = await supabase
      .from("quarterly_updates")
      .update({
        status: "at_risk",
        comment: managerComment,
      })
      .eq("id", updateId)
      .select();

    console.log("Risk result:", data);
    console.log("Risk error:", error);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}