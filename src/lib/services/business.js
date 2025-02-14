// Central service layer for all business generation functionality
import { saveBusiness, getUserBusiness } from "@/lib/db";
import { saveLandingPage } from "@/lib/db";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
import { defaultContent } from "@/app/landing/page";

export class BusinessService {
  constructor(userId) {
    this.userId = userId;
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

  async generateBranding(businessInfo, updateStep) {
    try {
      // Step 1: Generate logo first
      updateStep("logo", "running");
      const { logo_url } = await this.generateLogo(businessInfo.niche);
      updateStep("logo", "completed", logo_url);

      // Step 2: Generate business names
      updateStep("names", "running");
      const { allNames } = await this.generateName(businessInfo);
      updateStep("names", "completed", allNames);

      // Step 3: Check domains for all names
      updateStep("domains", "running");
      const domainData = await this.checkDomains(allNames);

      // Process domain results to show all domains with recommendations
      const domainResults = domainData.results.map((result) => {
        // Include all domains, both available and unavailable
        const allDomains = result.domains.sort((a, b) => {
          // Sort available domains by price first
          if (a.available && b.available) {
            return a.prices.registration_price - b.prices.registration_price;
          }
          // Put available domains before unavailable ones
          return a.available ? -1 : b.available ? 1 : 0;
        });

        const availableDomains = allDomains.filter((d) => d.available);
        const cheapestDomain = availableDomains[0];
        const bestValue = cheapestDomain?.domain;

        return {
          name: result.name,
          allDomains, // Include all domains
          bestValue,
          startingPrice: cheapestDomain?.prices.registration_price,
        };
      });

      updateStep("domains", "completed", domainResults);

      // Website Generation Steps
      updateStep("copywriting", "running");
      const { content, previewUrl, thumbnailUrl } =
        await this.generateWebsiteContent(businessInfo, {
          name: allNames[0],
          logo_url,
          domains: domainResults,
        });
      updateStep("copywriting", "completed", content);

      // Use the preview URL directly from generateWebsiteContent
      updateStep("preview", "completed", {
        url: previewUrl,
        thumbnail: thumbnailUrl,
      });

      return {
        logo_url,
        name: allNames[0],
        allNames,
        domains: domainResults,
        website: {
          content,
          previewUrl,
          thumbnailUrl,
        },
      };
    } catch (error) {
      console.error("❌ Error in generation:", error);
      throw error;
    }
  }
}
