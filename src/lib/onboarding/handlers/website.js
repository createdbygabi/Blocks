export async function generateWebsite(data, state) {
  // Generate website based on business data
  return {
    website: {
      url: `https://${state.domains[0].cheapestDomain}`,
      generated_at: new Date().toISOString(),
    },
  };
}
