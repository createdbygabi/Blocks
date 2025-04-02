import dynamic from "next/dynamic";

// Map of business subdomains to their feature components
export const businessFeatures = {
  linkletter: dynamic(() => import("./linkletter")),
  resumix: dynamic(() => import("./resumix")),
  rewordy: dynamic(() => import("./rewordy")),
  zapplay: dynamic(() => import("./zapplay")),
  renewly: dynamic(() => import("./renewly")),
  mijurn: dynamic(() => import("./mijurn")),
  cursage: dynamic(() => import("./cursage")),
  copyzen: dynamic(() => import("./copyzen")),
  namejet: dynamic(() => import("./namejet")),
};

// Helper to get feature by subdomain
export function getFeatureBySubdomain(subdomain) {
  return businessFeatures[subdomain] || null;
}
