import React, { useState } from "react";
import PatternAnalysis from "./PatternAnalysis";
import PostDeconstruction from "./PostDeconstruction";
import PostContentAnalysis from "./PostContentAnalysis";
import SuggestedTitles from "./SuggestedTitles";

function PostCard({ post, isReferenced, referenceContext }) {
  const postUrl = `https://reddit.com${post.permalink}`;

  return (
    <div
      className={`bg-gradient-to-br ${
        isReferenced
          ? "from-blue-900/50 via-blue-800/30 to-blue-900/50 border-blue-500/50"
          : "from-gray-900/50 via-gray-800/30 to-gray-900/50 border-gray-700/50"
      } rounded-xl p-6 backdrop-blur-sm border shadow-2xl`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
              {post.title}
            </h3>
          </a>
          {isReferenced && (
            <div className="mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">{referenceContext}</p>
            </div>
          )}
          {post.selftext && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {post.selftext}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <a
              href={`https://reddit.com/user/${post.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors duration-200"
            >
              👤 u/{post.author}
            </a>
            <span>⬆️ {post.score.toLocaleString()} upvotes</span>
            <span>
              💬 {post.num_comments?.toLocaleString() || "0"} comments
            </span>
            <span>
              📅 {new Date(post.created_utc * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/20"
        >
          View
        </a>
      </div>
    </div>
  );
}

const CompactPostList = ({ posts, title, analysisResults }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-white">
          {title} ({posts.length} posts)
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-4">
          <div className="space-y-2">
            {posts.map((post) => {
              const isReferenced = analysisResults?.patterns?.some((pattern) =>
                pattern.examples?.some(
                  (example) =>
                    example.postId === post.id || example.postId === post.name
                )
              );

              const referencePattern = analysisResults?.patterns?.find(
                (pattern) =>
                  pattern.examples?.some(
                    (example) =>
                      example.postId === post.id || example.postId === post.name
                  )
              );

              return (
                <div
                  key={post.name || post.id}
                  className={`p-3 rounded ${
                    isReferenced
                      ? "bg-blue-900/20 border border-blue-500/30"
                      : "bg-gray-800/20 border border-gray-700/30"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <a
                        href={`https://reddit.com${post.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <h5 className="text-white group-hover:text-blue-400 transition-colors duration-200 mb-1">
                          {post.title}
                        </h5>
                      </a>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <a
                          href={`https://reddit.com/user/${post.author}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors duration-200"
                        >
                          u/{post.author}
                        </a>
                        <span>⬆️ {post.score.toLocaleString()}</span>
                        <span>
                          💬 {post.num_comments?.toLocaleString() || "0"}
                        </span>
                        <span>
                          📅{" "}
                          {new Date(
                            post.created_utc * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {isReferenced && referencePattern && (
                        <div className="mt-2 text-sm text-blue-400">
                          Pattern: {referencePattern.pattern}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setSelectedPost(selectedPost === post ? null : post)
                      }
                      className={`px-3 py-1.5 rounded text-sm transition-all duration-200 ${
                        selectedPost === post
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-gray-800/30 text-gray-400 border border-gray-700/30 hover:text-purple-400 hover:border-purple-500/30"
                      }`}
                    >
                      {selectedPost === post
                        ? "Hide Analysis"
                        : "Analyze Content"}
                    </button>
                  </div>
                  {selectedPost === post && (
                    <div className="mt-4">
                      <PostContentAnalysis post={post} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to split posts into groups for analysis
function splitPostsIntoGroups(posts, limit) {
  if (!posts || posts.length === 0) return [];

  // Sort posts by score in descending order
  const sortedPosts = [...posts].sort((a, b) => b.score - a.score);

  // Take only the top posts up to the limit
  const topPosts = sortedPosts.slice(0, limit);

  // Split into groups of 5 for better analysis
  const groups = [];
  for (let i = 0; i < topPosts.length; i += 5) {
    groups.push(topPosts.slice(i, i + 5));
  }

  return groups;
}

const SubredditFullView = ({
  subreddit,
  onBack,
  analyzingSubreddit,
  handleAnalyzeSubreddit,
  analysisResults,
  analyzedPosts,
  postLimits,
  setPostLimits,
  postStats,
  business,
  marketingTool = "",
  redditService = null,
}) => {
  const [showDeconstruction, setShowDeconstruction] = useState(false);
  const [showContentAnalysis, setShowContentAnalysis] = useState(true);
  const [showTitleGenerator, setShowTitleGenerator] = useState(true);

  console.log("SubredditFullView - Props:", {
    subreddit,
    analyzingSubreddit,
    analysisResults: analysisResults[subreddit.name],
    analyzedPosts: analyzedPosts[subreddit.name],
    postLimits,
    postStats: postStats[subreddit.name],
  });

  const splitPosts = (posts = []) => {
    if (!posts || posts.length === 0) {
      return { allTimePosts: [], lastYearPosts: [] };
    }

    const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;

    // Sort posts by score in descending order
    const sortedPosts = [...posts].sort((a, b) => b.score - a.score);

    console.log("Splitting posts:", {
      totalPosts: sortedPosts.length,
      oneYearAgo,
      samplePost: {
        title: sortedPosts[0]?.title,
        created_utc: sortedPosts[0]?.created_utc,
        date: new Date(sortedPosts[0]?.created_utc * 1000).toLocaleString(),
      },
      postDates: sortedPosts.slice(0, 3).map((p) => ({
        created_utc: p.created_utc,
        date: new Date(p.created_utc * 1000).toLocaleString(),
      })),
    });

    // Split posts into last year and all time
    const lastYearPosts = sortedPosts.filter((post) => {
      const postDate = post.created_utc;
      return postDate && postDate >= oneYearAgo;
    });

    const allTimePosts = sortedPosts.filter((post) => {
      const postDate = post.created_utc;
      return postDate && postDate < oneYearAgo;
    });

    console.log("Split results:", {
      allTimePosts: allTimePosts.length,
      lastYearPosts: lastYearPosts.length,
      firstLastYearPost: lastYearPosts[0]
        ? {
            date: new Date(
              lastYearPosts[0].created_utc * 1000
            ).toLocaleString(),
            created_utc: lastYearPosts[0].created_utc,
          }
        : null,
    });

    return {
      allTimePosts: allTimePosts.slice(0, postLimits.allTime),
      lastYearPosts: lastYearPosts.slice(0, postLimits.lastYear),
    };
  };

  const { allTimePosts, lastYearPosts } = splitPosts(
    analyzedPosts[subreddit.name] || []
  );

  // Sort posts by score in descending order
  const sortedAllTimePosts = [...allTimePosts].sort(
    (a, b) => b.score - a.score
  );
  const sortedYearlyPosts = [...lastYearPosts].sort(
    (a, b) => b.score - a.score
  );

  console.log("Splitting posts:", {
    totalAllTimePosts: sortedAllTimePosts.length,
    totalYearlyPosts: sortedYearlyPosts.length,
  });

  // Split posts into groups for analysis
  const allTimeGroups = splitPostsIntoGroups(
    sortedAllTimePosts,
    postLimits.allTime
  );
  const yearlyGroups = splitPostsIntoGroups(
    sortedYearlyPosts,
    postLimits.lastYear
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black text-white p-8">
      {/* Header with back button */}
      <div className="max-w-[95%] mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              r/{subreddit.name}
            </h1>
            <p className="text-gray-400 mt-2">{subreddit.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400">Subscribers</div>
            <div className="text-xl text-white font-semibold">
              {subreddit.subscribers?.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400">Posts (24h)</div>
            <div className="text-xl text-white font-semibold">
              {subreddit.recentPosts?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Content Analysis
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">All Time Posts:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={postLimits.allTime}
                  onChange={(e) =>
                    setPostLimits((prev) => ({
                      ...prev,
                      allTime: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">
                  Last Year Posts:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={postLimits.lastYear}
                  onChange={(e) =>
                    setPostLimits((prev) => ({
                      ...prev,
                      lastYear: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <button
                onClick={() => handleAnalyzeSubreddit(subreddit)}
                disabled={analyzingSubreddit === subreddit.name}
                className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 rounded-lg transition-all duration-300 border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzingSubreddit === subreddit.name ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    Analyzing Patterns...
                  </span>
                ) : (
                  "Analyze Patterns"
                )}
              </button>
            </div>
          </div>

          {/* Posts Lists */}
          <div className="space-y-6 mb-8">
            {analyzedPosts[subreddit.name] && (
              <>
                <CompactPostList
                  title="All Time Top Posts"
                  posts={analyzedPosts[subreddit.name]
                    .sort((a, b) => b.score - a.score)
                    .filter((post) => {
                      const oneYearAgo =
                        Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
                      return post.created_utc < oneYearAgo;
                    })
                    .slice(0, postLimits.allTime)}
                  analysisResults={analysisResults[subreddit.name]}
                />
                <CompactPostList
                  title="Top Posts of the Year"
                  posts={analyzedPosts[subreddit.name]
                    .sort((a, b) => b.score - a.score)
                    .filter((post) => {
                      const oneYearAgo =
                        Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
                      return post.created_utc >= oneYearAgo;
                    })
                    .slice(0, postLimits.lastYear)}
                  analysisResults={analysisResults[subreddit.name]}
                />

                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-2">
                  {analyzedPosts[subreddit.name]
                    .map((post, i) => (
                      <div key={i} className="mb-1">
                        Date:{" "}
                        {new Date(post.created_utc * 1000).toLocaleString()}{" "}
                        (UTC: {post.created_utc})
                      </div>
                    ))
                    .slice(0, 5)}
                </div>
              </>
            )}
          </div>

          {/* Post Stats */}
          {postStats[subreddit.name] && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">
                  All Time Posts Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lowest Likes:</span>
                    <span className="text-white">
                      {postStats[
                        subreddit.name
                      ].allTime.lowest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Highest Likes:</span>
                    <span className="text-white">
                      {postStats[
                        subreddit.name
                      ].allTime.highest.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Last Year Posts Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lowest Likes:</span>
                    <span className="text-white">
                      {postStats[
                        subreddit.name
                      ].lastYear.lowest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Highest Likes:</span>
                    <span className="text-white">
                      {postStats[
                        subreddit.name
                      ].lastYear.highest.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showTitleGenerator && (
            <div className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-purple-900/50 rounded-xl p-6 backdrop-blur-sm border border-purple-700/50 shadow-2xl">
              <SuggestedTitles
                analysis={{
                  patterns: analysisResults[subreddit.name]?.patterns || [],
                  stats: postStats[subreddit.name] || {},
                  analysis: analysisResults[subreddit.name] || "",
                }}
                product={business?.product || "Not specified"}
                marketingTool={marketingTool}
                redditService={redditService}
              />
            </div>
          )}

          {analysisResults[subreddit.name] && (
            <>
              <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl border border-gray-700/50">
                <PatternAnalysis analysis={analysisResults[subreddit.name]} />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeconstruction(!showDeconstruction)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 rounded-lg transition-all duration-300 border border-purple-500/20"
                >
                  {showDeconstruction
                    ? "Hide Pattern Deconstruction"
                    : "Show Pattern Deconstruction"}
                </button>
              </div>

              {showDeconstruction && (
                <PostDeconstruction
                  posts={analyzedPosts[subreddit.name] || []}
                  analysis={analysisResults[subreddit.name]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function extractPatternsFromAnalysis(analysisText) {
  if (!analysisText) return [];

  // Split the analysis text into lines
  const lines = analysisText.split("\n");

  const patterns = [];
  let currentPattern = null;

  for (const line of lines) {
    // Look for pattern headers (usually numbered)
    if (line.match(/^\d+\.\s+Pattern:/)) {
      if (currentPattern) {
        patterns.push(currentPattern);
      }
      currentPattern = {
        pattern: line.replace(/^\d+\.\s+Pattern:\s*/, "").trim(),
        examples: [],
        successRate: 0,
        averageScore: 0,
      };
    }
    // Look for examples
    else if (currentPattern && line.includes("Example:")) {
      const example = {
        title: line.replace(/Example:\s*/, "").trim(),
        postId: `pattern_${patterns.length + 1}_example_${
          currentPattern.examples.length + 1
        }`,
      };
      currentPattern.examples.push(example);
    }
    // Look for success metrics
    else if (currentPattern && line.includes("Success Rate:")) {
      const rate = line.match(/\d+/);
      if (rate) {
        currentPattern.successRate = parseInt(rate[0]);
      }
    } else if (currentPattern && line.includes("Average Score:")) {
      const score = line.match(/\d+/);
      if (score) {
        currentPattern.averageScore = parseInt(score[0]);
      }
    }
  }

  // Don't forget to add the last pattern
  if (currentPattern) {
    patterns.push(currentPattern);
  }

  return patterns;
}

export default SubredditFullView;
