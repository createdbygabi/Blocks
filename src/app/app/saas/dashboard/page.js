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
    </div>
  );
}
