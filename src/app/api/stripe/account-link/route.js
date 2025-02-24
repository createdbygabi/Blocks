import { NextResponse } from "next/server";
import { stripe } from "@/lib/utils";

export async function POST(request) {
  try {
    const { account } = await request.json();

    // Get base URL - use HTTPS for production, allow HTTP for development
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL
        : "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: `${baseUrl}/stripe/refresh`,
      // When setup is complete, this URL will close the window and notify the parent
      return_url: `${baseUrl}/stripe/complete?account_id=${account}`,
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
