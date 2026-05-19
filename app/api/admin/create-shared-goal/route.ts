import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      thrust_area,
      target_value,
      uom_type,
    } = body;

    const { data: employees } = await supabaseServer
      .from("users")
      .select("email")
      .eq("role", "employee");

    const assignedEmails =
      employees?.map((e) => e.email) || [];

    const { error } = await supabaseServer
      .from("shared_goals")
      .insert([
        {
          title,
          description,
          thrust_area,
          target_value,
          uom_type,
          assigned_by: "admin@atomquest.com",
          assigned_to: assignedEmails,
          is_active: true,
        },
      ]);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: "Failed to create shared goal",
    });
  }
}