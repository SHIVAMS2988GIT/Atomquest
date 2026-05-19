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

    // approved individual goals
    const { data: approvedSheets } = await supabaseServer
      .from("goal_sheets")
      .select("*")
      .eq("employee_id", user.id)
      .eq("status", "approved");

    let individualGoals: any[] = [];

    if (approvedSheets?.length) {
      const sheetIds = approvedSheets.map((s) => s.id);

      const { data: goals } = await supabaseServer
        .from("goals")
        .select("*")
        .in("goal_sheet_id", sheetIds);

      individualGoals = goals || [];
    }

    // shared goals assigned to employee
    const { data: sharedGoals } = await supabaseServer
      .from("shared_goals")
      .select("*")
      .contains("assigned_to", [employeeEmail])
      .eq("is_active", true);

    const mappedSharedGoals =
      sharedGoals?.map((goal) => ({
        id: goal.id,
        title: `[Shared] ${goal.title}`,
        target_value: goal.target_value,
        uom_type: goal.uom_type,
        is_shared: true,
      })) || [];

    return NextResponse.json([
      ...individualGoals,
      ...mappedSharedGoals,
    ]);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch approved goals",
      },
      { status: 500 }
    );
  }
}