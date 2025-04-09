import React, { useState } from "react";

const PostDeconstruction = ({ posts, analysis }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  // Get the top performing posts based on score
  const topPosts = posts?.sort((a, b) => b.score - a.score).slice(0, 10) || [];

  return (
    <div className="mt-4 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-4">
        Post Pattern Deconstruction
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Top performing posts */}
        <div>
          <h4 className="text-lg text-gray-300 mb-3">Top Performing Posts</h4>
          <div className="space-y-3">
            {topPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedPost?.id === post.id
                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-500/50"
                    : "bg-gray-800/30 border-gray-700/50 hover:border-purple-500/30"
                }`}
              >
                <div className="text-sm text-gray-300">{post.title}</div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span>⬆️ {post.score.toLocaleString()} upvotes</span>
                  <span>💬 {post.numComments.toLocaleString()} comments</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Pattern breakdown */}
        <div>
          {selectedPost ? (
            <div className="space-y-4">
              <h4 className="text-lg text-gray-300 mb-3">Pattern Breakdown</h4>

              {/* Title Structure */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h5 className="text-sm font-medium text-purple-400 mb-2">
                  Title Structure
                </h5>
                <div className="text-gray-300">{selectedPost.title}</div>
              </div>

              {/* Key Elements */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h5 className="text-sm font-medium text-purple-400 mb-2">
                  Key Elements
                </h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    • Numbers/Statistics:{" "}
                    {selectedPost.title.match(/\d+/g)?.join(", ") || "None"}
                  </li>
                  <li>
                    • Keywords: {extractKeywords(selectedPost.title).join(", ")}
                  </li>
                  <li>
                    • Structure Type:{" "}
                    {determineStructureType(selectedPost.title)}
                  </li>
                </ul>
              </div>

              {/* Template Version */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h5 className="text-sm font-medium text-purple-400 mb-2">
                  Template Version
                </h5>
                <div className="text-gray-300">
                  {createTemplate(selectedPost.title)}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h5 className="text-sm font-medium text-purple-400 mb-2">
                  Performance Metrics
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Upvotes</div>
                    <div className="text-gray-300">
                      {selectedPost.score.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Comments</div>
                    <div className="text-gray-300">
                      {selectedPost.numComments.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Upvote Ratio</div>
                    <div className="text-gray-300">
                      {(selectedPost.upvoteRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Awards</div>
                    <div className="text-gray-300">
                      {selectedPost.totalAwardsReceived || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a post to see its pattern breakdown
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const extractKeywords = (title) => {
  // Remove common words and extract key terms
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ]);
  return title
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !commonWords.has(word))
    .slice(0, 5);
};

const determineStructureType = (title) => {
  if (title.match(/^(How|What|Why|When|Where)/i)) return "Question/How-to";
  if (title.match(/^\d/)) return "Number-led Statement";
  if (title.match(/^I\s|^My\s/i)) return "Personal Experience";
  if (title.match(/^The\s|^This\s/i)) return "Declarative Statement";
  return "General Statement";
};

const createTemplate = (title) => {
  return title
    .replace(/\d+/g, "[NUMBER]")
    .replace(/\$\d+(?:,\d+)*(?:\.\d+)?/g, "[AMOUNT]")
    .replace(
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,
      "[MONTH]"
    )
    .replace(/\b\d{4}\b/g, "[YEAR]")
    .replace(/\b(?:day|week|month|year)s?\b/gi, "[TIME_PERIOD]");
};

export default PostDeconstruction;
