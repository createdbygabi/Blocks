import { supabase } from "./supabase";

// Get landing page for a user
export async function getUserLandingPage(user_id) {
  console.log("Attempting to get landing page for user:", user_id);

  if (!user_id) {
    console.error("No user_id provided to getUserLandingPage");
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("Supabase error when fetching landing page:", {
        error_message: error.message,
        error_code: error.code,
        error_details: error.details,
        error_hint: error.hint,
        user_id,
      });
      throw error;
    }

    // If no data found, return null
    if (!data) {
      console.log("No landing page found for user:", user_id);
      return null;
    }

    console.log("Successfully fetched landing page:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error in getUserLandingPage:", {
      error_message: error.message,
      error_stack: error.stack,
      user_id,
    });
    throw error;
  }
}

// Save landing page changes
export async function saveLandingPage(user_id, updates) {
  console.log(
    "Attempting to save landing page for user:",
    user_id,
    "with updates:",
    updates
  );

  if (!user_id) {
    console.error("No user_id provided to saveLandingPage");
    throw new Error("User ID is required");
  }

  try {
    // First try to update existing page
    const { data, error: updateError } = await supabase
      .from("landing_pages")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .single();

    // If no page exists, create a new one
    if (updateError && updateError.code === "PGRST116") {
      console.log("No existing page found, creating new one");
      const { data: newPage, error: createError } = await supabase
        .from("landing_pages")
        .insert([
          {
            user_id,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Failed to create new landing page:", {
          error_message: createError.message,
          error_code: createError.code,
          error_details: createError.details,
          error_hint: createError.hint,
          user_id,
        });
        throw createError;
      }

      console.log("Successfully created new landing page:", newPage);
      return newPage;
    }

    if (updateError) {
      console.error("Failed to update landing page:", {
        error_message: updateError.message,
        error_code: updateError.code,
        error_details: updateError.details,
        error_hint: updateError.hint,
        user_id,
      });
      throw updateError;
    }

    console.log("Successfully updated landing page:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error in saveLandingPage:", {
      error_message: error.message,
      error_stack: error.stack,
      user_id,
      updates,
    });
    throw error;
  }
}

// Helper functions for specific updates
export async function saveContent(user_id, content) {
  return saveLandingPage(user_id, { content });
}

export async function saveTheme(user_id, theme) {
  return saveLandingPage(user_id, { theme });
}

export async function saveDesign(user_id, design) {
  return saveLandingPage(user_id, { design });
}

export async function saveFont(user_id, font) {
  return saveLandingPage(user_id, { font });
}

// Export landing page data
export async function exportLandingPage(user_id) {
  console.log("Attempting to export landing page for user:", user_id);

  if (!user_id) {
    console.error("No user_id provided to exportLandingPage");
    throw new Error("User ID is required");
  }

  try {
    const page = await getUserLandingPage(user_id);
    console.log("Successfully exported landing page:", page);
    return {
      theme: page.theme,
      design: page.design,
      font: page.font,
      content: page.content,
    };
  } catch (error) {
    console.error("Failed to export landing page:", {
      error_message: error.message,
      error_stack: error.stack,
      user_id,
    });
    throw error;
  }
}

// Get business for a user
export async function getUserBusiness(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      *
    `
    )
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  // Transform snake_case to camelCase for specific fields
  if (data) {
    data.mainFeature = data.main_feature;
  }

  return data;
}

// Save or update business
export async function saveBusiness(user_id, updates) {
  console.log(
    "Attempting to save business for user:",
    user_id,
    "with updates:",
    updates
  );

  if (!user_id) {
    throw new Error("User ID is required");
  }

  // Transform camelCase to snake_case for database
  const dbUpdates = { ...updates };
  if (updates.mainFeature) {
    dbUpdates.main_feature = updates.mainFeature;
    delete dbUpdates.mainFeature;
  }

  try {
    // First try to update existing business
    const { data, error: updateError } = await supabase
      .from("businesses")
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .single();

    // If no business exists, create a new one
    if (updateError && updateError.code === "PGRST116") {
      console.log("No existing business found, creating new one");
      const { data: newBusiness, error: createError } = await supabase
        .from("businesses")
        .insert([
          {
            user_id,
            ...dbUpdates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Failed to create new business:", createError);
        throw createError;
      }

      // Transform snake_case to camelCase for response
      if (newBusiness) {
        newBusiness.mainFeature = newBusiness.main_feature;
      }

      return newBusiness;
    }

    if (updateError) {
      console.error("Failed to update business:", updateError);
      throw updateError;
    }

    // Transform snake_case to camelCase for response
    if (data) {
      data.mainFeature = data.main_feature;
    }

    return data;
  } catch (error) {
    console.error("Error in saveBusiness:", error);
    throw error;
  }
}

export async function getBusinessAccountStatus(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data: business, error } = await supabase
      .from("businesses")
      .select(
        `
        id,
        stripe_account_id,
        ig_account_id
      `
      )
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    return {
      hasStripe: !!business?.stripe_account_id,
      hasInstagram: !!business?.ig_account_id,
      businessId: business?.id,
    };
  } catch (error) {
    console.error("Error checking account status:", error);
    throw error;
  }
}

export async function updateBusinessStripeAccount(businessId, stripeAccountId) {
  console.log("Updating business Stripe account:", {
    businessId,
    stripeAccountId,
  });

  if (!businessId) {
    throw new Error("Business ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("businesses")
      .update({
        stripe_account_id: stripeAccountId,
      })
      .eq("id", businessId)
      .select()
      .single();

    if (error) {
      console.error("Error updating business Stripe account:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating business Stripe account:", error);
    throw error;
  }
}
