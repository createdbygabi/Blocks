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

  // Add Instagram states
  const [igUsername, setIgUsername] = useState("");
  const [igPassword, setIgPassword] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [igError, setIgError] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Generate secure password function
  const generateSecurePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*";

    // Get 4 lowercase, 2 uppercase, 2 numbers, and 2 special chars
    const getLowercase = () =>
      lowercase[Math.floor(Math.random() * lowercase.length)];
    const getUppercase = () =>
      uppercase[Math.floor(Math.random() * uppercase.length)];
    const getNumber = () => numbers[Math.floor(Math.random() * numbers.length)];
    const getSpecial = () =>
      specialChars[Math.floor(Math.random() * specialChars.length)];

    // Generate base password with required characters
    const basePassword = [
      ...Array(4).fill(0).map(getLowercase),
      ...Array(2).fill(0).map(getUppercase),
      ...Array(2).fill(0).map(getNumber),
      ...Array(2).fill(0).map(getSpecial),
    ];

    // Shuffle the password array
    const shuffledPassword = basePassword
      .sort(() => Math.random() - 0.5)
      .join("");

    return shuffledPassword;
  };

  useEffect(() => {
    if (user) {
      fetchBusiness();
    }
  }, [user]);

  // Generate password once when component mounts
  useEffect(() => {
    if (!generatedPassword) {
      setGeneratedPassword(generateSecurePassword());
    }
  }, []); // Only run once on mount

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

  // Copy username to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace("@", ""));
  };

  // Handle Instagram connection
  const handleInstagramConnect = async () => {
    if (!igUsername || !igPassword) {
      setIgError("Please enter both username and password");
      return;
    }

    setIgLoading(true);
    setIgError(null);

    try {
      const response = await fetch("/api/instagram/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: igUsername.replace("@", ""),
          password: igPassword,
          businessId: business.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to connect Instagram account");
      }

      // Refresh business data to show updated Instagram status
      await fetchBusiness();

      // Clear form
      setIgUsername("");
      setIgPassword("");
    } catch (error) {
      console.error("Instagram connection error:", error);
      setIgError(error.message);
    } finally {
      setIgLoading(false);
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
      <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-black text-white">
      {/* Beta tester message */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6 lg:mb-8">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-blue-400 text-sm sm:text-base">
            👋 Hello and thank you for being a beta tester!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Stripe Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400"
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
                <h2 className="text-base sm:text-lg font-semibold">
                  Stripe Integration
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
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
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Website URL</p>
                      <p className="text-sm font-mono bg-black/30 px-2 py-1 rounded mt-1 text-purple-300">{`http://${business.subdomain}.joinblocks.me`}</p>
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

        {/* Instagram Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10 flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Instagram Integration
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  {business?.ig_account_credentials
                    ? "Your Instagram account is connected"
                    : "Set up your organic marketing channel"}
                </p>
              </div>
            </div>

            {business?.ig_account_credentials ? (
              <button
                onClick={() =>
                  window.open(
                    `https://instagram.com/${business.ig_account_credentials.username}`,
                    "_blank"
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 
                       hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-colors text-sm"
              >
                <span>View Profile</span>
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
              ""
            )}
          </div>

          {!business?.ig_account_credentials && (
            <div className="mt-4">
              <div className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                    Step 1: Create Your Instagram Account
                  </h4>
                </div>

                <div className="space-y-6">
                  {/* Account Name Section */}
                  <div>
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-xs">
                        1
                      </span>
                      Choose Your Account Name
                    </h5>
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                      We've crafted these professional usernames for your SaaS.
                      Click to copy and use when creating your account.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          username: `get${business.name.toLowerCase()}`,
                          description: "Professional & Clean",
                        },
                        {
                          username: `use${business.name.toLowerCase()}`,
                          description: "Authority & Trust",
                        },
                        {
                          username: `try${business.name.toLowerCase()}`,
                          description: "Business Focus",
                        },
                        {
                          username: `${business.name.toLowerCase()}.app`,
                          description: "Action-Oriented",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          onClick={() => copyToClipboard(item.username)}
                          className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-white/5 to-white/10 hover:from-pink-500/20 hover:to-purple-500/20 rounded-xl p-3 border border-white/10 hover:border-pink-500/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-pink-300 group-hover:text-white transition-colors">
                              {item.username}
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-pink-300 transition-colors">
                              Click to copy
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 group-hover:text-gray-300">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Password Section */}
                  <div>
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-xs">
                        2
                      </span>
                      Use This Secure Password
                    </h5>
                    <div className="bg-black/30 p-4 rounded-xl border border-pink-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-pink-300 font-mono">
                          {generatedPassword}
                        </code>
                        <button
                          onClick={() => copyToClipboard(generatedPassword)}
                          className="text-xs text-gray-400 hover:text-pink-300 transition-colors"
                        >
                          Copy Password
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        We've generated a secure password that meets Instagram's
                        requirements. Make sure to save it somewhere safe!
                      </p>
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <a
                    href="https://www.instagram.com/accounts/login/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-2 w-full p-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30"
                  >
                    <span className="text-white font-medium">
                      Create Instagram Account
                    </span>
                    <svg
                      className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5"
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
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </a>

                  {/* Connect Account Section */}
                  <div className="mt-8 pt-8 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                        Step 2: Connect Your Account
                      </h4>
                    </div>

                    <div className="space-y-6">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Once you've created your Instagram account, connect it
                        here to enable automated organic marketing features.
                      </p>

                      <div className="grid gap-4">
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Instagram Username
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              @
                            </span>
                            <input
                              type="text"
                              value={igUsername}
                              onChange={(e) => setIgUsername(e.target.value)}
                              placeholder="your.username"
                              className="w-full pl-8 pr-4 py-3 bg-black/30 border border-gray-800 group-hover:border-pink-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Instagram Password
                          </label>
                          <input
                            type="password"
                            value={igPassword}
                            onChange={(e) => setIgPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 bg-black/30 border border-gray-800 group-hover:border-pink-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleInstagramConnect}
                        disabled={igLoading || !igUsername || !igPassword}
                        className="relative w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 disabled:shadow-none"
                      >
                        {igLoading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="text-white font-medium">
                              Connecting...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-white font-medium">
                              Connect Instagram
                            </span>
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                          </>
                        )}
                      </button>

                      <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-blue-400 mt-0.5"
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
                          <div>
                            <h6 className="text-sm font-medium text-blue-300 mb-1">
                              Security Note
                            </h6>
                            <p className="text-sm text-gray-400">
                              Your Instagram credentials are securely encrypted
                              and used only for automated content posting
                              through the official Instagram API. We never store
                              passwords in plain text.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {igError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{igError}</p>
            </div>
          )}
        </motion.div>

        {/* Business Overview Section */}
        <div>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 w-[3px] bg-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold">Business Overview</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6"
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-contain bg-black flex-shrink-0"
                  />
                )}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {business.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Created {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a
                href={`http://${business.subdomain}.joinblocks.me`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 
                         text-xs sm:text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 
                         hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
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
              </a>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Business Info Column */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Business Info
                </h3>
                <div className="grid gap-3 sm:gap-4">
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
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Branding & Pricing
                </h3>

                {/* Theme */}
                {business.theme && (
                  <div className="bg-black/30 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">
                      Theme Colors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(business.theme).map(([key, color]) => (
                        <div key={key} className="text-xs sm:text-sm">
                          <div
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1"
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
                  <div className="bg-black/30 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">
                      Pricing Plan
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-medium">
                          {business.pricing_plans.name}
                        </span>
                        <span className="text-xs sm:text-sm text-blue-400">
                          ${business.pricing_plans.price}/
                          {business.pricing_plans.billingPeriod}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {business.pricing_plans.description}
                      </p>
                      {business.pricing_plans.features && (
                        <ul className="text-xs sm:text-sm text-gray-300 list-disc list-inside">
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

                {/* Integration Status */}
                <div className="bg-black/30 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">
                    Integration Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        business.stripe_account_id
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs sm:text-sm">Stripe</span>
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
      <p className="text-xs sm:text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-sm sm:text-base text-white break-words">{value}</p>
    </div>
  );
}
