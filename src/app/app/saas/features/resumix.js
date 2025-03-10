"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 w-64 p-2 mt-2 text-sm bg-white rounded-lg shadow-lg border border-gray-200 text-gray-700"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CorrectionHighlight = ({ correction, children }) => (
  <Tooltip
    content={
      <div className="space-y-1">
        <div className="font-medium">Suggested Change:</div>
        <div className="text-gray-600">{correction.explanation}</div>
      </div>
    }
  >
    <span
      className={`cursor-help border-b-2 ${
        correction.type === "grammar"
          ? "border-yellow-300"
          : correction.type === "impact"
          ? "border-green-300"
          : correction.type === "keyword"
          ? "border-blue-300"
          : "border-gray-300"
      }`}
    >
      {children}
    </span>
  </Tooltip>
);

export default function ResumixFeature({ styles, user, business }) {
  const [jobDescription, setJobDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [showTips, setShowTips] = useState(true);
  const [corrections, setCorrections] = useState([]);
  const [previewMode, setPreviewMode] = useState("enhanced"); // enhanced, clean

  useEffect(() => {
    if (jobDescription) setActiveStep(2);
    if (experience) setActiveStep(3);
    if (generatedContent) setActiveStep(4);
  }, [jobDescription, experience, generatedContent]);

  const processContent = async () => {
    if (!jobDescription.trim() || !experience.trim()) return;
    setIsProcessing(true);
    setError("");
    setActiveStep(3);

    try {
      const response = await fetch("/api/features/resumix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          jobDescription,
          experience,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process content");
      }

      const data = await response.json();
      setGeneratedContent(data.correctedText);
      setCorrections(data.corrections || []);
      setActiveStep(4);
    } catch (error) {
      console.error("Error processing content:", error);
      setError("Failed to process content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearAll = () => {
    setJobDescription("");
    setExperience("");
    setGeneratedContent("");
    setCorrections([]);
    setError("");
    setActiveStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <Step
                number="1"
                title="Job Description"
                description="Paste the job description you're targeting"
                isActive={activeStep >= 1}
              />
              <Step
                number="2"
                title="Your Experience"
                description="Add your relevant experience and achievements"
                isActive={activeStep >= 2}
              />
              <Step
                number="3"
                title="Generate Content"
                description="Transform your experience into targeted resume content"
                isActive={activeStep >= 3}
              />
              <Step
                number="4"
                title="Review & Export"
                description="Review the optimized content and export"
                isActive={activeStep >= 4}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Job Description Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Target Job Description
                  </h2>
                  <p className="text-sm text-gray-500">
                    Paste the job posting you're applying for
                  </p>
                </div>
                {showTips && (
                  <button
                    onClick={() => setShowTips(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hide tips
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                           resize-none font-medium"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  spellCheck="false"
                />
              </div>

              {showTips && (
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                  <h4 className="font-medium mb-2">Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>Include the full job description</li>
                    <li>Make sure to capture key requirements</li>
                    <li>Include any specific qualifications mentioned</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Experience Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Experience
                </h2>
                <p className="text-sm text-gray-500">
                  Describe your relevant experience and achievements
                </p>
              </div>

              <div className="relative">
                <textarea
                  className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                           resize-none font-medium"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe your experience, including metrics and achievements..."
                  spellCheck="false"
                />
              </div>

              {showTips && (
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                  <h4 className="font-medium mb-2">Writing Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>Use specific numbers and metrics</li>
                    <li>Focus on achievements over responsibilities</li>
                    <li>Include relevant technical skills</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processContent}
                disabled={
                  isProcessing || !jobDescription.trim() || !experience.trim()
                }
                className={`flex-1 py-4 rounded-xl font-medium text-white shadow-sm transition-all
                  ${
                    isProcessing || !jobDescription.trim() || !experience.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                  }`}
              >
                {isProcessing ? (
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
                    <span>Optimizing Content...</span>
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Optimize for Job</span>
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearAll}
                className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-300
                         transition-all flex items-center space-x-2"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Clear</span>
              </motion.button>
            </div>

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
                  Optimized Content
                </h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={previewMode}
                    onChange={(e) => setPreviewMode(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700"
                  >
                    <option value="enhanced">Enhanced View</option>
                    <option value="clean">Clean Text</option>
                  </select>
                  {generatedContent && (
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
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative flex-1 h-[calc(100vh-24rem)]">
              {generatedContent ? (
                <div className="absolute inset-0 overflow-auto">
                  <div className="p-6">
                    <div className="prose max-w-none">
                      {previewMode === "enhanced" ? (
                        <div className="space-y-4">
                          {corrections.map((correction, index) => (
                            <CorrectionHighlight
                              key={index}
                              correction={correction}
                            >
                              {correction.text}
                            </CorrectionHighlight>
                          ))}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-gray-800">
                          {generatedContent}
                        </div>
                      )}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-4 text-sm text-gray-500">
                      Your optimized content will appear here
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
