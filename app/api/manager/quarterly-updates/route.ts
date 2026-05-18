import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("quarterly_updates")
      .select(`
        id,
        quarter,
        actual_value,
        progress_score,
        comment,
        status,
        goals (
          title,
          target_value
        )
      `);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch quarterly updates" },
      { status: 500 }
    );
  }
}