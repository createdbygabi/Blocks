import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase, sendMagicLink } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { sessionId, stripeAccountId } = await request.json();

    if (!sessionId || !stripeAccountId) {
      return NextResponse.json(
        { error: "Session ID and Stripe Account ID are required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
      stripeAccount: stripeAccountId,
    });

    if (session.payment_status === "paid") {
      // Store subscription in Supabase
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          customer_email: session.metadata.customer_email,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          business_id: session.metadata?.business_id,
          status: "active",
          created_at: new Date().toISOString(),
        });

      if (subscriptionError) {
        console.error("Error storing subscription:", subscriptionError);
        return NextResponse.json(
          { error: "Failed to store subscription" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: session.payment_status === "paid",
      email: session.metadata.customer_email,
      session,
    });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { error: "Failed to check session status" },
      { status: 500 }
    );
  }
}
