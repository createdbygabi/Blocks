import { useState, useCallback } from "react";

export function useStripeSetup() {
  const [status, setStatus] = useState({
    isPending: false,
    isWindowOpen: false,
    accountId: null,
    error: null,
  });

  const setupStripe = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isPending: true, error: null }));

    try {
      const account = await createStripeAccount();
      const url = await getStripeConnectUrl(account.id);

      setStatus((prev) => ({
        ...prev,
        accountId: account.id,
        isWindowOpen: true,
      }));

      window.open(url, "stripe_setup", "width=1000,height=800");
    } catch (error) {
      setStatus((prev) => ({ ...prev, error }));
    } finally {
      setStatus((prev) => ({ ...prev, isPending: false }));
    }
  }, []);

  const handleStripeComplete = useCallback(() => {
    setStatus((prev) => ({ ...prev, isWindowOpen: false }));
  }, []);

  return {
    status,
    setupStripe,
    handleStripeComplete,
  };
}
