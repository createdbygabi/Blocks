"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStyles } from "@/lib/themes";
import { getSaasData } from "../lib/db";
import { getAuthCookiePrefix } from "@/lib/auth";

export default function SaasLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [saasData, setSaasData] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient({
    options: {
      cookieOptions: {
        name: getAuthCookiePrefix(window.location.host),
      },
    },
  });

  // Fetch SaaS data on mount
  useEffect(() => {
    const fetchSaasData = async () => {
      try {
        // Get subdomain from current URL
        const subdomain = window.location.host.split(".")[0];
        const data = await getSaasData(subdomain);

        if (!data || !data.business) {
          throw new Error("Invalid SaaS data");
        }

        setSaasData(data);
      } catch (error) {
        console.error("Error fetching SaaS data:", error);
        setError("Failed to load business data");
      }
    };

    fetchSaasData();
  }, []);

  useEffect(() => {
    // Log the origin for debugging
    console.log("🌐 Window location:", {
      origin: window.location.origin,
      host: window.location.host,
      hostname: window.location.hostname,
      href: window.location.href,
    });
  }, []);

  // Get styles based on SaaS theme
  const styles = saasData?.landingPage
    ? getStyles(
        saasData.landingPage.theme,
        saasData.landingPage.design,
        saasData.landingPage.font
      )
    : {};

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentOrigin = window.location.origin;
      // Remove /saas from callback path since middleware will handle it
      const redirectTo = `${currentOrigin}/auth/callback`;

      console.log("🔐 Login redirect URL:", redirectTo);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            subdomain: window.location.host.split(".")[0],
          },
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (!saasData?.business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const { name: businessName, logo_url: logoUrl } = saasData.business;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        styles.layout?.background || "bg-gray-900"
      }`}
    >
      <div
        className={`max-w-md w-full p-8 rounded-lg shadow-lg ${
          styles.card || "bg-gray-800"
        }`}
      >
        {!sent ? (
          <>
            {/* Logo */}
            {logoUrl && (
              <div className="flex justify-center mb-6">
                <img src={logoUrl} alt={businessName} className="h-12 w-auto" />
              </div>
            )}

            <h2
              className={`text-3xl font-bold mb-6 text-center ${
                styles.text?.primary || "text-white"
              }`}
            >
              Welcome to {businessName}
            </h2>
            <p
              className={`text-center mb-8 ${
                styles.text?.secondary || "text-gray-400"
              }`}
            >
              Enter your email to receive a magic link
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    styles.text?.secondary || "text-gray-300"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 ${
                    styles.input ||
                    "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                  }`}
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  styles.button?.primary ||
                  "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                styles.utils?.highlight || "bg-blue-500/20"
              }`}
            >
              <svg
                className={`w-8 h-8 ${styles.text?.accent || "text-blue-500"}`}
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
            </div>
            <h2
              className={`text-2xl font-bold mb-4 ${
                styles.text?.primary || "text-white"
              }`}
            >
              Check your email
            </h2>
            <p className={`mb-8 ${styles.text?.secondary || "text-gray-400"}`}>
              We've sent a magic link to{" "}
              <span className={styles.text?.primary || "text-white"}>
                {email}
              </span>
            </p>
            <button
              onClick={() => setSent(false)}
              className={`${
                styles.text?.accent || "text-blue-400"
              } hover:opacity-80 transition-colors`}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
