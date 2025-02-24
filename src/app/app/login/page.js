"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "" });
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "" });

    try {
      // Debug log
      console.log("Attempting to sign in with:", email);

      // Attempt to sign in with OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // Debug logs
      console.log("SignInWithOTP Response:", { data, error });

      if (error) {
        console.error("Detailed error:", {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      setStatus({
        loading: false,
        message: "✓ Magic link sent! Check your email.",
      });
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error stack:", error.stack);

      setStatus({
        loading: false,
        message: `✕ ${error.message}${error.hint ? ` (${error.hint})` : ""}`,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] mx-auto">
        {/* Logo */}
        <div className="text-center mb-12">
          <Image
            src="/images/logo.png"
            alt="Blocks Logo"
            width={40}
            height={40}
            className="mx-auto mb-3"
          />
          <div className="text-[13px] tracking-[0.2em] text-gray-500 uppercase">
            Blocks • Build with AI
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-[52px] px-4 bg-[#111111] rounded-lg border border-[#222222] text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className={`w-full h-[52px] bg-white text-black rounded-lg font-medium transition-all ${
              status.loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            {status.loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              "Continue with Email"
            )}
          </button>

          {status.message && (
            <div
              className={`p-4 rounded-lg text-sm text-center ${
                status.message.includes("✓")
                  ? "bg-[#111111] text-green-400"
                  : "bg-[#111111] text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}
        </form>

        {/* Help Links */}
        <div className="mt-8 text-center text-sm">
          <div className="text-gray-500">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
          <div className="mt-4 text-gray-500">
            Need help?{" "}
            <a
              href="/help"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
