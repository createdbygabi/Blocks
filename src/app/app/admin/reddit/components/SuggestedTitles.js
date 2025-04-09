import { useState } from "react";

export default function SuggestedTitles({
  analysis,
  product,
  marketingTool,
  redditService,
}) {
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateTitles = async (e) => {
    if (e) e.stopPropagation();
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/reddit/generate-titles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${redditService.token}`,
        },
        body: JSON.stringify({
          analysis:
            typeof analysis === "string" ? analysis : analysis?.analysis || "",
          product,
          marketingTool,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Convert string response to array if needed
      const titlesArray =
        typeof data.titles === "string"
          ? data.titles.split("\n").filter((t) => t.trim())
          : data.titles;

      setGeneratedTitles(titlesArray);
    } catch (error) {
      console.error("Error generating titles:", error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Title Generator</h3>
      </div>

      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 mb-4">
        <div className="text-sm text-gray-300 mb-2">
          Generate titles based on:
        </div>
        <div className="space-y-1 text-sm text-gray-400">
          <p>• Product: {product || "Not specified"}</p>
          {marketingTool && <p>• Marketing Tool: {marketingTool}</p>}
          <p>• Analysis of top performing posts</p>
        </div>
      </div>

      <button
        onClick={handleGenerateTitles}
        disabled={isGenerating || !analysis || !product}
        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            Generating Titles...
          </span>
        ) : (
          "Generate New Titles"
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {generatedTitles.length > 0 && (
        <div className="mt-4 border border-gray-800 rounded-lg bg-black/20 divide-y divide-gray-800">
          {generatedTitles.map((title, index) => (
            <div
              key={index}
              className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors duration-150"
            >
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
