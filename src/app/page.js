"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Features from "../components/Features";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [count, setCount] = useState(null);

  useEffect(() => {
    // Fetch count once on mount
    const getCount = async () => {
      try {
        const { data, error } = await supabase
          .from("waitlist")
          .select("*", { count: "exact" });

        console.log("Supabase full response:", { data, error });

        if (error) {
          console.error("Supabase error:", error);
          setCount(0);
          return;
        }

        // Set the actual count and add base number for social proof
        const actualCount = data?.length ?? 0;
        console.log("Actual count from database:", actualCount);

        // Start with at least 1500+ for social proof
        setCount(Math.max(actualCount, 0));
      } catch (error) {
        console.error("Fetch error:", error);
        setCount(0);
      }
    };

    getCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email, signed_up_at: new Date() }]);

      if (error) throw error;

      // Update count after successful signup
      setCount((prev) => (prev ?? 0) + 1);

      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Signup error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['Clash_Display']">
      {/* Enhanced background with smoother animation */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-black to-black animate-pulse-slow" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

      <main className="relative">
        {/* Hero Section with better responsive sizing */}
        <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 sm:mb-12 lg:mb-16 inline-block"
            >
              <img
                src="/images/logo.png"
                alt="BLOCKS Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 lg:mb-8"
              />
              <span className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border border-white/10 bg-black/40 text-white/90 text-xs sm:text-sm tracking-[0.2em] backdrop-blur-sm">
                <span className="font-cal">BLOCKS</span> • BUILD WITH AI
              </span>
            </motion.div>

            <h1 className="max-w-4xl mx-auto text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold mb-4 sm:mb-6 lg:mb-8 font-grotesk leading-[1.1] tracking-[-0.02em]">
              Create a fully automated business that{" "}
              <span className="relative inline-block group">
                <span
                  style={{ width: "105%" }}
                  className="absolute bottom-1 -left-1 w-full h-[1rem] bg-white/50 transform transition-all duration-300 group-hover:h-[1.5rem] group-hover:bg-white/40"
                ></span>
                <span className="relative">earns</span>
              </span>{" "}
              for you
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 lg:mb-16 max-w-2xl mx-auto leading-relaxed font-light">
              Zero effort, zero cost. Blocks uses AI to build a fully automated
              business that earns for you. Be among the first to embrace the
              future of business.
            </p>

            {/* Main form */}
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-lg mx-auto mb-4 sm:mb-6 relative"
            >
              <motion.div
                className="absolute -inset-1 bg-white/20 rounded-lg blur-xl opacity-20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-3 p-1.5 bg-white/[0.03] rounded-lg backdrop-blur-xl border border-white/10">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-md bg-black/50 border-0 focus:ring-1 focus:ring-white/30 focus:outline-none transition placeholder-white/40 text-white/90 text-base sm:text-lg font-light font-sans"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="whitespace-nowrap px-6 sm:px-10 py-3 sm:py-4 rounded-md bg-white text-black hover:bg-white/90 font-sans text-sm sm:text-base font-bold tracking-wider uppercase transition transform hover:scale-[1.02] disabled:opacity-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  {status === "loading" ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                      Processing
                    </span>
                  ) : (
                    "Get Early Access"
                  )}
                </button>
              </div>

              {/* Success message */}
              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/90 mt-4 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    You're in! Watch your inbox for exclusive early access.
                  </span>
                </motion.p>
              )}
            </form>

            {/* Social proof counter - now after form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 sm:mb-12 lg:mb-16"
            >
              <div className="inline-flex flex-col items-center gap-2">
                <span className="inline-flex items-center justify-center gap-1 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium text-white/90 text-base sm:text-lg">
                    {count !== null ? (count + 40).toLocaleString() : "40+"}{" "}
                    early founders
                  </span>
                  <span className="text-white/60 text-base sm:text-lg">
                    building with AI
                  </span>
                </span>
                <span className="text-xs sm:text-sm text-white/40">
                  Limited spots available
                </span>
              </div>
            </motion.div>

            {/* Refined features section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs sm:text-sm text-white/60 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12"
            >
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-white/40"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Zero Experience Needed
              </span>
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-white/40"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Zero Upfront Cost
              </span>
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-white/40"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Instant Setup
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Features and Testimonials with proper spacing */}
        <div className="max-w-7xl mx-auto px-4">
          <Features />
          {/* <Testimonials /> */}
        </div>
      </main>
    </div>
  );
}
