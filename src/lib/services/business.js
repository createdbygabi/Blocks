// Central service layer for all business generation functionality
import { saveBusiness, getUserBusiness } from "@/lib/db";
import { saveLandingPage } from "@/lib/db";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
import { defaultContent } from "@/app/landing/page";
import { mockData } from "@/lib/mockData";
import { DeploymentService } from "./deployment";

export class BusinessService {
  constructor(userId) {
    this.userId = userId;
    this.useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  }

  // Add method to get mock business info
  getMockBusinessInfo() {
    if (!this.useMockData) return null;

    console.log("🎭 Using mock business info for onboarding");
    return mockData.onboarding.business;
  }

  async generateName(businessInfo) {
    const response = await fetch("/api/business/generate-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessInfo }),
    });

    const { names } = await response.json();
    if (!names || names.length === 0) {
      throw new Error("Failed to generate business names");
    }

    // Clean up names and remove any "- " prefix
    const cleanNames = names.map((name) => name.replace(/^-\s+/, "").trim());

    // Save to database
    await saveBusiness(this.userId, {
      name: cleanNames[0],
      generated_names: {
        names: cleanNames,
        generated_at: new Date().toISOString(),
      },
    });

    return { name: cleanNames[0], allNames: cleanNames };
  }

  async generateLogo(niche) {
    // Simple placeholder logo for development
    return {
      logo_url: "https://placehold.co/400x400/1a1a1a/ffffff?text=AI+Logo",
    };

    // TODO: generate the keyword from the product and place it in the prompt for the logo generation

    /* Real implementation (commented out for now)
    // Generate logo using the niche instead of name
    const logoResponse = await fetch("/api/logo/generate-logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `a simple, minimal logo for a ${niche} business, vector style, line art, flat design, white on black`,
      }),
    });

    const { imageUrl } = await logoResponse.json();
    await saveBusiness(this.userId, { logo_url: imageUrl });
    return { logo_url: imageUrl };
    */
  }

  async checkDomains(names) {
    const response = await fetch("/api/business/check-domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessNames: names }), // Pass array of names
    });

    const data = await response.json();
    return data;
  }

  async generateWebsite(domain) {
    // Website generation logic here
    const websiteUrl = `https://${domain}`;

    await saveBusiness(this.userId, {
      website_url: websiteUrl,
    });

    return { website_url: websiteUrl };
  }

  async generateWebsiteContent(businessInfo, brandingResults) {
    try {
      const response = await fetch("/api/website/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo,
          brandingResults,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // First get the raw text
      const text = await response.text();
      console.log("Raw API Response:", text);

      // Only try to parse if we have content
      if (!text) {
        throw new Error("Empty response from server");
      }

      // Parse the response
      const data = JSON.parse(text);

      // Validate the response structure
      if (!data || !data.content) {
        console.error("Invalid response structure:", data);
        throw new Error("Missing content in response");
      }

      // Return just the content and any additional data
      return {
        content: data.content,
        previewUrl: data.previewUrl,
        thumbnailUrl: data.thumbnailUrl,
      };
    } catch (error) {
      console.error("Failed to generate website content:", error);
      throw error;
    }
  }

  async generateBranding(businessInfo, updateProgress) {
    if (this.useMockData) {
      // Always use mock business info in mock mode
      const mockBusinessInfo = this.getMockBusinessInfo();
      console.log(
        "🎭 Using mock data for generation with business info:",
        mockBusinessInfo
      );

      // Step 1: Logo
      console.log("🎨 Generating logo...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockLogo = {
        logo_url: `https://placehold.co/400x400/1a1a1a/ffffff?text=${encodeURIComponent(
          mockBusinessInfo.niche.split(" ")[0]
        )}`,
      };
      updateProgress("logo", "completed", mockLogo);
      console.log("✅ Logo generated:", mockLogo);

      // Step 2: Names
      console.log("📝 Generating names...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateProgress("names", "completed", mockData.businessNames.names);
      console.log("✅ Names generated:", mockData.businessNames.names);

      // Step 3: Domains
      console.log("🌐 Checking domains...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateProgress("domains", "completed", mockData.domains);
      console.log("✅ Domains checked:", mockData.domains);

      // Step 4: Website Content
      console.log("📄 Starting copywriting generation...");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      updateProgress(
        "copywriting",
        "completed",
        mockData.websiteContent.content
      );
      console.log("✅ Website content generation completed");

      // Step 5: Preview
      console.log("🖼️ Generating preview...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateProgress("preview", "completed", {
        previewUrl: mockData.websiteContent.previewUrl,
        thumbnailUrl: mockData.websiteContent.thumbnailUrl,
      });
      console.log("✅ Preview generated");

      // Step 6: Deploy
      console.log("🚀 Deploying website...");
      updateProgress("deploy", "loading");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateProgress("deploy", "completed", {
        url: `https://${businessInfo.niche
          .toLowerCase()
          .replace(/\s+/g, "-")}.joinblocks.me`,
      });

      const results = {
        logo: mockLogo,
        names: mockData.businessNames.names,
        domains: mockData.domains,
        content: mockData.websiteContent.content,
        preview: {
          previewUrl: mockData.websiteContent.previewUrl,
          thumbnailUrl: mockData.websiteContent.thumbnailUrl,
        },
      };

      // Save website content to database with correct structure
      await saveLandingPage(this.userId, {
        content: mockData.websiteContent.content, // Just save the content structure
      });

      console.log("🎉 Generation complete with results:", results);
      return results;
    }

    // Real API implementation
    try {
      // Step 1: Generate name (single call)
      updateProgress("names", "loading");
      const nameResponse = await fetch("/api/business/generate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo }),
      });

      if (!nameResponse.ok) {
        throw new Error(`Name generation failed: ${nameResponse.statusText}`);
      }

      const nameData = await nameResponse.json();
      if (!nameData?.names?.length) {
        throw new Error("No names were generated");
      }
      updateProgress("names", "completed", nameData.names);

      // Step 2: Check domains (single call)
      updateProgress("domains", "loading");
      const domainsResponse = await fetch("/api/business/check-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: nameData.names }), // Ensure we're sending { names: [...] }
      });

      if (!domainsResponse.ok) {
        const errorData = await domainsResponse.json();
        throw new Error(
          errorData.error ||
            `Domain check failed: ${domainsResponse.statusText}`
        );
      }

      const domainsData = await domainsResponse.json();
      if (!Array.isArray(domainsData)) {
        throw new Error("Invalid domain check response");
      }
      updateProgress("domains", "completed", domainsData);

      // Step 3: Generate website content (single call)
      updateProgress("copywriting", "loading");
      const contentResponse = await fetch("/api/website/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo,
          brandingResults: {
            name: nameData.names[0],
            domains: domainsData,
          },
        }),
      });

      if (!contentResponse.ok) {
        throw new Error(
          `Content generation failed: ${contentResponse.statusText}`
        );
      }

      const contentData = await contentResponse.json();
      updateProgress("copywriting", "completed", contentData);

      // Deploy step
      updateProgress("deploy", "loading");
      const deploymentService = new DeploymentService(this.userId);
      const deploymentUrl = await deploymentService.generateFromBoilerplate({
        name: businessInfo.niche.toLowerCase().replace(/\s+/g, "-"),
        // Add any other config needed
      });
      updateProgress("deploy", "completed", { url: deploymentUrl });

      return {
        names: nameData.names,
        domains: domainsData,
        content: contentData,
      };
    } catch (error) {
      console.error("Generation error:", error);
      updateProgress(error.message, "error");
      throw error;
    }
  }

  async generatePricingPlan(businessInfo) {
    if (this.useMockData) {
      console.log("🎭 Using mock data for pricing plan generation");

      // Simplified pricing with single core feature
      const mockPricing = {
        name: "Essential",
        price: "29",
        billingPeriod: "monthly",
        mainFeature: businessInfo.mainFeature || "AI-powered page builder",
        description: "Start with the essential feature you need",
        features: [
          // Only the core feature
          businessInfo.mainFeature || "AI-powered page builder",
        ],
        cta: "Start Free Trial",
        trialDays: 14,
        setupFee: "0",
        limitations: "Limited to 3 pages per month",
      };

      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockPricing;
    }

    // Real API implementation
    try {
      const response = await fetch("/api/business/generate-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo }),
      });

      if (!response.ok) {
        throw new Error(`Pricing generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to generate pricing plan:", error);
      throw error;
    }
  }
}
