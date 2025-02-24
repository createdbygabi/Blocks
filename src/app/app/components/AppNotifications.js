"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { getBusinessAccountStatus } from "@/lib/db";
import { useRouter } from "next/navigation";

export default function AppNotifications() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    hasStripe: false,
    hasInstagram: false,
    businessId: null,
  });

  // Check setup status
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) return;

      try {
        const status = await getBusinessAccountStatus(user.id);
        setSetupStatus(status);
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user?.id]);

  const handleSetupClick = () => {
    router.push("/onboarding/setup");
  };

  if (isLoading || !user || isDismissed) return null;

  // Don't show notifications if everything is set up
  if (setupStatus.hasStripe && setupStatus.hasInstagram) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 p-4 pl-[300px]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl bg-gradient-to-r from-red-500/15 to-orange-500/5 backdrop-blur-xl border border-red-500/20 rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white text-lg">
                  Complete Required Setup
                </h3>
                <span className="text-sm text-red-300 font-medium">
                  {`${
                    (setupStatus.hasStripe ? 1 : 0) +
                    (setupStatus.hasInstagram ? 1 : 0)
                  }/2 steps completed`}
                </span>
              </div>
              <p className="text-sm text-red-200/80 mt-1">
                Your business cannot operate without completing these crucial
                steps
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      setupStatus.hasStripe
                        ? "border-green-400/50 bg-green-400"
                        : "border-red-400/50"
                    } flex items-center justify-center`}
                  >
                    {setupStatus.hasStripe && (
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-red-200">
                    Create Stripe account
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      setupStatus.hasInstagram
                        ? "border-green-400/50 bg-green-400"
                        : "border-red-400/50"
                    } flex items-center justify-center`}
                  >
                    {setupStatus.hasInstagram && (
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-red-200">
                    Create Instagram account
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSetupClick}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium whitespace-nowrap"
            >
              Complete Setup Now
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
