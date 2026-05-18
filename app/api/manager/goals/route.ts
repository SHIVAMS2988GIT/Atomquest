import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: goalSheets, error } = await supabaseServer
      .from("goal_sheets")
      .select("*")
      .eq("status", "submitted");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const enrichedData = [];

    for (const sheet of goalSheets || []) {
      const { data: user } = await supabaseServer
        .from("users")
        .select("name, email")
        .eq("id", sheet.employee_id)
        .single();

      const { data: goals } = await supabaseServer
        .from("goals")
        .select("*")
        .eq("goal_sheet_id", sheet.id);

      enrichedData.push({
        ...sheet,
        user,
        goals,
      });
    }

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch manager goals" },
      { status: 500 }
    );
  }
}