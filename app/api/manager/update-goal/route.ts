import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, target_value, weightage } = body;

    // fetch existing goal
    const { data: existingGoal, error: fetchError } =
      await supabaseServer
        .from("goals")
        .select("target_value, weightage")
        .eq("id", id)
        .single();

    if (fetchError) {
      return NextResponse.json(
        {
          error: fetchError.message,
        },
        { status: 500 }
      );
    }

    // update goal
    const { error } = await supabaseServer
      .from("goals")
      .update({
        target_value,
        weightage,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    // audit log
    await supabaseServer
      .from("audit_logs")
      .insert([
        {
          entity_type: "goal",
          entity_id: id,
          action: "manager_update",
          changed_by: "manager@atomquest.com",
          old_value: JSON.stringify(existingGoal),
          new_value: JSON.stringify({
            target_value,
            weightage,
          }),
        },
      ]);

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update goal",
      },
      { status: 500 }
    );
  }
}