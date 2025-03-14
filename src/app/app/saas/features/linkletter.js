"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PreviewCard = ({ url, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="group relative flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{url}</p>
      <p className="text-xs text-gray-500">
        {url.includes("linkedin.com") ? "LinkedIn Post" : "Substack Newsletter"}
      </p>
    </div>
    <button
      onClick={onRemove}
      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </motion.div>
);

const Step = ({ number, title, description, isActive }) => (
  <div
    className={`flex items-start space-x-3 ${
      isActive ? "opacity-100" : "opacity-50"
    }`}
  >
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {number}
    </div>
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default function LinkletterFeature({ styles, user, business }) {
  const [linkedinPosts, setLinkedinPosts] = useState("");
  const [substackPosts, setSubstackPosts] = useState("");
  const [newsletter, setNewsletter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState("clean"); // clean, markdown, html
  const [showTips, setShowTips] = useState(true);

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

  useEffect(() => {
    if (linkedinUrls.length > 0) setActiveStep(2);
    if (substackUrls.length > 0) setActiveStep(3);
    if (newsletter) setActiveStep(4);
  }, [linkedinUrls.length, substackUrls.length, newsletter]);

  const generateNewsletter = async () => {
    if (!linkedinUrls.length) return;
    setIsGenerating(true);
    setError("");
    setActiveStep(3);

    try {
      const response = await fetch("/api/features/linkletter", {
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
      setActiveStep(4);
    } catch (error) {
      console.error("Error generating newsletter:", error);
      setError("Failed to generate newsletter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (format = "clean") => {
    try {
      let textToCopy = newsletter;
      if (format === "markdown") {
        // Convert to markdown
        textToCopy = newsletter.replace(/<[^>]*>/g, "");
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const removeUrl = (type, url) => {
    if (type === "linkedin") {
      setLinkedinPosts((prev) =>
        prev
          .split("\n")
          .filter((u) => u !== url)
          .join("\n")
      );
    } else {
      setSubstackPosts((prev) =>
        prev
          .split("\n")
          .filter((u) => u !== url)
          .join("\n")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Progress Steps */}
        {/* <div className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <Step
                number="1"
                title="Add LinkedIn Posts"
                description="Paste the URLs of the LinkedIn posts you want to include"
                isActive={activeStep >= 1}
              />
              <Step
                number="2"
                title="Add Newsletter Template (Optional)"
                description="Add a Substack newsletter URL to match its style"
                isActive={activeStep >= 2}
              />
              <Step
                number="3"
                title="Generate Newsletter"
                description="Transform your content into a cohesive newsletter"
                isActive={activeStep >= 3}
              />
              <Step
                number="4"
                title="Review & Export"
                description="Preview your newsletter and export in your preferred format"
                isActive={activeStep >= 4}
              />
            </div>
          </div>
        </div> */}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* LinkedIn Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    LinkedIn Posts
                  </h2>
                  <p className="text-sm text-gray-500">
                    Add one or more LinkedIn post URLs (one is recommended for
                    best results)
                  </p>
                </div>
                {/* {showTips && (
                  <button
                    onClick={() => setShowTips(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hide tips
                  </button>
                )} */}
              </div>

              <div className="relative">
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                           resize-none font-medium"
                  value={linkedinPosts}
                  onChange={(e) => setLinkedinPosts(e.target.value)}
                  placeholder="Paste LinkedIn post URLs here (one per line)"
                  spellCheck="false"
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                  {linkedinUrls.length} URLs
                </div>
              </div>

              {/* URL Previews */}
              <AnimatePresence>
                {linkedinUrls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {linkedinUrls.map((url, index) => (
                      <PreviewCard
                        key={url}
                        url={url}
                        onRemove={() => removeUrl("linkedin", url)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {showTips && (
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                  <h4 className="font-medium mb-2">Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>Use public LinkedIn post URLs</li>
                    <li>Add multiple posts to combine content</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Substack Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Newsletter Template
                </h2>
                <p className="text-sm text-gray-500">
                  Add a Substack newsletter to match its structure
                </p>
              </div>

              <div className="relative">
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                           resize-none font-medium"
                  value={substackPosts}
                  onChange={(e) => setSubstackPosts(e.target.value)}
                  placeholder="Paste Substack newsletter URLs here (one per line)"
                  spellCheck="false"
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                  {substackUrls.length} URLs
                </div>
              </div>

              {/* URL Previews */}
              <AnimatePresence>
                {substackUrls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {substackUrls.map((url, index) => (
                      <PreviewCard
                        key={url}
                        url={url}
                        onRemove={() => removeUrl("substack", url)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
                  <span>Generating Newsletter...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Generate Newsletter</span>
                </div>
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
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Newsletter Preview
                </h2>
                <div className="flex items-center space-x-2">
                  {/* <select
                    value={previewMode}
                    onChange={(e) => setPreviewMode(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700"
                  >
                    <option value="clean">Clean Text</option>
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                  </select> */}
                  {newsletter && (
                    <button
                      onClick={() => copyToClipboard(previewMode)}
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
                            className="w-4 h-4 mr-2"
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
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
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
                          <span>Copy {previewMode}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative flex-1 h-[calc(100vh-24rem)]">
              {newsletter ? (
                <div className="absolute inset-0 overflow-auto">
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {newsletter}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    <p className="mt-4 text-sm text-gray-500">
                      Your newsletter will appear here after generation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
