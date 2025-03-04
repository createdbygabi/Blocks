// Central service layer for all business generation functionality
import { saveBusiness, getUserBusiness } from "@/lib/db";
import { saveLandingPage } from "@/lib/db";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
import { defaultContent } from "@/app/app/landing/page";
import { mockData } from "@/lib/mockData";
import { DeploymentService } from "./deployment";
import { supabase } from "@/lib/supabase";

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
    try {
      console.log("🎭 Using mock data for name generation");

      const mockNames = [
        "IntelliFlow",
        "SmartSynth",
        "AiForge",
        "NexusAI",
        "BrainWave",
      ];

      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        await saveBusiness(this.userId, {
          name: mockNames[0],
          subdomain: mockNames[0].toLowerCase().replace(/\s+/g, "_"),
        });
      } catch (error) {
        console.error("Failed to save business name:", error);
      }
      return mockNames[0];
    } catch (error) {
      console.error("Failed to generate names:", error);
      throw error;
    }
  }

  async generateLogo(businessInfo) {
    try {
      console.log("🎭 Using mock data for logo generation");

      const mockLogo = {
        logo_url: "https://via.placeholder.com/150",
        alt_text: "Generated Logo",
        colors: ["#2563eb", "#1e40af"],
      };

      await new Promise((resolve) => setTimeout(resolve, 1200));
      return mockLogo;
    } catch (error) {
      console.error("Failed to generate logo:", error);
      throw error;
    }
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

  async generateWebsiteContent(businessInfo, brandingResults, pricingPlan) {
    try {
      // If using mock data, return mock content
      // if (this.useMockData) {
      // console.log("🎭 Using mock data for website content");
      // const mockContent = {
      //   content: {
      //     hero: {
      //       title: `Build Your ${businessInfo.niche} Business`,
      //       subtitle: "Launch faster with AI-powered tools and templates",
      //       cta: "Start Free Trial",
      //     },
      //     features: [
      //       {
      //         title: "AI-Powered Generation",
      //         description: "Create content and designs in seconds",
      //       },
      //       {
      //         title: "Professional Templates",
      //         description: "Start with beautiful, ready-to-use designs",
      //       },
      //     ],
      //     pricing: {
      //       title: "Simple, Transparent Pricing",
      //       description: "Start free, upgrade when you're ready",
      //     },
      //   },
      //   theme: {
      //     id: "modern-clean",
      //     name: "Modern Clean",
      //     colors: {
      //       card: {
      //         base: "bg-[#FFFFFF] border border-[#E5E7EB]",
      //         hover: "hover:shadow-lg hover:border-[#BFDBFE]",
      //       },
      //       text: {
      //         muted: "text-[#6B7280]",
      //         accent: "text-[#2563EB]",
      //         primary: "text-[#111827]",
      //         secondary: "text-[#4B5563]",
      //       },
      //       border: "border-[#E5E7EB]",
      //       button: {
      //         primary: {
      //           base: "bg-[#2563EB] text-[#FFFFFF]",
      //           hover: "hover:bg-[#1D4ED8]",
      //         },
      //         secondary: {
      //           base: "bg-[#FFFFFF] text-[#111827] border border-[#E5E7EB]",
      //           hover: "hover:bg-[#F9FAFB]",
      //         },
      //       },
      //       divider: "border-[#E5E7EB]",
      //       overlay: "bg-[#000000]/50",
      //       section: {
      //         primary: "bg-[#2563EB]",
      //         secondary: "bg-[#F3F4F6]",
      //       },
      //       surface: "bg-[#FFFFFF]",
      //       highlight: "bg-[#EFF6FF]",
      //       background: "bg-[#F9FAFB]",
      //     },
      //     audience: "SaaS & Enterprise",
      //   },
      //   design: {
      //     id: "modern-default",
      //     name: "Modern Default",
      //     styles: {
      //       ui: {
      //         shadows: "shadow-md",
      //         buttonSize: "px-4 py-2",
      //         roundedness: "rounded-lg",
      //         transitions: "transition duration-200",
      //       },
      //       spacing: {
      //         stack: "space-y-6",
      //         section: "py-20",
      //         container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      //       },
      //       typography: {
      //         body: "text-base leading-relaxed",
      //         button: "text-sm",
      //         heading: "text-4xl tracking-tight",
      //         subheading: "text-2xl",
      //       },
      //     },
      //     description: "Clean and professional with balanced proportions",
      //   },
      //   font: {
      //     id: "modernSans",
      //     name: "Modern Sans",
      //     styles: {
      //       body: "font-normal",
      //       button: "font-medium",
      //       heading: "font-bold tracking-tight",
      //       subheading: "font-semibold",
      //     },
      //     description:
      //       "Clean and contemporary typography using DM Sans + Plus Jakarta Sans",
      //   },
      //   previewUrl: "/landing",
      //   thumbnailUrl: "/preview.png",
      // };

      // updateProgress("landing", "completed", mockContent);
      // await this.saveLandingPage(businessInfo.id, mockContent);
      // return;
      // }

      // Prepare the data with all required fields
      console.log(
        "🔍 Branding Results from generateWebsiteContent:",
        brandingResults
      );

      const requestData = {
        businessInfo,
        brandingResults,
        pricingPlan,
      };

      console.log("📤 Sending website content request:", requestData);

      const response = await fetch("/api/website/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
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

      // After getting the API response and before saving
      const defaultData = {
        theme: {
          id: "modern-clean",
          name: "Modern Clean",
          colors: {
            card: {
              base: "bg-[#FFFFFF] border border-[#E5E7EB]",
              hover: "hover:shadow-lg hover:border-[#BFDBFE]",
            },
            text: {
              muted: "text-[#6B7280]",
              accent: "text-[#2563EB]",
              primary: "text-[#111827]",
              secondary: "text-[#4B5563]",
            },
            border: "border-[#E5E7EB]",
            button: {
              primary: {
                base: "bg-[#2563EB] text-[#FFFFFF]",
                hover: "hover:bg-[#1D4ED8]",
              },
              secondary: {
                base: "bg-[#FFFFFF] text-[#111827] border border-[#E5E7EB]",
                hover: "hover:bg-[#F9FAFB]",
              },
            },
            divider: "border-[#E5E7EB]",
            overlay: "bg-[#000000]/50",
            section: {
              primary: "bg-[#2563EB]",
              secondary: "bg-[#F3F4F6]",
            },
            surface: "bg-[#FFFFFF]",
            highlight: "bg-[#EFF6FF]",
            background: "bg-[#F9FAFB]",
          },
          audience: "SaaS & Enterprise",
        },
        design: {
          id: "modern-default",
          name: "Modern Default",
          styles: {
            ui: {
              shadows: "shadow-md",
              buttonSize: "px-4 py-2",
              roundedness: "rounded-lg",
              transitions: "transition duration-200",
            },
            spacing: {
              stack: "space-y-6",
              section: "py-20",
              container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
            },
            typography: {
              body: "text-base leading-relaxed",
              button: "text-sm",
              heading: "text-4xl tracking-tight",
              subheading: "text-2xl",
            },
          },
          description: "Clean and professional with balanced proportions",
        },
        font: {
          id: "modernSans",
          name: "Modern Sans",
          styles: {
            body: "font-normal",
            button: "font-medium",
            heading: "font-bold tracking-tight",
            subheading: "font-semibold",
          },
          description:
            "Clean and contemporary typography using DM Sans + Plus Jakarta Sans",
        },
      };

      // Merge the API response with default data
      const completeData = {
        ...data.content,
        ...defaultData,
      };

      // Add user_id when saving the landing page
      await saveLandingPage(businessInfo.id, {
        content: completeData,
        user_id: this.userId, // Add the user_id from BusinessService
        business_id: businessInfo.id,
        updated_at: new Date().toISOString(),
      });

      // Return just the content and any additional data
      return {
        content: data.content,
        theme: data.theme,
        design: data.design,
        font: data.font,
        previewUrl: data.previewUrl,
        thumbnailUrl: data.thumbnailUrl,
      };
    } catch (error) {
      console.error("Failed to generate website content:", error);
      throw error;
    }
  }

  async generateBranding(businessInfo, updateProgress) {
    try {
      // Step 1: Create Business
      console.log("🏢 Creating business record...");
      updateProgress("business", "loading");
      console.log("🔍 Business info:", businessInfo);
      const business = await this.createBusiness({
        ...businessInfo,
      });
      updateProgress("business", "completed", business);
      console.log("✅ Business created:", business);

      // Step 2: Generate Logo
      console.log("🎨 Generating logo...");
      updateProgress("logo", "loading");
      const logo = await this.generateLogo(businessInfo);
      updateProgress("logo", "completed", logo);
      console.log("✅ Logo generated");

      // Step 3: Generate Names
      console.log("🎨 Generating names...");
      updateProgress("names", "loading");
      const name = await this.generateName(businessInfo);
      // Pass array of names directly to the progress update
      updateProgress("names", "completed", name);
      console.log("✅ Names generated:", name);

      business.name = name;
      business.subdomain = name.toLowerCase().replace(/\s+/g, "_");
      business.logo_url = logo.logo_url;

      // // Step 4: Setup Subdomain
      // console.log("🌐 Setting up subdomain...");
      // updateProgress("subdomain", "loading");
      // await this.setupSubdomain(business.id, name);
      // updateProgress("subdomain", "completed");
      // console.log("✅ Subdomain setup complete");

      // // Step 6: Save Everything
      // console.log("💾 Saving all generated content...");
      // updateProgress("saving", "loading");
      // await this.saveGeneratedContent(business.id, logo, landingPage);
      // updateProgress("saving", "completed");
      // console.log("✅ All content saved");

      return {
        business,
      };
    } catch (error) {
      console.error("Error in generateBranding:", error);
      throw error;
    }
  }

  async generatePricingPlan(businessInfo) {
    try {
      console.log("🎭 Using mock data for pricing plan generation");

      // Ensure features is a simple array of strings
      // const mockPricing = {
      //   id: "essential-plan", // Add an ID since PricingPlans uses it as key
      //   name: "Essential",
      //   price: 29,
      //   billingPeriod: "monthly",
      //   mainFeature: "AI-powered landing page builder",
      //   description: "Perfect for getting started with your digital business",
      //   features: ["AI-powered landing page builder"], // Keep this as array even for single feature
      //   cta: "Start Free Trial",
      //   trialDays: 14,
      //   setupFee: 0,
      //   limitations: "Limited to 3 pages per month",
      // };

      // Add debug logging
      // console.log("🔍 Mock pricing plan structure:", {
      //   hasFeatures: !!mockPricing.pricing_plans[0].features,
      //   featuresType: typeof mockPricing.pricing_plans[0].features,
      //   isArray: Array.isArray(mockPricing.pricing_plans[0].features),
      //   features: mockPricing.pricing_plans[0].features,
      // });

      const response = await fetch("/api/business/generate-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo }),
      });

      if (!response.ok) {
        throw new Error(`Pricing generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        "pricing data from api that we're saving in the database",
        data
      );

      // Save the pricing plan to the business
      if (businessInfo.id) {
        await this.updateBusiness(businessInfo.id, {
          pricing_plans: data,
          updated_at: new Date().toISOString(),
        });
      }

      return data;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (businessInfo.id) {
        await this.updateBusiness(businessInfo.id, {
          pricing_plans: mockPricing,
          updated_at: new Date().toISOString(),
        });
      }

      return mockPricing;
    } catch (error) {
      console.error("Failed to generate pricing plan:", error);
      throw error;
    }
  }

  async saveLandingPage(businessId, content) {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .insert({
          business_id: businessId,
          user_id: this.userId,
          content: content.content,
          theme: content.theme,
          design: content.design,
          font: content.font,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving landing page:", error);
      throw error;
    }
  }

  async updateBusiness(businessId, updates) {
    try {
      console.log("📝 Updating business:", { businessId, updates });

      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", businessId)
        .select()
        .single();

      if (error) {
        console.error("Failed to update business:", error);
        throw error;
      }

      console.log("✅ Business updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in updateBusiness:", error);
      throw error;
    }
  }

  async createBusiness(businessInfo) {
    try {
      console.log("📝 Creating new business:", businessInfo);

      const { data, error } = await supabase
        .from("businesses")
        .insert({
          user_id: this.userId,
          name: businessInfo.name || businessInfo.niche,
          niche: businessInfo.niche,
          main_feature: businessInfo.mainFeature,
          product: businessInfo.product || null,
          pain_point: businessInfo.painPoint || null,
          target_audience: businessInfo.targetAudience || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create business:", error);
        throw error;
      }

      console.log("✅ Business created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in createBusiness:", error);
      throw error;
    }
  }

  async createStripeAccount(businessId) {
    console.log("💳 Creating Stripe account for business:", businessId);
    try {
      const response = await fetch("/api/stripe/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const json = await response.json();

      if (!json.account) {
        throw new Error("Failed to create Stripe account");
      }
      console.log("💳 Stripe account created:", json.account);

      // Save the account ID to business record
      await this.updateBusiness(businessId, {
        stripe_account_id: json.account,
      });

      return json.account;
    } catch (error) {
      console.error("Failed to create Stripe account:", error);
      throw error;
    }
  }

  async createStripeAccountLink(accountId, returnUrl) {
    try {
      const response = await fetch("/api/stripe/account-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: accountId,
          returnUrl,
        }),
      });

      const { url } = await response.json();
      if (!url) {
        throw new Error("Failed to create account link");
      }

      return url;
    } catch (error) {
      console.error("Failed to create account link:", error);
      throw error;
    }
  }

  async generateLandingPage(businessInfo) {
    try {
      console.log("🎭 Using mock data for landing page generation");

      const mockLanding = {
        theme: {
          name: "Modern Minimal",
          colors: ["#2563eb", "#1e40af", "#dbeafe"],
          audience: "Tech-savvy professionals",
        },
        content: {
          headline: "Transform Your Business with AI",
          description:
            "Automate your workflow and boost productivity with our intelligent solutions",
          features: [
            "Smart automation tools",
            "Real-time analytics",
            "24/7 AI assistance",
          ],
        },
      };

      await new Promise((resolve) => setTimeout(resolve, 1500));
      return mockLanding;
    } catch (error) {
      console.error("Failed to generate landing page:", error);
      throw error;
    }
  }

  async saveGeneratedContent(businessId, logo, landingPage) {
    try {
      console.log("💾 Saving generated content for business:", businessId);

      // Save logo URL to business record
      if (logo?.logo_url) {
        await this.updateBusiness(businessId, {
          logo_url: logo.logo_url,
          updated_at: new Date().toISOString(),
        });
      }

      // Save landing page content
      if (landingPage) {
        await this.saveLandingPage(businessId, landingPage);
      }

      console.log("✅ All content saved successfully");
    } catch (error) {
      console.error("Error saving generated content:", error);
      throw error;
    }
  }

  async setupSubdomain(businessId, subdomain) {
    try {
      // Update business with hardcoded subdomain
      await this.updateBusiness(businessId, {
        subdomain: subdomain.toLowerCase(),
        updated_at: new Date().toISOString(),
      });

      console.log("✅ Test subdomain setup completed");
      return subdomain;
    } catch (error) {
      console.error("Error setting up subdomain:", error);
      throw error;
    }
  }

  async setupStripeAccount(businessId, returnUrl) {
    try {
      console.log("💳 Setting up Stripe account for business:", businessId);

      // Create Stripe account and save it to business record
      const accountId = await this.createStripeAccount(businessId);

      // Get account link URL
      const url = await this.createStripeAccountLink(accountId, returnUrl);

      if (!url) {
        throw new Error("Failed to create Stripe account link");
      }

      return {
        accountId,
        url,
      };
    } catch (error) {
      console.error("Failed to setup Stripe account:", error);
      throw error;
    }
  }

  async setupMarketingChannels(businessInfo) {
    try {
      console.log("📱 Setting up marketing channels for:", businessInfo);

      // Add validation and defaults
      const businessName = businessInfo?.name || "my_business";
      const niche = businessInfo?.niche || "business";
      const mainFeature = businessInfo?.mainFeature || "Premium service";
      const product = businessInfo?.product || "Premium service";

      const channels = {
        instagram: {
          suggestedUsername: businessName.toLowerCase().replace(/\s+/g, "_"),
          suggestedBio: `${mainFeature}\n✨ ${niche} solutions\n🌟 ${product}`,
          setupSteps: [
            "1. Go to instagram.com/signup",
            `2. Create account with username: ${businessName
              .toLowerCase()
              .replace(/\s+/g, "_")}`,
            "3. Add your business logo as profile picture",
            "4. Complete your bio with the suggested text",
            "5. Start sharing your journey!",
          ],
        },
      };

      console.log("✨ Generated marketing channels data:", channels);

      // Save to business record if we have an ID
      if (businessInfo?.id) {
        await this.updateBusiness(businessInfo.id, {
          marketing_channels: channels,
          updated_at: new Date().toISOString(),
        });
      }

      return channels;
    } catch (error) {
      console.error("Failed to setup marketing channels:", error);
      throw error;
    }
  }

  async generateInstagramSetup(businessInfo) {
    try {
      console.log("🎭 Using mock data for Instagram setup");

      const mockInstagram = {
        instagram: {
          suggestedUsername: "intelliflow.ai",
          suggestedBio:
            "🚀 Transforming businesses with AI\n💡 Smart automation tools\n⚡️ Boost your productivity\n🔗 Get started: intelliflow.ai",
          setupSteps: [
            "Create a business Instagram account",
            "Add your brand logo as profile picture",
            "Update bio with suggested text",
            "Create 3 initial posts about your features",
            "Follow relevant industry accounts",
          ],
        },
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockInstagram;
    } catch (error) {
      console.error("Failed to generate Instagram setup:", error);
      throw error;
    }
  }
}
