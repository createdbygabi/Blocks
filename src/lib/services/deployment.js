export class DeploymentService {
  constructor(userId) {
    this.userId = userId;
  }

  async generateFromBoilerplate(config) {
    try {
      // Save SaaS app data
      const response = await fetch("/api/saas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: config.name,
          userId: this.userId,
          landingContent: config.landingContent,
          mainFeature: config.mainFeature,
          pricing: config.pricing,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create SaaS");
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error("Deployment error:", error);
      throw error;
    }
  }
}
