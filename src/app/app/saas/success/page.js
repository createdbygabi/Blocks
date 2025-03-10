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

        const response = await fetch("/api/check-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            stripeAccountId: business.stripe_account_id,
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

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${styles.text.primary}`}>
            Processing your payment...
          </h2>
          <p className={styles.text.secondary}>
            Please wait while we confirm your subscription.
          </p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Something went wrong
          </h2>
          <p className={styles.text.secondary}>
            {error || "Please try again or contact support."}
          </p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div
          className={`w-16 h-16 mx-auto mb-6 rounded-full ${styles.utils.highlight} flex items-center justify-center`}
        >
          <FiCheck className={`w-8 h-8 ${styles.text.accent}`} />
        </div>
        <h2
          className={`text-2xl md:text-3xl font-bold mb-4 ${styles.text.accent}`}
        >
          Thank you for your subscription!
        </h2>
        <p className={`${styles.text.secondary} mb-4`}>
          You can now log in with your email:
        </p>
        <p className={`font-medium mb-8 ${styles.text.primary}`}>
          {searchParams.get("email")}
        </p>
        <motion.a
          href="/login"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${styles.button.primary} inline-block px-8 py-3 rounded-xl text-lg font-bold`}
        >
          Go to Login
          <span className="ml-2">→</span>
        </motion.a>
      </div>
    );
  };

  return (
    <div className={`w-full min-h-screen ${fontVariables}`}>
      <main className={`w-full ${styles.layout.background}`}>
        <div
          className={`relative min-h-[90vh] flex items-center ${styles.layout.surface}`}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div
            className={`absolute inset-0 ${styles.section.primary} opacity-5`}
          />

          {/* Content */}
          <div className="relative w-full max-w-6xl mx-auto px-4">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
