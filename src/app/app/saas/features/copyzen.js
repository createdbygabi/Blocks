"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCopy, FiCheck } from "react-icons/fi";

const SECTIONS = [
  {
    id: "hero",
    name: "Hero Section",
    description: "Generate attention-grabbing headline and subtitle",
  },
  {
    id: "benefits",
    name: "Benefits Section",
    description: "Create compelling features and benefits",
  },
  {
    id: "faq",
    name: "FAQ Section",
    description: "Generate common questions and answers",
  },
  {
    id: "final",
    name: "Final CTA",
    description: "Create a powerful call-to-action",
  },
];

export default function CopyZenFeature({ styles, user, business }) {
  const [formData, setFormData] = useState({
    businessNiche: "",
    productService: "",
    mainFeature: "",
    painPoint: "",
    targetAudience: "",
  });

  const [generatedContent, setGeneratedContent] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSection = async (sectionId) => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/features/copyzen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          section: sectionId,
          businessId: business?.id,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate copy: ${errorText}`);
      }

      const data = await response.json();

      // Update the generated content state with the new content
      setGeneratedContent((prev) => ({
        ...prev,
        [sectionId]: data.content,
      }));
    } catch (error) {
      console.error("Error generating copy:", error);
      setError(error.message || "Failed to generate copy. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (sectionId) => {
    if (!generatedContent[sectionId]) return;

    try {
      const content = generatedContent[sectionId];
      let textToCopy = "";

      // Format the content based on section type
      switch (sectionId) {
        case "hero":
          textToCopy = `Title: ${content.title}\nSubtitle: ${content.subtitle}`;
          break;
        case "benefits":
          textToCopy = `Title: ${content.title}\nSubtitle: ${
            content.subtitle
          }\n\nFeatures:\n${content.features
            .map((f) => `- ${f.title}: ${f.description}`)
            .join("\n")}`;
          break;
        case "faq":
          textToCopy = `Title: ${content.title}\n\nQuestions:\n${content.items
            .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
            .join("\n\n")}`;
          break;
        case "final":
          textToCopy = `Title: ${content.title}\nSubtitle: ${content.subtitle}\nCTA: ${content.cta}`;
          break;
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const renderSectionContent = (sectionId) => {
    const content = generatedContent[sectionId];
    if (!content) return null;

    switch (sectionId) {
      case "hero":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <p className="text-xl font-semibold text-gray-900">
                {content.title}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Subtitle
              </h3>
              <p className="text-lg text-gray-600">{content.subtitle}</p>
            </div>
          </div>
        );
      case "benefits":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <p className="text-xl font-semibold text-gray-900">
                {content.title}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Subtitle
              </h3>
              <p className="text-lg text-gray-600">{content.subtitle}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Features
              </h3>
              <div className="space-y-4">
                {content.features.map((feature, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <p className="text-xl font-semibold text-gray-900">
                {content.title}
              </p>
            </div>
            <div className="space-y-4">
              {content.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{item.question}</h4>
                  <p className="text-gray-600 mt-2">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "final":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <p className="text-xl font-semibold text-gray-900">
                {content.title}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Subtitle
              </h3>
              <p className="text-lg text-gray-600">{content.subtitle}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">CTA</h3>
              <p className="text-lg font-medium text-blue-600">{content.cta}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Business Information
            </h2>
            <p className="text-sm text-gray-500">
              Fill in the details about your business to generate compelling
              copy
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Niche
              </label>
              <input
                type="text"
                name="businessNiche"
                value={formData.businessNiche}
                onChange={handleInputChange}
                placeholder="e.g., SaaS, E-commerce, Consulting"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product/Service Offered
              </label>
              <input
                type="text"
                name="productService"
                value={formData.productService}
                onChange={handleInputChange}
                placeholder="e.g., AI-powered analytics tool"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Feature/Benefit
              </label>
              <input
                type="text"
                name="mainFeature"
                value={formData.mainFeature}
                onChange={handleInputChange}
                placeholder="e.g., Automate your workflow in minutes"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pain Point
              </label>
              <input
                type="text"
                name="painPoint"
                value={formData.painPoint}
                onChange={handleInputChange}
                placeholder="e.g., Manual data entry is time-consuming"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                placeholder="e.g., Small business owners, Marketing teams"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-50 text-red-600 text-sm mb-8"
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

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{section.name}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {section.description}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateSection(section.id)}
                    disabled={
                      isGenerating || !Object.values(formData).every(Boolean)
                    }
                    className={`px-6 py-2 rounded-lg font-medium text-white shadow-sm transition-all
                      ${
                        isGenerating || !Object.values(formData).every(Boolean)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                      }`}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </motion.button>
                </div>
              </div>

              {/* Generated Content */}
              {generatedContent[section.id] && (
                <div className="p-6 border-t border-gray-100">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => copyToClipboard(section.id)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium 
                        ${
                          copied
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-colors`}
                    >
                      {copied ? (
                        <>
                          <FiCheck className="w-4 h-4 mr-2" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-4 h-4 mr-2" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  {renderSectionContent(section.id)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
