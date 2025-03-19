export const mockData = {
  onboarding: {
    business: {
      niche: "AI-Powered Coding Assistance & Prompt Optimization",
      services: ["AI wrapper for Cursor to enhance the prompts"],
      uniqueValue:
        "Don't waste prompts credits on bad prompts. Refine your prompts with AI before sending them to Cursor",
      painPoint:
        "Don't waste prompts credits on bad prompts. Refine your prompts with AI before sending them to Cursor (developer prompts)",
      goals: ["Save money, save time"],
      targetAudience: "Developers that use Cursor to generate code",
    },
    // business: {
    //   niche: "Content Repurposing & Audience Growth",
    //   services: [
    //     "Tool that creates newsletters with the help of AI based on previous Linkedin posts of the user",
    //   ],
    //   product: "Tool that transforms previous LinkedIn posts into newsletters",
    //   uniqueValue:
    //     "Save time by automatically transforming your LinkedIn content into engaging newsletters",
    //   painPoint:
    //     "Time saving - Content creators spend too much time repurposing content",
    //   goals: ["Grow audience", "Save time", "Increase content reach"],
    //   targetAudience: "LinkedIn influencers and content creators",
    //   mainFeature:
    //     "Tool that creates newsletters with the help of AI based on previous Linkedin posts of the user",
    // },
  },

  // Original mock data commented out for reference
  /*
  onboarding: {
    business: {
      niche: "Landing Page Builder",
      targetAudience:
        "Entrepreneurs and marketers who need high-converting landing pages without coding",
      uniqueValue:
        "AI-powered landing page builder that creates conversion-optimized pages in minutes",
      services: [
        "AI Content Generation",
        "Drag-and-Drop Builder",
        "Conversion Analytics",
        "A/B Testing",
        "Template Library",
      ],
      goals: [
        "Help businesses create landing pages faster",
        "Increase conversion rates with AI optimization",
        "Make professional design accessible to everyone",
      ],
    },
  },
  */

  businessNames: {
    names: [
      "LandingAI",
      "PageCraft",
      "ConvertFlow",
      "LaunchPage",
      "PageGenius",
    ],
  },

  domains: [
    {
      name: "TechFlow",
      domains: [
        {
          domain: "techflow.com",
          available: true,
          prices: {
            registration_price: "14.99",
            renewal_price: "14.99",
            transfer_price: "14.99",
          },
          premium: false,
        },
      ],
      cheapestDomain: "techflow.com",
    },
    // More domain results...
  ],

  websiteContent: {
    content: {
      hero: {
        title: "Create High-Converting Landing Pages in Minutes",
        subtitle:
          "AI-powered landing page builder that helps you achieve 3x higher conversion rates",
        cta: "Start Building Free",
        secondaryCta: "View Templates",
        metrics: [
          {
            id: "metric-1",
            value: "10k+",
            label: "Pages Created",
            iconName: "layout",
          },
          {
            id: "metric-2",
            value: "89%",
            label: "Conversion Rate",
            iconName: "trending-up",
          },
          {
            id: "metric-3",
            value: "5min",
            label: "Avg Build Time",
            iconName: "clock",
          },
        ],
        socialProof: {
          rating: 4.9,
          reviews: 2500,
          platform: "Rated #1 on G2 Crowd",
        },
      },
      features: [
        {
          id: "feature-1",
          title: "AI-Powered Analytics",
          description: "Get insights from your data instantly",
          iconName: "chart",
          metrics: "83% better engagement",
          detail: "Based on real-time data",
        },
      ],
      process: {
        title: "How It Works",
        subtitle: "Simple Process",
        steps: [
          {
            title: "Initial Consultation",
            detail: "Comprehensive Analysis",
            number: "01",
            description: "We understand your needs",
          },
        ],
      },
      testimonials: {
        title: "What Users Say",
        subtitle: "Real Testimonials",
        items: [
          {
            id: "testimonial-1",
            quote: "Great service",
            author: "John Doe",
            role: "CEO",
            company: {
              name: "Company Name",
              detail: "Industry Leader",
              result: "10x Growth",
            },
          },
        ],
      },
      comparison: {
        title: "Why Choose Us",
        subtitle: "The Difference",
        items: [
          {
            feature: "Time to Launch",
            us: "15 minutes",
            others: "2-3 days",
            detail: "Based on actual deployments",
          },
        ],
      },
      pricing: {
        title: "Simple Pricing",
        subtitle: "Choose Your Plan",
        plans: [
          {
            name: "Starter",
            price: "$0",
            period: "/month",
            perfect: "For small projects",
            features: ["Core Features", "Basic Support"],
            cta: "Start Free",
          },
        ],
      },
      faq: {
        title: "Common Questions",
        items: [
          {
            question: "How can we help?",
            answer: "We provide comprehensive solutions.",
          },
        ],
      },
      final: {
        title: "Ready to Get Started?",
        subtitle: "Join other successful businesses",
        cta: "Start Now",
        secondaryCta: "Contact Us",
        guarantee: "30-day satisfaction guarantee",
      },
    },
    styles: {
      colors: {
        primary: "#3B82F6",
        secondary: "#1E293B",
      },
      layout: "default",
    },
    theme: "modern",
    design: "minimal",
    font: "sans",
    previewUrl: "/landing",
    thumbnailUrl: "https://placehold.co/1200x630",
  },
};
