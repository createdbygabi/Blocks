import { useState, useCallback } from "react";
import { createStripeAccount, getStripeConnectUrl } from "@/lib/stripe";

export function useStripeOnboarding() {
  const [onboardingState, setOnboardingState] = useState({
    accountId: null,
    isCreatingAccount: false,
    isCompletingSetup: false,
    error: null,
  });

  // Start the Stripe onboarding process
  const startStripeOnboarding = useCallback(async () => {
    setOnboardingState((prev) => ({
      ...prev,
      isCreatingAccount: true,
      error: null,
    }));

    try {
      // 1. Create Stripe account
      const account = await createStripeAccount();

      // 2. Get onboarding URL
      const onboardingUrl = await getStripeConnectUrl(account.id);

      // 3. Update state and open window
      setOnboardingState((prev) => ({
        ...prev,
        accountId: account.id,
        isCompletingSetup: true,
      }));

      window.open(onboardingUrl, "stripe_setup", "width=1000,height=800");
    } catch (error) {
      setOnboardingState((prev) => ({
        ...prev,
        error: error.message,
      }));
    } finally {
      setOnboardingState((prev) => ({
        ...prev,
        isCreatingAccount: false,
      }));
    }
  }, []);

  // Called when onboarding completes
  const completeStripeOnboarding = useCallback(() => {
    setOnboardingState((prev) => ({
      ...prev,
      isCompletingSetup: false,
    }));
  }, []);

  return {
    onboardingState,
    startStripeOnboarding,
    completeStripeOnboarding,
  };
}
