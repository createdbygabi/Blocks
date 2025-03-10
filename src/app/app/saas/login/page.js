"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { getStyles } from "@/lib/themes";
import { getBusinessBySubdomain } from "../lib/db";
// import { supabase } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getAuthCookiePrefix } from "@/lib/auth";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
// Add fadeUp animation variant
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function SaasLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [business, setBusiness] = useState(null);

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
        const businessData = await getBusinessBySubdomain(subdomain);

        console.log("🎨 Login Page - Fetched business data:", {
          business: businessData,
        });

        if (!businessData) {
          throw new Error("Invalid SaaS data");
        }

        setBusiness(businessData);
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

  // Get styles based on theme from landing page data
  const styles = useMemo(() => {
    if (!business?.landing_pages?.[0])
      return getStyles(landingThemes[0], designPresets[0], fontPresets[0]);

    const landingPage = business.landing_pages[0];
    const theme = landingThemes[landingPage.theme_id || 0];
    const design =
      designPresets.find((d) => d.id === landingPage.design?.id) ||
      designPresets[0];
    const font =
      fontPresets.find((f) => f.id === landingPage.font?.id) || fontPresets[0];

    return getStyles(theme, design, font);
  }, [business]);

  console.log("🎨 Login Page - Applied styles:", {
    hasLandingPage: Boolean(business?.landing_pages?.[0]),
    theme_id: business?.landing_pages?.[0]?.theme_id,
    theme: landingThemes[business?.landing_pages?.[0]?.theme_id || 0],
    design: business?.landing_pages?.[0]?.design,
    font: business?.landing_pages?.[0]?.font,
    styles,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const verifyResponse = await fetch("/api/auth/verify-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          businessId: business.id,
        }),
      });

      const data = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(data.error);
      }

      const currentOrigin = window.location.origin;
      const redirectTo = `${currentOrigin}/auth/callback`;

      console.log("🔐 Login redirect URL:", redirectTo);

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            subdomain: window.location.host.split(".")[0],
          },
        },
      });

      if (signInError) throw signInError;
      setSent(true);
    } catch (error) {
      console.error("Login error:", error);
      setError({
        message: error.message,
        isHtml: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const { name: businessName, logo_url: logoUrl } = business;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeUp}
      className={`min-h-screen flex items-center justify-center ${
        styles.layout?.background || "bg-gray-900"
      }`}
    >
      <motion.div
        variants={fadeUp}
        className={`max-w-md w-full mx-4 p-8 md:p-12 rounded-2xl shadow-xl ${
          styles.card || "bg-gray-800"
        }`}
      >
        {!sent ? (
          <motion.div variants={fadeUp} className="space-y-8">
            {/* Logo */}

            <div className="space-y-3">
              <motion.h2
                variants={fadeUp}
                className={`text-3xl font-bold text-center ${
                  styles.text?.primary || "text-white"
                }`}
              >
                Log in
              </motion.h2>
              <p
                className={`text-center ${
                  styles.text?.secondary || "text-gray-400"
                }`}
              >
                Sign in to {businessName} to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium ${
                    styles.text?.secondary || "text-gray-300"
                  }`}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 rounded-xl text-base ${
                    styles.layout?.surface || "bg-gray-700"
                  } ${styles.border || "border border-gray-400"} ${
                    styles.text?.primary || "text-white"
                  } ${
                    styles.input?.focus ||
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  } transition-colors`}
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div
                  className={`p-4 rounded-xl text-sm ${
                    styles.utils?.error || "bg-red-500/10 text-red-400"
                  }`}
                >
                  {error.isHtml ? (
                    <span dangerouslySetInnerHTML={{ __html: error.message }} />
                  ) : (
                    error.message
                  )}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 px-4 rounded-xl font-medium text-base transition-all ${
                  styles.button?.primary ||
                  "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Continue with Email"
                )}
              </motion.button>

              <p
                className={`text-center text-sm ${
                  styles.text?.muted || "text-gray-500"
                }`}
              >
                By continuing, you agree to our{" "}
                <a
                  href="/terms"
                  className={`${
                    styles.text?.accent || "text-blue-400"
                  } hover:underline`}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className={`${
                    styles.text?.accent || "text-blue-400"
                  } hover:underline`}
                >
                  Privacy Policy
                </a>
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="text-center space-y-6"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
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
            <div className="space-y-2">
              <h2
                className={`text-2xl font-bold ${
                  styles.text?.primary || "text-white"
                }`}
              >
                Check your inbox
              </h2>
              <p className={`${styles.text?.secondary || "text-gray-400"}`}>
                We've sent a magic link to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setSent(false)}
              className={`text-sm ${
                styles.text?.accent || "text-blue-400"
              } hover:opacity-80 transition-colors`}
            >
              Use a different email
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
