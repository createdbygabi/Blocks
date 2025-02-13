export async function checkDomains(data, state) {
  const response = await fetch("/api/business/check-domains", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessNames: [state.name],
    }),
  });

  const domainData = await response.json();
  return {
    domains: domainData.results,
  };
}
