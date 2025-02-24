import { useState, useCallback } from "react";
import { BusinessService } from "@/lib/services/business";

export function useBusinessGeneration(userId) {
  const [generationState, setGenerationState] = useState({
    currentStep: "logo",
    stepResults: {},
    isGenerating: false,
    error: null,
  });

  // Called when each individual step completes
  const handleStepComplete = useCallback(async (step, result) => {
    setGenerationState((prev) => ({
      ...prev,
      stepResults: {
        ...prev.stepResults,
        [step]: { status: "completed", data: result },
      },
    }));
  }, []);

  // Called to start the entire generation process
  const startBusinessGeneration = useCallback(
    async (businessInfo) => {
      setGenerationState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      try {
        const service = new BusinessService(userId);

        // 1. Generate Brand Identity
        await generateBrandIdentity(service, businessInfo, handleStepComplete);

        // 2. Generate Revenue Model
        await generateRevenueModel(service, businessInfo, handleStepComplete);

        // 3. Generate Landing Page
        await generateLandingPage(service, businessInfo, handleStepComplete);

        // 4. Deploy Application
        await deployApplication(service, businessInfo, handleStepComplete);
      } catch (error) {
        setGenerationState((prev) => ({
          ...prev,
          error: error.message,
        }));
      } finally {
        setGenerationState((prev) => ({
          ...prev,
          isGenerating: false,
        }));
      }
    },
    [userId, handleStepComplete]
  );

  return {
    generationState,
    startBusinessGeneration,
  };
}

// Helper functions for each major generation phase
async function generateBrandIdentity(service, businessInfo, onComplete) {
  // Logo
  await service.generateLogo(businessInfo);
  onComplete("logo", { logo_url: "..." });

  // Business Names
  const names = await service.generateNames(businessInfo);
  onComplete("names", names);

  // Domain Names
  const domains = await service.checkDomains(names);
  onComplete("domains", domains);
}

async function generateRevenueModel(service, businessInfo, onComplete) {
  const pricingPlan = await service.generatePricingPlan(businessInfo);
  onComplete("pricing_plan", pricingPlan);
}

async function generateLandingPage(service, businessInfo, onComplete) {
  const content = await service.generateWebsiteContent(businessInfo);
  onComplete("copywriting", content);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  onComplete("preview", { url: "/landing" });
}

async function deployApplication(service, businessInfo, onComplete) {
  const appUrl = `http://${businessInfo.niche
    .toLowerCase()
    .replace(/\s+/g, "-")}.localhost:3000`;
  onComplete("deploy", { url: appUrl });
}
