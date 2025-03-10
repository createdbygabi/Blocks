import dynamic from "next/dynamic";

// Map of business subdomains to their feature components
export const businessFeatures = {
  linkletter: dynamic(() => import("./linkletter")),
  resumix: dynamic(() => import("./resumix")),
  rewordy: dynamic(() => import("./rewordy")),
  // jobmuse: dynamic(() => import("./jobmuse")),
  // Add more features as needed
};

// Helper to get feature by subdomain
export function getFeatureBySubdomain(subdomain) {
  return businessFeatures[subdomain] || null;
}
