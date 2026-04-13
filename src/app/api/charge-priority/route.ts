import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { payment_method_id, profile_id } = await req.json();

    if (!payment_method_id || !profile_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create and immediately confirm the $29 priority charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2900,
      currency: "usd",
      payment_method: payment_method_id,
      confirm: true,
      description: "Priority filing fee — Owed app",
      metadata: { profile_id },
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment not completed: ${paymentIntent.status}` },
        { status: 402 }
      );
    }

    // Record in DB
    await supabaseAdmin.from("priority_filings").insert({
      profile_id,
      stripe_payment_id: paymentIntent.id,
      amount: 29.00,
      status: "paid",
    });

    // Save payment method to profile for future 20% charge
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_payment_method_id: payment_method_id })
      .eq("id", profile_id);

    return NextResponse.json({ success: true, payment_intent_id: paymentIntent.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Priority charge error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
