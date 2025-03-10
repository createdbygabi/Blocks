"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBusinessId, setOpenBusinessId] = useState(null);

  useEffect(() => {
    if (user && user.id !== ADMIN_USER_ID) {
      router.push("/");
      return;
    }

    if (user?.id === ADMIN_USER_ID) {
      fetchBusinesses();
    }
  }, [user]);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBusiness = (businessId) => {
    setOpenBusinessId(openBusinessId === businessId ? null : businessId);
  };

  if (!user || user.id !== ADMIN_USER_ID) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-[3px] bg-blue-500" />
          <h1 className="text-2xl font-bold">SaaS Dashboard</h1>
        </div>

        <div className="grid gap-6">
          {businesses.map((business) => (
            <motion.div
              key={business.id}
              initial={false}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              {/* Header Section - Always Visible */}
              <button
                onClick={() => toggleBusiness(business.id)}
                className="w-full text-left"
              >
                <div className="p-6 flex items-start justify-between group hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {business.logo_url && (
                      <img
                        src={business.logo_url}
                        alt={business.name}
                        className="h-12 w-12 rounded-lg object-contain bg-black"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        {business.name}
                        <motion.svg
                          className="w-5 h-5 text-gray-400"
                          animate={{
                            rotate: openBusinessId === business.id ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-400">
                          Created{" "}
                          {new Date(business.created_at).toLocaleDateString()}
                        </p>
                        <span className="text-gray-600">•</span>
                        <p className="text-sm text-blue-400">
                          {business.user_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`http://${business.subdomain}.localhost:3000`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>View Site</span>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {openBusinessId === business.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-800"
                  >
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      {/* Business Info Column */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                          Business Info
                        </h3>
                        <div className="grid gap-4">
                          <InfoItem label="Niche" value={business.niche} />
                          <InfoItem label="Product" value={business.product} />
                          <InfoItem
                            label="Main Feature"
                            value={business.main_feature}
                          />
                          <InfoItem
                            label="Target Audience"
                            value={business.target_audience}
                          />
                          <InfoItem
                            label="Pain Point"
                            value={business.pain_point}
                          />
                        </div>
                      </div>

                      {/* Branding & Pricing Column */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                          Branding & Pricing
                        </h3>

                        {/* Theme */}
                        {business.theme && (
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-gray-400 mb-2">Theme Colors</p>
                            <div className="flex gap-2">
                              {Object.entries(business.theme).map(
                                ([key, color]) => (
                                  <div key={key} className="text-sm">
                                    <div
                                      className="w-8 h-8 rounded-lg mb-1"
                                      style={{ backgroundColor: color }}
                                    />
                                    <p className="text-xs text-gray-500">
                                      {key}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pricing Plan */}
                        {business.pricing_plans && (
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-gray-400 mb-2">Pricing Plan</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {business.pricing_plans.name}
                                </span>
                                <span className="text-blue-400">
                                  ${business.pricing_plans.price}/
                                  {business.pricing_plans.billingPeriod}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {business.pricing_plans.description}
                              </p>
                              {business.pricing_plans.features && (
                                <ul className="text-sm text-gray-300 list-disc list-inside">
                                  {business.pricing_plans.features.map(
                                    (feature, index) => (
                                      <li key={index}>{feature}</li>
                                    )
                                  )}
                                </ul>
                              )}
                              {business.pricing_plans.limitations && (
                                <p className="text-sm text-yellow-500 mt-2">
                                  Limit: {business.pricing_plans.limitations}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Integration Status */}
                        <div className="bg-black/30 rounded-lg p-4">
                          <p className="text-gray-400 mb-2">
                            Integration Status
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  business.stripe_account_id
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-sm">Stripe</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  business.ig_account_id
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-sm">Instagram</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="bg-black/30 rounded-lg p-3">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}
