"use client";

import { useState, useMemo } from "react";
import {
  FiEdit3,
  FiCheck,
  FiX,
  FiLoader,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { saveLandingPage } from "@/lib/db";
import { useUser } from "@/hooks/useUser";

// Replace react-hot-toast with our custom toast
const showToast = (message, type) => {
  window.dispatchEvent(
    new CustomEvent("show-toast", {
      detail: { message, type },
    })
  );
};

export default function CopywritingSettings({
  content,
  onContentUpdate,
  styles,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [productDescription, setProductDescription] = useState("");
  const [audiencePainPoints, setAudiencePainPoints] = useState("");
  const [previewContent, setPreviewContent] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

  // Track changes history for each section
  const [changesHistory, setChangesHistory] = useState({});

  const sections = [
    { id: "hero", label: "Hero Section" },
    { id: "features", label: "Features" },
    { id: "process", label: "Process" },
    { id: "testimonials", label: "Testimonials" },
    { id: "comparison", label: "Comparison" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
    { id: "final", label: "Final CTA" },
  ];

  const generateCopy = async (sectionId) => {
    if (!productDescription || !audiencePainPoints) {
      showToast(
        "Please fill in both the product description and audience pain points",
        "error"
      );
      return;
    }

    setGeneratingSection(sectionId);
    console.log("🎯 Generating copy for section:", sectionId);

    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: sectionId,
          currentContent: content[sectionId],
          productDescription,
          audiencePainPoints,
        }),
      });

      const data = await response.json();
      console.log("📝 Received new content:", data.content);

      if (data.content) {
        // Track the changes for this section
        const changes = Object.entries(data.content).map(
          ([field, newValue]) => ({
            field,
            oldValue: content[sectionId][field],
            newValue,
          })
        );

        console.log("🔄 Changes to apply:", changes);

        setChangesHistory((prev) => ({
          ...prev,
          [sectionId]: [...(prev[sectionId] || []), ...changes],
        }));

        // Set preview content and update UI immediately
        const previewData = {
          section: sectionId,
          content: data.content,
          animationState: "typing",
        };
        console.log("👀 Setting preview content:", previewData);
        setPreviewContent(previewData);

        // Update the actual content for preview
        const updatedContent = {
          ...content,
          [sectionId]: data.content,
        };
        console.log("🔄 Updating content for preview:", updatedContent);
        onContentUpdate(updatedContent);

        // After animation completes
        setTimeout(() => {
          console.log("✨ Animation complete, showing approval state");
          setPreviewContent((prev) => ({
            ...prev,
            animationState: "complete",
          }));
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Failed to generate copy:", error);
      showToast("Failed to generate copy. Please try again.", "error");
    } finally {
      setGeneratingSection(null);
    }
  };

  // Helper function to format field names for display
  const formatFieldName = (field) => {
    return field
      .split(/(?=[A-Z])|_/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to format value for display
  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "object") {
            return Object.entries(item)
              .map(([key, val]) => `${formatFieldName(key)}: ${val}`)
              .join(", ");
          }
          return String(item);
        })
        .join("\n");
    }
    if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${formatFieldName(key)}: ${val}`)
        .join("\n");
    }
    return String(value);
  };

  // Render changes for a section
  const renderChanges = (sectionId) => {
    const changes = changesHistory[sectionId] || [];
    if (changes.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium text-white/80">Changes History</h4>
        {changes.map((change, index) => (
          <div key={index} className="text-sm text-white/60 space-y-1">
            <div className="font-medium text-white/80">
              {formatFieldName(change.field)}:
            </div>
            <div className="line-through opacity-50 whitespace-pre-wrap">
              {formatValue(change.oldValue)}
            </div>
            <div className="text-green-400 whitespace-pre-wrap">
              {formatValue(change.newValue)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to get the current text to display for a field
  const getDisplayText = (sectionId, path, originalText) => {
    if (!previewContent || previewContent.section !== sectionId) {
      return originalText;
    }

    const newContent = previewContent.content;
    if (!newContent) return originalText;

    // Convert content to string representation
    const contentString =
      typeof newContent === "object"
        ? JSON.stringify(newContent, null, 2)
        : String(newContent);

    if (previewContent.animationState === "typing") {
      // During animation, show text being typed
      const progress = Math.random(); // Simulate different typing progress for each field
      return contentString.slice(
        0,
        Math.floor(contentString.length * progress)
      );
    }

    return contentString;
  };

  // Inject props into the parent component's content
  const contentWithPreview = useMemo(() => {
    if (!previewContent) return content;

    return {
      ...content,
      [previewContent.section]: previewContent.content,
    };
  }, [content, previewContent]);

  // Add approval overlay when changes are ready
  const ApprovalOverlay = () => {
    if (!previewContent || previewContent.animationState !== "complete")
      return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm p-4 flex items-center gap-4"
      >
        <span className="text-white/60">Apply these changes?</span>
        <button
          onClick={applyChanges}
          disabled={isSaving}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors"
        >
          {isSaving ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiCheck className="w-4 h-4" />
              <span>Apply</span>
            </>
          )}
        </button>
        <button
          onClick={discardChanges}
          disabled={isSaving}
          className="px-4 py-2 rounded-full hover:bg-white/10 text-white/60 flex items-center gap-2 transition-colors"
        >
          <FiX className="w-4 h-4" />
          <span>Discard</span>
        </button>
      </motion.div>
    );
  };

  const applyChanges = async () => {
    if (previewContent && user) {
      console.log("💾 Starting to save changes");
      setIsSaving(true);
      try {
        const updatedContent = {
          ...content,
          [previewContent.section]: previewContent.content,
        };

        console.log("📤 Saving to Supabase:", {
          userId: user.id,
          section: previewContent.section,
        });

        // Save to Supabase
        await saveLandingPage(user.id, { content: updatedContent });

        console.log("🔄 Updating local state");
        // Update local state
        onContentUpdate(updatedContent);

        // Clear changes history for this section
        setChangesHistory((prev) => {
          const newHistory = { ...prev };
          delete newHistory[previewContent.section];
          return newHistory;
        });

        setPreviewContent(null);
        setTypingText("");
        showToast("Changes saved successfully!", "success");
        console.log("✅ Changes saved successfully");
      } catch (error) {
        console.error("❌ Failed to save changes:", error);
        showToast("Failed to save changes", "error");

        // Revert the content if save failed
        onContentUpdate({
          ...content,
          [previewContent.section]: content[previewContent.section],
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const discardChanges = () => {
    if (previewContent) {
      console.log("↩️ Reverting changes for section:", previewContent.section);

      // Store the original content for reference
      const originalContent = content[previewContent.section];
      console.log("📝 Original content:", originalContent);

      // Revert the content in the UI
      onContentUpdate({
        ...content,
        [previewContent.section]: originalContent,
      });

      // Clear preview and changes history
      setPreviewContent(null);
      setChangesHistory((prev) => {
        const newHistory = { ...prev };
        delete newHistory[previewContent.section];
        return newHistory;
      });

      showToast("Changes reverted to original", "info");
      console.log("✅ Changes reverted successfully");
    }
  };

  return (
    <>
      {/* Toggle Button - Positioned next to theme switcher */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-24 z-50 p-3 bg-black/80 hover:bg-black text-white rounded-full backdrop-blur-sm transition-all group border border-white/10 shadow-lg"
      >
        <FiEdit3 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </motion.button>

      {/* Settings Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed right-0 top-0 h-screen w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">AI Copywriting</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            {/* Quick Tips */}
            <div className="p-4 rounded-lg bg-white/10 mb-6">
              <h3 className="font-medium mb-2 text-white">Quick Tips</h3>
              <ul className="text-sm text-white/60 space-y-2">
                <li className="flex items-center gap-2">
                  <FiChevronRight className="w-4 h-4 flex-shrink-0" />
                  <span>Be specific about your product's unique value</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiChevronRight className="w-4 h-4 flex-shrink-0" />
                  <span>List real pain points your audience faces</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiChevronRight className="w-4 h-4 flex-shrink-0" />
                  <span>Generate sections one by one for best results</span>
                </li>
              </ul>
            </div>

            {/* Input Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-2 text-white/60 font-medium">
                  Product Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  rows={4}
                  placeholder="What makes your product/service unique?"
                />
              </div>

              <div>
                <label className="block mb-2 text-white/60 font-medium">
                  Audience Pain Points
                </label>
                <textarea
                  value={audiencePainPoints}
                  onChange={(e) => setAudiencePainPoints(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  rows={4}
                  placeholder="What problems does your audience face?"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-2">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-white">
                        {section.label}
                      </span>
                      {previewContent?.section === section.id && (
                        <span className="text-xs text-white/60">
                          Changes ready to apply
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => generateCopy(section.id)}
                      disabled={
                        !productDescription ||
                        !audiencePainPoints ||
                        generatingSection === section.id
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        !productDescription || !audiencePainPoints
                          ? "text-white/40 cursor-not-allowed"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      {generatingSection === section.id ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        "Generate"
                      )}
                    </button>
                  </div>

                  {/* Preview Changes */}
                  <AnimatePresence>
                    {previewContent?.section === section.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                      >
                        <div className="mt-3">
                          <div className="p-3 rounded-lg bg-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-white/80">
                                Proposed Changes
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={applyChanges}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                  {isSaving ? (
                                    <>
                                      <FiLoader className="w-4 h-4 animate-spin" />
                                      <span className="text-xs">Saving...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FiCheck className="w-4 h-4 text-green-400" />
                                      <span className="text-xs">
                                        Keep Changes
                                      </span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={discardChanges}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                  <FiX className="w-4 h-4 text-red-400" />
                                  <span className="text-xs">
                                    Revert Changes
                                  </span>
                                </button>
                              </div>
                            </div>
                            {/* Changes Display */}
                            <div className="mt-4 space-y-4">
                              {Object.entries(previewContent.content).map(
                                ([field, newValue], index) => {
                                  const oldValue =
                                    content[previewContent.section][field];
                                  if (
                                    JSON.stringify(oldValue) ===
                                    JSON.stringify(newValue)
                                  )
                                    return null;

                                  return (
                                    <div key={index} className="space-y-2">
                                      <div className="text-sm font-medium text-white/80">
                                        {formatFieldName(field)}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="text-sm text-white/60">
                                          <span className="text-red-400">
                                            -{" "}
                                          </span>
                                          <span className="line-through">
                                            {formatValue(oldValue)}
                                          </span>
                                        </div>
                                        <div className="text-sm">
                                          <span className="text-green-400">
                                            +{" "}
                                          </span>
                                          <span className="text-white">
                                            {formatValue(newValue)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
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

        {/* Add custom scrollbar styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </motion.div>

      {/* Approval Overlay */}
      <ApprovalOverlay />
    </>
  );
}
