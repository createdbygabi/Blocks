"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntelliflowFeature({ styles, user, business }) {
  const [linkedinPosts, setLinkedinPosts] = useState("");
  const [substackPosts, setSubstackPosts] = useState("");
  const [newsletter, setNewsletter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Parse URLs
  const linkedinUrls = useMemo(() => {
    return linkedinPosts
      .split("\n")
      .filter((url) => url.trim() && url.includes("linkedin.com/"))
      .map((url) => url.trim());
  }, [linkedinPosts]);

  const substackUrls = useMemo(() => {
    return substackPosts
      .split("\n")
      .filter((url) => url.trim() && url.includes("substack.com/"))
      .map((url) => url.trim());
  }, [substackPosts]);

  const generateNewsletter = async () => {
    if (!linkedinUrls.length) return;
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/features/intelliflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          linkedinUrls,
          substackUrls,
          businessName: business?.name || "Company",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate newsletter: ${errorText}`);
      }

      const data = await response.json();
      setNewsletter(data.newsletter);
    } catch (error) {
      console.error("Error generating newsletter:", error);
      setError("Failed to generate newsletter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newsletter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          {/* <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Newsletter Generator
          </motion.h1> */}
          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className="text-xl text-gray-600"
          >
            Transform your LinkedIn content into engaging newsletters in seconds
          </motion.p> */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6"
          >
            {/* LinkedIn Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn Posts URLs
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={linkedinPosts}
                  onChange={(e) => setLinkedinPosts(e.target.value)}
                  placeholder="Paste your LinkedIn post URLs here (one per line)"
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                  {linkedinUrls.length} URLs
                </div>
              </div>
            </div>

            {/* Substack Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Substack Newsletter URL to imitate:
                {/* <span className="text-gray-500 ml-1">(optional)</span> */}
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={substackPosts}
                  onChange={(e) => setSubstackPosts(e.target.value)}
                  placeholder="Paste your Substack newsletter URLs here (one per line)"
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                  {substackUrls.length} URLs
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateNewsletter}
              disabled={isGenerating || !linkedinPosts.trim()}
              className={`w-full py-4 rounded-xl font-medium text-white shadow-sm transition-all
                ${
                  isGenerating || !linkedinPosts.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Newsletter"
              )}
            </motion.button>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-50 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Generated Newsletter
              </h2>
              {newsletter && (
                <button
                  onClick={copyToClipboard}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
                    ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div
              className={`relative min-h-[500px] rounded-xl border border-gray-200 bg-gray-50 
                ${!newsletter && "flex items-center justify-center"}`}
            >
              {newsletter ? (
                <div className="p-6 prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {newsletter}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center p-6">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Your generated newsletter will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
