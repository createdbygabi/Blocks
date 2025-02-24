import { useState, useCallback, useEffect } from "react";
import { saveBusiness, getUserBusiness } from "@/lib/db";
import { STEP_SEQUENCE, GENERATION_STEPS } from "@/constants/generation-steps";

export function useGenerationProgress(userId) {
  // Track both the current step and all results
  const [progressState, setProgressState] = useState({
    currentStep: "logo",
    stepResults: {},
    isGenerating: false,
    error: null,
    lastCompletedStep: null,
  });

  // Load saved progress on mount
  useEffect(() => {
    if (!userId) return;

    const loadSavedProgress = async () => {
      try {
        const business = await getUserBusiness(userId);
        if (business?.generation_progress) {
          setProgressState((prev) => ({
            ...prev,
            currentStep: business.generation_progress,
            lastCompletedStep: getPreviousStep(business.generation_progress),
          }));
        }
      } catch (error) {
        console.error("Failed to load progress:", error);
      }
    };

    loadSavedProgress();
  }, [userId]);

  // Update progress for a specific step
  const updateStepProgress = useCallback(
    async (step, status, data = null) => {
      setProgressState((prev) => ({
        ...prev,
        stepResults: {
          ...prev.stepResults,
          [step]: { status, data },
        },
      }));

      if (status === "completed" && userId) {
        const nextStep = STEP_SEQUENCE[step];

        // Update state
        setProgressState((prev) => ({
          ...prev,
          currentStep: nextStep,
          lastCompletedStep: step,
        }));

        // Save to database
        await saveBusiness(userId, {
          generation_progress: nextStep,
          [`${step}_result`]: data, // Save step result separately
        });
      }
    },
    [userId]
  );

  // Check if a main step (branding, revenue, etc.) is completed
  const isMainStepCompleted = useCallback(
    (mainStep) => {
      const substeps = GENERATION_STEPS[mainStep].substeps;
      return Object.keys(substeps).every(
        (subKey) => progressState.stepResults[subKey]?.status === "completed"
      );
    },
    [progressState.stepResults]
  );

  // Get the status of a specific step
  const getStepStatus = useCallback(
    (step) => {
      const result = progressState.stepResults[step];
      if (!result) return "pending";
      return result.status;
    },
    [progressState.stepResults]
  );

  // Start/stop generation
  const setGenerating = useCallback((isGenerating) => {
    setProgressState((prev) => ({
      ...prev,
      isGenerating,
    }));
  }, []);

  // Set error state
  const setError = useCallback((error) => {
    setProgressState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  return {
    currentStep: progressState.currentStep,
    lastCompletedStep: progressState.lastCompletedStep,
    stepResults: progressState.stepResults,
    isGenerating: progressState.isGenerating,
    error: progressState.error,
    updateStepProgress,
    isMainStepCompleted,
    getStepStatus,
    setGenerating,
    setError,
  };
}

// Helper function to get the previous step
function getPreviousStep(currentStep) {
  const steps = Object.entries(STEP_SEQUENCE);
  const currentIndex = steps.findIndex(([_, next]) => next === currentStep);
  return currentIndex > 0 ? steps[currentIndex - 1][0] : null;
}
