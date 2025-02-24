import dynamic from "next/dynamic";

// Simple mapping of business IDs to their feature components
export const businessFeatures = {
  // Digistry's feature
  "7cf7f069-5925-4048-9521-8540d15ea846": dynamic(() => import("./digistry"), {
    loading: () => <div>Loading feature...</div>,
  }),
  // Add more businesses as needed
};
