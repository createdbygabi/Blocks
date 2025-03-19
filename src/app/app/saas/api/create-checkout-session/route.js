import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    let {
      plan,
      stripeConnectId,
      successUrl,
      cancelUrl,
      customerEmail,
      businessId,
      businessSubdomain,
    } = await request.json();

    console.log("stripeConnectId", stripeConnectId);
    if (!stripeConnectId) {
      stripeConnectId = process.env.DEFAULT_STRIPE_CONNECT_ID;
      if (!stripeConnectId) {
        return NextResponse.json(
          {
            error: "Failed to create checkout session",
            details: "No Stripe Connect account ID available",
          },
          { status: 400 }
        );
      }
      console.log("Using default Stripe Connect account:", stripeConnectId);
    }

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

    // Create checkout session with metadata
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
        customer_email: customerEmail, // Pre-fill customer email
        subscription_data: {
          application_fee_percent: 50, // 50% fee
        },
        metadata: {
          business_id: businessId,
          stripe_account_id: stripeConnectId,
          customer_email: customerEmail, // Store the email from the landing page
          business_subdomain: businessSubdomain, // Add the subdomain for the login URL
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
        debug: error,
      },
      { status: 500 }
    );
  }
}
