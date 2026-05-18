import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Incoming body:", body);

    const {
      goal_id,
      quarter,
      progress_percent,
      employee_comment,
      self_rating,
    } = body;

    // duplicate check
    const { data: existing } = await supabase
      .from("quarterly_updates")
      .select("id")
      .eq("goal_id", goal_id)
      .eq("quarter", quarter);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Quarter update already submitted",
      });
    }

    const { data, error } = await supabase
      .from("quarterly_updates")
      .insert([
        {
          goal_id,
          quarter,
          actual_value: progress_percent,
          status: "on_track",
          progress_score: self_rating,
          comment: employee_comment,
        },
      ])
      .select();

    console.log("Insert result:", data);
    console.log("Insert error:", error);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}