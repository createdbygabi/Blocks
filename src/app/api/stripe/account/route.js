import { NextResponse } from "next/server";
import { stripe } from "@/lib/utils";

export async function POST() {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      country: "FR",
      settings: {
        payouts: {
          schedule: {
            interval: "manual",
          },
        },
      },
      business_type: "individual",
    });

    return NextResponse.json({ account: account.id });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
