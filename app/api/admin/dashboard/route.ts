import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("role", "employee");

    const { data: goalSheets } = await supabase
      .from("goal_sheets")
      .select("*");

    const { data: quarterlyUpdates } = await supabase
      .from("quarterly_updates")
      .select("*");

    return NextResponse.json({
      users: users || [],
      goalSheets: goalSheets || [],
      quarterlyUpdates: quarterlyUpdates || [],
    });

  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}