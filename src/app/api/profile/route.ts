import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      first_name,
      last_name,
      date_of_birth,
      state,
      income_range,
      filing_status,
      has_children,
      num_children,
      children_ages,
      living_situation,
      has_disability,
      employment_type,
      has_post_secondary,
      filed_taxes_all_years,
      missed_tax_years,
      life_events,
    } = body;

    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { error: "email, first_name, and last_name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          email: email.trim().toLowerCase(),
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          date_of_birth: date_of_birth ?? null,
          state,
          income_range,
          filing_status,
          has_children,
          num_children,
          children_ages,
          living_situation,
          has_disability,
          employment_type,
          has_post_secondary,
          filed_taxes_all_years,
          missed_tax_years,
          life_events,
        },
        { onConflict: "email" }
      )
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (err) {
    // Supabase throws PostgrestError (plain object), not Error instances
    const message =
      err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? JSON.stringify(err);
    console.error("Profile upsert error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
