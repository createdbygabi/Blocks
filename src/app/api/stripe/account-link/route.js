import { NextResponse } from "next/server";
import { stripe } from "@/lib/utils";

export async function POST(request) {
  try {
    const { account, state } = await request.json();

    if (!account || !state) {
      return NextResponse.json(
        { error: "Account and state parameters are required" },
        { status: 400 }
      );
    }

    // Get base URL - use HTTPS for production, allow HTTP for development
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL
        : "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: `${baseUrl}/stripe/refresh`,
      // Pass both account_id and state to the completion route
      return_url: `${baseUrl}/api/stripe/complete?account_id=${account}&state=${state}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account link:",
      error
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
