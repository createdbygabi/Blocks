import { BusinessService } from "@/lib/services/business";

// All automated tasks that run in background
export const createAutomatedTasks = (userId) => {
  const businessService = new BusinessService(userId);

  return {
    branding: {
      title: "Creating Your Brand",
      description: "Generating business name, logo, and checking domains",
      async execute(businessInfo) {
        return await businessService.generateBranding(businessInfo);
      },
    },
  };
};

// Optional integrations
export const integrations = {
  stripe: {
    title: "Payment Setup",
    description: "Connect Stripe to accept payments",
    async setup() {
      window.location.href = `/stripe-account`;
    },
  },
  instagram: {
    title: "Social Media",
    description: "Connect Instagram for marketing",
    async setup() {
      window.location.href = `/instagram-connect`;
    },
  },
};
