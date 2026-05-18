import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeEmail = searchParams.get("employeeEmail");

    if (!employeeEmail) {
      return NextResponse.json({ status: "new" });
    }

    const { data: user } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", employeeEmail)
      .single();

    if (!user) {
      return NextResponse.json({ status: "new" });
    }

    const { data: cycle } = await supabaseServer
      .from("goal_cycles")
      .select("id")
      .eq("is_active", true)
      .single();

    if (!cycle) {
      return NextResponse.json({ status: "new" });
    }

    const { data: sheets } = await supabaseServer
      .from("goal_sheets")
      .select("status, locked")
      .eq("employee_id", user.id)
      .eq("cycle_id", cycle.id)
      .order("submitted_at", { ascending: false });

    if (!sheets || sheets.length === 0) {
      return NextResponse.json({ status: "new" });
    }

    const latest = sheets[0];

    return NextResponse.json({
      status: latest.status,
      locked: latest.locked,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      status: "new",
    });
  }
}