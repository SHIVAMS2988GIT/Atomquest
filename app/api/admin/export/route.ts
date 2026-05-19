import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("quarterly_updates")
    .select(`
      quarter,
      actual_value,
      status,
      progress_score,
      comment,
      goals (
        title,
        target_value
      )
    `);

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  const headers = [
    "Goal Title",
    "Quarter",
    "Target",
    "Actual",
    "Status",
    "Progress Score",
    "Comment",
  ];

  const rows = data.map((row: any) => [
    row.goals?.title || "",
    row.quarter,
    row.goals?.target_value || "",
    row.actual_value,
    row.status,
    row.progress_score,
    row.comment || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; filename="achievement-report.csv"',
    },
  });
}