"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUserBusiness, saveBusiness } from "@/lib/db";
import { useUser } from "@/hooks/useUser";
import Replicate from "replicate";

export default function BrandingPage() {
  const { user } = useUser();
  const [businessData, setBusinessData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    businessNames: [],
    names: [],
    logos: [],
  });
  const [testInput, setTestInput] = useState("");
  const [generatedLogos, setGeneratedLogos] = useState([]);
  const [domainResults, setDomainResults] = useState(null);
  const [isCheckingDomains, setIsCheckingDomains] = useState(false);

  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      const business = await getUserBusiness(user.id);
      console.log("📦 Frontend - Loaded business data:", business);
      setBusinessData(business);

      // Log specific fields we're interested in
      console.log("🔍 Frontend - Business fields check:", {
        logo_url: business?.logo_url,
        generated_names: business?.generated_names,
        name: business?.name,
        entire_business: business, // Log the entire business object
      });

      // If business has generated names, load them
      if (business?.generated_names?.names) {
        console.log(
          "✅ Frontend - Found generated names:",
          business.generated_names.names
        );
        setGeneratedContent((prev) => ({
          ...prev,
          businessNames: business.generated_names.names,
        }));
      } else {
        console.log("❌ Frontend - No generated names found in business data");
      }

      // If business has a logo, load it
      if (business?.logo_url) {
        console.log("✅ Frontend - Found logo URL:", business.logo_url);
        setGeneratedContent((prev) => ({
          ...prev,
          logos: [business.logo_url],
        }));
      }
    } catch (error) {
      console.error("❌ Frontend - Error loading business data:", error);
    }
  };

  const generateBusinessName = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/business/generate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo: businessData }),
      });

      const data = await response.json();
      console.log("📦 Frontend - Received business names:", data);

      if (data.error) throw new Error(data.error);

      // Save all generated names and the selected one
      await saveBusiness(user.id, {
        name: data.names[0], // Save first name as the selected name
        generated_names: {
          names: data.names,
          generated_at: new Date().toISOString(),
        },
      });
      console.log("💾 Frontend - Saved business names to database");

      setGeneratedContent((prev) => ({
        ...prev,
        businessNames: data.names,
      }));
    } catch (error) {
      console.error("❌ Frontend - Error generating business name:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBranding = async () => {
    setIsGenerating(true);
    try {
      // Generate logo keyword
      const keywordResponse = await fetch("/api/logo/generate-keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo: businessData }),
      });

      const keywordData = await keywordResponse.json();
      console.log("📦 Frontend - Received keyword data:", keywordData);

      if (keywordData.error) throw new Error(keywordData.error);

      setGeneratedContent((prev) => ({
        ...prev,
        names: keywordData.names,
      }));

      // Generate logo using the keyword
      const selectedKeyword = keywordData.names[0];
      console.log(
        "🎨 Frontend - Generating logo for keyword:",
        selectedKeyword
      );

      const logoResponse = await fetch("/api/logo/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `a simple logo of a ${selectedKeyword}, vector, line, flat, white on black`,
        }),
      });

      const logoData = await logoResponse.json();
      console.log("📦 Frontend - Received logo data:", logoData);

      if (logoData.error) throw new Error(logoData.error);

      // Save logo URL using existing db function
      await saveBusiness(user.id, {
        logo_url: logoData.imageUrl,
      });
      console.log("💾 Frontend - Saved logo URL to database");

      setGeneratedContent((prev) => ({
        ...prev,
        logos: [logoData.imageUrl], // Replace existing logo
      }));
    } catch (error) {
      console.error("❌ Frontend - Error generating branding:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLogo = async () => {
    if (!testInput.trim()) return;

    setIsGenerating(true);
    try {
      const prompt = `a simple logo of a ${testInput}, vector, line, flat, white on black`;
      console.log("🎨 Frontend - Sending logo prompt:", prompt);

      const response = await fetch("/api/logo/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("📦 Frontend - Received logo data:", data);

      if (data.error) {
        console.error("❌ Frontend - Error from logo API:", data.error);
        throw new Error(data.error);
      }

      if (!data.imageUrl) {
        console.error("❌ Frontend - No image URL in response:", data);
        throw new Error("No image URL received");
      }

      console.log("🖼️ Frontend - Adding image URL to state:", data.imageUrl);
      setGeneratedLogos((prev) => [...prev, data.imageUrl]);
    } catch (error) {
      console.error("❌ Frontend - Error generating logo:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const checkDomainAvailability = async () => {
    if (!generatedContent.businessNames.length) {
      console.error("No business names available", generatedContent);
      return;
    }

    setIsCheckingDomains(true);
    try {
      const response = await fetch("/api/business/check-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessNames: generatedContent.businessNames,
        }),
      });

      const data = await response.json();
      console.log("📦 Frontend - Domain check response:", data);

      // Directly set the results from our API response
      setDomainResults(data);
    } catch (error) {
      console.error("❌ Frontend - Error checking domains:", error);
    } finally {
      setIsCheckingDomains(false);
    }
  };

  console.log("🎯 Frontend - Current logos state:", generatedLogos);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Business Information Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-[2px] bg-white/20" />
            <h2 className="text-xl font-semibold">Business Information</h2>
          </div>
          <div className="grid gap-8">
            {businessData && (
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60">
                    Current Business Name
                  </label>
                  <div className="mt-1 p-3 bg-white/5 rounded-lg">
                    {businessData.name || "No name set"}
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={generateBusinessName}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    Generate Business Name
                  </button>
                  <button
                    onClick={generateBranding}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-black rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    Generate Logo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Business Names Section */}
        {generatedContent.businessNames.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-[2px] bg-white/20" />
              <h2 className="text-xl font-semibold">Generated Names</h2>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {generatedContent.businessNames.map((name, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    {name}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={checkDomainAvailability}
                  disabled={isCheckingDomains}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isCheckingDomains ? (
                    <span className="flex items-center gap-2">
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
                      Checking Domains...
                    </span>
                  ) : (
                    "Check Domain Availability"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logo Section */}
        {generatedContent.logos.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-[2px] bg-white/20" />
              <h2 className="text-xl font-semibold">Logo</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {generatedContent.logos.map((logoUrl, i) => (
                <div
                  key={i}
                  className="aspect-square bg-black/30 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors p-4"
                >
                  <img
                    src={logoUrl}
                    alt={`Business logo ${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domain Results Section */}
        {domainResults?.results && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-[2px] bg-white/20" />
              <h2 className="text-xl font-semibold">Domain Availability</h2>
            </div>
            <div className="grid gap-6">
              {domainResults.results.map((nameResult, i) => {
                // Sort domains to put cheapest first and unavailable last
                const sortedDomains = [...nameResult.domains].sort((a, b) => {
                  if (!a.available && b.available) return 1;
                  if (a.available && !b.available) return -1;
                  if (!a.prices || !b.prices) return 0;
                  return (
                    a.prices.registration_price - b.prices.registration_price
                  );
                });

                return (
                  <div key={i} className="space-y-4">
                    <h3 className="text-lg font-medium">{nameResult.name}</h3>
                    <div className="grid gap-4">
                      {sortedDomains.map((domain, j) => {
                        const isAvailable = domain.available && domain.prices;
                        const isCheapest =
                          domain.domain === nameResult.cheapestDomain;
                        const namecheapUrl = `https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}`;

                        return (
                          <div
                            key={j}
                            className={`p-4 rounded-xl border ${
                              isAvailable
                                ? isCheapest // Only apply special styling if it's both available AND the cheapest
                                  ? "bg-white/5 border-white/10 ring-2 ring-green-500/30"
                                  : "bg-white/5 border-white/10"
                                : "bg-white/[0.02] border-white/5"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-lg">
                                  {domain.domain}
                                  {isCheapest && (
                                    <span className="ml-2 text-sm text-green-400">
                                      Best Value
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-sm px-2 py-1 rounded ${
                                    isAvailable
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                                >
                                  {isAvailable
                                    ? `$${domain.prices.registration_price}`
                                    : "Unavailable"}
                                </span>
                                {isAvailable && (
                                  <a
                                    href={namecheapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                                  >
                                    Register
                                  </a>
                                )}
                              </div>
                            </div>

                            {domain.error && (
                              <div className="flex items-center gap-2 text-sm text-red-400 mt-2">
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 9V11M12 15H12.01M5.07 19H18.93C20.66 19 21.74 17.12 20.87 15.66L13.94 3.66C13.07 2.2 10.93 2.2 10.06 3.66L3.13 15.66C2.26 17.12 3.34 19 5.07 19Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {domain.error}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
