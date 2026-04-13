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

    // Only use profile_id if it looks like a real UUID — "demo" and empty strings
    // would violate the foreign key constraint against the profiles table.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const safeProfileId = profile_id && UUID_RE.test(profile_id) ? profile_id : null;

    const { error } = await supabaseAdmin.from("waitlist").upsert(
      {
        profile_id:      safeProfileId,
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
