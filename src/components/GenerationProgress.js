import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { QuickActionCard } from "./QuickActionCard";
import { BusinessService } from "@/lib/services/business";

const GENERATION_STEPS = {
  branding: {
    title: "Creating Your Brand Identity",
    description: "Building your unique business brand",
    substeps: {
      logo: {
        title: "Designing Logo",
        description: "Creating a professional visual identity",
        loadingText: "AI is crafting your logo..^",
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
  marketing: {
    title: "Setting Up Marketing Channels",
    description: "Connecting your marketing platforms",
    substeps: {
      channels: {
        title: "Instagram Setup",
        description: "Create your business Instagram profile",
        loadingText: "Preparing Instagram setup guide...",
      },
    },
  },
};

console.log("🔍 GENERATION_STEPS structure:", GENERATION_STEPS);

// Update the step order to match the logical flow
const STEP_ORDER = [
  "branding", // 1. Brand identity
  "revenue", // 2. Revenue model
  "landing", // 3. Landing page
  "app", // 4. Build app
  "payments", // 5. Payments
  "marketing", // 6. Marketing
];

export function GenerationProgress({ businessInfo, onComplete }) {
  const { user } = useUser();
  const [businessId, setBusinessId] = useState(null);
  const [generationState, setGenerationState] = useState({
    currentStep: "logo",
    results: {},
    error: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedStep, setExpandedStep] = useState("branding");
  const [isCompleted, setIsCompleted] = useState(false);
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [stripeError, setStripeError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState();
  const [isStripeWindowOpen, setIsStripeWindowOpen] = useState(false);

  const updateProgress = useCallback((step, status, data = null) => {
    console.log(`🔄 Updating progress for ${step}:`, { status, data });

    setGenerationState((prev) => {
      const nextStep = status === "completed" ? getNextStep(step) : step;
      const mainStep = getMainStepForSubstep(step);
      console.log("Next step will be:", nextStep);
      console.log("Main step is:", mainStep);

      // If this is the first substep of a main step, expand its accordion
      if (mainStep && !prev.results[step]) {
        setExpandedStep(mainStep);
      }

      // Log the state update
      const newState = {
        ...prev,
        currentStep: nextStep,
        results: {
          ...prev.results,
          [step]: { status, data },
        },
        error: status === "error" ? step : null,
      };
      console.log("New generation state will be:", newState);
      return newState;
    });
  }, []);

  const getNextStep = (currentStep) => {
    console.log("🔄 Getting next step from:", currentStep);

    const steps = {
      logo: "names",
      names: "domains",
      domains: "pricing_plan",
      pricing_plan: "deploy",
      deploy: "copywriting",
      copywriting: "preview",
      preview: "stripe",
      stripe: "channels",
      channels: null,
    };

    return steps[currentStep];
  };

  const isStepCompleted = (stepKey) => {
    const substeps = GENERATION_STEPS[stepKey].substeps;
    return Object.keys(substeps).every(
      (subKey) => generationState.results[subKey]?.status === "completed"
    );
  };

  // Add a function to get the main step for a substep
  const getMainStepForSubstep = (substep) => {
    for (const [mainStep, data] of Object.entries(GENERATION_STEPS)) {
      if (Object.keys(data.substeps).includes(substep)) {
        return mainStep;
      }
    }
    return null;
  };

  // Add a function to check if a step can be accessed
  const canAccessStep = (stepKey) => {
    const stepIndex = STEP_ORDER.indexOf(stepKey);
    if (stepIndex === 0) return true; // First step is always accessible

    // Get all previous steps
    const previousSteps = STEP_ORDER.slice(0, stepIndex);

    // Check if any previous step has started (has any completed substeps)
    return previousSteps.some((prevStep) => {
      const substeps = GENERATION_STEPS[prevStep].substeps;
      return Object.keys(substeps).some(
        (subKey) => generationState.results[subKey]?.status === "completed"
      );
    });
  };

  // Single generation effect with proper completion check
  useEffect(() => {
    const shouldGenerate =
      user?.id &&
      businessInfo &&
      !isGenerating &&
      !generationState.error &&
      !isCompleted;

    console.log("🔍 Generation conditions:", {
      hasUser: !!user?.id,
      hasBusinessInfo: !!businessInfo,
      isGenerating,
      hasError: !!generationState.error,
      isCompleted,
      shouldGenerate,
    });

    if (shouldGenerate) {
      const generateBusiness = async () => {
        console.log("🚀 Starting content generation");
        setIsGenerating(true);

        try {
          const businessService = new BusinessService(user.id);

          // Step 1: Generate branding (which includes business creation)
          const brandingResults = await businessService.generateBranding(
            businessInfo,
            updateProgress
          );
          setBusinessId(brandingResults.business.id);
          console.log(
            "✅ Business created with ID:",
            brandingResults.business.id
          );

          // Step 2: Generate pricing plan
          updateProgress("pricing_plan", "loading");
          const pricingPlan = await businessService.generatePricingPlan({
            ...businessInfo,
            id: brandingResults.business.id,
          });
          updateProgress("pricing_plan", "completed", pricingPlan);

          // Step 3: Generate landing page content
          updateProgress("copywriting", "loading");
          const websiteContent = await businessService.generateWebsiteContent(
            { ...businessInfo, id: brandingResults.business.id },
            {
              ...brandingResults,
              pricing_plan: pricingPlan,
            }
          );
          updateProgress("copywriting", "completed", websiteContent);

          // Step 4: Deploy app
          updateProgress("deploy", "loading");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          updateProgress("deploy", "completed", {
            url: `http://${businessInfo.niche
              .toLowerCase()
              .replace(/\s+/g, "-")}.localhost:3000`,
          });

          // Generate preview
          updateProgress("preview", "loading");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          updateProgress("preview", "completed", { url: "/landing" });

          // Initialize Stripe step as pending (but don't execute it)
          updateProgress("stripe", "pending");

          console.log("✨ Generation completed:", brandingResults);
          onComplete?.({ ...brandingResults, businessId });
          setIsCompleted(true);
        } catch (error) {
          console.error("❌ Generation error:", error);
          setGenerationState((prev) => ({
            ...prev,
            error: error.message,
          }));
        } finally {
          setIsGenerating(false);
        }
      };

      generateBusiness();
    }
  }, [
    user?.id,
    businessInfo,
    onComplete,
    updateProgress,
    isGenerating,
    generationState.error,
    isCompleted,
  ]);

  // Update the step expansion effect
  useEffect(() => {
    // Use the STEP_ORDER array instead of hardcoding
    const currentIndex = STEP_ORDER.indexOf(expandedStep);

    // Only proceed if we're not on the last step
    if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) return;

    // Check if current step is completed
    const isCurrentStepDone = isStepCompleted(expandedStep);

    // If current step is done, expand next step
    if (isCurrentStepDone) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      setExpandedStep(nextStep);
    }
  }, [generationState.results, expandedStep]);

  // Update the handleStepClick function
  const handleStepClick = (stepKey) => {
    const canExpand =
      stepKey === "branding" ||
      canAccessStep(stepKey) ||
      expandedStep === stepKey ||
      isStepCompleted(stepKey);

    if (canExpand) {
      setExpandedStep(stepKey === expandedStep ? null : stepKey);
    }
  };

  // Add this effect to listen for completion message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "stripe_complete") {
        setIsStripeWindowOpen(false);
        // Move to next step
        updateProgress("stripe", "completed", {
          accountId: connectedAccountId,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [connectedAccountId, updateProgress]);

  // Update the button click handler
  const handleStripeSetup = async () => {
    if (!businessId) {
      console.error("No business ID available");
      return;
    }

    setAccountCreatePending(true);
    setStripeError(false);

    try {
      const businessService = new BusinessService(user.id);
      const { accountId, url } = await businessService.setupStripeAccount(
        businessId,
        `${window.location.origin}/dashboard?stripe=success`
      );

      setConnectedAccountId(accountId);

      if (url) {
        window.open(url, "_blank");
        setIsStripeWindowOpen(true);
      } else {
        setStripeError(true);
      }
    } catch (error) {
      console.error("Stripe setup error:", error);
      setStripeError(true);
    } finally {
      setAccountCreatePending(false);
    }
  };

  // Update the completion effect to properly trigger the marketing step
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log("🔍 Checking URL params:", Object.fromEntries(params));

    if (params.get("stripe") === "success") {
      console.log("✅ Stripe success param found");
      window.history.replaceState({}, "", window.location.pathname);

      if (connectedAccountId) {
        console.log("🎯 Connected account ID found:", connectedAccountId);
        console.log("🚀 Triggering marketing channels setup");

        updateProgress("stripe", "completed", {
          accountId: connectedAccountId,
        });
        setIsStripeWindowOpen(false);

        setIsGenerating(true);
        setGenerationState((prev) => {
          const newState = {
            ...prev,
            currentStep: "channels",
          };
          console.log("📊 Setting new generation state:", newState);
          return newState;
        });
      }
    }
  }, [window.location.search, connectedAccountId, updateProgress]);

  // Separate effect for handling the marketing channels step
  useEffect(() => {
    console.log("🔄 Marketing channels effect running with:", {
      currentStep: generationState.currentStep,
      isGenerating,
      businessId,
      hasBusinessInfo: !!businessInfo,
    });

    const setupMarketingChannels = async () => {
      if (generationState.currentStep === "channels" && isGenerating) {
        console.log("🎯 Starting marketing channels setup");
        try {
          updateProgress("channels", "loading");

          const businessService = new BusinessService(user.id);
          const marketingChannels =
            await businessService.setupMarketingChannels({
              ...businessInfo,
              id: businessId,
            });

          console.log("✨ Marketing channels setup result:", marketingChannels);
          updateProgress("channels", "completed", marketingChannels);

          setIsGenerating(false);
          setIsCompleted(true);
        } catch (error) {
          console.error("❌ Marketing channels setup error:", error);
          updateProgress("channels", "error");
          setIsGenerating(false);
        }
      }
    };

    setupMarketingChannels();
  }, [
    generationState.currentStep,
    isGenerating,
    businessId,
    businessInfo,
    user?.id,
  ]);

  if (generationState.error) {
    return <div>Error: {generationState.error}</div>;
  }

  // Add result display components
  const NamesList = ({ names }) => (
    <div className="space-y-2">
      {names.map((name, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center text-xs bg-black/30 rounded">
            {i + 1}
          </span>
          <span className="font-medium">{name}</span>
        </div>
      ))}
    </div>
  );

  const DomainsList = ({ domains }) => {
    if (!Array.isArray(domains)) {
      console.error("Invalid domains data:", domains);
      return <div>Error loading domain data</div>;
    }

    return (
      <div className="space-y-4">
        {domains.map((result, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{result.name}</span>
              {result.cheapestDomain && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                  Best price: ${result.domains[0]?.prices?.registration_price}
                </span>
              )}
            </div>

            <div className="grid gap-1">
              {result.domains.map((domain, j) => (
                <div
                  key={j}
                  className={`flex items-center justify-between p-2 rounded text-xs ${
                    domain.available
                      ? domain.domain === result.cheapestDomain
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-black/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{domain.domain}</span>
                    {domain.available ? (
                      domain.domain === result.cheapestDomain && (
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded text-[10px]">
                          Best Value
                        </span>
                      )
                    ) : (
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded text-[10px]">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {domain.available && domain.prices && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">
                        ${domain.prices.registration_price}
                      </span>
                      <a
                        href={`https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                      >
                        Register
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const LogoPreview = ({ url }) => {
    // Handle both string URL and object with logo_url
    const logoUrl = typeof url === "string" ? url : url?.logo_url;

    return (
      <div className="aspect-square w-32 bg-black/30 border border-gray-800 rounded-xl p-4">
        <img
          src={logoUrl}
          alt="Generated logo"
          className="w-full h-full object-contain"
        />
      </div>
    );
  };

  // Update the PricingPlanPreview component to handle the new format
  const PricingPlanPreview = ({ plan }) => {
    // If plan is part of pricing_plans array, extract the first plan
    const pricingPlan = plan.pricing_plans ? plan.pricing_plans[0] : plan;

    return (
      <div className="mt-4 bg-black/30 rounded-xl border border-gray-800 p-4 space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Plan</div>
          <div className="text-lg font-medium">{pricingPlan.name}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Price</div>
          <div className="text-2xl font-bold text-blue-400">
            ${pricingPlan.price}
            <span className="text-sm text-gray-400">
              /{pricingPlan.billingPeriod}
            </span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Features</div>
          <ul className="space-y-2">
            {pricingPlan.features?.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        {pricingPlan.limitations && (
          <div>
            <div className="text-sm text-gray-400 mb-1">Limitations</div>
            <div className="text-sm">{pricingPlan.limitations}</div>
          </div>
        )}
        {pricingPlan.trialDays > 0 && (
          <div>
            <div className="text-sm text-gray-400 mb-1">Trial Period</div>
            <div className="text-sm text-green-400">
              {pricingPlan.trialDays} days free trial
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update the InstagramSetupPreview component
  const InstagramSetupPreview = ({ data }) => {
    console.log("🎨 InstagramSetupPreview rendering with data:", data);

    const instagram = data?.instagram;
    if (!instagram) {
      console.log("⚠️ No Instagram data found in:", data);
      return null;
    }

    console.log("✅ Instagram data looks good:", instagram);

    return (
      <div className="mt-4 space-y-6">
        {/* Instagram Preview Card */}
        <div className="bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              📸
            </div>
            <div>
              <div className="text-lg font-medium">
                @{instagram.suggestedUsername}
              </div>
              <div className="text-sm text-gray-400">Business Account</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Suggested Bio</div>
              <div className="whitespace-pre-line text-sm bg-black/30 rounded-lg p-3 border border-gray-800">
                {instagram.suggestedBio}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">
                Quick Setup Guide
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                <ol className="space-y-3">
                  {instagram.setupSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-400">
                        {i + 1}
                      </span>
                      <span className="text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <a
          href="https://instagram.com/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl p-4 text-center font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">📸</span>
            <span>Create Instagram Business Account</span>
          </div>
          <div className="text-sm text-white/80 mt-1">
            Follow the setup guide to establish your presence
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid md:grid-cols-[1fr,320px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          <div className="bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-medium">
                Building Your Digital Business
              </h1>
              <p className="text-gray-400 mt-2">
                We're creating everything you need to launch successfully
              </p>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-6">
              {Object.entries(GENERATION_STEPS).map(([stepKey, step]) => {
                const isCompleted = isStepCompleted(stepKey);
                const isExpanded = expandedStep === stepKey;

                return (
                  <div key={stepKey} className="relative">
                    {/* Main Step Header */}
                    <button
                      onClick={() => handleStepClick(stepKey)}
                      disabled={
                        !canAccessStep(stepKey) && stepKey !== "branding"
                      }
                      className={`w-full flex items-center gap-3 mb-6 transition-colors ${
                        isCompleted ? "text-gray-400" : ""
                      } ${
                        !canAccessStep(stepKey) && stepKey !== "branding"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-800/30"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-400 font-medium">
                          {STEP_ORDER.indexOf(stepKey) + 1}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h2 className="font-medium text-lg">{step.title}</h2>
                        <p className="text-sm text-gray-400">
                          {step.description}
                        </p>
                      </div>
                      {isCompleted && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Substeps */}
                    <div
                      className={`ml-5 pl-8 border-l border-gray-800 space-y-6 transition-all duration-300 ${
                        isExpanded
                          ? "opacity-100 max-h-[2000px] visible"
                          : "opacity-0 max-h-0 invisible overflow-hidden"
                      }`}
                      style={{
                        transitionProperty: "max-height, opacity, visibility",
                        transitionDuration: "300ms",
                        transitionTimingFunction: "ease-in-out",
                      }}
                    >
                      {Object.entries(step.substeps).map(
                        ([subKey, substep]) => {
                          const isActive =
                            generationState.currentStep === subKey;
                          const isCompleted =
                            generationState.results[subKey]?.status ===
                            "completed";

                          return (
                            <div key={subKey} className="relative">
                              <div className="flex gap-4">
                                {/* Status Icon */}
                                <div className="relative">
                                  <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800" />
                                  {isActive && (
                                    <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-3 h-3">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                                      <div className="absolute inset-0 w-3 h-3 bg-blue-500 rounded-full" />
                                    </div>
                                  )}
                                  {isCompleted && (
                                    <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                  <h3 className="font-medium text-sm">
                                    {substep.title}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    {substep.description}
                                  </p>

                                  {/* Results */}
                                  {subKey === "names" &&
                                    generationState.results[subKey]?.data && (
                                      <NamesList
                                        names={
                                          generationState.results[subKey].data
                                        }
                                      />
                                    )}
                                  {subKey === "domains" &&
                                    generationState.results[subKey]?.data && (
                                      <DomainsList
                                        domains={
                                          generationState.results[subKey].data
                                        }
                                      />
                                    )}
                                  {subKey === "logo" &&
                                    generationState.results[subKey]?.data && (
                                      <LogoPreview
                                        url={
                                          generationState.results[subKey].data
                                            .logo_url
                                        }
                                      />
                                    )}
                                  {subKey === "copywriting" &&
                                    generationState.results[subKey]?.data && (
                                      <div className="mt-4 bg-black/30 rounded-xl border border-gray-800 p-4 space-y-4">
                                        {/* Hero Section */}
                                        {generationState.results[subKey].data
                                          .content?.hero && (
                                          <>
                                            <div>
                                              <div className="text-sm text-gray-400 mb-1">
                                                Headline
                                              </div>
                                              <div className="text-lg font-medium">
                                                {
                                                  generationState.results[
                                                    subKey
                                                  ].data.content.hero.title
                                                }
                                              </div>
                                            </div>
                                            <div>
                                              <div className="text-sm text-gray-400 mb-1">
                                                Subtitle
                                              </div>
                                              <div className="text-gray-300">
                                                {
                                                  generationState.results[
                                                    subKey
                                                  ].data.content.hero.subtitle
                                                }
                                              </div>
                                            </div>
                                            <div>
                                              <div className="text-sm text-gray-400 mb-1">
                                                Call to Action
                                              </div>
                                              <div className="text-blue-400 font-medium">
                                                {
                                                  generationState.results[
                                                    subKey
                                                  ].data.content.hero.cta
                                                }
                                              </div>
                                            </div>
                                          </>
                                        )}

                                        {/* Features Section */}
                                        {generationState.results[subKey].data
                                          .content?.features && (
                                          <div>
                                            <div className="text-sm text-gray-400 mb-2">
                                              Features
                                            </div>
                                            <div className="space-y-2">
                                              {generationState.results[
                                                subKey
                                              ].data.content.features.map(
                                                (feature, i) => (
                                                  <div
                                                    key={i}
                                                    className="bg-black/20 p-2 rounded"
                                                  >
                                                    <div className="font-medium">
                                                      {feature.title}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                      {feature.description}
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  {subKey === "preview" &&
                                    generationState.results[subKey]?.data && (
                                      <div className="mt-4">
                                        <a
                                          href="/landing"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                                        >
                                          <span>View Landing Page Preview</span>
                                          <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                          >
                                            <path
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </a>
                                      </div>
                                    )}
                                  {subKey === "stripe" && (
                                    <div className="mt-4">
                                      {!connectedAccountId &&
                                        !accountCreatePending && (
                                          <button
                                            onClick={handleStripeSetup}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                                            disabled={accountCreatePending}
                                          >
                                            <span>
                                              {accountCreatePending
                                                ? "Setting up Stripe..."
                                                : "Connect Stripe Account"}
                                            </span>
                                            {!accountCreatePending && (
                                              <svg
                                                className="w-4 h-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </button>
                                        )}

                                      {(accountCreatePending ||
                                        connectedAccountId) && (
                                        <div className="mt-2 text-sm text-gray-400">
                                          {accountCreatePending && (
                                            <p>
                                              Setting up your Stripe account...
                                            </p>
                                          )}
                                          {connectedAccountId &&
                                            !isStripeWindowOpen && (
                                              <p>
                                                Account created! Complete your
                                                setup to start accepting
                                                payments.
                                              </p>
                                            )}
                                          {connectedAccountId &&
                                            isStripeWindowOpen && (
                                              <p>
                                                Completing Stripe setup...{" "}
                                                <span className="animate-pulse">
                                                  ⌛
                                                </span>
                                              </p>
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {subKey === "deploy" &&
                                    generationState.results[subKey]?.data && (
                                      <div className="mt-4">
                                        <a
                                          href="http://landingai.localhost:3000/"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                                        >
                                          <span>View Your App</span>
                                          <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                          >
                                            <path
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </a>
                                      </div>
                                    )}
                                  {subKey === "pricing_plan" &&
                                    generationState.results[subKey]?.data && (
                                      <PricingPlanPreview
                                        plan={
                                          generationState.results[subKey].data
                                        }
                                      />
                                    )}
                                  {subKey === "channels" &&
                                    generationState.results[subKey]?.data &&
                                    (console.log(
                                      "🎯 Attempting to render InstagramSetupPreview with:",
                                      generationState.results[subKey].data
                                    ) || (
                                      <InstagramSetupPreview
                                        data={
                                          generationState.results[subKey].data
                                        }
                                      />
                                    ))}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-6">
            <h3 className="text-lg font-medium mb-4">While You Wait...</h3>
            <p className="text-sm text-gray-400 mb-6">
              Get ahead by setting up these essential business tools. They'll
              help you start earning and growing faster.
            </p>

            <div className="space-y-4">
              <QuickActionCard
                title="Accept Payments"
                description="Set up Stripe to receive payments from customers instantly"
                icon="💳"
                action="/stripe-account"
                badge="Essential"
              />
              <QuickActionCard
                title="Grow Your Audience"
                description="Connect Instagram to start building your organic presence"
                icon="📱"
                action="/instagram-connect"
              />
            </div>

            <p className="text-xs text-gray-500 mt-6">
              You can always set these up later from your dashboard
            </p>
          </div>

          {/* Tips Section */}
          <div className="bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-6">
            <h3 className="text-lg font-medium mb-4">Quick Tips</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-blue-400">💡</div>
                <p className="text-sm text-gray-400">
                  Setting up Stripe early helps you accept payments as soon as
                  your business launches
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-blue-400">💡</div>
                <p className="text-sm text-gray-400">
                  Instagram is great for building brand awareness and connecting
                  with potential customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/90 rounded-lg text-xs text-white/80 max-w-xs">
          <pre>
            {JSON.stringify(
              {
                currentStep: generationState.currentStep,
                isGenerating,
                hasChannelsData: !!generationState.results?.channels?.data,
                channelsStatus: generationState.results?.channels?.status,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
