export const GENERATION_STEPS = {
  branding: {
    title: "Creating Your Brand Identity",
    description: "Building your unique business brand",
    substeps: {
      logo: {
        title: "Designing Logo",
        description: "Creating a professional visual identity",
        loadingText: "AI is crafting your logo...",
      },
      names: {
        title: "Generating Names",
        description: "Finding the perfect business name",
        loadingText: "AI is brainstorming names...",
      },
      domains: {
        title: "Checking Domains",
        description: "Securing your online presence",
        loadingText: "Checking domain availability...",
      },
    },
  },
  revenue: {
    title: "Setting Up Revenue Model",
    description: "Creating your monetization strategy",
    substeps: {
      pricing_plan: {
        title: "Generating Pricing Plan",
        description: "Creating optimal pricing strategy",
        loadingText: "AI is analyzing market data...",
      },
    },
  },
  landing: {
    title: "Building Your Landing Page",
    description: "Creating your public presence",
    substeps: {
      copywriting: {
        title: "Writing Content",
        description: "Crafting your landing page content",
        loadingText: "AI is writing your content...",
      },
      preview: {
        title: "Generating Preview",
        description: "Creating your landing page preview",
        loadingText: "Building your landing page...",
      },
    },
  },
  app: {
    title: "Building Your App",
    description: "Creating your SaaS application",
    substeps: {
      deploy: {
        title: "Deploying App",
        description: "Making your app live",
        loadingText: "Deploying to joinblocks.me...",
      },
    },
  },
  payments: {
    title: "Setting Up Payments",
    description: "Connecting your payment processing",
    substeps: {
      stripe: {
        title: "Connecting Stripe",
        description: "Setting up secure payment processing",
        loadingText: "Connecting to Stripe...",
      },
    },
  },
};

export const STEP_SEQUENCE = {
  logo: "names",
  names: "domains",
  domains: "pricing_plan",
  pricing_plan: "copywriting",
  copywriting: "preview",
  preview: "deploy",
  deploy: "stripe",
};

export const MAIN_STEPS = ["branding", "revenue", "landing", "app", "payments"];

export const getMainStepForSubstep = (substep) => {
  for (const [mainStep, details] of Object.entries(GENERATION_STEPS)) {
    if (Object.keys(details.substeps).includes(substep)) {
      return mainStep;
    }
  }
  return null;
};

export const getStepNumber = (stepKey) => {
  const index = MAIN_STEPS.indexOf(stepKey);
  return index !== -1 ? index + 1 : null;
};
