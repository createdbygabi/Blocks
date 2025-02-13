import { PIPELINE_STEPS } from "./pipeline";
import { getUserBusiness, saveBusiness } from "@/lib/db";
import * as handlers from "./handlers";

export class OnboardingManager {
  constructor(userId) {
    this.userId = userId;
    this.state = {};
    this.currentStep = null;
    this.completedSteps = new Set();
    this.deferredSteps = new Set();
  }

  async initialize() {
    // Load saved state from database
    this.state = await this.loadState();
    this.currentStep = this.determineCurrentStep();
  }

  async loadState() {
    try {
      const business = await getUserBusiness(this.userId);
      if (!business) return {};

      // Convert stored state back into Sets
      if (business.onboarding) {
        this.completedSteps = new Set(business.onboarding.completedSteps || []);
        this.deferredSteps = new Set(business.onboarding.deferredSteps || []);
      }

      return business;
    } catch (error) {
      console.error("Error loading onboarding state:", error);
      return {};
    }
  }

  async saveState() {
    try {
      await saveBusiness(this.userId, {
        ...this.state,
        onboarding: {
          completedSteps: Array.from(this.completedSteps),
          deferredSteps: Array.from(this.deferredSteps),
          lastStep: this.currentStep?.id,
        },
      });
    } catch (error) {
      console.error("Error saving onboarding state:", error);
      throw error;
    }
  }

  determineCurrentStep() {
    // Find first incomplete required step
    return Object.values(PIPELINE_STEPS).find((step) => {
      if (this.completedSteps.has(step.id)) return false;
      if (this.deferredSteps.has(step.id)) return false;
      if (step.dependsOn?.some((dep) => !this.completedSteps.has(dep)))
        return false;
      return true;
    });
  }

  canStepBeDeferred(stepId) {
    const step = PIPELINE_STEPS[stepId];
    return step.deferrable && !step.required;
  }

  async executeHandler(handlerName, data) {
    if (!handlers[handlerName]) {
      throw new Error(`Handler ${handlerName} not found`);
    }
    return await handlers[handlerName](data, this.state);
  }

  async executeStep(stepId, data) {
    const step = PIPELINE_STEPS[stepId];
    if (!step) throw new Error(`Invalid step: ${stepId}`);

    // Check dependencies
    if (step.dependsOn?.some((dep) => !this.completedSteps.has(dep))) {
      throw new Error("Dependencies not met");
    }

    try {
      // Execute the step handler
      const result = await this.executeHandler(step.handler, data);

      // Update state
      this.state = {
        ...this.state,
        ...result,
      };
      this.completedSteps.add(stepId);

      // Save progress
      await this.saveState();

      return result;
    } catch (error) {
      console.error(`Error executing step ${stepId}:`, error);
      throw error;
    }
  }

  async deferStep(stepId) {
    if (!this.canStepBeDeferred(stepId)) {
      throw new Error(`Step ${stepId} cannot be deferred`);
    }

    this.deferredSteps.add(stepId);
    await this.saveState();
  }

  getNextSteps() {
    return Object.values(PIPELINE_STEPS).filter((step) => {
      if (this.completedSteps.has(step.id)) return false;
      if (this.deferredSteps.has(step.id)) return false;
      if (step.dependsOn?.some((dep) => !this.completedSteps.has(dep)))
        return false;
      return true;
    });
  }

  getProgress() {
    const total = Object.values(PIPELINE_STEPS).filter(
      (step) => step.required
    ).length;
    const completed = [...this.completedSteps].filter(
      (id) => PIPELINE_STEPS[id].required
    ).length;

    return {
      progress: (completed / total) * 100,
      completed: this.completedSteps,
      deferred: this.deferredSteps,
      current: this.currentStep,
      nextSteps: this.getNextSteps(),
    };
  }

  // ... other helper methods
}
