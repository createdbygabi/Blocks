"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const PreviewCard = ({ url, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="group relative flex items-center p-2.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all"
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          {url.includes("linkedin.com") ? (
            <svg
              className="w-4 h-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-orange-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-15-1.5h15a3 3 0 013 3v15a3 3 0 01-3 3h-15a3 3 0 01-3-3v-15a3 3 0 013-3z" />
              <path d="M7.5 9h9v1.5h-9V9zm0 3h9v1.5h-9V12zm0 3h9v1.5h-9V15z" />
            </svg>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">
          {url.includes("linkedin.com")
            ? "LinkedIn Post"
            : "Substack Newsletter"}
        </p>
      </div>
      <p className="mt-1 text-xs text-gray-500 truncate">{url}</p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="ml-2 flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
    >
      <svg
        className="w-4 h-4"
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

function SavedNewslettersList({
  newsletters,
  onSelect,
  selectedId,
  onClose,
  onDelete,
}) {
  if (!newsletters.length) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No saved newsletters
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {newsletters.map((newsletter) => (
        <motion.div
          key={newsletter.id}
          className={`bg-white rounded-xl border ${
            selectedId === newsletter.id
              ? "border-blue-500 shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          } transition-all cursor-pointer`}
          onClick={() => onSelect(newsletter)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {`Newsletter #${newsletter.number}`}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(newsletter.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {newsletter.content.substring(0, 150)}...
            </p>
            {selectedId === newsletter.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <div className="space-y-4"></div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

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
  const [savedNewsletters, setSavedNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [viewMode, setViewMode] = useState("form"); // "form" or "list"
  const [selectedNewsletterId, setSelectedNewsletterId] = useState(null);

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

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const response = await fetch("/api/features/linkletter/newsletters");
        if (!response.ok) {
          throw new Error("Failed to fetch newsletters");
        }
        const data = await response.json();
        setSavedNewsletters(data.newsletters || []);
      } catch (err) {
        console.error("Error fetching newsletters:", err);
      }
    };

    fetchNewsletters();
  }, []);

  const deleteNewsletter = async (id) => {
    try {
      const response = await fetch(
        `/api/features/linkletter/newsletters?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete newsletter");
      }

      // Optimistically update UI
      setSavedNewsletters((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      setError("Failed to delete newsletter. Please try again.");
    }
  };

  const updateNewsletter = async (id, updates) => {
    try {
      const response = await fetch("/api/features/linkletter/newsletters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to update newsletter");
      }

      const data = await response.json();

      // Optimistically update UI
      setSavedNewsletters((prev) =>
        prev.map((n) => (n.id === id ? data.newsletter : n))
      );

      return data.newsletter;
    } catch (error) {
      console.error("Error updating newsletter:", error);
      setError("Failed to update newsletter. Please try again.");
      return null;
    }
  };

  const saveNewsletter = async (newsletterData) => {
    try {
      const response = await fetch("/api/features/linkletter/newsletters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsletterData),
      });

      if (!response.ok) {
        throw new Error("Failed to save newsletter");
      }

      const data = await response.json();

      // Optimistically update UI
      setSavedNewsletters((prev) => [data.savedNewsletter, ...prev]);

      return data.savedNewsletter;
    } catch (error) {
      console.error("Error saving newsletter:", error);
      setError("Failed to save newsletter. Please try again.");
      return null;
    }
  };

  const testSupabaseInsert = async () => {
    try {
      console.log("Testing newsletter insert with user:", user);

      const testData = {
        content: "This is a test newsletter",
        linkedin_urls: ["https://linkedin.com/test"],
        substack_urls: [],
        title: `Test Newsletter #${Date.now()}`,
        business_id: business?.id,
      };

      const savedNewsletter = await saveNewsletter(testData);
      if (!savedNewsletter) {
        throw new Error("Failed to save test newsletter");
      }
    } catch (error) {
      console.error("Error in test insert:", error);
      setError("Failed to save test newsletter. Please check console.");
    }
  };

  const generateNewsletter = async () => {
    if (!linkedinUrls.length) return;
    setIsGenerating(true);
    setError("");
    setActiveStep(3);

    try {
      console.log("Generating newsletter with:", {
        linkedinUrls,
        substackUrls,
        businessName: business?.name || "Company",
        userId: user?.id,
      });

      const response = await fetch("/api/features/linkletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedinUrls,
          substackUrls,
          businessName: business?.name || "Company",
          businessId: business?.id,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate newsletter: ${errorText}`);
      }

      const data = await response.json();
      setNewsletter(data.newsletter);

      // Update the saved newsletters list with the newly created newsletter
      if (data.savedNewsletter) {
        setSavedNewsletters((prev) => [data.savedNewsletter, ...prev]);
      }

      setActiveStep(4);
    } catch (error) {
      console.error("Error in newsletter generation flow:", error);
      setError(
        error.message || "Failed to generate newsletter. Please try again."
      );
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

  const handleSelectNewsletter = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setNewsletter(newsletter.content);
    setLinkedinPosts(newsletter.linkedin_urls.join("\n"));
    setSubstackPosts(newsletter.substack_urls.join("\n"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Saved Newsletters Cards */}
        <div className="lg:w-80 flex-shrink-0">
          <SavedNewslettersList
            newsletters={savedNewsletters}
            selectedId={selectedNewsletterId}
            onSelect={(newsletter) => {
              setSelectedNewsletterId(
                newsletter.id === selectedNewsletterId ? null : newsletter.id
              );
            }}
            onClose={() => {
              setSelectedNewsletterId(null);
            }}
            onDelete={deleteNewsletter}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 max-w-full">
          {selectedNewsletterId ? (
            // Selected Newsletter View
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              {savedNewsletters.map((n) =>
                n.id === selectedNewsletterId ? (
                  <div key={n.id} className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {`Newsletter #${n.number}`}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedNewsletterId(null);
                          }}
                          className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => deleteNewsletter(n.id)}
                          className="px-3 py-1.5 text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {n.content}
                      </div>
                    </div>
                    {n.linkedin_urls?.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          LinkedIn Posts
                        </h3>
                        <div className="space-y-1">
                          {n.linkedin_urls.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline break-all line-clamp-1"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {n.substack_urls?.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Substack Templates
                        </h3>
                        <div className="space-y-1">
                          {n.substack_urls.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline break-all line-clamp-1"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              )}
            </motion.div>
          ) : (
            // Newsletter Generation Form
            <div className="space-y-6">
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

              {/* Preview */}
              {newsletter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Newsletter Preview
                      </h2>
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
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {newsletter}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
