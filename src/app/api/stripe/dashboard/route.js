import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    // const headersList = headers();
    // const authHeader = headersList.get("authorization");

    // if (!authHeader?.startsWith("Bearer ")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get the connected account ID from the request
    const url = new URL(request.url);
    const accountId = url.searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No account ID provided" },
        { status: 400 }
      );
    }

    // Create login link for Express dashboard
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    return NextResponse.json({
      url: loginLink.url,
      status: "success",
    });
  } catch (error) {
    console.error("Stripe login link error:", error);
    return NextResponse.json(
      { error: "Failed to create login link" },
      { status: 500 }
    );
  }
}
