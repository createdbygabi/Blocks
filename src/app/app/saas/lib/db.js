import { supabase } from "@/lib/supabase";

// Get business by subdomain
export async function getBusinessBySubdomain(subdomain) {
  console.log("🔍 Fetching business for subdomain:", subdomain);

  if (!subdomain) {
    throw new Error("Subdomain is required");
  }

  try {
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("subdomain", subdomain)
      .single();

    console.log("subdomain", subdomain);
    console.log("business", business);

    if (error) {
      console.error("Error fetching business:", error);
      throw error;
    }

    if (!business) {
      console.log("No business found for subdomain:", subdomain);
      return null;
    }

    console.log("Found business:", business);
    return business;
  } catch (error) {
    console.error("Unexpected error in getBusinessBySubdomain:", error);
    throw error;
  }
}

// Get landing page for a business
export async function getBusinessLandingPage(businessId) {
  console.log("📄 Fetching landing page for business:", businessId);

  if (!businessId) {
    throw new Error("Business ID is required");
  }

  try {
    console.log("businessId", businessId);
    const { data: landingPage, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching landing page:", error);
      return null;
    }

    return landingPage;
  } catch (error) {
    console.error("Unexpected error in getBusinessLandingPage:", error);
    return null;
  }
}

// Combined function to get both business and landing page data
export async function getSaasData(subdomain) {
  console.log("🚀 Fetching SaaS data for subdomain:", subdomain);

  try {
    const business = await getBusinessBySubdomain(subdomain);
    if (!business) {
      return null;
    }

    const landingPage = await getBusinessLandingPage(business.id);

    return {
      business,
      landingPage,
    };
  } catch (error) {
    console.error("Error fetching SaaS data:", error);
    throw error;
  }
}
