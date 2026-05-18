import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeEmail = searchParams.get("employeeEmail");

    if (!employeeEmail) {
      return NextResponse.json({ goals: [] });
    }

    const { data: user } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", employeeEmail)
      .single();

    if (!user) {
      return NextResponse.json({ goals: [] });
    }

    const { data: cycle } = await supabaseServer
      .from("goal_cycles")
      .select("id")
      .eq("is_active", true)
      .single();

    if (!cycle) {
      return NextResponse.json({ goals: [] });
    }

    const { data: reworkSheets } = await supabaseServer
      .from("goal_sheets")
      .select("id, submitted_at")
      .eq("employee_id", user.id)
      .eq("cycle_id", cycle.id)
      .eq("status", "rework")
      .order("submitted_at", { ascending: false });

    if (!reworkSheets || reworkSheets.length === 0) {
      return NextResponse.json({ goals: [] });
    }

    for (const sheet of reworkSheets) {
      const { data: goals } = await supabaseServer
        .from("goals")
        .select("*")
        .eq("goal_sheet_id", sheet.id);

      if (goals && goals.length > 0) {
        return NextResponse.json({
          goals,
        });
      }
    }

    return NextResponse.json({
      goals: [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      goals: [],
    });
  }
}