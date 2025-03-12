"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ZapPlay() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("audio/") && !file.type.includes("video/")) {
      setError("Please upload only audio or video files");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Get presigned URL
      const response = await fetch("/api/features/zapplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, fileUrl } = await response.json();

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Add to files list
      setFiles((prev) => [
        ...prev,
        {
          name: file.name,
          url: fileUrl,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">ZapPlay</h2>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
            hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 
            ${
              uploading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload File
              </>
            )}
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Files List */}
      <div className="space-y-4">
        {files.map((file, index) => (
          <motion.div
            key={file.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">{file.name}</h3>
              <span className="text-xs text-gray-400">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Direct Play Link */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={file.url}
                readOnly
                className="flex-1 px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-sm text-gray-300"
              />
              <button
                onClick={() => navigator.clipboard.writeText(file.url)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              </button>
            </div>

            {/* Preview */}
            <div className="rounded-lg overflow-hidden bg-black/30">
              {file.type.includes("audio/") ? (
                <audio controls className="w-full">
                  <source src={file.url} type={file.type} />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <video controls className="w-full">
                  <source src={file.url} type={file.type} />
                  Your browser does not support the video element.
                </video>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
