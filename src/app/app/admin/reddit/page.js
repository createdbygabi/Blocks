"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { RedditService } from "@/lib/services/redditService";
import Image from "next/image";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

function SubredditCard({ subreddit, onSelect }) {
  const [rules, setRules] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      // Check if rules are already cached
      const cachedRules = localStorage.getItem(
        `reddit_rules_${subreddit.name}`
      );
      if (cachedRules) {
        setRules(JSON.parse(cachedRules));
        return;
      }

      try {
        setLoadingRules(true);
        const redditService = new RedditService();
        const rulesData = await redditService.getSubredditRules(subreddit.name);
        setRules(rulesData);
        // Cache the rules
        localStorage.setItem(
          `reddit_rules_${subreddit.name}`,
          JSON.stringify(rulesData)
        );
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setLoadingRules(false);
      }
    };

    fetchRules();
  }, [subreddit.name]);

  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl hover:border-blue-500/50 transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                r/{subreddit.name}
              </h3>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {subreddit.description}
              </p>
            </div>
            <button
              onClick={() => onSelect(subreddit)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/20 whitespace-nowrap"
            >
              View Posts
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>👥 {subreddit.subscribers.toLocaleString()}</span>
            <span>📝 {subreddit.recentPosts.toLocaleString()} posts/24h</span>
          </div>

          {loadingRules ? (
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <div className="w-3 h-3 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              Loading rules...
            </div>
          ) : (
            rules && (
              <div className="space-y-3">
                {/* Requirements */}
                {(rules.requirements?.minKarma > 0 ||
                  rules.requirements?.minAccountAge > 0 ||
                  rules.requirements?.isRestricted ||
                  rules.requirements?.isPrivate) && (
                  <div className="flex flex-wrap gap-2 text-sm text-orange-400">
                    {rules.requirements.minKarma > 0 && (
                      <span className="bg-orange-500/10 px-2 py-1 rounded">
                        Min. Karma: {rules.requirements.minKarma}
                      </span>
                    )}
                    {rules.requirements.minAccountAge > 0 && (
                      <span className="bg-orange-500/10 px-2 py-1 rounded">
                        Min. Age: {rules.requirements.minAccountAge}d
                      </span>
                    )}
                    {rules.requirements.isRestricted && (
                      <span className="bg-orange-500/10 px-2 py-1 rounded">
                        Restricted
                      </span>
                    )}
                    {rules.requirements.isPrivate && (
                      <span className="bg-orange-500/10 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                )}

                {/* Rules */}
                {rules.rules?.length > 0 && (
                  <div className="text-sm">
                    <div className="text-white font-medium mb-2">Rules:</div>
                    <div className="space-y-1.5">
                      {(showAllRules
                        ? rules.rules
                        : rules.rules.slice(0, 3)
                      ).map((rule, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 rounded px-2 py-1.5 border border-gray-700/50"
                        >
                          <div className="font-medium text-white text-xs">
                            {rule.shortName}
                          </div>
                        </div>
                      ))}
                      {rules.rules.length > 3 && (
                        <button
                          onClick={() => setShowAllRules(!showAllRules)}
                          className="w-full text-center py-1.5 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs"
                        >
                          {showAllRules
                            ? "Show Less"
                            : `+${rules.rules.length - 3} More Rules`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {post.title}
          </h3>
          {post.isSelf && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {post.selftext}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>👤 u/{post.author}</span>
            <span>⬆️ {post.score.toLocaleString()} upvotes</span>
            <span>💬 {post.numComments.toLocaleString()} comments</span>
          </div>
        </div>
        <a
          href={post.permalink}
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

export default function RedditPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [subreddits, setSubreddits] = useState([]);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [allTimePosts, setAllTimePosts] = useState([]);
  const [yearlyPosts, setYearlyPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastAfter, setLastAfter] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(false);
  const [postSort, setPostSort] = useState("top");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id === ADMIN_USER_ID) {
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Session error:", sessionError);
            setError("Authentication error");
            return;
          }
          if (session) {
            await fetchBusinesses();
          }
        } catch (error) {
          console.error("Error in useEffect:", error);
          setError(error.message);
        }
      }
    };

    fetchData();
  }, [user]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data: businessesData, error } = await supabase
        .from("businesses")
        .select("id, name, logo_url, target_audience")
        .order("name");

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        return;
      }

      setBusinesses(businessesData || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = async (businessId) => {
    setSelectedBusiness(businessId);
    setSelectedSubreddit(null);
    setPosts([]);
    await fetchSubreddits(businessId);
  };

  const fetchSubreddits = async (businessId) => {
    try {
      setIsLoadingSubreddits(true);
      setError(null);

      // Check if subreddits are already cached for this business
      const cachedSubreddits = localStorage.getItem(
        `reddit_subreddits_${businessId}`
      );
      if (cachedSubreddits) {
        setSubreddits(JSON.parse(cachedSubreddits));
        setIsLoadingSubreddits(false);
        return;
      }

      const business = businesses.find((b) => b.id === businessId);
      if (!business) throw new Error("Business not found");

      const redditService = new RedditService();
      const relevantSubreddits = await redditService.findRelevantSubreddits(
        business
      );
      setSubreddits(relevantSubreddits);
      // Cache the subreddits
      localStorage.setItem(
        `reddit_subreddits_${businessId}`,
        JSON.stringify(relevantSubreddits)
      );
    } catch (error) {
      console.error("Error fetching subreddits:", error);
      setError(error.message);
    } finally {
      setIsLoadingSubreddits(false);
    }
  };

  const handleSubredditSelect = async (subreddit) => {
    setSelectedSubreddit(subreddit);
    await fetchPosts(subreddit.name);
  };

  const fetchPosts = async (subredditName, after = null) => {
    try {
      if (!after) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const redditService = new RedditService();

      // Fetch both all-time and yearly posts in parallel
      const [allTimeResponse, yearlyResponse] = await Promise.all([
        redditService.getSubredditPosts(subredditName, 30, "top", "all", after),
        redditService.getSubredditPosts(
          subredditName,
          30,
          "top",
          "year",
          after
        ),
      ]);

      if (after) {
        setAllTimePosts((prev) => [...prev, ...allTimeResponse.posts]);
        setYearlyPosts((prev) => [...prev, ...yearlyResponse.posts]);
        setFilteredPosts((prev) => [...prev, ...allTimeResponse.posts]);
      } else {
        setAllTimePosts(allTimeResponse.posts);
        setYearlyPosts(yearlyResponse.posts);
        setFilteredPosts(allTimeResponse.posts);
      }

      setLastAfter(allTimeResponse.after);
      setHasMore(!!allTimeResponse.after);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Add back the useEffect for filtering posts
  useEffect(() => {
    if (!postSearchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = postSearchQuery.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.selftext?.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  }, [postSearchQuery, posts]);

  // Reset pagination when filters change
  useEffect(() => {
    if (selectedSubreddit) {
      setLastAfter(null);
      setHasMore(true);
      fetchPosts(selectedSubreddit.name);
    }
  }, [postSort, timeFilter]);

  // Handle scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (
        !loadingMore &&
        hasMore &&
        selectedSubreddit &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100
      ) {
        fetchPosts(selectedSubreddit.name, lastAfter);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore, selectedSubreddit, lastAfter]);

  // Add a function to clear cache if needed
  const clearCache = () => {
    // Clear all Reddit-related cache
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("reddit_")) {
        localStorage.removeItem(key);
      }
    });
  };

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-0.5">
              <div className="w-full h-full rounded-[10px] bg-gray-900 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                Reddit
              </h1>
              <p className="text-gray-400 mt-2">
                Find relevant subreddits for your SaaS businesses
              </p>
            </div>
          </div>
          <button
            onClick={clearCache}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200"
          >
            Clear Cache
          </button>
        </div>

        {error && (
          <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-lg text-red-400 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Business Selection */}
        <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Select Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleBusinessSelect(business.id)}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  selectedBusiness === business.id
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50"
                    : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 border-gray-700/50 hover:border-orange-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 p-0.5">
                    <div className="w-full h-full rounded-[6px] bg-gray-900 flex items-center justify-center">
                      {business.logo_url ? (
                        <Image
                          src={business.logo_url}
                          alt={business.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-orange-400"
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
                  <div className="text-left">
                    <h3 className="font-medium text-white">{business.name}</h3>
                    <p className="text-sm text-gray-400">
                      {business.target_audience || "No target audience set"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Subreddits Section */}
        {selectedBusiness && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Relevant Subreddits
              </h2>
              {isLoadingSubreddits && (
                <div className="flex items-center gap-2 text-orange-400">
                  <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  Loading subreddits...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subreddits.map((subreddit) => (
                <SubredditCard
                  key={subreddit.name}
                  subreddit={subreddit}
                  onSelect={handleSubredditSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {selectedSubreddit && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Posts from r/{selectedSubreddit.name}
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={postSort}
                  onChange={(e) => setPostSort(e.target.value)}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="hot">Hot</option>
                  <option value="top">Top</option>
                  <option value="new">New</option>
                  <option value="rising">Rising</option>
                </select>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="hour">Past Hour</option>
                  <option value="day">Past 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={postSearchQuery}
                onChange={(e) => setPostSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-3 pl-12 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {postSearchQuery && (
                <button
                  onClick={() => setPostSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* All Time Posts */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">
                  All Time Top Posts
                </h3>
                <div className="grid gap-4">
                  {allTimePosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>

              {/* Yearly Posts */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Top Posts of the Year
                </h3>
                <div className="grid gap-4">
                  {yearlyPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </div>

            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4 text-gray-400">
                No more posts to load
              </div>
            )}
            {filteredPosts.length === 0 && !loadingMore && (
              <div className="text-center py-8 text-gray-400">
                No posts found matching your search
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
