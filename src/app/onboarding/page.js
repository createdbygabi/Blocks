"use client";

import { useState, useEffect } from "react";
import { Button, Card } from "../components/ui/FormElements";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTarget,
  FiLayout,
  FiDollarSign,
  FiStar,
  FiBox,
  FiGlobe,
  FiZap,
  FiTrendingUp,
  FiCheck,
  FiArrowRight,
  FiUsers,
  FiRocket,
} from "react-icons/fi";
import Image from "next/image";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [showingResults, setShowingResults] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [formData, setFormData] = useState({
    businessNiche: "",
    product: "",
    mainFeature: "",
    painPoint: "",
    targetAudience: "",
  });

  // Add completedSteps state
  const [completedSteps, setCompletedSteps] = useState({
    overview: { completed: true },
    businessIdea: null,
    branding: null,
    website: null,
    pricing: null,
    marketing: null,
    launch: null,
  });

  useEffect(() => {
    // Reset showingResults when step changes
    const isFirstStep = currentStep === 1;
    setShowingResults(!isFirstStep);
  }, [currentStep]);

  const steps = [
    {
      id: "overview",
      explanation: {
        title:
          "Let's set up your fully automated business to start earning money.",
        fields: [
          {
            name: "start",
            type: "action",
            actionText: "Start Building →",
          },
        ],
      },
    },
    {
      id: "businessIdea",
      title: "Design Your Business",
      subtitle: "Tell us about your idea",
      explanation: {
        fields: [
          {
            name: "businessNiche",
            label: "Business Niche",
            type: "text",
            placeholder: "Business creators",
          },
          {
            name: "product",
            label: "Product",
            type: "text",
            placeholder: "Generating landing pages",
          },
          {
            name: "mainFeature",
            label: "Main Feature",
            type: "text",
            placeholder: "Quick landing page setup",
          },
          {
            name: "painPoint",
            label: "Pain Point",
            type: "textarea",
            placeholder: "Landing page creation is time consuming",
          },
          {
            name: "targetAudience",
            label: "Target Audience",
            type: "text",
            placeholder: "Developers and creators",
          },
        ],
      },
    },
    {
      id: "branding",
      icon: FiLayout,
      title: "Create Your Brand",
      subtitle: "Design your professional identity",
      explanation: {
        title: "Let's build your brand",
        description:
          "We'll create a professional brand that attracts customers",
        fields: [
          {
            name: "brandName",
            label: "Brand Name Ideas",
            type: "textarea",
            placeholder: "Any ideas for your brand name? (optional)",
            helper: "We'll help generate options if you're not sure",
          },
        ],
      },
      generationPhases: [
        {
          title: "Generating Brand Names",
          description: "Creating memorable options for your business",
        },
        {
          title: "Designing Visual Identity",
          description: "Crafting your brand's look and feel",
        },
      ],
    },
    {
      id: "pricing",
      icon: FiDollarSign,
      title: "Set Your Prices",
      subtitle: "Maximize your earnings",
      explanation: {
        title: "Let's price your offerings",
        description:
          "We'll help you set profitable prices that customers will love",
        fields: [
          {
            name: "priceRange",
            label: "Desired Monthly Income",
            type: "select",
            options: [
              "Under $1,000",
              "$1,000 - $5,000",
              "$5,000 - $10,000",
              "Over $10,000",
            ],
            helper: "This helps us structure your pricing strategy",
          },
        ],
      },
      generationPhases: [
        {
          title: "Analyzing Market Rates",
          description: "Researching competitive pricing",
        },
        {
          title: "Creating Price Tiers",
          description: "Designing your pricing structure",
        },
      ],
    },
    {
      id: "marketing",
      icon: FiUsers,
      title: "Marketing Setup",
      subtitle: "Attract your ideal customers",
      explanation: {
        title: "Let's plan your marketing",
        description: "We'll create a strategy to reach your target audience",
        generationPhases: [
          {
            title: "Creating Marketing Plan",
            description: "Designing your customer acquisition strategy",
          },
          {
            title: "Setting Up Channels",
            description: "Preparing your marketing platforms",
          },
        ],
      },
    },
    {
      id: "launch",
      icon: FiRocket,
      title: "Launch",
      subtitle: "Go live and start earning",
      explanation: {
        title: "Ready for launch!",
        description: "Let's get your business live and earning",
        generationPhases: [
          {
            title: "Final Setup",
            description: "Preparing your business for launch",
          },
          {
            title: "Going Live",
            description: "Making your business available to customers",
          },
        ],
      },
    },
  ];

  // Handle step completion
  const completeStep = (stepId, stepData = null) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: {
        completed: true,
        data: stepData,
      },
    }));
  };

  // Handle continuing to next step
  const handleContinue = async () => {
    const currentStepData = steps[currentStep];

    if (currentStep === 0) {
      // Simply move to next step for overview
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      // Business Idea step
      completeStep("businessIdea", {
        "Business Niche": formData.businessNiche,
        Product: formData.product,
        "Main Feature": formData.mainFeature,
        "Pain Point": formData.painPoint,
        "Target Audience": formData.targetAudience,
      });
      setGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setGenerating(false);
    } else if (currentStepData.id) {
      // For other steps, just mark them as completed
      completeStep(currentStepData.id);
    }

    setCurrentStep(currentStep + 1);
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  const renderResults = (stepData) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Step Explanation */}
        <div className="p-6 bg-blue-500/10 rounded-lg">
          <p className="text-gray-300">{stepData.explanation}</p>
        </div>

        {/* Results */}
        <div className="p-6 bg-gray-800/30 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-6">
            {stepData.results.title}
          </h3>
          <div className="space-y-6">
            {stepData.results.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
                <p className="text-sm text-gray-500">{item.explanation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEducationalContent = (content) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-6"
    >
      {/* Intro Message */}
      <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/10">
        <p className="text-lg text-gray-300">{content.intro}</p>
      </div>

      {/* What We'll Do Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white flex items-center gap-2">
            <FiTarget className="text-blue-400" />
            What We'll Do
          </h4>
          <ul className="space-y-3">
            {content.whatWeWillDo.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white flex items-center gap-2">
            <FiStar className="text-blue-400" />
            Pro Tips
          </h4>
          <ul className="space-y-3">
            {content.tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );

  const GenerationProcess = ({ phases, onComplete }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        if (generationPhase < phases.length - 1) {
          setGenerationPhase((prev) => prev + 1);
        } else {
          onComplete();
          setGenerationPhase(0);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }, [generationPhase, phases.length, onComplete]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Current Phase Display */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <h3 className="text-xl font-medium text-white">
            {phases[generationPhase].title}
          </h3>
          <p className="text-gray-400">{phases[generationPhase].description}</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-md mx-auto">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 mb-6 transition-all duration-300 ${
                index === generationPhase ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${
                  index < generationPhase
                    ? "bg-blue-500"
                    : index === generationPhase
                    ? "bg-blue-500/20 animate-pulse"
                    : "bg-gray-800"
                }
              `}
              >
                {index < generationPhase ? (
                  <FiCheck className="w-4 h-4 text-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    index <= generationPhase ? "text-white" : "text-gray-500"
                  }`}
                >
                  {phase.title}
                </p>
                {index === generationPhase && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-400 mt-1"
                  >
                    {phase.explanation}
                  </motion.p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Educational Note */}
        <motion.div
          key={generationPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-gradient-to-b from-blue-500/5 to-transparent rounded-xl border border-blue-500/10"
        >
          <p className="text-gray-400 text-center">
            {phases[generationPhase].educationalNote}
          </p>
        </motion.div>
      </motion.div>
    );
  };

  const renderInsight = (insight) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="grid grid-cols-2 gap-4">
        {insight.points.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
              {point.icon}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {point.title}
            </h3>
            <p className="text-gray-400">{point.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const StepProgress = ({ currentStep, steps, completedSteps }) => (
    <div className="fixed top-8 right-8 w-80 bg-gray-900/90 backdrop-blur rounded-xl p-4 border border-gray-800">
      <h3 className="text-lg font-medium text-white mb-4">Your Progress</h3>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps[step.id];
          const isCurrent = currentStep === index;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg ${
                isCurrent
                  ? "bg-blue-500/20 border border-blue-500/50"
                  : isCompleted
                  ? "bg-green-500/20 border border-green-500/50"
                  : "bg-gray-800/50 border border-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500"
                      : isCurrent
                      ? "bg-blue-500"
                      : "bg-gray-700"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span className="text-white">{step.title}</span>
              </div>

              {/* Show completed step data */}
              {isCompleted && completedSteps[step.id].data && (
                <div className="mt-2 ml-9 text-sm text-gray-400">
                  {Object.entries(completedSteps[step.id].data).map(
                    ([key, value]) => (
                      <div key={key} className="truncate">
                        <span className="text-gray-500">{key}:</span> {value}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStepContent = (currentStepData) => {
    if (currentStepData.explanation?.fields) {
      return (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-medium text-white">
              {currentStepData.explanation.title}
            </h3>
            <p className="text-gray-400">
              {currentStepData.explanation.description}
            </p>
          </motion.div>

          <div className="space-y-6">
            {currentStepData.explanation.fields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <label className="block text-lg font-medium text-white">
                  {field.label}
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  rows={4}
                />
                {field.helper && (
                  <p className="text-sm text-gray-500">{field.helper}</p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-800">
            <Button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              variant="secondary"
              className="px-6 py-2"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              variant="primary"
              className="px-6 py-2"
            >
              Continue
            </Button>
          </div>
        </div>
      );
    }

    if (generating) {
      return (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Generating your business plan...</p>
        </div>
      );
    }

    return null;
  };

  const renderStep = () => {
    const currentStepData = steps[currentStep];

    if (currentStep === 0) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-12 space-y-10">
            <h1 className="text-3xl font-medium text-white">
              Let's set up your automated business to start making money.
            </h1>

            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl text-sm font-medium transition-all duration-200"
            >
              Create My Business →
            </button>
          </div>
        </div>
      );
    }

    // Regular steps
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-12 space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium text-white">
              Design Your Business
            </h2>
            <p className="text-gray-400">Define your business fundamentals</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Business Niche
              </label>
              <input
                type="text"
                value={formData.businessNiche}
                onChange={(e) =>
                  setFormData({ ...formData, businessNiche: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-gray-700 focus:ring-0"
                placeholder="Business creators"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Product
              </label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-gray-700 focus:ring-0"
                placeholder="Generating landing pages"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Main Feature
              </label>
              <input
                type="text"
                value={formData.mainFeature}
                onChange={(e) =>
                  setFormData({ ...formData, mainFeature: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-gray-700 focus:ring-0"
                placeholder="Quick landing page setup"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Pain Point
              </label>
              <textarea
                value={formData.painPoint}
                onChange={(e) =>
                  setFormData({ ...formData, painPoint: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-gray-700 focus:ring-0"
                placeholder="Landing page creation is time consuming"
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-gray-700 focus:ring-0"
                placeholder="Developers and creators"
              />
            </div>
          </form>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-3 border border-gray-800 text-gray-400 hover:bg-gray-800/50 rounded-xl text-sm"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>;
}
