import dynamic from "next/dynamic";

// Map of business subdomains to their feature components
export const businessFeatures = {
  intelliflow: dynamic(() => import("./intelliflow")),
  // Add more features as needed
};

// Helper to get feature by subdomain
export function getFeatureBySubdomain(subdomain) {
  return businessFeatures[subdomain] || null;
}
