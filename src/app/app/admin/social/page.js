"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { SocialMarketingService } from "@/lib/services/socialMarketing";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import JSZip from "jszip";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

function VideoPreviewModal({ video, onClose, onApprove, showApproveButton }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8">
      <div className="relative w-full max-w-lg">
        <div className="absolute -top-12 right-0 flex items-center gap-4">
          {showApproveButton && (
            <button
              onClick={onApprove}
              className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-lg border border-emerald-500/20"
            >
              Approve Reel
            </button>
          )}
          <button onClick={onClose} className="text-white hover:text-gray-300">
            Close
          </button>
        </div>
        <video
          controls
          autoPlay
          className="w-full aspect-[9/16] rounded-lg shadow-2xl"
          poster={video.thumbnail}
        >
          <source src={video.url} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

function ContentCell({
  content,
  onGenerate,
  isLoading,
  onPreview,
  onPublish,
  date,
  businessId,
}) {
  // Content is approved and ready
  if (content?.status === "pending") {
    return (
      <div className="flex gap-0.5">
        <button
          onClick={() => onPreview(content.content.video)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg text-green-400 text-sm transition-all duration-300 border border-green-500/20"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Preview
        </button>
        <button
          onClick={() => onPublish(content.id)}
          title="Mark as Published"
          className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 text-blue-400 transition-all duration-300 border border-blue-500/20"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  // Content needs approval
  if (content?.status === "needs_approval") {
    return (
      <button
        onClick={() => onPreview(content.content.video)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 rounded-lg text-orange-400 text-sm transition-all duration-300 border border-orange-500/20"
      >
        <div className="w-2 h-2 rounded-full bg-orange-500" />
        Review
      </button>
    );
  }

  // Content is published
  if (content?.status === "published") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg text-blue-400 text-sm border border-blue-500/20">
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        Published
      </div>
    );
  }

  // No content, show generate button
  return (
    <button
      onClick={() => onGenerate(businessId, date)}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400/20 to-pink-400/20 hover:from-rose-400/30 hover:to-pink-400/30 rounded-lg text-rose-300 text-sm transition-all duration-300 border border-rose-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-2 h-2 rounded-full bg-rose-400" />
      Generate
    </button>
  );
}

function ReelIdsManager({ businessId, onSave }) {
  const [reelIds, setReelIds] = useState("");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset states when businessId changes
  useEffect(() => {
    setReelIds("");
    setCurrentQueue([]);
    setError(null);
  }, [businessId]);

  useEffect(() => {
    let isMounted = true;

    const fetchReelIds = async () => {
      if (!businessId) return;
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("reel_queue")
          .select("reel_ids")
          .eq("business_id", businessId)
          .single();

        if (!isMounted) return;

        if (error) throw error;
        if (data?.reel_ids) {
          setCurrentQueue(data.reel_ids);
          setReelIds(data.reel_ids.join(", "));
        } else {
          setCurrentQueue([]);
          setReelIds("");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching reel IDs:", err);
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReelIds();

    return () => {
      isMounted = false;
    };
  }, [businessId]);

  const handleSave = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError(null);

      // Parse the comma-separated string into an array of numbers
      const idsArray = reelIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      // Get the existing entry's ID from the initial fetch
      const { data: existingEntry } = await supabase
        .from("reel_queue")
        .select("id")
        .eq("business_id", businessId)
        .single();

      let result;
      if (existingEntry) {
        // Update existing entry
        result = await supabase
          .from("reel_queue")
          .update({
            reel_ids: idsArray,
            last_updated_at: new Date().toISOString(),
          })
          .eq("id", existingEntry.id);
      } else {
        // Create new entry
        result = await supabase.from("reel_queue").insert({
          business_id: businessId,
          reel_ids: idsArray,
          last_updated_at: new Date().toISOString(),
        });
      }

      if (result.error) throw result.error;
      setCurrentQueue(idsArray);
      onSave?.();
    } catch (err) {
      console.error("Error saving reel IDs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-900/30 to-violet-800/20 rounded-lg border border-indigo-700/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-indigo-300">Reel Queue</h3>
        {!loading && currentQueue.length > 0 && (
          <span className="text-sm text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
            {currentQueue.length} reels queued
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <div className="text-sm text-indigo-400">Loading queue...</div>
          </div>
        </div>
      ) : (
        <>
          {/* Current Queue Display */}
          {currentQueue.length > 0 && (
            <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-800/30">
              <div className="text-sm text-indigo-300 mb-2">Current Queue:</div>
              <div className="flex flex-wrap gap-2">
                {currentQueue.map((id, index) => (
                  <div
                    key={`${id}-${index}`}
                    className="px-2 py-1 bg-indigo-500/10 rounded-md text-sm text-indigo-400 border border-indigo-500/20"
                  >
                    #{id}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <textarea
                value={reelIds}
                onChange={(e) => setReelIds(e.target.value)}
                placeholder="Enter reel IDs separated by commas (e.g., 23, 46, 97)"
                className="w-full px-3 py-2 bg-indigo-900/30 border border-indigo-700/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 h-24 resize-none"
              />
              <div className="mt-1 text-xs text-indigo-400/70">
                Enter new reel IDs to update the queue
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 hover:from-indigo-500/30 hover:to-violet-500/30 text-indigo-400 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-indigo-500/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Update Queue"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GenerateContentSection({
  businesses,
  onGenerate,
  isLoading,
  pendingContent,
  needsApprovalContent,
  publishedContent,
  formatDate,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleGenerateForToday = async () => {
    if (selectedBusiness) {
      // Check if content already exists for today for this business
      const existingContent = [
        ...pendingContent,
        ...needsApprovalContent,
        ...publishedContent,
      ].find(
        (c) =>
          c.business_id === selectedBusiness &&
          formatDate(new Date(c.scheduled_for)) === today
      );

      if (!existingContent) {
        await onGenerate(selectedBusiness, today);
      }
    } else {
      // Handle all businesses sequentially
      for (const business of businesses) {
        // Check if content already exists for today for this business
        const existingContent = [
          ...pendingContent,
          ...needsApprovalContent,
          ...publishedContent,
        ].find(
          (c) =>
            c.business_id === business.id &&
            formatDate(new Date(c.scheduled_for)) === today
        );

        if (!existingContent) {
          await onGenerate(business.id, today);
        }
      }
    }
  };

  const handleGenerateForDate = () => {
    if (!selectedDate) return;
    if (selectedBusiness) {
      onGenerate(selectedBusiness, selectedDate);
    } else {
      businesses.forEach((business) => onGenerate(business.id, selectedDate));
    }
  };

  const handleDownloadAllMP4s = async (date) => {
    // Get all content for the selected date
    const contentForDate = [
      ...pendingContent,
      ...needsApprovalContent,
      ...publishedContent,
    ].filter((content) => formatDate(new Date(content.scheduled_for)) === date);

    if (contentForDate.length === 0) {
      alert("No videos found for this date!");
      return;
    }

    // Download videos one by one
    for (const content of contentForDate) {
      if (content.content?.video?.url) {
        try {
          // Create filename
          const fileName = `${content.businesses.name
            .toLowerCase()
            .replace(/\s+/g, "-")}-${date}-${Date.now()}.mp4`;

          // Create and trigger download directly from URL
          const link = document.createElement("a");
          link.href = content.content.video.url;
          link.download = fileName;
          link.target = "_blank"; // Open in new tab if direct download fails
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Small delay between downloads
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(
            `Failed to download video for ${content.businesses.name}:`,
            error
          );
          // If download fails, open in new tab as fallback
          window.open(content.content.video.url, "_blank");
        }
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 mb-8 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
      <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
        Generate Content
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Generate */}
        <div className="space-y-4 p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-700/30 backdrop-blur-sm">
          <h3 className="font-medium text-blue-300">Quick Generate</h3>
          <button
            onClick={handleGenerateForToday}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-blue-500/20"
          >
            Generate Today's Reels
          </button>
          <button
            onClick={() => handleDownloadAllMP4s(today)}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-400 rounded-lg transition-all duration-300 transform hover:scale-[1.02] border border-emerald-500/20 flex items-center justify-center gap-2"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Today's Reels
          </button>
        </div>

        {/* Generate for Date */}
        <div className="space-y-4 p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg border border-purple-700/30 backdrop-blur-sm">
          <h3 className="font-medium text-purple-300">Generate for Date</h3>
          <div className="space-y-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              min={today}
            />
            <button
              onClick={handleGenerateForDate}
              disabled={isLoading || !selectedDate}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-purple-500/20"
            >
              Generate for Selected Date
            </button>
          </div>
        </div>
      </div>

      {/* Business Filter and Reel Queue Manager */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full px-3 py-2 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            <option value="">All Businesses</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>
        {selectedBusiness && (
          <ReelIdsManager
            businessId={selectedBusiness}
            onSave={() => {
              // Optionally refresh data or show success message
            }}
          />
        )}
      </div>
    </div>
  );
}

function PendingApprovalsSection({
  pendingApprovals,
  onApprove,
  onRegenerate,
  onPreview,
  isLoading,
  formatDate,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pendingApprovals?.length) return null;

  const currentContent = pendingApprovals[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pendingApprovals.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + pendingApprovals.length) % pendingApprovals.length
    );
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, pendingApprovals.length]);

  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          Pending Approvals
        </h2>
        <div className="text-sm text-gray-400">
          {currentIndex + 1} of {pendingApprovals.length} reels
        </div>
      </div>

      <div className="relative">
        {/* Navigation Buttons - Moved closer to video */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-900/80 rounded-full text-white hover:bg-gray-800/80 transition-colors border border-gray-700/50"
          disabled={pendingApprovals.length <= 1}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-900/80 rounded-full text-white hover:bg-gray-800/80 transition-colors border border-gray-700/50"
          disabled={pendingApprovals.length <= 1}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Content Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-4 border border-blue-700/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-white flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-0.5">
                    <div className="w-full h-full rounded-[6px] bg-gray-900 flex items-center justify-center">
                      {currentContent.businesses.logo_url ? (
                        <Image
                          src={currentContent.businesses.logo_url}
                          alt={currentContent.businesses.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  {currentContent.businesses.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Scheduled for{" "}
                  {new Date(currentContent.scheduled_for).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() =>
                  onPreview(currentContent.content.video, currentContent)
                }
                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Video Preview - Centered */}
            <div className="flex flex-col items-center">
              <div className="relative w-[240px] aspect-[9/16] bg-black/20 rounded-lg overflow-hidden mb-4">
                <video
                  className="w-full h-full object-cover"
                  controls
                  src={currentContent?.content?.video?.url}
                  poster={currentContent?.content?.video?.thumbnail}
                />
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => onApprove(currentContent.id)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-400 text-sm rounded-lg transition-all duration-300 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    onRegenerate(
                      currentContent.business_id,
                      formatDate(new Date(currentContent.scheduled_for)),
                      currentContent.id
                    )
                  }
                  disabled={isLoading}
                  className="flex-1 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-400 text-sm rounded-lg transition-all duration-300 border border-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-1 mt-4">
          {pendingApprovals.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SocialMarketingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [pendingContent, setPendingContent] = useState([]);
  const [publishedContent, setPublishedContent] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [needsApprovalContent, setNeedsApprovalContent] = useState([]);

  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: businessesData } = await supabase
        .from("businesses")
        .select("id, name, logo_url")
        .order("name");

      const { data: contentData } = await supabase
        .from("social_content")
        .select("*, businesses(*)")
        .order("scheduled_for");

      setBusinesses(businessesData || []);
      setPendingContent(
        contentData?.filter((c) => c.status === "pending") || []
      );
      setNeedsApprovalContent(
        contentData?.filter((c) => c.status === "needs_approval") || []
      );
      setPublishedContent(
        contentData?.filter((c) => c.status === "published") || []
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async (
    businessId,
    date,
    existingContentId = null
  ) => {
    try {
      setIsGenerating(true);

      // Get business data
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("target_audience, name")
        .eq("id", businessId)
        .single();

      if (businessError) throw businessError;

      // Get queue data (but won't update it)
      const { data: queueData, error: queueError } = await supabase
        .from("reel_queue")
        .select("reel_ids")
        .eq("business_id", businessId)
        .single();

      if (queueError) throw queueError;

      if (!queueData?.reel_ids?.length) {
        throw new Error("No reel IDs in queue for this business");
      }

      // Get the first reel ID from the queue
      const formatId = queueData.reel_ids[0];

      const requestBody = {
        format_id: formatId.toString(),
        niche: businessData.target_audience || "Software engineers",
        product: businessData.name || "test",
        test_mode: true,
      };

      // Call the reel generation API
      const response = await fetch("http://127.0.0.1:8000/api/reel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ""
          }`
        );
      }

      const data = await response.json();

      // If successful, update or create entry in social_content table
      if (data.url) {
        // Add timestamp to video URL to prevent caching
        const videoUrl = new URL(data.url);
        videoUrl.searchParams.set("t", Date.now());

        const contentData = {
          business_id: businessId,
          scheduled_for: new Date(date + "T12:00:00Z").toISOString(),
          status: "needs_approval",
          content_type: "reel",
          content: {
            video: {
              url: videoUrl.toString(),
              thumbnail: null,
            },
          },
        };

        let error;

        if (existingContentId) {
          // Update existing entry
          const { error: updateError } = await supabase
            .from("social_content")
            .update(contentData)
            .eq("id", existingContentId);
          error = updateError;
        } else {
          // Create new entry
          const { error: insertError } = await supabase
            .from("social_content")
            .insert(contentData);
          error = insertError;
        }

        if (error) throw error;
      }

      await fetchData(); // Refresh the data
    } catch (error) {
      console.error("Failed to generate content:", error);
      setError(
        typeof error === "string"
          ? error
          : error.message || "Failed to generate content"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveContent = async (contentId) => {
    try {
      setIsGenerating(true);
      const { data, error } = await supabase
        .from("social_content")
        .update({ status: "pending" })
        .eq("id", contentId);

      if (error) throw error;

      await fetchData(); // Refresh the data
      setPreviewVideo(null); // Close the preview modal
    } catch (error) {
      console.error("Failed to approve content:", error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishContent = async (contentId) => {
    try {
      setIsGenerating(true);

      // Get the content before updating
      const { data: content } = await supabase
        .from("social_content")
        .select("*")
        .eq("id", contentId)
        .single();

      if (!content) throw new Error("Content not found");

      // Delete the video from S3
      if (content.content?.video?.url) {
        console.log(
          "🔄 Attempting to delete video from S3:",
          content.content.video.url
        );
        try {
          const response = await fetch("/api/social/delete-video", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoUrl: content.content.video.url,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error("❌ Failed to delete video from S3:", result.error);
            throw new Error("Failed to delete video from S3");
          }

          console.log(
            "✅ Successfully deleted video from S3:",
            content.content.video.url
          );
        } catch (error) {
          console.error("❌ Error deleting video:", error);
          // Continue with publishing even if deletion fails
        }
      }

      // Update the content status
      const { error } = await supabase
        .from("social_content")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      if (error) throw error;

      await fetchData(); // Refresh the data
    } catch (error) {
      console.error("Failed to mark content as published:", error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewVideo = (video, content) => {
    setPreviewVideo({
      ...video,
      contentId: content?.id,
      needsApproval: content?.status === "needs_approval",
    });
  };

  // Generate next 7 days
  const next7Days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
      }),
    []
  );

  const formatDate = (date) => date.toISOString().split("T")[0];

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => null,
        cell: (info) => (
          <div className="font-medium text-white flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-0.5">
              <div className="w-full h-full rounded-[6px] bg-gray-900 flex items-center justify-center">
                {info.row.original.logo_url ? (
                  <Image
                    src={info.row.original.logo_url}
                    alt={info.getValue()}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
            </div>
            {info.getValue()}
          </div>
        ),
      }),
      ...next7Days.map((date) =>
        columnHelper.accessor(formatDate(date), {
          header: () => (
            <div className="text-center">
              <div className="font-medium">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-sm text-gray-400">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ),
          cell: (info) => {
            const business = info.row.original;
            const content = [
              ...pendingContent,
              ...needsApprovalContent,
              ...publishedContent,
            ].find(
              (c) =>
                c.business_id === business.id &&
                formatDate(new Date(c.scheduled_for)) === formatDate(date)
            );

            return (
              <div
                className={`text-center p-0.5 rounded-lg ${
                  content?.status === "published"
                    ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20"
                    : content?.status === "pending"
                    ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                    : content?.status === "needs_approval"
                    ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20"
                    : "bg-gradient-to-r from-rose-400/10 to-pink-400/10 border border-rose-400/20"
                }`}
              >
                <ContentCell
                  content={content}
                  onGenerate={handleGenerateContent}
                  onPublish={handlePublishContent}
                  isLoading={isGenerating}
                  onPreview={handlePreviewVideo}
                  date={formatDate(date)}
                  businessId={business.id}
                />
              </div>
            );
          },
        })
      ),
    ],
    [
      next7Days,
      pendingContent,
      needsApprovalContent,
      publishedContent,
      isGenerating,
    ]
  );

  const table = useReactTable({
    data: businesses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black text-white p-8">
      <div className="max-w-[95%] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-[10px] bg-gray-900 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Content Schedule
              </h1>
              <p className="text-gray-400 mt-2">
                Manage and generate Instagram reels for your SaaS businesses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-green-400">Ready to Post</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-orange-400">Needs Approval</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-blue-400">Published</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-400/10 to-pink-400/10 border border-rose-400/20">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <span className="text-sm text-rose-300">Needs Content</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-lg text-red-400 backdrop-blur-sm">
            {error}
          </div>
        )}

        <GenerateContentSection
          businesses={businesses}
          onGenerate={handleGenerateContent}
          isLoading={isGenerating}
          pendingContent={pendingContent}
          needsApprovalContent={needsApprovalContent}
          publishedContent={publishedContent}
          formatDate={formatDate}
        />

        {/* Table */}
        <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-gradient-to-r from-gray-900/90 to-gray-800/90"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-4 font-medium border-b border-gray-700/50 first:w-[200px] first:text-left"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-800/30 last:border-0 hover:bg-gray-800/20 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-1">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <PendingApprovalsSection
          pendingApprovals={needsApprovalContent}
          onApprove={handleApproveContent}
          onRegenerate={handleGenerateContent}
          onPreview={handlePreviewVideo}
          isLoading={isGenerating}
          formatDate={formatDate}
        />

        <VideoPreviewModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
          onApprove={() =>
            previewVideo?.contentId &&
            handleApproveContent(previewVideo.contentId)
          }
          showApproveButton={previewVideo?.needsApproval}
        />
      </div>
    </div>
  );
}
