import React from "react";

export default function PostContentAnalysis({ post }) {
  if (!post) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-4">
        Post Content Analysis
      </h3>

      {/* Post Overview */}
      <div className="mb-6">
        <h4 className="text-lg text-blue-400 mb-2">Overview</h4>
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
          <div className="text-white font-medium mb-2">{post.title}</div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>👤 u/{post.author}</span>
            <span>⬆️ {post.score.toLocaleString()} upvotes</span>
            <span>
              💬 {post.num_comments?.toLocaleString() || "0"} comments
            </span>
            <span>
              📅 {new Date(post.created_utc * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content Structure */}
      {post.selftext && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg text-blue-400 mb-2">Content Structure</h4>
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Length:</span>
                  <span className="text-white">
                    {post.selftext.length} characters
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Paragraphs:</span>
                  <span className="text-white">
                    {post.selftext.split("\n\n").filter((p) => p.trim()).length}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Links:</span>
                  <span className="text-white">
                    {
                      (post.selftext.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [])
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div>
            <h4 className="text-lg text-blue-400 mb-2">Content Breakdown</h4>
            <div className="space-y-4">
              {post.selftext
                .split("\n\n")
                .filter((p) => p.trim())
                .map((paragraph, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30"
                  >
                    <div className="text-sm text-purple-400 mb-1">
                      Section {index + 1}
                    </div>
                    <div className="text-white whitespace-pre-wrap">
                      {paragraph}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Writing Style */}
          <div>
            <h4 className="text-lg text-blue-400 mb-2">Writing Style</h4>
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Style:</span>
                  <span className="text-white">
                    {post.selftext.includes("?")
                      ? "Question/Discussion"
                      : "Statement/Information"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Tone:</span>
                  <span className="text-white">
                    {post.selftext.includes("!") ? "Enthusiastic" : "Neutral"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white">
                    {post.selftext.includes("#")
                      ? "Formatted with Headers"
                      : post.selftext.includes("*")
                      ? "Uses Emphasis"
                      : "Plain Text"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
