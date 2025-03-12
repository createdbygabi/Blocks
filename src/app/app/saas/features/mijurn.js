"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Reorganized categories by importance for Midjourney
const PROMPT_CATEGORIES = {
  style: [
    "digital art",
    "photographic",
    "oil painting",
    "cinematic",
    "anime",
    "3D render",
    "concept art",
    "illustration",
    "watercolor",
    "pixel art",
    "comic art",
    "abstract",
    "minimalist",
    "surrealist",
    "hyperrealistic",
    "impressionist",
    "fantasy art",
    "sci-fi art",
    "steampunk",
    "cyberpunk",
    "gothic",
    "art nouveau",
    "pop art",
    "ukiyo-e",
    "graffiti",
    "low poly",
    "isometric",
    "vaporwave",
  ],
  quality: [
    "highly detailed",
    "8k",
    "4k",
    "masterpiece",
    "award winning",
    "professional",
    "ultra realistic",
    "intricate details",
    "sharp focus",
    "studio quality",
    "high resolution",
    "high definition",
    "high fidelity",
    "octane render",
    "unreal engine",
    "ray tracing",
    "photorealistic",
    "trending on artstation",
    "featured on pixiv",
    "professional photography",
  ],
  lighting: [
    "golden hour",
    "studio lighting",
    "volumetric lighting",
    "dramatic lighting",
    "neon lights",
    "soft lighting",
    "backlit",
    "rim lighting",
    "natural light",
    "sunlight",
    "moonlight",
    "candlelight",
    "bioluminescent",
    "ambient lighting",
    "cinematic lighting",
    "chiaroscuro",
    "ray tracing",
    "subsurface scattering",
    "global illumination",
    "god rays",
    "lens flare",
  ],
  camera: [
    "wide shot",
    "close-up",
    "macro",
    "aerial view",
    "portrait",
    "ultra wide lens",
    "telephoto lens",
    "fisheye lens",
    "dutch angle",
    "birds eye view",
    "worms eye view",
    "panoramic",
    "isometric view",
    "tilt shift",
    "bokeh",
    "depth of field",
    "motion blur",
    "long exposure",
    "time lapse",
    "drone shot",
  ],
  mood: [
    "atmospheric",
    "ethereal",
    "epic",
    "moody",
    "peaceful",
    "dark",
    "vibrant",
    "mysterious",
    "whimsical",
    "dreamy",
    "melancholic",
    "nostalgic",
    "energetic",
    "serene",
    "dramatic",
    "romantic",
    "dystopian",
    "utopian",
    "horror",
    "fantasy",
  ],
  color: [
    "vibrant colors",
    "muted colors",
    "pastel colors",
    "monochromatic",
    "duotone",
    "technicolor",
    "iridescent",
    "neon colors",
    "earth tones",
    "vintage colors",
    "sepia",
    "black and white",
    "high contrast",
    "low contrast",
    "color grading",
    "color harmony",
  ],
  time: [
    "sunrise",
    "sunset",
    "golden hour",
    "blue hour",
    "morning",
    "afternoon",
    "evening",
    "night",
    "midnight",
    "dawn",
    "dusk",
    "twilight",
    "overcast",
    "stormy",
    "foggy",
  ],
  artist: [
    "by Greg Rutkowski",
    "by James Gurney",
    "by Alphonse Mucha",
    "by Thomas Kinkade",
    "by Artgerm",
    "by Ross Tran",
    "by Hayao Miyazaki",
    "by Vincent van Gogh",
    "by Claude Monet",
    "by Salvador Dali",
    "by HR Giger",
    "by John Singer Sargent",
    "by Yoshitaka Amano",
    "by Junji Ito",
    "by Syd Mead",
    "by Ivan Aivazovsky",
    "by Alberto Mielgo",
    "by Moebius",
    "by Zdzisław Beksiński",
    "by Simon Stålenhag",
  ],
  medium: [
    "oil on canvas",
    "acrylic paint",
    "watercolor",
    "digital painting",
    "pencil drawing",
    "ink drawing",
    "charcoal",
    "pastel",
    "gouache",
    "mixed media",
    "collage",
    "sculpture",
    "3D model",
    "photograph",
    "film",
  ],
  environment: [
    "indoor",
    "outdoor",
    "underwater",
    "space",
    "urban",
    "rural",
    "fantasy realm",
    "sci-fi setting",
    "post-apocalyptic",
    "medieval",
    "futuristic",
    "cyberpunk city",
    "steampunk world",
    "ethereal dimension",
    "parallel universe",
  ],
};

