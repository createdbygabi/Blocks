"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Create a standalone HTML string for the popup
const popupHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    body { 
      margin: 0; 
      background: #1e1e1e; 
      color: white; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .popup {
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 8px;
    }
    .textarea {
      flex: 0 0 auto;
      width: 100%;
      padding: 8px 12px;
      background: #1e1e1e;
      color: white;
      border: 1px solid #2d2d2d;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      resize: none;
      outline: none;
      height: 80px;
    }
    .controls {
      flex: 0 0 auto;
      padding: 8px 0;
      background: #1e1e1e;
    }
    .button {
      width: 100%;
      padding: 4px 8px;
      background: #2d2d2d;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .button:hover { background: #3d3d3d; }
    .button:disabled { 
      background: #252525; 
      color: #666;
      cursor: not-allowed;
    }
    .result {
      margin-top: 8px;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .result-label {
      font-size: 11px;
      color: #888;
    }
    .copy-button {
      font-size: 11px;
      color: #3b82f6;
      background: none;
      border: none;
      cursor: pointer;
    }
    .copy-button:hover { color: #60a5fa; }
    .result-content {
      padding: 8px 12px;
      background: #2d2d2d;
      border: 1px solid #3d3d3d;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      white-space: pre-wrap;
      min-height: 80px;
      line-height: normal;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  </style>
</head>
<body>
  <div class="popup">
    <textarea 
      class="textarea" 
      placeholder="Enter your prompt for Cursor here..."
      autofocus
    ></textarea>
    <div class="controls">
      <button class="button">Enhance Prompt</button>
      <div class="result" style="display: none">
        <div class="result-header">
          <span class="result-label">Optimized for Cursor</span>
          <button class="copy-button">Copy</button>
        </div>
        <div class="result-content"></div>
      </div>
    </div>
  </div>
  <script>
    const textarea = document.querySelector('.textarea');
    const enhanceButton = document.querySelector('.button');
    const resultDiv = document.querySelector('.result');
    const resultContent = document.querySelector('.result-content');
    const copyButton = document.querySelector('.copy-button');
    
    let isLoading = false;

    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });

    enhanceButton.addEventListener('click', async () => {
      if (isLoading || !textarea.value.trim()) return;
      
      isLoading = true;
      enhanceButton.disabled = true;
      enhanceButton.innerHTML = '<div class="spinner"></div>Enhancing...';
      resultDiv.style.display = 'none';
      
      try {
        const response = await fetch("/api/features/cursage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textarea.value.trim() }),
        });
        
        if (!response.ok) throw new Error('Failed to enhance prompt');
        
        const data = await response.json();
        resultContent.textContent = data.enhancedPrompt;
        resultDiv.style.display = 'block';
        
        // Resize window when showing results
        window.resizeTo(550, 300);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        isLoading = false;
        enhanceButton.disabled = false;
        enhanceButton.textContent = 'Enhance Prompt';
      }
    });

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(resultContent.textContent);
        copyButton.textContent = 'Copied!';
        setTimeout(() => copyButton.textContent = 'Copy', 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    });
  </script>
</body>
</html>
`;

// Main page component
export default function CursagePage() {
  const [windowInstance, setWindowInstance] = useState(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        openCursageWindow();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const openCursageWindow = () => {
    if (windowInstance && !windowInstance.closed) {
      windowInstance.focus();
      return;
    }

    const width = 550;
    const height = 150;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const features = `
      width=${width},
      height=${height},
      left=${left},
      top=${top},
      resizable=yes,
      scrollbars=yes,
      status=no,
      menubar=no,
      toolbar=no,
      location=no
    `.replace(/\s+/g, "");

    // Create a new window and write the HTML content
    const newWindow = window.open("", "Cursage", features);
    newWindow.document.write(popupHTML);
    newWindow.document.close();
    setWindowInstance(newWindow);

    // Handle window close
    const checkWindow = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(checkWindow);
        setWindowInstance(null);
      }
    }, 1000);
  };

  // Main page UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cursage</h1>
          <p className="text-gray-500">
            Make your Cursor prompts clearer and more effective. Perfect for
            when you're not sure how to phrase your request.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Always Available
                </h3>
                <p className="mt-2 text-gray-500">
                  Just press{" "}
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">⌘</kbd>{" "}
                  +{" "}
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">⇧</kbd>{" "}
                  +{" "}
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">P</kbd>{" "}
                  whenever you need help phrasing your Cursor request.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Better Results
                </h3>
                <p className="mt-2 text-gray-500">
                  Get clearer responses from Cursor by letting us help structure
                  your prompts while keeping their original meaning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Try It Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Enhance Your Prompt
              </h2>
              <p className="text-sm text-gray-500">
                Not sure how to phrase it? Let's make your request crystal
                clear.
              </p>
            </div>
            <button
              onClick={openCursageWindow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Open Enhancer
            </button>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-gray-600">
                  Type your request naturally, and we'll help make it more
                  effective for Cursor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
