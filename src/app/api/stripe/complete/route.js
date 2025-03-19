import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request) {
  try {
    // Get the state and account_id from the URL params
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const accountId = searchParams.get("account_id");

    if (!state || !accountId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Decode and validate state parameter
    try {
      // Add padding if needed
      const base64String = state.replace(/-/g, "+").replace(/_/g, "/");
      const paddedState = base64String.padEnd(
        base64String.length + ((4 - (base64String.length % 4)) % 4),
        "="
      );

      console.log("Attempting to decode state:", {
        original: state,
        padded: paddedState,
      });

      const decodedState = JSON.parse(atob(paddedState));

      console.log("Decoded state:", decodedState);

      const { businessId, timestamp } = decodedState;

      if (!businessId || !timestamp) {
        throw new Error("Missing required fields in state");
      }

      // Check if the state is not too old (e.g., 1 hour)
      if (Date.now() - timestamp > 3600000) {
        return NextResponse.json(
          { error: "Setup link expired" },
          { status: 400 }
        );
      }

      console.log("Updating business:", {
        businessId,
        accountId,
      });

      // Update the business with the Stripe account ID using supabaseAdmin
      const { data: updatedBusiness, error: updateError } = await supabaseAdmin
        .from("businesses")
        .update({
          stripe_account_id: accountId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating business:", updateError);
        throw new Error("Failed to update business with Stripe account");
      }

      console.log("Successfully updated business:", updatedBusiness);

      // Redirect back to the app with success parameter
      return NextResponse.redirect(
        `${request.nextUrl.origin}/app?stripe_setup=success`
      );
    } catch (error) {
      console.error("Error processing state parameter:", error);
      return NextResponse.json(
        { error: "Invalid state parameter", details: error.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error completing Stripe setup:", error);
    return NextResponse.json(
      { error: "Failed to complete Stripe setup", details: error.message },
      { status: 500 }
    );
  }
}
