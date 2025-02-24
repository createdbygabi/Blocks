"use client";

import { useState, useEffect } from "react";
import {
  getUserReels,
  createReel,
  scheduleReel,
  updateReelVideo,
} from "@/lib/reelsDb";
import { getUserBusiness } from "@/lib/db";
import { useUser } from "@/hooks/useUser";
import { Input, Button, Card } from "../components/ui/FormElements";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import { supabase } from "@/lib/supabase";
import {
  IoAdd,
  IoVideocam,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoSparkles,
  IoFilm,
  IoGrid,
  IoInformation,
  IoClose,
} from "react-icons/io5";
import { FiX, FiCheck, FiEdit3, FiRefreshCw } from "react-icons/fi";

// Refined ReelCard component with better visuals
const ReelCard = ({
  reel,
  isGenerating,
  isEditing,
  editedContent,
  onModifyText,
  onRegenerate,
  onSaveModifications,
  setEditedContent,
  setIsEditing,
}) => {
  const statusConfig = {
    generating: {
      icon: IoTimeOutline,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      text: "Generating...",
    },
    completed: {
      icon: IoCheckmarkCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      text: "Ready",
    },
    failed: {
      icon: IoCloseCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      text: "Failed",
    },
  };

  const StatusIcon = statusConfig[reel.generation_status]?.icon;

  return (
    <div className="group relative">
      {/* Main Card */}
      <div className="aspect-[9/16] bg-gray-900/50 rounded-2xl overflow-hidden hover:ring-2 ring-blue-500/50 transition-all duration-300 backdrop-blur-sm">
        {/* Video or Generation Content */}
        {reel.generation_status === "generating" || isGenerating ? (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-gray-900/50 animate-pulse">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] animate-[ping_3s_ease-in-out_infinite]" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                <IoSparkles className="absolute inset-0 w-16 h-16 text-blue-400 animate-pulse" />
              </div>
              <div className="text-center mt-4">
                <div className="text-sm font-medium text-gray-300">
                  Generating Reel
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  This may take a moment...
                </div>
              </div>
            </div>
          </div>
        ) : reel.generation_status === "completed" && reel.video_url ? (
          <video
            className="w-full h-full object-cover rounded-2xl"
            src={reel.video_url}
            controls
            playsInline
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-500/10">
            <IoCloseCircle className="w-12 h-12 text-red-400" />
            <p className="text-sm text-red-400">Generation failed</p>
          </div>
        )}
      </div>

      {/* Info Below Card */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              Format #{reel.format_number}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{reel.niche}</span>
          </div>
          <span
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              statusConfig[reel.generation_status].bgColor
            } ${statusConfig[reel.generation_status].color}`}
          >
            {StatusIcon && <StatusIcon className="w-3 h-3" />}
            {statusConfig[reel.generation_status].text}
          </span>
        </div>

        {/* Action Buttons */}
        {reel.generation_status === "completed" && (
          <div className="flex gap-2">
            <button
              onClick={() => onModifyText(reel.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium text-white"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              Modify Text
            </button>
            <button
              onClick={() => onRegenerate(reel.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium text-white"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Text Modification Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-gray-900/95 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Modify Text</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-full hover:bg-white/10"
            >
              <FiX className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`slot${i + 1}`} className="space-y-1">
                <label className="text-xs text-gray-400">Slot {i + 1}</label>
                <textarea
                  value={editedContent[`slot${i + 1}`] || ""}
                  onChange={(e) =>
                    setEditedContent((prev) => ({
                      ...prev,
                      [`slot${i + 1}`]: e.target.value,
                    }))
                  }
                  placeholder={`Enter text for slot ${i + 1}`}
                  className="w-full h-20 px-3 py-2 text-sm bg-black/50 border border-white/10 rounded-lg focus:ring-2 ring-blue-500/50 outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onSaveModifications(reel.id, editedContent)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-sm font-medium text-white"
            >
              <FiCheck className="w-4 h-4" />
              Save & Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateReelModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  business,
  format_number,
  niche,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg mx-4">
        <div className="relative bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-white">
                Create New Reel
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <IoClose className="w-5 h-5 text-[#a1a1aa]" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IoFilm className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-[#a1a1aa]">
                      Format
                    </span>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-[#27272a] text-white">
                    #{format_number}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IoSparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-[#a1a1aa]">
                      Niche
                    </span>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-[#27272a] text-white">
                    {business?.niche || "Not set"}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSubmit(e);
                  onClose();
                }}
                disabled={loading || !business?.niche}
                className={`
                  w-full px-4 py-3 rounded-lg font-medium
                  flex items-center justify-center gap-2 text-sm
                  transition-all duration-200
                  ${
                    loading || !business?.niche
                      ? "bg-[#27272a] text-[#71717a] cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }
                `}
              >
                {loading ? (
                  <>
                    <IoTimeOutline className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IoSparkles className="w-4 h-4" />
                    Generate Reel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InstagramContent() {
  const { user } = useUser();
  const [reels, setReels] = useState([]);
  const [business, setBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [generatingReel, setGeneratingReel] = useState(null);
  const [editingReel, setEditingReel] = useState(null);
  const [editedContent, setEditedContent] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [format_number, setFormatNumber] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);

  async function loadInitialData() {
    try {
      const [reelsData, businessData] = await Promise.all([
        getUserReels(user.id),
        getUserBusiness(user.id),
      ]);
      setReels(reelsData);
      setBusiness(businessData);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    }
  }

  async function handleCreateReel(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const format_number = formData.get("format_number");

    if (!business?.niche) {
      setMessage({
        type: "error",
        text: "Please set your business niche in settings first",
      });
      return;
    }

    setLoading(true);
    let createdReel = null;

    try {
      // First create the reel in database
      createdReel = await createReel(user.id, {
        format_number: parseInt(format_number),
        niche: business.niche,
        business_id: business.id,
        generation_status: "generating",
      });

      // Immediately update the UI with the new reel
      setReels((prevReels) => [createdReel, ...prevReels]);
      setGeneratingReel(createdReel);
      e.target.reset();

      // Then start the generation process
      console.log("Calling reel generation API...");
      const response = await fetch("http://localhost:8000/api/reel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format_id: format_number,
          niche: business.niche,
          product: "test_product",
          test_mode: true,
        }),
      });

      const data = await response.json();
      if (data.status !== "success" || !data.url) {
        throw new Error(data.message || "Failed to generate reel video");
      }

      // Update the reel with the video URL
      const updatedReel = await updateReelVideo(createdReel.id, {
        video_url: data.url,
        generation_status: "completed",
        updated_at: new Date().toISOString(),
      });

      // Update the reels list with the completed reel
      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel.id === createdReel.id ? updatedReel : reel
        )
      );

      setMessage({ type: "success", text: "Reel created successfully!" });
    } catch (error) {
      console.error("Failed to create reel:", error);

      if (createdReel) {
        // Update the reel status to failed if we have a database entry
        const failedReel = await updateReelVideo(createdReel.id, {
          generation_status: "failed",
          error_message: error.message, // Assuming we have this column in our database
          updated_at: new Date().toISOString(),
        });

        // Update the UI to show the failed status
        setReels((prevReels) =>
          prevReels.map((reel) =>
            reel.id === createdReel.id ? failedReel : reel
          )
        );
      }

      setMessage({
        type: "error",
        text: "Failed to generate reel. Please try again later.",
      });
    } finally {
      setLoading(false);
      setGeneratingReel(null);
    }
  }

  const regenerateReel = async (reel, customContent = null) => {
    try {
      // Update reel status to generating
      const updatingReel = await updateReelVideo(reel.id, {
        status: "generating",
        generation_status: "generating",
      });

      setReels((prevReels) =>
        prevReels.map((r) => (r.id === reel.id ? updatingReel : r))
      );

      // Call the FastAPI endpoint directly with test_mode always true
      const response = await fetch("http://localhost:8000/api/reel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format_id: reel.format_number.toString(),
          niche: reel.niche,
          product: "test_product",
          test_mode: true,
        }),
      });

      const data = await response.json();

      if (data.status !== "success" || !data.url) {
        throw new Error("Failed to generate reel video");
      }

      // Update the reel with the new video URL and content
      const updatedReel = await updateReelVideo(reel.id, {
        video_url: data.url, // Make sure this matches the column name in your database
        content: customContent,
        generation_status: "completed",
        updated_at: new Date().toISOString(), // Ensure the updated_at is set
      });

      // Log for debugging
      console.log("New video URL:", data.url);
      console.log("Updated reel:", updatedReel);

      setReels((prevReels) =>
        prevReels.map((r) =>
          r.id === reel.id
            ? {
                ...r,
                video_url: data.url, // Explicitly set the video_url in the UI state
                content: customContent,
                generation_status: "completed",
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );

      setMessage({
        type: "success",
        text: customContent
          ? "Reel updated successfully!"
          : "Reel regenerated successfully!",
      });
    } catch (error) {
      console.error("Failed to regenerate reel:", error);

      // Update the reel status to failed
      const failedReel = await updateReelVideo(reel.id, {
        generation_status: "failed",
        updated_at: new Date().toISOString(),
      });

      setReels((prevReels) =>
        prevReels.map((r) => (r.id === reel.id ? failedReel : r))
      );

      setMessage({ type: "error", text: error.message });
    }
  };

  const handleModifyText = (reelId) => {
    const reel = reels.find((r) => r.id === reelId);
    setEditingReel(reelId);
    // Initialize with existing content or empty object
    setEditedContent(reel.content || {});
    setIsEditing(true);
  };

  const handleRegenerate = async (reelId) => {
    const reel = reels.find((r) => r.id === reelId);
    await regenerateReel(reel);
  };

  const handleSaveModifications = async (reelId, newContent) => {
    const reel = reels.find((r) => r.id === reelId);
    await regenerateReel(reel, newContent);
    setEditingReel(null);
    setEditedContent({});
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background with on-brand gradients */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,16,20,0.5),rgba(9,9,11,0.5))]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />
      </div>
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

      <div className="relative container mx-auto px-6 py-12 max-w-[1400px]">
        {/* Header section */}
        <div className="flex flex-col gap-10 mb-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[2.5rem] font-semibold tracking-[-0.02em] bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                Content Library
              </h1>
              <p className="mt-2 text-[#a1a1aa] text-lg">
                Create and manage your AI-powered content
              </p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: "Total Reels", value: reels.length, icon: IoVideocam },
              {
                label: "In Progress",
                value: reels.filter((r) => r.generation_status === "generating")
                  .length,
                icon: IoSparkles,
              },
              {
                label: "Published",
                value: reels.filter((r) => r.generation_status === "completed")
                  .length,
                icon: IoCheckmarkCircle,
              },
            ].map((stat, i) => (
              <div key={i} className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <stat.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-[#a1a1aa] font-medium">
                      {stat.label}
                    </span>
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-white tracking-[-0.02em]">
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* New Reel Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative aspect-[9/16]"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute inset-0 rounded-2xl bg-[#18181b] border border-[#27272a] group-hover:border-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative h-full flex flex-col items-center justify-center p-6 gap-6">
                <div className="p-4 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors duration-300">
                  <IoAdd className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Create New Reel
                  </h3>
                  <p className="text-[#a1a1aa] text-sm">
                    Format #{format_number}
                  </p>
                  <p className="text-[#a1a1aa] text-sm mt-1">
                    {business?.niche || "Set niche in settings"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Existing Reels */}
          {reels.map((reel) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl" />
              <div className="relative rounded-2xl bg-[#18181b] border border-[#27272a] group-hover:border-[#3f3f46] overflow-hidden transition-all duration-300">
                <ReelCard
                  reel={reel}
                  isGenerating={generatingReel?.id === reel.id}
                  isEditing={editingReel === reel.id}
                  editedContent={editedContent}
                  onModifyText={handleModifyText}
                  onRegenerate={handleRegenerate}
                  onSaveModifications={handleSaveModifications}
                  setEditedContent={setEditedContent}
                  setIsEditing={setIsEditing}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simplified Modal with format and niche pre-filled */}
        <CreateReelModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateReel}
          loading={loading}
          business={business}
          format_number={format_number}
          niche={business?.niche}
        />
      </div>
    </div>
  );
}
