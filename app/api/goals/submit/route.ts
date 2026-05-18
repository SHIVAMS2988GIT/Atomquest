import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeEmail, goals } = body;

    const { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", employeeEmail)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const { data: cycle } = await supabaseServer
      .from("goal_cycles")
      .select("*")
      .eq("is_active", true)
      .single();

    if (!cycle) {
      return NextResponse.json(
        { error: "No active cycle found" },
        { status: 404 }
      );
    }

    // CHECK REWORK FIRST
    const { data: reworkSheet } = await supabaseServer
      .from("goal_sheets")
      .select("*")
      .eq("employee_id", user.id)
      .eq("cycle_id", cycle.id)
      .eq("status", "rework")
      .maybeSingle();

    if (reworkSheet) {
      await supabaseServer
        .from("goals")
        .delete()
        .eq("goal_sheet_id", reworkSheet.id);

      for (const goal of goals) {
        await supabaseServer.from("goals").insert({
          goal_sheet_id: reworkSheet.id,
          title: goal.title,
          description: goal.description,
          thrust_area: goal.thrustArea,
          uom_type: goal.uomType,
          target_value: Number(goal.targetValue),
          weightage: Number(goal.weightage),
          primary_owner_id: user.id,
        });
      }

      await supabaseServer
        .from("goal_sheets")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          locked: false,
        })
        .eq("id", reworkSheet.id);

      return NextResponse.json({
        success: true,
        message: "Reworked goals submitted successfully",
      });
    }

    // PREVENT DUPLICATES
    const { data: existingApproved } = await supabaseServer
      .from("goal_sheets")
      .select("id")
      .eq("employee_id", user.id)
      .eq("cycle_id", cycle.id)
      .in("status", ["submitted", "approved"]);

    if (existingApproved && existingApproved.length > 0) {
      return NextResponse.json(
        {
          error: "Goals already submitted for this cycle",
        },
        { status: 400 }
      );
    }

    // NEW SUBMISSION
    const { data: goalSheet } = await supabaseServer
      .from("goal_sheets")
      .insert({
        employee_id: user.id,
        cycle_id: cycle.id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    for (const goal of goals) {
      await supabaseServer.from("goals").insert({
        goal_sheet_id: goalSheet.id,
        title: goal.title,
        description: goal.description,
        thrust_area: goal.thrustArea,
        uom_type: goal.uomType,
        target_value: Number(goal.targetValue),
        weightage: Number(goal.weightage),
        primary_owner_id: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Goals submitted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Submission failed" },
      { status: 500 }
    );
  }
}