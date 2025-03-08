"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { getSaasData } from "../lib/db";
import { getStyles } from "@/lib/themes";
import { getAuthCookiePrefix } from "@/lib/auth";
import { getFeatureBySubdomain } from "../features";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";

export default function SaasDashboard() {
  const [user, setUser] = useState(null);
  const [saasData, setSaasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient({
    options: {
      cookieOptions: {
        name: getAuthCookiePrefix(window.location.host),
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          router.push("/login");
          return;
        }
        setUser(user.data.user);
        console.log("🚀 User:", user.data.user);

        // Get subdomain from current URL
        const subdomain = window.location.host.split(".")[0];
        const data = await getSaasData(subdomain);
        console.log("🚀 Data:", data);
        setSaasData(data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
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
    <div
      className={`min-h-screen flex flex-col ${
        styles.layout?.background || "bg-gray-900"
      }`}
    >
      <nav
        className={`${styles.layout?.surface || "bg-gray-800"} ${
          styles.border || "border-gray-700"
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={businessName}
                  className="h-8 w-auto mr-3"
                />
              )}
              <span
                className={`text-lg font-bold ${
                  styles.text?.primary || "text-white"
                }`}
              >
                {businessName} Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm ${
                  styles.text?.secondary || "text-gray-400"
                }`}
              >
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  styles.button?.secondary ||
                  "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                Sign Out
              </button>
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
          <div className={`rounded-xl p-6 ${styles.card || "bg-gray-800"}`}>
            No feature configured for this business
          </div>
        )}
      </main>
    </div>
  );
}
