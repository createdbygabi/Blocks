"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiX,
  FiInfo,
  FiEdit2,
  FiTarget,
  FiTrendingUp,
  FiArrowRight,
  FiCopy,
  FiRefreshCw,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import Link from "next/link";
import { getStyles } from "@/lib/themes";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
import {
  inter,
  plusJakarta,
  dmSans,
  spaceGrotesk,
  crimsonPro,
  workSans,
} from "@/app/app/fonts";
import { getSaasData } from "../../../lib/db";

export default function HeroScoringPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [audience, setAudience] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subdomain = window.location.hostname.split(".")[0];
        const result = await getSaasData(subdomain);
        console.log("🎯 Hero Scoring Page - Fetched data:", result);
        setData(result);
      } catch (err) {
        console.error("❌ Hero Scoring Page - Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-400">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-400">
            Something went wrong while loading the tool.
          </p>
        </div>
      </div>
    );
  }

  const { business, landingPage } = data;
  console.log("🎯 Hero Scoring Page - Business:", business);
  console.log("🎯 Hero Scoring Page - Landing Page:", landingPage);

  const theme = landingThemes[landingPage?.theme_id || 0];
  const design =
    designPresets.find((d) => d.id === landingPage?.design?.id) ||
    designPresets[0];
  const font =
    fontPresets.find((f) => f.id === landingPage?.font?.id) || fontPresets[0];
  const styles = getStyles(theme, design, font);
  const fontVariables = `${inter.variable} ${plusJakarta.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${crimsonPro.variable} ${workSans.variable}`;

  const extractRecommendations = (text) => {
    console.log("🎯 Extracting recommendations from text:", text);

    // Split the text into lines
    const lines = text.split("\n");
    console.log("🎯 Split lines:", lines);

    const headlines = [];
    const subtitles = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      console.log("🎯 Processing line:", trimmedLine);

      // Look for lines that start with a number followed by a dot and a quote
      if (trimmedLine.match(/^\d+\.\s*"/)) {
        const number = parseInt(trimmedLine.split(".")[0]);
        // Extract the content between quotes
        const content = trimmedLine.match(/"([^"]+)"/)?.[1] || "";
        console.log(`🎯 Found numbered item ${number}:`, content);

        if (number <= 3) {
          headlines.push(content);
        } else if (number <= 6) {
          subtitles.push(content);
        }
      }
    });

    console.log("🎯 Extracted headlines:", headlines);
    console.log("🎯 Extracted subtitles:", subtitles);
    return { headlines, subtitles };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAnalyzing(true);
      setError(null);

      const businessData = {
        heroTitle: headline,
        heroSubtitle: subtitle,
        targetAudience: audience,
        painPoint: painPoint,
      };

      console.log("🎯 Hero Scoring - Sending request:", businessData);

      const response = await fetch("/app/saas/tools/api/hero-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": window.location.hostname.split(".")[0],
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Hero Scoring - API Error Response:", errorText);
        throw new Error(`Failed to analyze hero section: ${response.status}`);
      }

      const result = await response.json();
      console.log("🎯 Hero Scoring - Received response:", result);

      // Parse the analysis sections
      const analysisText = result.data.analysis;
      console.log("🎯 Analysis text:", analysisText);

      const recommendations = extractRecommendations(analysisText);
      console.log("🎯 Extracted recommendations:", recommendations);

      const sections = {
        ...recommendations,
        relevance: extractSection(analysisText, "Relevance to Audience:"),
        clarity: extractSection(analysisText, "Clarity:"),
        actionWords: extractSection(analysisText, "Action Words:"),
        emotionalAppeal: extractSection(analysisText, "Emotional Appeal:"),
        valueProposition: extractSection(analysisText, "Value Proposition:"),
        urgency: extractSection(analysisText, "Urgency:"),
        solutionFocus: extractSection(analysisText, "Solution Focus:"),
      };

      console.log("🎯 Final sections:", sections);
      setAnalysis(sections);
    } catch (error) {
      console.error("❌ Hero Scoring - Error:", error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractSection = (text, sectionName) => {
    const section = text.split(sectionName)[1]?.split("\n")[0]?.trim();
    return section || "";
  };

  const handleReset = () => {
    setHeadline("");
    setSubtitle("");
    setAudience("");
    setPainPoint("");
    setAnalysis(null);
  };

  const handleCopy = () => {
    const text = `Headline: ${headline}\nSubtitle: ${subtitle}\nTarget Audience: ${audience}\nPain Point: ${painPoint}\n\nAnalysis:\n${Object.entries(
      analysis
    )
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-[calc(100vh-280px)] ${styles.layout.background} flex flex-col`}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className={`absolute inset-0 ${styles.section.primary} opacity-5`} />

      <div className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-8 sm:mt-12">
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${styles.utils.highlight}`}
          >
            <FiTarget
              className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.text.accent}`}
            />
            <span
              className={`text-xs sm:text-sm font-medium ${styles.text.accent}`}
            >
              Hero Section Optimizer
            </span>
          </motion.div>
          <h1
            className={`text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 ${styles.text.primary}`}
          >
            Optimize Your Hero Section
          </h1>
          <p
            className={`text-base sm:text-lg ${styles.text.secondary} max-w-2xl mx-auto px-4`}
          >
            Create compelling hero sections that resonate with your target
            audience and address their pain points
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${styles.card} p-6 sm:p-8 rounded-2xl`}
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 sm:mb-2 ${styles.text.primary}`}
                >
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${styles.input}`}
                  placeholder="Enter your headline"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 sm:mb-2 ${styles.text.primary}`}
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${styles.input}`}
                  placeholder="Enter your subtitle"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 sm:mb-2 ${styles.text.primary}`}
                >
                  Target Audience
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${styles.input}`}
                  placeholder="e.g., Small business owners who need automation"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 sm:mb-2 ${styles.text.primary}`}
                >
                  User's Pain Point
                </label>
                <input
                  type="text"
                  value={painPoint}
                  onChange={(e) => setPainPoint(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${styles.input}`}
                  placeholder="e.g., Wasting hours on manual tasks"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className={`flex-1 ${styles.button.primary} py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Hero Section
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`${styles.button.secondary} py-2.5 sm:py-3 px-4 rounded-xl text-sm sm:text-base font-medium flex items-center justify-center gap-2`}
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Results */}
          <div className="space-y-4 sm:space-y-6">
            {analysis ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2
                    className={`text-lg sm:text-xl font-semibold ${styles.text.primary}`}
                  >
                    Analysis Results
                  </h2>
                  <button
                    onClick={handleCopy}
                    className={`${styles.button.secondary} py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2`}
                  >
                    <FiCopy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy Results"}
                  </button>
                </div>

                {/* Headlines First - Made More Prominent */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.card} p-6 sm:p-8 rounded-2xl`}
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className={`p-2 rounded-lg ${styles.utils.highlight}`}>
                      <FiTrendingUp
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.text.accent}`}
                      />
                    </div>
                    <h3
                      className={`text-lg sm:text-xl font-semibold ${styles.text.primary}`}
                    >
                      Alternative Headlines
                    </h3>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {analysis.headlines.map((headline, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 sm:gap-4"
                      >
                        <div
                          className={`mt-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full ${styles.utils.highlight} flex items-center justify-center text-sm sm:text-base font-medium ${styles.text.accent}`}
                        >
                          {index + 1}
                        </div>
                        <p
                          className={`text-xl sm:text-2xl font-bold ${styles.text.primary} leading-tight`}
                        >
                          {headline}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Subtitle Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.card} p-6 sm:p-8 rounded-2xl`}
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className={`p-2 rounded-lg ${styles.utils.highlight}`}>
                      <FiEdit2
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.text.accent}`}
                      />
                    </div>
                    <h3
                      className={`text-lg sm:text-xl font-semibold ${styles.text.primary}`}
                    >
                      Alternative Subtitles
                    </h3>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {analysis.subtitles.map((subtitle, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 sm:gap-4"
                      >
                        <div
                          className={`mt-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full ${styles.utils.highlight} flex items-center justify-center text-sm sm:text-base font-medium ${styles.text.accent}`}
                        >
                          {index + 4}
                        </div>
                        <p
                          className={`text-lg sm:text-xl ${styles.text.primary} leading-tight`}
                        >
                          {subtitle}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Quick Analysis - Improved Layout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.card} p-6 sm:p-8 rounded-2xl`}
                >
                  <h3
                    className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${styles.text.primary}`}
                  >
                    Quick Analysis
                  </h3>
                  <div className="grid gap-4 sm:gap-6">
                    {Object.entries(analysis).map(
                      ([key, value]) =>
                        key !== "headlines" &&
                        key !== "subtitles" && (
                          <div key={key} className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${styles.utils.highlight}`}
                              />
                              <h4
                                className={`text-sm sm:text-base font-medium ${styles.text.primary} capitalize`}
                              >
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </h4>
                            </div>
                            <p
                              className={`text-xs sm:text-sm ${styles.text.secondary} pl-4`}
                            >
                              {value}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${styles.card} p-6 sm:p-8 rounded-2xl text-center`}
              >
                <FiTarget
                  className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 ${styles.text.accent}`}
                />
                <h3
                  className={`text-lg sm:text-xl font-semibold mb-2 ${styles.text.primary}`}
                >
                  Ready to Analyze
                </h3>
                <p className={`text-sm sm:text-base ${styles.text.secondary}`}>
                  Enter your hero section content and click analyze to get
                  started
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Minimal CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-12 sm:mt-16 ${styles.card} p-6 sm:p-8 rounded-2xl relative overflow-hidden`}
        >
          {/* Background gradient */}
          <div
            className={`absolute inset-0 ${styles.section.primary} opacity-5`}
          />

          <div className="relative">
            <div className="text-center max-w-2xl mx-auto">
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ${styles.text.primary}`}
              >
                Ready to optimize your entire website?
              </h2>

              <p
                className={`text-base sm:text-lg ${styles.text.secondary} mb-6 sm:mb-8`}
              >
                Get AI-powered copywriting that converts visitors into customers
              </p>

              <Link
                href="/"
                className={`${styles.button.primary} py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg font-medium flex items-center justify-center gap-2 group mx-auto w-fit`}
              >
                Start Your Website Rewrite
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
