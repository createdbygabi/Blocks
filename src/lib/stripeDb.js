import { supabase } from "./supabase";

/**
 * Get Stripe account for a business - with detailed logging
 */
export async function getStripeAccount(business_id) {
  console.log("=== getStripeAccount START ===");
  console.log("Business ID:", business_id);

  try {
    // 1. Get business details
    const businessQuery = await supabase
      .from("businesses")
      .select("stripe_account_id")
      .eq("id", business_id)
      .single();

    console.log("Business Query Result:", {
      data: businessQuery.data,
      error: businessQuery.error,
      status: businessQuery.status,
      statusText: businessQuery.statusText,
    });

    if (businessQuery.error) {
      console.error("Business Query Error:", businessQuery.error);
      throw businessQuery.error;
    }

    if (!businessQuery.data?.stripe_account_id) {
      console.log("No stripe_account_id found for business");
      return null;
    }

    // 2. Get stripe account
    const stripeQuery = await supabase
      .from("stripe_accounts")
      .select("*")
      .eq("id", businessQuery.data.stripe_account_id)
      .single();

    console.log("Stripe Query Result:", {
      data: stripeQuery.data,
      error: stripeQuery.error,
      status: stripeQuery.status,
      statusText: stripeQuery.statusText,
    });

    if (stripeQuery.error) {
      console.error("Stripe Query Error:", stripeQuery.error);
      throw stripeQuery.error;
    }

    return stripeQuery.data;
  } catch (error) {
    console.error("=== getStripeAccount ERROR ===", error);
    throw error;
  } finally {
    console.log("=== getStripeAccount END ===");
  }
}

/**
 * Create test Stripe account - with detailed logging
 */
export async function createTestStripeAccount(business_id) {
  console.log("=== createTestStripeAccount START ===");
  console.log("Business ID:", business_id);

  try {
    // 1. Create stripe account
    const createStripeQuery = await supabase
      .from("stripe_accounts")
      .insert({
        account_id: `acct_test_${Math.random().toString(36).substring(2, 9)}`,
        account_type: "custom",
        country: "US",
        payouts_enabled: true,
        charges_enabled: true,
        details_submitted: true,
      })
      .select()
      .single();

    console.log("Create Stripe Query Result:", {
      data: createStripeQuery.data,
      error: createStripeQuery.error,
      status: createStripeQuery.status,
      statusText: createStripeQuery.statusText,
    });

    if (createStripeQuery.error) {
      console.error("Create Stripe Error:", createStripeQuery.error);
      throw createStripeQuery.error;
    }

    // 2. Update business
    const updateBusinessQuery = await supabase
      .from("businesses")
      .update({ stripe_account_id: createStripeQuery.data.id })
      .eq("id", business_id)
      .select()
      .single();

    console.log("Update Business Query Result:", {
      data: updateBusinessQuery.data,
      error: updateBusinessQuery.error,
      status: updateBusinessQuery.status,
      statusText: updateBusinessQuery.statusText,
    });

    if (updateBusinessQuery.error) {
      console.error("Update Business Error:", updateBusinessQuery.error);
      throw updateBusinessQuery.error;
    }

    return createStripeQuery.data;
  } catch (error) {
    console.error("=== createTestStripeAccount ERROR ===", error);
    throw error;
  } finally {
    console.log("=== createTestStripeAccount END ===");
  }
}

/**
 * Save or update a Stripe account
 * @param {string} business_id - The business ID
 * @param {Object} stripeData - The Stripe account data
 * @returns {Promise<Object>} The saved Stripe account
 */
export async function saveStripeAccount(business_id, stripeData) {
  if (!business_id) throw new Error("Business ID is required");
  if (!stripeData) throw new Error("Stripe data is required");

  const accountData = {
    business_id,
    account_id: stripeData.id,
    account_type: stripeData.account_type || "custom",
    country: stripeData.country || "US",
    capabilities: stripeData.capabilities || {},
    payouts_enabled: stripeData.payouts_enabled || false,
    charges_enabled: stripeData.charges_enabled || false,
    details_submitted: stripeData.details_submitted || false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("stripe_accounts")
    .upsert(accountData, {
      onConflict: "business_id",
      returning: "representation",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a Stripe account
 * @param {string} business_id - The business ID
 * @returns {Promise<void>}
 */
export async function deleteStripeAccount(business_id) {
  if (!business_id) throw new Error("Business ID is required");
  console.log("Deleting Stripe account for business:", business_id);

  // First get the stripe_account_id
  const { data: business, error: fetchError } = await supabase
    .from("businesses")
    .select("stripe_account_id")
    .eq("id", business_id)
    .single();

  if (fetchError) throw fetchError;

  if (business?.stripe_account_id) {
    // Remove reference from business
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ stripe_account_id: null })
      .eq("id", business_id);

    if (updateError) throw updateError;

    // Delete the stripe account
    const { error: deleteError } = await supabase
      .from("stripe_accounts")
      .delete()
      .eq("id", business.stripe_account_id);

    if (deleteError) throw deleteError;
  }

  console.log("Successfully deleted Stripe account for business:", business_id);
}

// Update Stripe account status
export async function updateStripeAccountStatus(business_id, status) {
  if (!business_id) throw new Error("Business ID is required");

  const { data, error } = await supabase
    .from("stripe_accounts")
    .update({
      ...status,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", business_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Test function to create a Stripe Connect account via API
 */
export async function testCreateStripeConnect() {
  console.log("1. Starting Stripe Connect test...");

  try {
    console.log("2. Making API request to /api/stripe/connect");
    const response = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("3. Got API response:", response.status);
    const result = await response.json();

    if (!response.ok) {
      console.error("4. API error:", result.error);
      throw new Error(result.error || "Failed to create Stripe account");
    }

    console.log("4. Success! Account created:", result.accountId);
    return {
      success: true,
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
    };
  } catch (error) {
    console.error("4. Error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
