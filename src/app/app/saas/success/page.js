"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import {
  landingThemes,
  designPresets,
  fontPresets,
  getStyles,
} from "@/lib/themes";
import {
  inter,
  plusJakarta,
  dmSans,
  spaceGrotesk,
  crimsonPro,
  workSans,
} from "@/app/app/fonts";
import { Navbar } from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [business, setBusiness] = useState(null);
  const [landingPage, setLandingPage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get theme settings from landing page or use defaults
  const theme = landingPage?.theme_id
    ? landingThemes[landingPage.theme_id]
    : landingThemes[0];
  const design = landingPage?.design || designPresets[0];
  const font = landingPage?.font || fontPresets[0];
  const styles = getStyles(theme, design, font);
  const fontVariables = `${inter.variable} ${plusJakarta.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${crimsonPro.variable} ${workSans.variable}`;

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const { data: businessData, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("subdomain", window.location.host.split(".")[0])
          .single();

        if (businessError) throw businessError;
        setBusiness(businessData);

        // Fetch landing page data
        const { data: landingData, error: landingError } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("business_id", businessData.id)
          .single();

        if (landingError) throw landingError;
        setLandingPage(landingData);
      } catch (err) {
        console.error("Error fetching business data:", err);
      }
    };

    fetchBusinessData();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setError("No session ID found");
      return;
    }

    const checkSession = async () => {
      // Prevent multiple calls
      if (isProcessing || status !== "loading") return;
      setIsProcessing(true);

      try {
        if (!business) return;

        console.log("stripe_account_id", business.stripe_account_id);
        console.log(
          "default_stripe_connect_id",
          process.env.DEFAULT_STRIPE_CONNECT_ID
        );

        const response = await fetch("/api/check-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            stripeAccountId:
              business?.stripe_account_id ||
              process.env.NEXT_PUBLIC_DEFAULT_STRIPE_CONNECT_ID ||
              null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify session");
        }

        const { success, session, email } = await response.json();

        if (success) {
          // Add email to URL params without causing a page reload
          const url = new URL(window.location.href);
          url.searchParams.set("email", email);
          window.history.replaceState({}, "", url);
          setStatus("success");
        } else {
          setStatus("error");
          setError("Payment not completed");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setStatus("error");
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };

    checkSession();
  }, [searchParams, business, status, isProcessing]);

  return (
    <div
      className={`w-full min-h-screen ${fontVariables} ${styles.layout.background}`}
    >
      <main className="w-full min-h-screen flex flex-col">
        {/* Navbar can be added here if needed */}
        <div
          className={`flex-1 flex items-center justify-center relative ${styles.layout.surface}`}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div
            className={`absolute inset-0 ${styles.section.primary} opacity-5`}
          />

          {/* Content */}
          <div className="relative w-full max-w-lg mx-auto px-4 py-12 md:py-0">
            {status === "loading" ? (
              <div className="text-center space-y-6">
                <div className="animate-pulse space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full ${styles.utils.highlight}`}
                  />
                  <div
                    className={`h-8 w-3/4 mx-auto rounded-lg ${styles.utils.highlight}`}
                  />
                  <div
                    className={`h-4 w-1/2 mx-auto rounded-lg ${styles.utils.highlight}`}
                  />
                </div>
                <div className="mt-8">
                  <h2
                    className={`text-2xl font-bold mb-4 ${styles.text.primary}`}
                  >
                    Processing your payment...
                  </h2>
                  <p className={styles.text.secondary}>
                    Please wait while we confirm your subscription.
                  </p>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="text-center space-y-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center`}
                >
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold mb-4 ${styles.text.primary}`}
                  >
                    Something went wrong
                  </h2>
                  <p className={styles.text.secondary}>
                    {error || "Please try again or contact support."}
                  </p>
                </div>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${styles.button.secondary} inline-block px-8 py-3 rounded-xl text-lg font-bold mt-4`}
                >
                  Return Home
                </motion.a>
              </div>
            ) : (
              <div className="text-center space-y-8">
                <div
                  className={`w-20 h-20 mx-auto rounded-full ${styles.utils.highlight} flex items-center justify-center`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <FiCheck className={`w-10 h-10 ${styles.text.accent}`} />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <h2
                    className={`text-3xl md:text-4xl font-bold ${styles.text.primary}`}
                  >
                    Welcome aboard! 🎉
                  </h2>
                  <p className={`text-lg ${styles.text.secondary}`}>
                    Thank you for your subscription. You're all set to get
                    started!
                  </p>
                  <div
                    className={`p-4 rounded-xl ${styles.utils.highlight} max-w-sm mx-auto`}
                  >
                    <p className={`text-sm ${styles.text.secondary} mb-2`}>
                      You can now log in with your email:
                    </p>
                    <p className={`font-medium ${styles.text.primary}`}>
                      {searchParams.get("email")}
                    </p>
                  </div>
                  <div className="pt-4">
                    <motion.a
                      href="/login"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${styles.button.primary} inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold`}
                    >
                      Continue to Login
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
