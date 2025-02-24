import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { plan, stripeConnectId, successUrl, cancelUrl } =
      await request.json();

    console.log("Creating checkout session with plan:", plan);
    console.log("Connected account ID (stripe_account_id):", stripeConnectId);

    if (!stripeConnectId) {
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: "Missing Stripe Connect account ID",
        },
        { status: 400 }
      );
    }

    // First, create a product in the connected account
    const product = await stripe.products.create(
      {
        name: plan.name,
        description: plan.description,
      },
      {
        stripeAccount: stripeConnectId,
      }
    );

    // Then create a price for that product
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: plan.price * 100,
        currency: "usd",
        recurring: {
          interval: "month",
        },
      },
      {
        stripeAccount: stripeConnectId,
      }
    );

    // Create checkout session with the price ID
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: cancelUrl,
        subscription_data: {
          application_fee_percent: 5, // 5% fee
        },
      },
      {
        stripeAccount: stripeConnectId,
      }
    );

    console.log("Checkout session created:", session.id);
    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
