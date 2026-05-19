import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      goal_id,
      quarter,
      progress_percent,
      employee_comment,
      status,
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

    // fetch goal details
    const { data: goalData, error: goalError } = await supabase
      .from("goals")
      .select("target_value, uom_type")
      .eq("id", goal_id)
      .single();

    if (goalError || !goalData) {
      return NextResponse.json({
        success: false,
        error: "Goal not found",
      });
    }

    const target = Number(goalData.target_value);
    const actual = Number(progress_percent);
    const uom = goalData.uom_type;

    let progressScore = 0;

    if (uom === "numeric_min" || uom === "percentage") {
      progressScore = Math.min(
        Math.round((actual / target) * 100),
        100
      );
    } else if (uom === "numeric_max") {
      progressScore = Math.min(
        Math.round((target / actual) * 100),
        100
      );
    } else if (uom === "zero") {
      progressScore = actual === 0 ? 100 : 0;
    } else if (uom === "timeline") {
      progressScore = actual;
    }

    const { data, error } = await supabase
      .from("quarterly_updates")
      .insert([
        {
          goal_id,
          quarter,
          actual_value: actual,
          status,
          progress_score: progressScore,
          comment: employee_comment,
        },
      ])
      .select();

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