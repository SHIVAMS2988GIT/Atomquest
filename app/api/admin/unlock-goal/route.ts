import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goalSheetId } = body;

    const { error } = await supabaseServer
      .from("goal_sheets")
      .update({
        status: "draft",
      })
      .eq("id", goalSheetId);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    // audit log
    await supabaseServer
      .from("audit_logs")
      .insert([
        {
          entity_type: "goal_sheet",
          entity_id: goalSheetId,
          action: "admin_unlock",
          changed_by: "admin@atomquest.com",
          old_value: "approved",
          new_value: "draft",
        },
      ]);

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Unlock failed",
    });
  }
}