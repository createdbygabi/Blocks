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

// Add explicit step mapping
const STEP_MAPPING = {
  logo: "branding",
  names: "branding",
  pricing_plan: "revenue",
  deploy: "app",
  copywriting: "landing",
  preview: "landing",
  stripe: "payments",
  channels: "marketing",
};

// Add these preview components right after the STEP_MAPPING constant

// Logo Preview Component
const LogoPreview = ({ logo }) => {
  if (!logo?.logo_url) return null;

  return (
    <div className="relative w-32 h-32 bg-black/20 rounded-xl overflow-hidden">
      <img
        src={logo.logo_url}
        alt="Generated Logo"
        className="w-full h-full object-contain p-4"
      />
    </div>
  );
};

// Names List Component
const NamesList = ({ names }) => {
  if (!names || names.length === 0) {
    return <div className="text-sm text-gray-400">No names generated yet</div>;
  }

  return (
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
};

// Pricing Plan Preview Component
const PricingPlanPreview = ({ plan }) => {
  const pricingPlan = plan?.pricing_plans?.[0] || plan;

  console.log("🔍 Raw plan data:", plan);
  console.log("🔍 Processed pricingPlan:", pricingPlan);

  if (!pricingPlan) return null;

  return (
    <div className="bg-black/20 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-medium">{pricingPlan.name}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {pricingPlan.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${pricingPlan.price}</div>
          <div className="text-sm text-gray-400">
            per {pricingPlan.billingPeriod}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-sm font-medium mb-2">Features:</div>
        {pricingPlan.feature}
        {/* <ul className="space-y-2">
          {features.map((feature, i) => {
            console.log(`🔍 Rendering feature ${i}:`, feature);
            return (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                {feature}
              </li>
            );
          })}
        </ul> */}
        {/* {pricingPlan.limitations && (
          <div className="mt-4 text-sm text-gray-400">
            <span className="font-medium">Limitations:</span>{" "}
            {pricingPlan.limitations}
          </div>
        )} */}
      </div>
    </div>
  );
};

// Landing Page Preview Component
const LandingPreview = ({ landing }) => {
  if (!landing) return null;

  // Convert colors to array if it's not already
  const colors = landing.theme?.colors
    ? Array.isArray(landing.theme.colors)
      ? landing.theme.colors
      : [landing.theme.colors]
    : [];

  return (
    <div className="bg-black/20 rounded-xl p-6">
      <h3 className="text-lg font-medium mb-4">Landing Page Preview</h3>
      <div className="space-y-4">
        {landing.theme && (
          <div>
            <h4 className="text-sm font-medium mb-2">Theme</h4>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{landing.theme.name}</span>
                {colors.length > 0 && (
                  <div className="flex gap-1">
                    {colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {landing.theme.audience && (
                <div className="text-sm text-gray-400 mt-1">
                  {landing.theme.audience}
                </div>
              )}
            </div>
          </div>
        )}

        {landing.content && (
          <div>
            <h4 className="text-sm font-medium mb-2">Content</h4>
            <div className="bg-black/30 rounded-lg p-3 space-y-3">
              {typeof landing.content === "string" ? (
                <p className="text-sm">{landing.content}</p>
              ) : (
                <>
                  {landing.content.headline && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Headline</div>
                      <p className="text-sm font-medium">
                        {landing.content.headline}
                      </p>
                    </div>
                  )}
                  {landing.content.description && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Description
                      </div>
                      <p className="text-sm">{landing.content.description}</p>
                    </div>
                  )}
                  {/* {landing.content.features && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Features</div>
                      <ul className="space-y-1">
                        {landing.content.features.map((feature, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-green-500">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Instagram Setup Preview Component
const InstagramSetupPreview = ({ data }) => {
  if (!data?.instagram) return null;
  const { suggestedUsername, suggestedBio, setupSteps } = data.instagram;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Suggested Username</h4>
        <div className="bg-black/20 p-3 rounded-lg font-mono text-sm">
          @{suggestedUsername}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Bio</h4>
        <div className="bg-black/20 p-3 rounded-lg text-sm whitespace-pre-line">
          {suggestedBio}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Setup Steps</h4>
        <ol className="space-y-2 text-sm">
          {setupSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

// Status Icon Component
const StatusIcon = ({ status }) => {
  if (!status) return null;

  const icons = {
    pending: <div className="w-5 h-5 rounded-full border-2 border-gray-600" />,
    loading: (
      <div className="w-5 h-5">
        <div className="animate-spin rounded-full h-full w-full border-2 border-blue-500 border-t-transparent" />
      </div>
    ),
    completed: (
      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-green-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
    error: (
      <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
  };

  return icons[status] || null;
};

export function GenerationProgress({ businessInfo, onComplete }) {
  const { user } = useUser();
  const [businessId, setBusinessId] = useState(null);
  const [generationState, setGenerationState] = useState({
    currentStep: "logo",
    results: {},
    error: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(new Set(["branding"]));
  const [isCompleted, setIsCompleted] = useState(false);
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [stripeError, setStripeError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState();
  const [isStripeWindowOpen, setIsStripeWindowOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Define step progress state
  const [stepProgress, setStepProgress] = useState({
    branding: { started: false, completed: false },
    revenue: { started: false, completed: false },
    landing: { started: false, completed: false },
    app: { started: false, completed: false },
    payments: { started: false, completed: false },
    marketing: { started: false, completed: false },
  });

  // Update this to track completed steps
  const updateProgress = useCallback(
    (step, status, data = null) => {
      const mainStep = STEP_MAPPING[step];

      setGenerationState((prev) => {
        const nextStep = status === "completed" ? getNextStep(step) : step;

        // If this step is completed, add its main step to completedSteps
        // and keep it expanded
        if (status === "completed") {
          setCompletedSteps((prev) => {
            const next = new Set(prev);
            next.add(mainStep);
            return next;
          });

          // Keep completed step expanded and expand next step
          setExpandedSteps((prev) => {
            const next = new Set(prev);
            next.add(mainStep); // Keep current step expanded
            const nextMainStep = STEP_MAPPING[nextStep];
            if (nextMainStep) {
              next.add(nextMainStep); // Expand next step
            }
            return next;
          });
        }

        return {
          ...prev,
          currentStep: nextStep,
          results: {
            ...prev.results,
            [step]: { status, data },
          },
          error: status === "error" ? step : null,
        };
      });
    },
    [STEP_MAPPING]
  );

  // Modify canExpandStep to consider completed steps
  const canExpandStep = useCallback(
    (stepKey) => {
      const stepIndex = STEP_ORDER.indexOf(stepKey);

      // First step is always expandable
      if (stepIndex === 0) return true;

      // Previous step must be completed to expand current step
      const previousStep = STEP_ORDER[stepIndex - 1];
      return completedSteps.has(previousStep);
    },
    [completedSteps]
  );

  // Update handleStepClick to handle multiple expanded steps
  const handleStepClick = useCallback(
    (stepKey) => {
      if (canExpandStep(stepKey)) {
        setExpandedSteps((prev) => {
          const next = new Set(prev);
          if (next.has(stepKey)) {
            next.delete(stepKey);
          } else {
            next.add(stepKey);
          }
          return next;
        });
      }
    },
    [canExpandStep]
  );

  const getNextStep = (currentStep) => {
    console.log("🔄 Getting next step from:", currentStep);

    const steps = {
      logo: "names",
      names: "pricing_plan",
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

  // Update getMainStepForSubstep
  const getMainStepForSubstep = (substep) => {
    return STEP_MAPPING[substep] || null;
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
    const currentIndex = STEP_ORDER.indexOf(generationState.currentStep);

    // Only proceed if we're not on the last step
    if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) return;

    // Check if current step is completed
    const isCurrentStepDone = isStepCompleted(generationState.currentStep);

    // If current step is done, expand next step
    if (isCurrentStepDone) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        next.add(nextStep);
        return next;
      });
    }
  }, [generationState.results, generationState.currentStep]);

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
              {STEP_ORDER.map((stepKey) => (
                <div
                  key={stepKey}
                  className="border border-gray-800 rounded-xl overflow-hidden"
                >
                  <div
                    role="button"
                    aria-expanded={expandedSteps.has(stepKey)}
                    aria-controls={`step-content-${stepKey}`}
                    tabIndex={0}
                    className={`p-6 cursor-pointer bg-[#0C0F17] ${
                      canExpandStep(stepKey) ? "" : "opacity-50"
                    } ${
                      completedSteps.has(stepKey)
                        ? "border-l-4 border-green-500"
                        : ""
                    }`}
                    onClick={() => handleStepClick(stepKey)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleStepClick(stepKey);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">
                          {GENERATION_STEPS[stepKey].title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {GENERATION_STEPS[stepKey].description}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        {expandedSteps.has(stepKey) ? "−" : "+"}
                      </div>
                    </div>
                  </div>

                  {expandedSteps.has(stepKey) && (
                    <div
                      id={`step-content-${stepKey}`}
                      className="p-6 bg-[#0C0F17]/50 border-t border-gray-800"
                    >
                      <div className="space-y-8">
                        {Object.entries(GENERATION_STEPS[stepKey].substeps).map(
                          ([subKey, subStep]) => {
                            const result = generationState.results[subKey];
                            const status = result?.status || "pending";

                            return (
                              <div key={subKey} className="relative">
                                <div className="flex items-start gap-4">
                                  <div className="relative">
                                    <StatusIcon status={status} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium flex items-center gap-2">
                                      {subStep.title}
                                      {status === "loading" && (
                                        <span className="text-sm text-blue-400 animate-pulse">
                                          {subStep.loadingText}
                                        </span>
                                      )}
                                    </h4>

                                    <p className="text-sm text-gray-400 mt-1">
                                      {subStep.description}
                                    </p>

                                    {/* Results Display */}
                                    {status === "completed" && result.data && (
                                      <div className="mt-4">
                                        {subKey === "logo" && (
                                          <LogoPreview logo={result.data} />
                                        )}
                                        {subKey === "names" && (
                                          <NamesList names={result.data} />
                                        )}
                                        {subKey === "pricing_plan" && (
                                          <PricingPlanPreview
                                            plan={result.data}
                                          />
                                        )}
                                        {subKey === "copywriting" && (
                                          <LandingPreview
                                            landing={result.data}
                                          />
                                        )}
                                        {subKey === "preview" && (
                                          <LandingPreview
                                            landing={result.data}
                                          />
                                        )}
                                        {subKey === "deploy" && (
                                          <a
                                            href={`http://${result.data.subdomain}.localhost:3000`}
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
                                        )}
                                        {subKey === "channels" && (
                                          <InstagramSetupPreview
                                            data={result.data}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
