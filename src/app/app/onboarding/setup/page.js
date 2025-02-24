"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/app/app/components/ui/FormElements";
import { useUser } from "@/hooks/useUser";
import { BusinessService } from "@/lib/services/business";
import { getBusinessAccountStatus } from "@/lib/db";

export default function SetupPage() {
  const { user } = useUser();
  const [setupStatus, setSetupStatus] = useState({
    hasStripe: false,
    hasInstagram: false,
    businessId: null,
  });
  const [currentStep, setCurrentStep] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stripe states
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [stripeError, setStripeError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState();
  const [isStripeWindowOpen, setIsStripeWindowOpen] = useState(false);

  const steps = ["Create Stripe Account", "Create Instagram Account"];

  // Check setup status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const status = await getBusinessAccountStatus(user.id);
        setSetupStatus(status);

        // Determine which step to show
        if (!status.hasStripe) {
          setCurrentStep(0);
        } else if (!status.hasInstagram) {
          setCurrentStep(1);
        } else {
          window.location.href = "/dashboard";
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user?.id]);

  // Listen for Stripe completion
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "stripe_complete") {
        setIsStripeWindowOpen(false);
        setCurrentStep(1);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Check URL params for Stripe success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      setIsStripeWindowOpen(false);
      setCurrentStep(1);
    }
  }, []);

  const handleStripeSetup = async () => {
    if (!user?.id || !setupStatus.businessId) {
      console.error("No user ID or business ID available");
      return;
    }

    setAccountCreatePending(true);
    setStripeError(false);

    try {
      const businessService = new BusinessService(user.id);
      const { accountId, url } = await businessService.setupStripeAccount(
        setupStatus.businessId,
        `${window.location.origin}/onboarding/setup?stripe=success`
      );

      setConnectedAccountId(accountId);

      if (url) {
        window.open(url, "_blank");
        setIsStripeWindowOpen(true);
      } else {
        setStripeError(true);
      }
    } catch (error) {
      console.error("Stripe setup error:", error);
      setStripeError(true);
    } finally {
      setAccountCreatePending(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Not ready state
  if (currentStep === null) {
    return null;
  }

  const StepIndicator = ({ step, current }) => {
    const isCompleted = step < current;
    const isActive = step === current;

    return (
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            isCompleted
              ? "bg-green-500 border-green-500"
              : isActive
              ? "border-purple-500 text-purple-500"
              : "border-gray-600 text-gray-600"
          }`}
        >
          {isCompleted ? (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <span className="text-sm">{step + 1}</span>
          )}
        </div>
        {step < steps.length - 1 && (
          <div
            className={`h-[2px] w-24 mx-2 transition-colors ${
              isCompleted ? "bg-green-500" : "bg-gray-600"
            }`}
          />
        )}
      </div>
    );
  };

  const StripeSetup = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <svg
          className="w-6 h-6 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold">Create Stripe Account</h2>
      </div>
      <p className="text-gray-400">
        Create your Stripe account to start accepting payments. It's free and
        only takes a few minutes.
      </p>
      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
        <h3 className="font-medium text-purple-400 mb-2">You'll be able to:</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Accept payments worldwide</li>
          <li>• Get paid directly to your bank account</li>
          <li>• Access detailed financial reports</li>
        </ul>
      </div>

      {stripeError && (
        <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/20">
          There was an error. Please try again.
        </div>
      )}

      <button
        onClick={handleStripeSetup}
        disabled={accountCreatePending || isStripeWindowOpen}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {accountCreatePending
          ? "Creating account..."
          : isStripeWindowOpen
          ? "Complete signup in new window..."
          : "Create Stripe Account"}
      </button>

      {isStripeWindowOpen && (
        <p className="text-sm text-gray-400 text-center mt-2">
          Please complete your account setup in the new window
        </p>
      )}
    </div>
  );

  const InstagramSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <svg
          className="w-6 h-6 text-pink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h2 className="text-xl font-semibold">Set Up Instagram</h2>
      </div>

      <div className="space-y-8">
        {/* Step 1: Create Account */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">
              1
            </span>
            Create Your Account
          </h3>
          <p className="text-gray-400 text-sm">
            Let Blocks automatically create and publish engaging Reels to
            attract customers. We'll generate content that resonates with your
            target audience.
          </p>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Create Instagram Account
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* Step 2: Set Up Profile */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">
              2
            </span>
            Complete Your Profile
          </h3>
          <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
            <p className="text-sm text-gray-300 mb-4">
              Copy these details to your Instagram profile:
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-pink-400">Profile Image</label>
                <div className="flex items-center gap-3 mt-1">
                  <img
                    src="/path/to/generated/image"
                    alt="Profile"
                    className="w-12 h-12 rounded-lg bg-pink-500/20"
                  />
                  <button className="text-xs text-pink-400 hover:text-pink-300">
                    Download Image
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-pink-400">Bio</label>
                <div className="mt-1 p-2 bg-pink-500/5 rounded border border-pink-500/10 text-sm text-gray-300">
                  {/* Generated bio here */}
                  Your AI-powered business partner. We create stunning designs
                  and help businesses grow. 🚀
                  <button className="text-xs text-pink-400 hover:text-pink-300 ml-2">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Connect API */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">
              3
            </span>
            Connect Instagram API
          </h3>
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-4 border border-pink-500/20">
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Follow these quick steps to let Blocks post content for you:
              </p>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">1.</span>
                  Go to Instagram Developer Settings
                  <a
                    href="https://www.instagram.com/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 ml-1"
                  >
                    (Click here)
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">2.</span>
                  Click "Generate New Token"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">3.</span>
                  Copy the token and paste it below
                </li>
              </ol>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Paste your Instagram API token here"
                  className="w-full bg-black/20 border border-pink-500/20 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                />
                <button className="w-full mt-3 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition-colors text-sm">
                  Connect Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      <div className="mb-12">
        <h1 className="text-2xl font-bold mb-2">Create Your Accounts</h1>
        <p className="text-gray-400">
          Set up the accounts you need to run your business
        </p>
      </div>

      <div className="flex justify-center mb-12">
        {steps.map((_, index) => (
          <StepIndicator key={index} step={index} current={currentStep} />
        ))}
      </div>

      <Card>
        <div className="p-2">
          {currentStep === 0 ? <StripeSetup /> : <InstagramSetup />}
        </div>
      </Card>
    </motion.div>
  );
}
