import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("amount_recovered")
      .eq("status", "paid");

    if (error) throw error;

    const total = (data ?? []).reduce(
      (sum: number, row: { amount_recovered: number | null }) =>
        sum + (row.amount_recovered ?? 0),
      0
    );

    return NextResponse.json({ total_recovered: total });
  } catch {
    // Supabase not configured yet — return 0 gracefully
    return NextResponse.json({ total_recovered: 0 });
  }
}
