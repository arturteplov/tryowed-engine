import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { profile_id, email, full_name, total_estimated, num_matches } =
      await req.json();

    if (!email || !full_name) {
      return NextResponse.json(
        { error: "email and full_name are required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("waitlist").upsert(
      {
        profile_id:      null, // linked via email later — avoids FK violations on unverified IDs
        email:           email.trim().toLowerCase(),
        full_name:       full_name.trim(),
        total_estimated: total_estimated ?? 0,
        num_matches:     num_matches ?? 0,
      },
      { onConflict: "email" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? JSON.stringify(err);
    console.error("Waitlist signup error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
