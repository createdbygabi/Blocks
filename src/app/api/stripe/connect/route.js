import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { getUserBusiness } from "@/lib/db"; // Import our existing function

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("1. Starting with user ID:", data.userId);

    // 1. Use our existing getUserBusiness function
    const business = await getUserBusiness(data.userId);
    if (!business) {
      console.error("Cannot find business for user:", data.userId);
      throw new Error("Business not found");
    }
    console.log("2. Found business:", business.id);

    // 2. Create Stripe account
    const stripeAccount = await stripe.accounts.create({
      type: "standard",
      country: data.country,
      email: data.email,
      business_type: data.business_type,
      company: data.company,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    console.log("3. Stripe account created:", stripeAccount.id);

    // 3. Save to stripe_accounts table
    const { data: savedStripeAccount, error: stripeError } = await supabase
      .from("stripe_accounts")
      .insert({
        account_id: stripeAccount.id,
        account_type: stripeAccount.type,
        country: stripeAccount.country,
        capabilities: stripeAccount.capabilities || {},
        charges_enabled: stripeAccount.charges_enabled || false,
        payouts_enabled: stripeAccount.payouts_enabled || false,
        details_submitted: stripeAccount.details_submitted || false,
      })
      .select()
      .single();

    if (stripeError) {
      console.error("4. Failed to save stripe account:", stripeError);
      throw stripeError;
    }
    console.log("4. Saved stripe account:", savedStripeAccount.id);

    // 4. Update business
    const { data: updatedBusiness, error: updateError } = await supabase
      .from("businesses")
      .update({ stripe_account_id: savedStripeAccount.id })
      .eq("id", business.id)
      .select()
      .single();

    if (updateError) {
      console.error("5. Failed to update business:", updateError);
      throw updateError;
    }
    console.log("5. Updated business:", updatedBusiness);

    return NextResponse.json({
      success: true,
      account: stripeAccount,
      businessId: business.id,
      stripeAccountId: savedStripeAccount.id,
    });
  } catch (error) {
    console.error("Error in /api/stripe/connect:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
