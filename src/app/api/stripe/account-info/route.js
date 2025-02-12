import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json(
      { error: "Account ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get live data from Stripe API
    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        business_type: account.business_type,
        country: account.country,
        email: account.email,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        capabilities: account.capabilities,
        requirements: account.requirements,
        settings: account.settings,
        external_accounts: account.external_accounts,
        metadata: account.metadata,
      },
    });
  } catch (error) {
    console.error("Failed to fetch Stripe account:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
