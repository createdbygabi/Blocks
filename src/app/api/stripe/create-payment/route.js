import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const {
      amount,
      currency = "usd",
      connectedAccountId,
      metadata = {},
    } = await request.json();

    // Calculate 50% split
    const transferAmount = Math.floor(amount / 2);

    // Create PaymentIntent with automatic transfer
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      transfer_data: {
        destination: connectedAccountId,
        amount: transferAmount,
      },
      metadata: {
        ...metadata,
        platformFee: transferAmount,
        creatorPayout: transferAmount,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
