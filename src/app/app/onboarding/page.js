"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { BusinessService } from "@/lib/services/business";
import { GenerationProgress } from "@/components/GenerationProgress";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState("business_idea");
  const [businessInfo, setBusinessInfo] = useState(null);
  const [formData, setFormData] = useState({
    niche: "",
    product: "",
    mainFeature: "",
    problem: "",
    targetAudience: "",
  });

  // Initialize BusinessService and get mock data
  useEffect(() => {
    if (!user?.id) return;

    const businessService = new BusinessService(user.id);
    const mockData = businessService.getMockBusinessInfo();

    if (mockData) {
      setFormData({
        niche: mockData.niche || "",
        product: mockData.services[0] || "", // Use first service as product
        mainFeature: mockData.uniqueValue || "",
        problem: mockData.goals[0] || "", // Use first goal as problem
        targetAudience: mockData.targetAudience || "",
      });
    }
  }, [user?.id]);

  const handleBusinessIdeaSubmit = (data) => {
    setBusinessInfo(data);
    setStep("generation");
  };

  if (step === "business_idea") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#0C0F17] rounded-2xl border border-gray-800/50 p-12 space-y-10">
          <h1 className="text-3xl font-medium text-white">
            Let's set up your automated business
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBusinessIdeaSubmit({
                niche: e.target.niche.value,
                product: e.target.product.value,
                mainFeature: e.target.mainFeature.value,
                painPoint: e.target.painPoint.value,
                targetAudience: e.target.targetAudience.value,
              });
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                What's your business niche?
              </label>
              <input
                type="text"
                name="niche"
                value={formData.niche}
                onChange={(e) =>
                  setFormData({ ...formData, niche: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., SaaS, E-commerce, Education"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                What product or service do you offer?
              </label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Landing page builder, Online courses"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                What's the main feature or benefit?
              </label>
              <input
                type="text"
                name="mainFeature"
                value={formData.mainFeature}
                onChange={(e) =>
                  setFormData({ ...formData, mainFeature: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., AI-powered design suggestions"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                What problem does it solve?
              </label>
              <input
                type="text"
                name="painPoint"
                value={formData.problem}
                onChange={(e) =>
                  setFormData({ ...formData, problem: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Time spent on website design"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Who is your target audience?
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Small business owners, Startups"
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-colors"
            >
              Generate My Business →
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "generation") {
    return (
      <GenerationProgress
        businessInfo={businessInfo}
        onComplete={(finalState) => {
          console.log("Business generated:", finalState);
        }}
      />
    );
  }

  return null;
}
