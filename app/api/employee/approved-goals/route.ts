import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const employeeEmail = "employee@atomquest.com";

    const { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", employeeEmail)
      .single();

    if (!user) {
      return NextResponse.json([]);
    }

    const { data: approvedSheets } = await supabaseServer
      .from("goal_sheets")
      .select("*")
      .eq("employee_id", user.id)
      .eq("status", "approved");

    if (!approvedSheets?.length) {
      return NextResponse.json([]);
    }

    const sheetIds = approvedSheets.map((s) => s.id);

    const { data: goals } = await supabaseServer
      .from("goals")
      .select("*")
      .in("goal_sheet_id", sheetIds);

    return NextResponse.json(goals || []);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch approved goals" },
      { status: 500 }
    );
  }
}