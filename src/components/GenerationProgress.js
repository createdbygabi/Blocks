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
  website: {
    title: "Building Your Website",
    description: "Creating your online presence",
    substeps: {
      copywriting: {
        title: "Writing Content",
        description: "Crafting your landing page content",
        loadingText: "AI is writing your content...",
      },
      preview: {
        title: "Generating Preview",
        description: "Creating your website preview",
        loadingText: "Building your landing page...",
      },
      deploy: {
        title: "Deploying Website",
        description: "Making your site live",
        loadingText: "Deploying to joinblocks.me...",
      },
    },
  },
  pricing: {
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
};

console.log("🔍 GENERATION_STEPS structure:", GENERATION_STEPS);

export function GenerationProgress({ businessInfo, onComplete }) {
  const { user } = useUser();
  const [generationState, setGenerationState] = useState({
    currentStep: "logo",
    results: {},
    error: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedStep, setExpandedStep] = useState("branding");
  const [isCompleted, setIsCompleted] = useState(false);

  const updateProgress = useCallback((step, status, data = null) => {
    console.log(`🔄 Updating progress for ${step}:`, {
      status,
      dataReceived: !!data,
      dataType: data ? typeof data : null,
      dataStructure: data ? Object.keys(data) : null,
    });

    setGenerationState((prev) => {
      const nextStep = status === "completed" ? getNextStep(step) : step;
      console.log(`📍 Current step: ${step} → Next step: ${nextStep}`);
      console.log(`📊 Current state:`, prev);

      const newState = {
        ...prev,
        currentStep: nextStep,
        results: {
          ...prev.results,
          [step]: { status, data },
        },
        error: status === "error" ? step : null,
      };

      console.log(`📊 New state:`, newState);
      return newState;
    });
  }, []);

  const getNextStep = (currentStep) => {
    console.log("🔄 Getting next step from:", currentStep);

    const steps = {
      logo: "names",
      names: "domains",
      domains: "copywriting",
      copywriting: "preview",
      preview: "deploy",
    };

    const nextStep = steps[currentStep];
    console.log("➡️ Next step will be:", nextStep);
    return nextStep;
  };

  const isStepCompleted = (stepKey) => {
    const substeps = GENERATION_STEPS[stepKey].substeps;
    return Object.keys(substeps).every(
      (subKey) => generationState.results[subKey]?.status === "completed"
    );
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
          const results = await businessService.generateBranding(
            businessInfo,
            updateProgress
          );
          console.log("✨ Generation completed:", results);
          onComplete?.(results);
          setIsCompleted(true);

          // Generate pricing plan
          updateProgress("pricing_plan", "loading");
          const pricingPlan = await businessService.generatePricingPlan(
            businessInfo
          );
          updateProgress("pricing_plan", "completed", pricingPlan);
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

  // Update the useEffect for section expansion
  useEffect(() => {
    if (isStepCompleted("branding") && expandedStep === "branding") {
      setExpandedStep("website");
    } else if (isStepCompleted("website") && expandedStep === "website") {
      setExpandedStep("pricing");
    }
  }, [generationState.results]);

  // Update the useEffect for section expansion
  useEffect(() => {
    // Expand website section when copywriting starts
    if (
      generationState.currentStep === "copywriting" &&
      expandedStep === "branding"
    ) {
      setExpandedStep("website");
    }
  }, [generationState.currentStep, expandedStep]);

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

  // Add PricingPlanPreview component
  const PricingPlanPreview = ({ plan }) => (
    <div className="mt-4 bg-black/30 rounded-xl border border-gray-800 p-4 space-y-4">
      <div>
        <div className="text-sm text-gray-400 mb-1">Plan</div>
        <div className="text-lg font-medium">{plan.name}</div>
      </div>
      <div>
        <div className="text-sm text-gray-400 mb-1">Price</div>
        <div className="text-2xl font-bold text-blue-400">
          ${plan.price}
          <span className="text-sm text-gray-400">/{plan.billingPeriod}</span>
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-400 mb-1">Features</div>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

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
                      onClick={() =>
                        setExpandedStep(isExpanded ? null : stepKey)
                      }
                      className={`w-full flex items-center gap-3 mb-6 transition-colors ${
                        isCompleted ? "text-gray-400" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-400 font-medium">
                          {stepKey === "branding"
                            ? "1"
                            : stepKey === "website"
                            ? "2"
                            : "3"}
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
                          ? "opacity-100 max-h-[2000px]"
                          : "opacity-0 max-h-0 overflow-hidden"
                      }`}
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
                                        <div>
                                          <div className="text-sm text-gray-400 mb-1">
                                            Headline
                                          </div>
                                          <div className="text-lg font-medium">
                                            {
                                              generationState.results[subKey]
                                                .data.hero.title
                                            }
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-400 mb-1">
                                            Subtitle
                                          </div>
                                          <div className="text-gray-300">
                                            {
                                              generationState.results[subKey]
                                                .data.hero.subtitle
                                            }
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-400 mb-1">
                                            Call to Action
                                          </div>
                                          <div className="text-blue-400 font-medium">
                                            {
                                              generationState.results[subKey]
                                                .data.hero.cta
                                            }
                                          </div>
                                        </div>
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
                                          <span>View Landing Page</span>
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
    </div>
  );
}