export default function Mijurn({ user, styles }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("style");
  const [selectedParams, setSelectedParams] = useState({});

  const handleParamToggle = (category, param) => {
    setSelectedParams((prev) => {
      const current = prev[category] || [];
      // Limit selections per category
      const maxSelections = {
        style: 2, // Allow combining styles (e.g., "cyberpunk, digital art")
        quality: 3, // Allow multiple quality parameters
        lighting: 2, // Allow main + secondary lighting
        camera: 1, // One camera angle/style
        mood: 2, // Allow mood combinations
        color: 2, // Allow color scheme combinations
        time: 1, // One time of day
        environment: 1, // One environment type
        medium: 1, // One medium type
        artist: 1, // One artist style
      };

      const updated = current.includes(param)
        ? current.filter((p) => p !== param)
        : current.length < (maxSelections[category] || 1)
        ? [...current, param]
        : [param]; // Replace existing selection if at max

      return {
        ...prev,
        [category]: updated,
      };
    });
  };

  const buildEnhancedPrompt = () => {
    // Order parameters by importance for Midjourney
    const paramOrder = [
      "style",
      "quality",
      "lighting",
      "camera",
      "mood",
      "color",
      "time",
      "environment",
      "medium",
      "artist",
    ];

    // Start with the user's core concept
    let enhancedPrompt = prompt.trim();
    let addedParams = [];

    // Add only the selected parameters in order
    paramOrder.forEach((category) => {
      const params = selectedParams[category] || [];
      if (params.length > 0) {
        addedParams.push(params.join(", "));
      }
    });

    // Combine with commas
    if (addedParams.length > 0) {
      enhancedPrompt += `, ${addedParams.join(", ")}`;
    }

    return enhancedPrompt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/features/mijurn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildEnhancedPrompt() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className={`text-lg font-medium ${styles.text.secondary} mb-2`}>
            Please log in
          </h3>
          <p className={styles.text.tertiary}>
            You need to be logged in to use this feature
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className={`${styles.text.secondary}`}>
          Transform your basic prompts into powerful Midjourney instructions
        </p>
      </div>

      {/* Input Form First */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Your Core Concept
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your main idea (e.g., 'a magical forest with ancient trees and glowing mushrooms')"
            className="w-full h-32 p-4 rounded-xl border border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Start with a clear description of what you want to create. The more
            specific you are, the better the results will be.
          </p>
        </div>
      </form>

      {/* Parameter Categories */}
      <div className="mb-6">
        <h3 className={`text-sm font-medium ${styles.text.primary} mb-4`}>
          Enhance your prompt with these parameters:
        </h3>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {Object.keys(PROMPT_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium ${
                selectedCategory === category
                  ? `${styles.button.primary} shadow-lg`
                  : `${styles.button.secondary} hover:opacity-80`
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {PROMPT_CATEGORIES[selectedCategory].map((param) => (
            <button
              key={param}
              onClick={() => handleParamToggle(selectedCategory, param)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedParams[selectedCategory]?.includes(param)
                  ? `${styles.button.primary} shadow-md transform scale-105`
                  : `bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50`
              }`}
            >
              {param}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Parameters Preview */}
      {Object.keys(selectedParams).length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
          <h3 className={`text-sm font-medium ${styles.text.secondary} mb-2`}>
            Selected Parameters:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedParams).map(([category, params]) =>
              params.map((param) => (
                <span
                  key={`${category}-${param}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 border border-gray-200"
                >
                  <span className="font-medium text-gray-500">{category}:</span>{" "}
                  {param}
                  <button
                    onClick={() => handleParamToggle(category, param)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Preview:{" "}
            <code className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 block mt-2 whitespace-pre-wrap">
              {buildEnhancedPrompt()}
            </code>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
        className={`${styles.button.primary} w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-8`}
      >
        {loading ? (
          <>
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Enhancing your prompt...
          </>
        ) : (
          "Enhance Prompt"
        )}
      </button>

      {error && (
        <div
          className={`mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600`}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className={`p-6 rounded-xl ${styles.utils.highlight}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-medium ${styles.text.primary}`}>
                Enhanced Prompt
              </h3>
              <button
                onClick={() => copyToClipboard(result.enhancedPrompt)}
                className={`${styles.button.secondary} px-3 py-1 text-sm rounded-lg`}
              >
                Copy
              </button>
            </div>
            <p
              className={`${styles.text.secondary} font-mono text-sm break-words`}
            >
              {result.enhancedPrompt}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className={`font-medium ${styles.text.primary}`}>
              Alternative Versions
            </h3>
            {result.variations.map((variation, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${styles.utils.highlight} flex items-center justify-between`}
              >
                <p
                  className={`${styles.text.secondary} font-mono text-sm flex-1 mr-4`}
                >
                  {variation}
                </p>
                <button
                  onClick={() => copyToClipboard(variation)}
                  className={`${styles.button.secondary} px-3 py-1 text-sm rounded-lg shrink-0`}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>

          <div className={`text-xs ${styles.text.tertiary} mt-4`}>
            Tokens used:{" "}
            {result.tokens.promptTokens + result.tokens.variationTokens}
          </div>
        </div>
      )}
    </div>
  );
}
