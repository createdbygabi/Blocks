"use client";

import { useState } from "react";
import { Card } from "@/app/app/components/ui/FormElements";

export default function FormatTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    const formData = {
      format_id: e.target.format.value,
      niche: e.target.niche.value,
      product: e.target.product.value,
      test_mode: e.target.testMode.checked,
    };

    console.log("Sending request with data:", formData);

    try {
      const response = await fetch(
        "http://104.248.193.34:10000/api/reel/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.detail || data.message || "API request failed");
      }

      if (data.status === "success" && data.url) {
        setVideoUrl(data.url);
      } else {
        setError(data.message || "Failed to generate video");
      }
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <input
              type="number"
              name="format"
              placeholder="Format ID"
              className="w-full bg-black/20 border border-gray-600 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="niche"
              placeholder="Niche"
              className="w-full bg-black/20 border border-gray-600 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <textarea
              name="product"
              placeholder="Product description"
              className="w-full bg-black/20 border border-gray-600 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="testMode" />
              <span>Test Mode</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </form>
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      {videoUrl && (
        <div className="mt-4">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Generated Video</h3>
              <video
                controls
                className="w-full rounded bg-black/20"
                playsInline
                preload="metadata"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-purple-400 hover:text-purple-300 text-sm inline-block"
              >
                Open video in new tab
              </a>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
