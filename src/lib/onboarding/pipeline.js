// Update pipeline to include parallel tasks
export const PIPELINE_STEPS = {
  BUSINESS_IDEA: {
    id: "business_idea",
    required: true,
    title: "Business Idea",
    description: "Define your business concept",
    handler: "generateBusinessIdea",
  },
  GENERATION: {
    id: "generation",
    required: true,
    title: "Building Your Business",
    description: "Creating your complete business setup",
    parallelTasks: {
      branding: {
        title: "Creating Your Brand",
        description: "Generating business name and logo",
        handler: "generateBranding",
      },
      website: {
        title: "Building Website",
        description: "Setting up your landing page",
        handler: "generateWebsite",
      },
      domain: {
        title: "Securing Domain",
        description: "Finding and reserving your domain name",
        handler: "checkDomains",
      },
    },
    integrations: {
      stripe: {
        title: "Payment Setup",
        description: "Connect Stripe to accept payments",
        optional: true,
        handler: "setupStripe",
      },
      instagram: {
        title: "Social Media",
        description: "Connect Instagram for marketing",
        optional: true,
        handler: "setupInstagram",
      },
    },
  },
  LAUNCH: {
    id: "launch",
    required: true,
    title: "Launch",
    description: "Review and launch your business",
    handler: "launchBusiness",
  },
};
