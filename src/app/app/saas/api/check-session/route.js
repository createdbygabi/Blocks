import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { sessionId, stripeAccountId } = await request.json();

    // Initialize Stripe with the connected account
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      stripeAccount: stripeAccountId,
    });

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json({ success: false });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("business_id", session.metadata.business_id)
      .eq("customer_email", session.customer_email)
      .eq("status", "active")
      .single();

    if (!existingSubscription) {
      // Create new subscription only if it doesn't exist
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert([
          {
            business_id: session.metadata.business_id,
            customer_email: session.customer_email,
            status: "active",
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
          },
        ])
        .single();

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
        // If error is due to unique constraint, it's okay - subscription already exists
        if (subscriptionError.code !== "23505") {
          // PostgreSQL unique violation code
          throw subscriptionError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      session,
      email: session.customer_email,
    });
  } catch (error) {
    console.error("Check session error:", error);
    return NextResponse.json(
      { error: "Failed to process session" },
      { status: 500 }
    );
  }
}
