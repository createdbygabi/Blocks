"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { RedditService } from "@/lib/services/redditService";
import Image from "next/image";
import SubredditGraph from "./components/SubredditGraph";
import PatternAnalysis from "./components/PatternAnalysis";
import PostDeconstruction from "./components/PostDeconstruction";
import SubredditFullView from "./components/SubredditFullView";
import SuggestedTitles from "./components/SuggestedTitles";

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
          {post.isSelf && (
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
            <span>💬 {post.numComments.toLocaleString()} comments</span>
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
  const [graphData, setGraphData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [selectedSubreddits, setSelectedSubreddits] = useState(new Set());
  const [savingSubreddits, setSavingSubreddits] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showSubredditFinder, setShowSubredditFinder] = useState(false);
  const [savedSubreddits, setSavedSubreddits] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [analyzingSubreddit, setAnalyzingSubreddit] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [showDeconstruction, setShowDeconstruction] = useState(false);
  const [analyzedPosts, setAnalyzedPosts] = useState({});
  const [fullViewSubreddit, setFullViewSubreddit] = useState(null);
  const [postLimits, setPostLimits] = useState({
    allTime: 20,
    lastYear: 20,
  });
  const [postStats, setPostStats] = useState({});
  const [marketingTool, setMarketingTool] = useState("");
  const [savedMarketingTool, setSavedMarketingTool] = useState("");
  const [filteredSubreddits, setFilteredSubreddits] = useState([]);
  const [filteringStep, setFilteringStep] = useState(1);
  const [filteringStatus, setFilteringStatus] = useState("idle");
  const [subredditCache, setSubredditCache] = useState({});
  const [karmaTestResults, setKarmaTestResults] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const redditService = new RedditService();

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
        .select("id, name, logo_url, target_audience, marketing_tool, product")
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
    setShowSubredditFinder(false);

    try {
      // Clear cache for the previous business
      if (selectedBusiness) {
        clearSubredditCache(selectedBusiness);
      }

      // Load saved subreddits data
      await loadSavedSubredditsData(businessId);

      // Load marketing tool data
      const { data: business, error } = await supabase
        .from("businesses")
        .select("marketing_tool")
        .eq("id", businessId)
        .single();

      if (error) throw error;

      setMarketingTool(business.marketing_tool || "");
      setSavedMarketingTool(business.marketing_tool || "");
    } catch (error) {
      console.error("Error loading business data:", error);
      setError(error.message);
    }
  };

  const loadSavedSubredditsData = async (businessId) => {
    try {
      setLoadingSaved(true);

      // Check cache first
      const cacheKey = `saved_subreddits_${businessId}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;

        // Use cache if it's less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          console.log("📦 Using cached subreddits data");
          setSavedSubreddits(data.savedSubreddits);
          setSelectedSubreddits(new Set(data.selectedSubreddits));
          setSubredditCache(data.subredditCache);
          setLoadingSaved(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("business_subreddits")
        .select("subreddit_name, allows_urls, has_good_karma")
        .eq("business_id", businessId)
        .eq("is_selected", true);

      if (error) throw error;

      // Create basic subreddit objects from the names
      const basicSubreddits = data.map((item) => ({
        name: item.subreddit_name,
        description: "Loading...",
        subscribers: 0,
        recentPosts: 0,
      }));

      // Set the initial state with basic info
      setSavedSubreddits(basicSubreddits);
      setSelectedSubreddits(new Set(data.map((item) => item.subreddit_name)));

      // Initialize the subreddit cache with the loaded states
      const initialCache = {};
      data.forEach((item) => {
        initialCache[item.subreddit_name] = {
          allowsUrls: item.allows_urls,
          hasGoodKarma: item.has_good_karma,
          checked: true,
        };
      });
      setSubredditCache(initialCache);

      // Cache the data
      const cacheData = {
        savedSubreddits: basicSubreddits,
        selectedSubreddits: Array.from(
          new Set(data.map((item) => item.subreddit_name))
        ),
        subredditCache: initialCache,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));

      // Fetch full details in the background
      const redditService = new RedditService();
      const detailsPromises = data.map(async (item) => {
        try {
          const details = await redditService.getSubredditInfo(
            item.subreddit_name
          );
          return (
            details || {
              name: item.subreddit_name,
              description: "Unable to load details",
              subscribers: 0,
              recentPosts: 0,
            }
          );
        } catch (error) {
          console.error(
            `Error loading details for ${item.subreddit_name}:`,
            error
          );
          return {
            name: item.subreddit_name,
            description: "Unable to load details",
            subscribers: 0,
            recentPosts: 0,
          };
        }
      });

      const subredditDetails = await Promise.all(detailsPromises);
      const updatedSubreddits = subredditDetails.filter(Boolean);
      setSavedSubreddits(updatedSubreddits);

      // Update cache with full details
      const updatedCacheData = {
        ...cacheData,
        savedSubreddits: updatedSubreddits,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(updatedCacheData));
    } catch (error) {
      console.error("Error loading saved subreddits:", error);
      setError(error.message);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Add function to clear cache when needed
  const clearSubredditCache = (businessId) => {
    const cacheKey = `saved_subreddits_${businessId}`;
    localStorage.removeItem(cacheKey);
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
      const relevantSubreddits = await redditService.findMostRelevantSubreddits(
        business,
        18
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
    setLoadingGraph(true);
    try {
      const redditService = new RedditService();
      const graphData = await redditService.generateSubredditGraphData(
        subreddit.name
      );
      setGraphData(graphData);
      await fetchPosts(subreddit.name);
    } catch (error) {
      console.error("Error generating graph:", error);
    } finally {
      setLoadingGraph(false);
    }
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

  const handleSubredditToggle = (subredditName) => {
    setSelectedSubreddits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subredditName)) {
        newSet.delete(subredditName);
      } else {
        newSet.add(subredditName);
      }
      return newSet;
    });
  };

  const saveSelectedSubreddits = async () => {
    try {
      setSavingSubreddits(true);

      // First, clear existing selections for this business
      await supabase
        .from("business_subreddits")
        .delete()
        .eq("business_id", selectedBusiness);

      // Then insert the new selections
      const subredditInserts = Array.from(selectedSubreddits).map(
        (subredditName) => ({
          business_id: selectedBusiness,
          subreddit_name: subredditName,
          is_selected: true,
        })
      );

      const { error } = await supabase
        .from("business_subreddits")
        .insert(subredditInserts);

      if (error) throw error;

      // Show success message
      alert("Selected subreddits saved successfully!");
    } catch (error) {
      console.error("Error saving subreddits:", error);
      alert("Error saving subreddits. Please try again.");
    } finally {
      setSavingSubreddits(false);
    }
  };

  // Load saved selections when business changes
  useEffect(() => {
    const loadSavedSubreddits = async () => {
      if (!selectedBusiness) return;

      try {
        const { data, error } = await supabase
          .from("business_subreddits")
          .select("subreddit_name")
          .eq("business_id", selectedBusiness)
          .eq("is_selected", true);

        if (error) throw error;

        setSelectedSubreddits(new Set(data.map((item) => item.subreddit_name)));
      } catch (error) {
        console.error("Error loading saved subreddits:", error);
      }
    };

    loadSavedSubreddits();
  }, [selectedBusiness]);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const redditService = new RedditService();
      const results = await redditService.searchSubreddits(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching subreddits:", error);
      setError(error.message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    (query) => {
      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set a new timeout
      const timeout = setTimeout(() => {
        handleSearch(query);
      }, 500); // Wait 500ms after the user stops typing

      setSearchTimeout(timeout);
    },
    [handleSearch, searchTimeout]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Add this function to load saved analyses
  const loadSavedAnalyses = async (businessId) => {
    try {
      const { data: analyses, error } = await supabase
        .from("subreddit_analyses")
        .select("*")
        .eq("business_id", businessId);

      if (error) throw error;

      // Convert array to object with subreddit names as keys
      const analysisMap = analyses.reduce((acc, analysis) => {
        acc[analysis.subreddit_name] = analysis.analysis;
        return acc;
      }, {});

      setAnalysisResults(analysisMap);
    } catch (error) {
      console.error("Error loading analyses:", error);
      setError("Failed to load saved analyses");
    }
  };

  // Add this function to save/update analysis
  const saveAnalysisToDb = async (subredditName, analysis) => {
    try {
      const { error } = await supabase.from("subreddit_analyses").upsert(
        {
          business_id: selectedBusiness,
          subreddit_name: subredditName,
          analysis: analysis,
        },
        {
          onConflict: "business_id,subreddit_name",
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error saving analysis:", error);
      setError("Failed to save analysis");
    }
  };

  // Modify the handleAnalyzeSubreddit function
  const handleAnalyzeSubreddit = async (subreddit) => {
    try {
      setAnalyzingSubreddit(subreddit.name);
      console.log("🔍 Starting analysis for subreddit:", subreddit.name);
      console.log("📊 Post limits configuration:", postLimits);

      // Fetch top posts from all time and past year
      console.log("📥 Fetching posts...");
      const [allTimeResponse, yearResponse] = await Promise.all([
        redditService.getPosts(subreddit.name, {
          sort: "top",
          time: "all",
          limit: postLimits.allTime,
        }),
        redditService.getPosts(subreddit.name, {
          sort: "top",
          time: "year",
          limit: postLimits.lastYear,
        }),
      ]);

      console.log("📊 All Time Posts:", {
        requested: postLimits.allTime,
        received: allTimeResponse.posts.length,
        posts: allTimeResponse.posts.map((p) => ({
          id: p.id,
          title: p.title,
          score: p.score,
          created: new Date(p.created_utc * 1000).toLocaleString(),
        })),
      });

      console.log("📊 Last Year Posts:", {
        requested: postLimits.lastYear,
        received: yearResponse.posts.length,
        posts: yearResponse.posts.map((p) => ({
          id: p.id,
          title: p.title,
          score: p.score,
          created: new Date(p.created_utc * 1000).toLocaleString(),
        })),
      });

      // Set the posts in state
      setAllTimePosts(allTimeResponse.posts);
      setYearlyPosts(yearResponse.posts);

      // Combine posts for analysis
      const allPosts = [...allTimeResponse.posts, ...yearResponse.posts];
      console.log("🔄 Combined posts:", {
        totalPosts: allPosts.length,
        uniquePosts: new Set(allPosts.map((p) => p.id)).size,
      });

      // Calculate stats
      const allTimeStats = {
        lowest: Math.min(...allTimeResponse.posts.map((p) => p.score)),
        highest: Math.max(...allTimeResponse.posts.map((p) => p.score)),
      };
      const yearStats = {
        lowest: Math.min(...yearResponse.posts.map((p) => p.score)),
        highest: Math.max(...yearResponse.posts.map((p) => p.score)),
      };

      console.log("📈 Post Stats:", {
        allTime: allTimeStats,
        lastYear: yearStats,
      });

      setPostStats({
        ...postStats,
        [subreddit.name]: {
          allTime: allTimeStats,
          lastYear: yearStats,
        },
      });

      // Store the posts in state
      setAnalyzedPosts((prev) => ({
        ...prev,
        [subreddit.name]: allPosts,
      }));

      const response = await fetch("/api/reddit/analyze-patterns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${redditService.token}`,
        },
        body: JSON.stringify({ posts: allPosts }),
      });

      const result = await response.json();

      if (result.error) throw new Error(result.error);

      // Save to database
      await saveAnalysisToDb(subreddit.name, result.analysis);

      // Update state
      setAnalysisResults((prev) => ({
        ...prev,
        [subreddit.name]: result.analysis,
      }));
    } catch (error) {
      console.error("Error analyzing subreddit:", error);
      setError(`Failed to analyze ${subreddit.name}: ${error.message}`);
    } finally {
      setAnalyzingSubreddit(null);
    }
  };

  // Add useEffect to load saved analyses when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      loadSavedAnalyses(selectedBusiness);
    }
  }, [selectedBusiness]);

  // Add handler for opening full view
  const handleOpenFullView = (subreddit) => {
    setFullViewSubreddit(subreddit);
  };

  // Add handler for closing full view
  const handleCloseFullView = () => {
    setFullViewSubreddit(null);
  };

  const handleSaveMarketingTool = async () => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ marketing_tool: marketingTool })
        .eq("id", selectedBusiness);

      if (error) throw error;

      setSavedMarketingTool(marketingTool);
      alert("Marketing tool saved successfully!");
    } catch (error) {
      console.error("Error saving marketing tool:", error);
      setError("Failed to save marketing tool");
      alert("Failed to save marketing tool. Please try again.");
    }
  };

  // Add useEffect for loading saved subreddits
  useEffect(() => {
    const loadSavedSubreddits = () => {
      const saved = localStorage.getItem("savedSubreddits");
      if (saved) {
        setSavedSubreddits(JSON.parse(saved));
      }
    };
    loadSavedSubreddits();
  }, []);

  // Add useEffect for saving subreddits
  useEffect(() => {
    if (savedSubreddits.length > 0) {
      localStorage.setItem("savedSubreddits", JSON.stringify(savedSubreddits));
    }
  }, [savedSubreddits]);

  // Add new function to check subreddit karma requirements
  const checkSubredditKarma = async (subredditName) => {
    try {
      const rules = await redditService.getSubredditRules(subredditName);
      const minKarma = rules?.requirements?.minKarma || 0;
      return {
        minKarma,
        meetsRequirement: minKarma <= 0, // If no karma requirement, it meets the requirement
      };
    } catch (error) {
      console.error(`Error checking karma for ${subredditName}:`, error);
      return {
        minKarma: 0,
        meetsRequirement: true, // Default to true if we can't check
      };
    }
  };

  // Add new function to check URL promotion rules
  const checkUrlPromotionRules = async (subredditName) => {
    try {
      const rules = await redditService.getSubredditRules(subredditName);
      const rulesText = rules?.rules?.map((r) => r.description).join(" ") || "";
      const allowsPromotion =
        !rulesText.toLowerCase().includes("no self-promotion") &&
        !rulesText.toLowerCase().includes("no advertising");
      return {
        allowsPromotion,
        rulesText: rulesText.substring(0, 200) + "...", // Truncate for display
      };
    } catch (error) {
      console.error(`Error checking URL rules for ${subredditName}:`, error);
      return {
        allowsPromotion: true, // Default to true if we can't check
        rulesText: "Unable to fetch rules",
      };
    }
  };

  // Cache subreddit data when it's first loaded
  useEffect(() => {
    if (savedSubreddits.length > 0) {
      const newCache = { ...subredditCache };
      savedSubreddits.forEach((subreddit) => {
        if (!newCache[subreddit.name]) {
          newCache[subreddit.name] = {
            ...subreddit,
            minKarma: null,
            allowsUrls: null,
            checked: false,
          };
        }
      });
      setSubredditCache(newCache);
    }
  }, [savedSubreddits]);

  // Update filtered subreddits when step changes
  useEffect(() => {
    if (savedSubreddits.length === 0) return;

    const filterSubreddits = () => {
      setFilteringStatus("filtering");
      let filtered = [];

      switch (filteringStep) {
        case 1: // All subreddits
          filtered = savedSubreddits;
          break;
        case 2: // URL Rules Check
          filtered = savedSubreddits;
          break;
        case 3: // Karma Check - only show subreddits that passed URL check
          filtered = savedSubreddits.filter((sub) => {
            const cache = subredditCache[sub.name] || {};
            return cache.allowsUrls === true;
          });
          break;
        case 4: // Final list - only show subreddits that passed both checks
          filtered = savedSubreddits.filter((sub) => {
            const cache = subredditCache[sub.name] || {};
            return cache.allowsUrls === true && cache.hasGoodKarma === true;
          });
          break;
      }

      setFilteredSubreddits(filtered);
      setFilteringStatus("idle");
    };

    filterSubreddits();
  }, [filteringStep, savedSubreddits, subredditCache]);

  const handleUrlRuleToggle = async (subreddit, allowsUrls) => {
    try {
      console.log("🔍 Checking existing record for:", {
        business_id: selectedBusiness,
        subreddit_name: subreddit.name,
      });

      // First check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from("business_subreddits")
        .select("*")
        .eq("business_id", selectedBusiness)
        .eq("subreddit_name", subreddit.name)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Error checking record:", checkError);
        throw checkError;
      }

      console.log("📊 Existing record:", existingRecord);

      if (existingRecord) {
        console.log(
          "🔄 Updating existing record with allows_urls:",
          allowsUrls
        );
        // Update existing record
        const { error: updateError } = await supabase
          .from("business_subreddits")
          .update({ allows_urls: allowsUrls })
          .eq("business_id", selectedBusiness)
          .eq("subreddit_name", subreddit.name);

        if (updateError) {
          console.error("❌ Error updating record:", updateError);
          throw updateError;
        }
        console.log("✅ Successfully updated record");
      } else {
        console.log("➕ Creating new record with allows_urls:", allowsUrls);
        // Insert new record
        const { error: insertError } = await supabase
          .from("business_subreddits")
          .insert({
            business_id: selectedBusiness,
            subreddit_name: subreddit.name,
            allows_urls: allowsUrls,
            is_selected: true,
          });

        if (insertError) {
          console.error("❌ Error inserting record:", insertError);
          throw insertError;
        }
        console.log("✅ Successfully created new record");
      }

      // Update local state
      setSubredditCache((prev) => ({
        ...prev,
        [subreddit.name]: {
          ...(prev[subreddit.name] || {}),
          allowsUrls,
        },
      }));
    } catch (error) {
      console.error("❌ Error in handleUrlRuleToggle:", error);
      alert("Failed to update URL status. Please try again.");
    }
  };

  const handleKarmaRuleToggle = async (subreddit, hasGoodKarma) => {
    try {
      console.log("🔍 Checking existing record for:", {
        business_id: selectedBusiness,
        subreddit_name: subreddit.name,
      });

      // First check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from("business_subreddits")
        .select("*")
        .eq("business_id", selectedBusiness)
        .eq("subreddit_name", subreddit.name)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Error checking record:", checkError);
        throw checkError;
      }

      console.log("📊 Existing record:", existingRecord);

      if (existingRecord) {
        console.log(
          "🔄 Updating existing record with has_good_karma:",
          hasGoodKarma
        );
        // Update existing record
        const { error: updateError } = await supabase
          .from("business_subreddits")
          .update({ has_good_karma: hasGoodKarma })
          .eq("business_id", selectedBusiness)
          .eq("subreddit_name", subreddit.name);

        if (updateError) {
          console.error("❌ Error updating record:", updateError);
          throw updateError;
        }
        console.log("✅ Successfully updated record");
      } else {
        console.log(
          "➕ Creating new record with has_good_karma:",
          hasGoodKarma
        );
        // Insert new record
        const { error: insertError } = await supabase
          .from("business_subreddits")
          .insert({
            business_id: selectedBusiness,
            subreddit_name: subreddit.name,
            has_good_karma: hasGoodKarma,
            is_selected: true,
          });

        if (insertError) {
          console.error("❌ Error inserting record:", insertError);
          throw insertError;
        }
        console.log("✅ Successfully created new record");
      }

      // Update local state
      setSubredditCache((prev) => ({
        ...prev,
        [subreddit.name]: {
          ...(prev[subreddit.name] || {}),
          hasGoodKarma,
        },
      }));
    } catch (error) {
      console.error("❌ Error in handleKarmaRuleToggle:", error);
      alert("Failed to update karma status. Please try again.");
    }
  };

  const handleKarmaTest = async (subreddit) => {
    try {
      setIsGenerating(true);

      const testPost = {
        title: "Test Post - Please Ignore",
        text: "This is a test post to check karma requirements.",
        subreddit: subreddit.name,
      };

      const response = await fetch("/api/reddit/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${redditService.token}`,
        },
        body: JSON.stringify(testPost),
      });

      const result = await response.json();

      // Update local state only
      setKarmaTestResults((prev) => ({
        ...prev,
        [subreddit.name]: {
          response: result.error || result.message || "Post attempt completed",
          date: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Error testing karma:", error);
      setKarmaTestResults((prev) => ({
        ...prev,
        [subreddit.name]: {
          response: `Error: ${error.message}`,
          date: new Date().toISOString(),
        },
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKarmaValidation = async (subreddit, passed) => {
    // Update local state only
    setKarmaTestResults((prev) => ({
      ...prev,
      [subreddit.name]: {
        ...prev[subreddit.name],
        passed,
      },
    }));
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
      {fullViewSubreddit ? (
        <SubredditFullView
          subreddit={fullViewSubreddit}
          onBack={handleCloseFullView}
          analyzingSubreddit={analyzingSubreddit}
          handleAnalyzeSubreddit={handleAnalyzeSubreddit}
          analysisResults={analysisResults}
          analyzedPosts={analyzedPosts}
          postLimits={postLimits}
          setPostLimits={setPostLimits}
          postStats={postStats}
          business={businesses.find((b) => b.id === selectedBusiness)}
          marketingTool={marketingTool}
          redditService={redditService}
        />
      ) : (
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
                      <h3 className="font-medium text-white">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {business.target_audience || "No target audience set"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Marketing as Engineering Tool Input */}
          {selectedBusiness && (
            <div className="mt-6 bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Engineering as Marketing Tool
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={marketingTool || ""}
                    onChange={(e) => setMarketingTool(e.target.value)}
                    placeholder="Explain your marketing as engineering tool in one line..."
                    className="flex-1 px-4 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                  />
                  <button
                    onClick={handleSaveMarketingTool}
                    disabled={!marketingTool}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
                {savedMarketingTool && (
                  <p className="text-sm text-gray-400">
                    Current tool: {savedMarketingTool}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Selected Subreddits Section */}
          {selectedBusiness && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Selected Subreddits
                </h2>
                <button
                  onClick={() => setShowSubredditFinder((prev) => !prev)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                  {showSubredditFinder
                    ? "Hide Subreddit Finder"
                    : "Find Subreddits"}
                </button>
              </div>

              {loadingSaved ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-orange-400">
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    Loading selected subreddits...
                  </div>
                </div>
              ) : savedSubreddits.length > 0 ? (
                <div className="space-y-4">
                  {/* Filtering Steps */}
                  <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setFilteringStep(1)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            filteringStep === 1
                              ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400"
                              : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 text-gray-400 hover:text-white"
                          }`}
                        >
                          Step 1: All Selected
                        </button>
                        <button
                          onClick={() => setFilteringStep(2)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            filteringStep === 2
                              ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400"
                              : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 text-gray-400 hover:text-white"
                          }`}
                        >
                          Step 2: URL Rules Check
                        </button>
                        <button
                          onClick={() => setFilteringStep(3)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            filteringStep === 3
                              ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400"
                              : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 text-gray-400 hover:text-white"
                          }`}
                        >
                          Step 3: Karma Check
                        </button>
                        <button
                          onClick={() => setFilteringStep(4)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            filteringStep === 4
                              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400"
                              : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 text-gray-400 hover:text-white"
                          }`}
                        >
                          ✓ Ready to Post
                        </button>
                      </div>
                      <div className="text-sm text-gray-400">
                        {filteringStep === 4
                          ? `${filteredSubreddits.length} subreddits approved`
                          : `${filteredSubreddits.length} subreddits`}
                      </div>
                    </div>

                    {/* Compact Subreddit List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredSubreddits.map((subreddit) => {
                        const cachedData = subredditCache[subreddit.name] || {};
                        return (
                          <div
                            key={subreddit.name}
                            className={`flex flex-col bg-gradient-to-br p-2 rounded-lg border ${
                              filteringStep === 4
                                ? "from-green-500/20 to-green-400/20 border-green-500"
                                : filteringStep === 2
                                ? cachedData?.allowsUrls === true
                                  ? "from-green-500/20 to-green-400/20 border-green-500"
                                  : cachedData?.allowsUrls === false
                                  ? "from-red-500/20 to-red-400/20 border-red-500"
                                  : "from-gray-900/30 to-gray-800/30 border-gray-700/50"
                                : filteringStep === 3
                                ? cachedData?.hasGoodKarma === true
                                  ? "from-green-500/20 to-green-400/20 border-green-500"
                                  : cachedData?.hasGoodKarma === false
                                  ? "from-red-500/20 to-red-400/20 border-red-500"
                                  : "from-gray-900/30 to-gray-800/30 border-gray-700/50"
                                : "from-gray-900/30 to-gray-800/30 border-gray-700/50"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-2">
                                <span className="text-orange-400">r/</span>
                                <span className="font-medium text-white">
                                  {subreddit.name}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {subreddit.subscribers?.toLocaleString() ||
                                    "N/A"}{" "}
                                  👥
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                {filteringStep === 2 && (
                                  <div className="flex items-center gap-2 sm:gap-4">
                                    <button
                                      onClick={() =>
                                        handleUrlRuleToggle(subreddit, true)
                                      }
                                      className={`text-2xl ${
                                        cachedData?.allowsUrls === true
                                          ? "text-green-400 bg-green-500/20 px-2 sm:px-3 py-1 rounded-full"
                                          : "text-gray-400 hover:text-green-400"
                                      }`}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleUrlRuleToggle(subreddit, false)
                                      }
                                      className={`text-2xl ${
                                        cachedData?.allowsUrls === false
                                          ? "text-red-400 bg-red-500/20 px-2 sm:px-3 py-1 rounded-full"
                                          : "text-gray-400 hover:text-red-400"
                                      }`}
                                    >
                                      ✗
                                    </button>
                                  </div>
                                )}
                                {filteringStep === 3 && (
                                  <div className="flex items-center gap-2 sm:gap-4">
                                    <button
                                      onClick={() =>
                                        handleKarmaRuleToggle(subreddit, true)
                                      }
                                      className={`text-2xl ${
                                        cachedData?.hasGoodKarma === true
                                          ? "text-green-400 bg-green-500/20 px-2 sm:px-3 py-1 rounded-full"
                                          : "text-gray-400 hover:text-green-400"
                                      }`}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleKarmaRuleToggle(subreddit, false)
                                      }
                                      className={`text-2xl ${
                                        cachedData?.hasGoodKarma === false
                                          ? "text-red-400 bg-red-500/20 px-2 sm:px-3 py-1 rounded-full"
                                          : "text-gray-400 hover:text-red-400"
                                      }`}
                                    >
                                      ✗
                                    </button>
                                  </div>
                                )}
                                {filteringStep !== 4 ? (
                                  <button
                                    onClick={() => {
                                      if (filteringStep === 2) {
                                        handleUrlRuleToggle(
                                          subreddit,
                                          !cachedData?.allowsUrls
                                        );
                                      } else if (filteringStep === 3) {
                                        handleKarmaRuleToggle(
                                          subreddit,
                                          !cachedData?.hasGoodKarma
                                        );
                                      }
                                    }}
                                    className="px-2 py-1 text-sm sm:text-base bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300 whitespace-nowrap"
                                  >
                                    {filteringStep === 2
                                      ? cachedData?.allowsUrls
                                        ? "Block URLs"
                                        : "Allow URLs"
                                      : filteringStep === 3
                                      ? cachedData?.hasGoodKarma
                                        ? "Bad Karma"
                                        : "Good Karma"
                                      : "View"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleOpenFullView(subreddit)
                                    }
                                    className="px-2 py-1 text-sm sm:text-base bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 whitespace-nowrap"
                                  >
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No subreddits selected yet. Click "Find Subreddits" to get
                  started.
                </div>
              )}
            </div>
          )}

          {/* Subreddit Finder Section */}
          {selectedBusiness && showSubredditFinder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Find Relevant Subreddits
                </h2>
                <div className="flex items-center gap-4">
                  {isLoadingSubreddits && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                      Loading subreddits...
                    </div>
                  )}
                  <button
                    onClick={saveSelectedSubreddits}
                    disabled={savingSubreddits || selectedSubreddits.size === 0}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSubreddits ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      `Save Selected (${selectedSubreddits.size})`
                    )}
                  </button>
                </div>
              </div>

              {/* Search Section */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for subreddits..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
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
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Search Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((subreddit) => (
                      <div
                        key={subreddit.name}
                        className={`bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border ${
                          selectedSubreddits.has(subreddit.name)
                            ? "border-orange-500/50"
                            : "border-gray-700/50"
                        } shadow-2xl hover:border-blue-500/50 transition-all duration-300`}
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white">
                                  r/{subreddit.name}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                  {subreddit.description ||
                                    "No description available"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleSubredditToggle(subreddit.name)
                                }
                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                  selectedSubreddits.has(subreddit.name)
                                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400"
                                    : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 text-gray-400"
                                }`}
                              >
                                {selectedSubreddits.has(subreddit.name)
                                  ? "Selected"
                                  : "Select"}
                              </button>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                              <span>
                                👥{" "}
                                {(subreddit.subscribers || 0).toLocaleString()}
                              </span>
                              <span>
                                📝{" "}
                                {(subreddit.recentPosts || 0).toLocaleString()}{" "}
                                posts/24h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Subreddits */}
              {!searchQuery && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Recommended Subreddits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subreddits.map((subreddit) => (
                      <div
                        key={subreddit.name}
                        className={`bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border ${
                          selectedSubreddits.has(subreddit.name)
                            ? "border-orange-500/50"
                            : "border-gray-700/50"
                        } shadow-2xl hover:border-blue-500/50 transition-all duration-300`}
                      >
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
                                onClick={() =>
                                  handleSubredditToggle(subreddit.name)
                                }
                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                  selectedSubreddits.has(subreddit.name)
                                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400"
                                    : "bg-gradient-to-r from-gray-900/30 to-gray-800/30 text-gray-400"
                                }`}
                              >
                                {selectedSubreddits.has(subreddit.name)
                                  ? "Selected"
                                  : "Select"}
                              </button>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                              <span>
                                👥 {subreddit.subscribers.toLocaleString()}
                              </span>
                              <span>
                                📝 {subreddit.recentPosts.toLocaleString()}{" "}
                                posts/24h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Network Graph Section */}
          {selectedSubreddit && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Related Subreddits Network
              </h2>
              {loadingGraph ? (
                <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-2 text-orange-400">
                    <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    Generating network graph...
                  </div>
                </div>
              ) : (
                graphData && (
                  <SubredditGraph
                    data={graphData}
                    onNodeClick={(node) => {
                      const subreddit = subreddits.find(
                        (s) => s.name === node.name
                      );
                      if (subreddit) {
                        handleSubredditSelect(subreddit);
                      }
                    }}
                  />
                )
              )}
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
                    {allTimePosts.map((post) => {
                      const analysisReference = analysisResults[
                        selectedSubreddit.name
                      ]?.patterns?.find((pattern) =>
                        pattern.examples?.some(
                          (example) => example.postId === post.id
                        )
                      );
                      return (
                        <PostCard
                          key={post.id}
                          post={post}
                          isReferenced={!!analysisReference}
                          referenceContext={
                            analysisReference
                              ? `Pattern: ${analysisReference.pattern}`
                              : null
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Yearly Posts */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Top Posts of the Year
                  </h3>
                  <div className="grid gap-4">
                    {yearlyPosts.map((post) => {
                      const analysisReference = analysisResults[
                        selectedSubreddit.name
                      ]?.patterns?.find((pattern) =>
                        pattern.examples?.some(
                          (example) => example.postId === post.id
                        )
                      );
                      return (
                        <PostCard
                          key={post.id}
                          post={post}
                          isReferenced={!!analysisReference}
                          referenceContext={
                            analysisReference
                              ? `Pattern: ${analysisReference.pattern}`
                              : null
                          }
                        />
                      );
                    })}
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

          {/* Content Analysis Section */}
          {analysisResults[selectedSubreddit?.name] && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-purple-900/50 rounded-xl p-6 backdrop-blur-sm border border-purple-700/50 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Content Analysis
                </h3>
                <div className="prose prose-invert max-w-none">
                  {analysisResults[selectedSubreddit?.name]
                    .split("\n")
                    .map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                </div>
              </div>

              <SuggestedTitles
                analysis={{
                  patterns:
                    analysisResults[selectedSubreddit?.name]?.patterns || [],
                  stats: postStats[selectedSubreddit?.name] || {},
                  analysis: analysisResults[selectedSubreddit?.name] || "",
                }}
                product={
                  businesses.find((b) => b.id === selectedBusiness)?.product
                }
                marketingTool={marketingTool}
                redditService={redditService}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
