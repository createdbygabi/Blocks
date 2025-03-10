"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Tooltip component
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

export default function RewordyFeature({ styles, user, business }) {
  const [originalText, setOriginalText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [corrections, setCorrections] = useState([]);
  const [showDiff, setShowDiff] = useState(true);

  useEffect(() => {
    setCharCount(originalText.length);
  }, [originalText]);

  const processText = async () => {
    if (!originalText.trim()) return;
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/features/rewordy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          text: originalText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      const data = await response.json();
      setCorrectedText(data.correctedText);
      setCorrections(data.corrections || []);
    } catch (error) {
      console.error("Error processing text:", error);
      setError("Failed to process text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearText = () => {
    setOriginalText("");
    setCorrectedText("");
    setCorrections([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Text
                </h2>
                <span className="text-sm text-gray-500">
                  ({charCount} characters)
                </span>
              </div>
              {originalText && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearText}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Clear</span>
                </motion.button>
              )}
            </div>

            <div className="relative">
              <textarea
                className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                         resize-none font-medium"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Enter your text here..."
                spellCheck="false"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processText}
                disabled={isProcessing || !originalText.trim()}
                className={`absolute bottom-4 right-4 px-6 py-2 rounded-lg font-medium text-white shadow-sm 
                  transition-all flex items-center space-x-2
                  ${
                    isProcessing || !originalText.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                  }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>Correct Text</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Output Section */}
          <AnimatePresence>
            {correctedText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Corrected Text
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Show changes
                      </span>
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${showDiff ? "bg-blue-600" : "bg-gray-200"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${showDiff ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </div>
                  </div>
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
                </div>

                <div className="relative">
                  <div className="p-4 rounded-xl bg-gray-50 font-medium text-gray-900">
                    {showDiff ? (
                      <div className="space-y-2">
                        {corrections.map((correction, index) => (
                          <Tooltip key={index} content={correction.explanation}>
                            <span
                              className={
                                correction.type === "grammar"
                                  ? "bg-yellow-100"
                                  : "bg-blue-100"
                              }
                            >
                              {correction.text}
                            </span>
                          </Tooltip>
                        ))}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{correctedText}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-red-50 text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
