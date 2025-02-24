import { NextResponse } from "next/server";
import { stripe } from "@/lib/utils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.retrieve(accountId);

    // Check if the account has completed the required steps
    const isComplete =
      account.details_submitted &&
      account.payouts_enabled &&
      account.capabilities?.card_payments === "active" &&
      account.capabilities?.transfers === "active";

    return NextResponse.json({
      isComplete,
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
      capabilities: account.capabilities,
    });
  } catch (error) {
    console.error("Error checking account status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
