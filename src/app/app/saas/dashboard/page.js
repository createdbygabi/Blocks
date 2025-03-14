"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { getSaasData } from "../lib/db";
import { getStyles } from "@/lib/themes";
import { getAuthCookiePrefix } from "@/lib/auth";
import { getFeatureBySubdomain } from "../features";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
import { motion } from "framer-motion";

export default function SaasDashboard() {
  const [user, setUser] = useState(null);
  const [saasData, setSaasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const router = useRouter();

  // Debug current environment and host
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Window Location:", {
    host: window.location.host,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  });

  const supabase = createClientComponentClient({
    options: {
      cookieOptions: {
        name: getAuthCookiePrefix(window.location.host),
        domain: ".joinblocks.me",
        path: "/",
        secure: true,
      },
    },
  });

  // Debug cookie settings
  console.log("Cookie Settings:", {
    name: getAuthCookiePrefix(window.location.host),
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting fetchData...");
      try {
        // Debug auth state before getUser
        console.log("Checking session before getUser...");
        const session = await supabase.auth.getSession();
        console.log("Current Session:", session);

        const user = await supabase.auth.getUser();
        console.log("Auth getUser Response:", user);

        if (!user.data.user) {
          console.log("No user found, redirecting to login...");
          router.push("/login");
          return;
        }

        setUser(user.data.user);
        console.log("🚀 User:", user.data.user);

        // Get subdomain from current URL
        const subdomain = window.location.host.split(".")[0];
        console.log("Current Subdomain:", subdomain);

        const data = await getSaasData(subdomain);
        console.log("🚀 SaaS Data:", data);
        setSaasData(data);
      } catch (error) {
        console.error("Dashboard data fetch error:", {
          error,
          message: error.message,
          stack: error.stack,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get styles based on theme with proper null checks
  const styles = saasData?.landingPage
    ? getStyles(
        landingThemes[saasData?.landingPage?.theme_id] || landingThemes[0],
        designPresets.find((d) => d.id === saasData?.landingPage?.design?.id) ||
          designPresets[0],
        fontPresets.find((f) => f.id === saasData?.landingPage?.font?.id) ||
          fontPresets[0]
      )
    : getStyles(landingThemes[0], designPresets[0], fontPresets[0]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.from("user_feedback").insert([
        {
          business_id: saasData.business.id,
          submitted_by_email: user.email,
          message: feedbackMessage,
        },
      ]);
      setFeedbackMessage("");
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!saasData?.business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Business not found</div>
      </div>
    );
  }

  const { name: businessName, logo_url: logoUrl } = saasData.business;
  const BusinessFeature = getFeatureBySubdomain(
    window.location.host.split(".")[0]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="sticky top-0 z-50">
        <div
          className="absolute inset-0 bg-white
          backdrop-blur-md border-b border-gray-200 shadow-sm"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessName}
                  className="h-8 w-auto rounded-lg ring-1 ring-gray-200"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-lg overflow-hidden
                  ${styles.utils?.highlight || "bg-gray-100"}
                  ring-1 ring-gray-200 flex items-center justify-center`}
                >
                  <span className={`text-lg font-bold ${styles.text?.accent}`}>
                    {businessName.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex items-center">
                <span className="text-base font-medium text-gray-900">
                  {businessName}
                </span>
                <div className="hidden sm:block h-4 w-px mx-3 bg-gray-200" />
                <div
                  className="hidden sm:flex px-2 py-1 text-xs font-medium rounded-md
                  bg-gray-100 text-gray-700
                  ring-1 ring-gray-200"
                >
                  Dashboard
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg
                  bg-gray-100
                  ring-1 ring-gray-200"
              >
                <div
                  className={`w-6 h-6 rounded-md 
                  ${styles.utils?.highlight || "bg-gray-200"}
                  flex items-center justify-center`}
                >
                  <span className="text-xs font-medium text-gray-700">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{user.email}</span>
              </motion.div>

              {/* Feedback Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowFeedback(true)}
                className="group px-3 py-1.5 rounded-lg text-sm
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700
                  transition-all duration-150 flex items-center gap-2
                  ring-1 ring-gray-200"
              >
                <svg
                  className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Feedback</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSignOut}
                className="group px-3 py-1.5 rounded-lg text-sm
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700
                  transition-all duration-150 flex items-center gap-2
                  ring-1 ring-gray-200"
              >
                <svg
                  className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <svg
                className="w-5 h-5 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <div>
                <h3 className="font-medium">Help Us Improve!</h3>
                <p className="text-sm text-blue-100">
                  Share your ideas and suggestions - we'll act on them quickly.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFeedback(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white 
                rounded-lg backdrop-blur-sm border border-white/20 
                transition-all duration-150 flex items-center gap-2 
                shadow-sm hover:shadow"
            >
              Share Feedback
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {BusinessFeature ? (
          <BusinessFeature
            styles={styles}
            user={user}
            business={saasData.business}
          />
        ) : (
          <div className="rounded-xl p-6 bg-white shadow-sm border border-gray-200">
            No feature configured for this business
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Share Your Ideas
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your feedback helps us build a better product for you
                </p>
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-8 text-center">
                <svg
                  className="w-12 h-12 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-900 font-medium">
                  Thank you for your valuable feedback!
                </p>
                <p className="text-gray-600 mt-2">
                  We'll review it and take action soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="What would make this product even better? Share your thoughts..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      placeholder:text-gray-400 text-gray-900"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFeedback(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 
                      text-white text-sm font-medium rounded-lg
                      transition-colors flex items-center gap-2"
                  >
                    Submit Feedback
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
