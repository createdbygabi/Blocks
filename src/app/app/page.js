"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { getUserBusiness } from "@/lib/db";
import { BusinessService } from "@/lib/services/business";

export default function AppPage() {
  const { user } = useUser();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Stripe states
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [stripeError, setStripeError] = useState(false);
  const [isStripeWindowOpen, setIsStripeWindowOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBusiness();
    }
  }, [user]);

  // Listen for Stripe completion
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "stripe_complete") {
        setIsStripeWindowOpen(false);
        fetchBusiness(); // Refresh business data
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
      fetchBusiness(); // Refresh business data
    }
  }, []);

  const fetchBusiness = async () => {
    try {
      const businessData = await getUserBusiness(user.id);
      setBusiness(businessData);
    } catch (error) {
      console.error("Error fetching business:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSetup = async () => {
    if (!user?.id || !business?.id) {
      console.error("No user ID or business ID available");
      return;
    }

    setAccountCreatePending(true);
    setStripeError(false);

    try {
      const businessService = new BusinessService(user.id);
      const { accountId, url } = await businessService.setupStripeAccount(
        business.id,
        `${window.location.origin}/app?stripe=success`
      );

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

  const openStripeDashboard = async () => {
    try {
      const response = await fetch(
        `/api/stripe/dashboard?account_id=${business.stripe_account_id}`
      );
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening Stripe dashboard:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <div className="inline-block p-4 rounded-xl bg-blue-500/10 text-blue-400">
              <span className="text-xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold">
              Hello and thank you for being a beta tester!
            </h1>
            <p className="text-gray-400">
              A SaaS will soon be attributed to you.
            </p>
            <p className="text-sm text-gray-500">
              We're excited to have you on board.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Beta tester message */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-blue-400">
            👋 Hello and thank you for being a beta tester!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Stripe Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
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
              </div>
              <div>
                <h2 className="text-lg font-semibold">Stripe Integration</h2>
                <p className="text-sm text-gray-400">
                  {business?.stripe_account_id
                    ? "Access your Stripe Express Dashboard"
                    : "Set up payments for your business"}
                </p>
              </div>
            </div>

            {business?.stripe_account_id ? (
              <button
                onClick={openStripeDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                         text-white rounded-lg transition-colors text-sm"
              >
                <span>Open Dashboard</span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleStripeSetup}
                disabled={accountCreatePending || isStripeWindowOpen}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                         disabled:opacity-50 disabled:hover:bg-purple-500 text-white rounded-lg 
                         transition-colors text-sm"
              >
                {accountCreatePending ? (
                  <span>Setting up...</span>
                ) : isStripeWindowOpen ? (
                  <span>Waiting for completion...</span>
                ) : (
                  <>
                    Connect Stripe Account
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
          {!business?.stripe_account_id && (
            <div className="mt-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl border border-purple-500/10">
                <h3 className="text-sm font-medium text-purple-300 mb-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Important Setup Instructions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/10">
                    <div className="flex-shrink-0 p-1.5 bg-purple-500/10 rounded-lg">
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Business Category</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Select{" "}
                        <strong className="text-purple-300 font-medium">
                          Software
                        </strong>{" "}
                        or{" "}
                        <strong className="text-purple-300 font-medium">
                          Logiciels
                        </strong>{" "}
                        (French)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/10">
                    <div className="flex-shrink-0 p-1.5 bg-purple-500/10 rounded-lg">
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Website URL</p>
                      <p className="text-sm font-mono bg-black/30 px-2 py-1 rounded mt-1 text-purple-300">{`http://${business.subdomain}.localhost:3000`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stripeError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">
                There was an error setting up Stripe. Please try again.
              </p>
            </div>
          )}
        </motion.div>

        {/* Business Overview Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-[3px] bg-blue-500" />
            <h1 className="text-2xl font-bold">Business Overview</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-12 w-12 rounded-lg object-contain bg-black"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{business.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Created {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a
                href={`http://${business.subdomain}.localhost:3000`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 
                         text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 
                         hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10">View Site</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 
                              group-hover:opacity-100 transition-opacity duration-200"
                ></div>
              </a>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Business Info Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Business Info
                </h3>
                <div className="grid gap-4">
                  <InfoItem label="Niche" value={business.niche} />
                  <InfoItem label="Product" value={business.product} />
                  <InfoItem
                    label="Main Feature"
                    value={business.main_feature}
                  />
                  <InfoItem
                    label="Target Audience"
                    value={business.target_audience}
                  />
                  <InfoItem label="Pain Point" value={business.pain_point} />
                </div>
              </div>

              {/* Branding & Pricing Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Branding & Pricing
                </h3>

                {/* Theme */}
                {business.theme && (
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-gray-400 mb-2">Theme Colors</p>
                    <div className="flex gap-2">
                      {Object.entries(business.theme).map(([key, color]) => (
                        <div key={key} className="text-sm">
                          <div
                            className="w-8 h-8 rounded-lg mb-1"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-xs text-gray-500">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Plan */}
                {business.pricing_plans && (
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-gray-400 mb-2">Pricing Plan</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {business.pricing_plans.name}
                        </span>
                        <span className="text-blue-400">
                          ${business.pricing_plans.price}/
                          {business.pricing_plans.billingPeriod}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {business.pricing_plans.description}
                      </p>
                      {business.pricing_plans.features && (
                        <ul className="text-sm text-gray-300 list-disc list-inside">
                          {business.pricing_plans.features.map(
                            (feature, index) => (
                              <li key={index}>{feature}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Integration Status - Stripe Only */}
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-400 mb-2">Integration Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        business.stripe_account_id
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm">Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="bg-black/30 rounded-lg p-3">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}
