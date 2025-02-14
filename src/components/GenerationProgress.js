import { useState, useEffect } from "react";
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
    },
  },
};

export function GenerationProgress({ businessInfo, onComplete }) {
  const { user } = useUser();
  const [generationState, setGenerationState] = useState({
    currentStep: "logo",
    results: {},
    error: null,
  });
  const [expandedStep, setExpandedStep] = useState("branding");

  const updateProgress = (step, status, data = null) => {
    setGenerationState((prev) => ({
      ...prev,
      currentStep: status === "completed" ? getNextStep(step) : step,
      results: {
        ...prev.results,
        [step]: { status, data },
      },
    }));
  };

  const getNextStep = (currentStep) => {
    const steps = Object.keys(GENERATION_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1
      ? steps[currentIndex + 1]
      : "completed";
  };

  // Helper to check if a main step is completed
  const isStepCompleted = (stepKey) => {
    const substeps = GENERATION_STEPS[stepKey].substeps;
    return Object.keys(substeps).every(
      (subKey) => generationState.results[subKey]?.status === "completed"
    );
  };

  // Auto-collapse completed steps and expand next
  useEffect(() => {
    if (isStepCompleted("branding") && expandedStep === "branding") {
      setExpandedStep("website");
    }
  }, [generationState.results]);

  useEffect(() => {
    if (user && businessInfo) {
      const generateBusiness = async () => {
        const businessService = new BusinessService(user.id);

        try {
          // Start with logo generation
          await businessService.generateBranding(businessInfo, updateProgress);
        } catch (error) {
          console.error("Generation error:", error);
          setGenerationState((prev) => ({
            ...prev,
            error: error.message,
          }));
        }
      };

      generateBusiness();
    }
  }, [user, businessInfo]);

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

  const DomainsList = ({ domains }) => (
    <div className="space-y-4">
      {domains.map((result, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{result.name}</span>
            {result.startingPrice && (
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                Best price: ${result.startingPrice}
              </span>
            )}
          </div>

          <div className="grid gap-1">
            {result.allDomains.map((domain, j) => (
              <div
                key={j}
                className={`flex items-center justify-between p-2 rounded text-xs ${
                  domain.available
                    ? domain.domain === result.bestValue
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-black/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono">{domain.domain}</span>
                  {domain.available ? (
                    domain.domain === result.bestValue && (
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
                {domain.available && (
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

  const LogoPreview = ({ url }) => (
    <div className="aspect-square w-32 bg-black/30 border border-gray-800 rounded-xl p-4">
      <img
        src={url}
        alt="Generated logo"
        className="w-full h-full object-contain"
      />
    </div>
  );

  const WebsitePreview = ({ data }) => (
    <div className="space-y-4">
      <div className="relative aspect-video w-full max-w-lg mx-auto overflow-hidden rounded-xl border border-gray-800">
        <img
          src={data.thumbnail}
          alt="Website Preview"
          className="w-full h-full object-cover"
        />
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
        >
          <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm">
            View Preview
          </span>
        </a>
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
                          {stepKey === "branding" ? "1" : "2"}
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
                                  {generationState.results[subKey]?.data && (
                                    <div className="mt-4 bg-black/30 rounded-xl border border-gray-800 p-4">
                                      {subKey === "names" && (
                                        <NamesList
                                          names={
                                            generationState.results[subKey].data
                                          }
                                        />
                                      )}
                                      {subKey === "domains" && (
                                        <DomainsList
                                          domains={
                                            generationState.results[subKey].data
                                          }
                                        />
                                      )}
                                      {subKey === "logo" && (
                                        <LogoPreview
                                          url={
                                            generationState.results[subKey].data
                                          }
                                        />
                                      )}
                                      {subKey === "preview" && (
                                        <WebsitePreview
                                          data={
                                            generationState.results[subKey].data
                                          }
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
