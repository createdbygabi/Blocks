import { supabase } from "./supabase";

// Get Stripe account for a business
export async function getStripeAccount(business_id) {
  if (!business_id) throw new Error("Business ID is required");

  const { data, error } = await supabase
    .from("stripe_accounts")
    .select("*")
    .eq("business_id", business_id)
    .single();

  if (error) throw error;
  return data;
}

// Save or update Stripe account
export async function saveStripeAccount(business_id, stripeData) {
  if (!business_id) throw new Error("Business ID is required");

  console.log("Saving Stripe account:", { business_id, stripeData });

  const accountData = {
    business_id,
    account_id: stripeData.id,
    account_type: stripeData.type || "custom",
    country: stripeData.country || "FR",
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

  if (error) {
    console.error("Error saving Stripe account:", error);
    throw error;
  }

  console.log("Successfully saved Stripe account:", data);
  return data;
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
