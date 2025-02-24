"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { getSaasData } from "../lib/db";
import { getStyles } from "@/lib/themes";
import { getAuthCookiePrefix } from "@/lib/auth";
import { businessFeatures } from "../features";

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
        // Check auth status
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);

        // Get subdomain from current URL
        const subdomain = window.location.host.split(".")[0];
        const data = await getSaasData(subdomain);
        setSaasData(data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const styles = saasData?.landingPage
    ? getStyles(
        saasData.landingPage.theme,
        saasData.landingPage.design,
        saasData.landingPage.font
      )
    : {};

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

  if (!user || !saasData?.business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to access the dashboard</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const BusinessFeature = businessFeatures[saasData.business.id];

  return (
    <div
      className={`min-h-screen flex flex-col ${
        styles.layout?.background || "bg-gray-900"
      }`}
    >
      <nav
        className={`border-b ${styles.card || "bg-gray-800"} border-gray-700`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {saasData.business.logo_url && (
                <img
                  src={saasData.business.logo_url}
                  alt={saasData.business.name}
                  className="h-8 w-auto mr-3"
                />
              )}
              <span
                className={`text-lg font-bold ${
                  styles.text?.primary || "text-white"
                }`}
              >
                {saasData.business.name} Dashboard
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
        <div className={`rounded-lg ${styles.card || "bg-gray-800"} p-6`}>
          <h2
            className={`text-xl font-semibold mb-4 ${
              styles.text?.primary || "text-white"
            }`}
          >
            Welcome to your dashboard
          </h2>
          <p className={`${styles.text?.secondary || "text-gray-400"}`}>
            This is a simple dashboard for {saasData.business.name}. You can
            customize it further based on your needs.
          </p>
        </div>

        {BusinessFeature && <BusinessFeature styles={styles} />}
      </main>
    </div>
  );
}
