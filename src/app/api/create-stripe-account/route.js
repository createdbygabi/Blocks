import { NextResponse } from "next/server";
import { getUserBusiness, createStripeAccount } from "@/lib/db";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createStripeConnectAccount } from "@/lib/stripe";
console.log("API Route - db.js location:", require.resolve("@/lib/db"));

// Add a GET handler for testing
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await getUserBusiness(user.id);
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      business,
      stripeAccount: business.stripe_accounts?.[0] || null,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 1. Get authenticated user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get business and check for existing stripe account
    const business = await getUserBusiness(user.id);
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // 3. If stripe account exists, return it
    if (business.stripe_accounts?.[0]) {
      return NextResponse.json({
        status: "existing",
        business,
        stripeAccount: business.stripe_accounts[0],
      });
    }

    // 4. If no stripe account, create one
    const { email, businessName, businessType, country } = await request.json();

    const stripeAccount = await createStripeConnectAccount({
      email,
      businessName,
      businessType,
      country,
    });

    // 5. Save stripe account details to database
    const savedStripeAccount = await createStripeAccount(
      business.id,
      stripeAccount
    );

    // 6. Return new stripe account info
    return NextResponse.json({
      status: "created",
      business,
      stripeAccount: savedStripeAccount,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
