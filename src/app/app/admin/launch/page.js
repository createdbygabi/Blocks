"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { FiTrash2, FiExternalLink, FiEdit2, FiX } from "react-icons/fi";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

function Launch({ launch, onDelete, businesses }) {
  const [redditStats, setRedditStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newRedditUrls, setNewRedditUrls] = useState("");
  const [newTwitterUrls, setNewTwitterUrls] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState({
    reddit: [],
    twitter: [],
  });

  const business = businesses.find((b) => b.id === launch.business_id);

  useEffect(() => {
    fetchRedditStats();
  }, []);

  const fetchRedditStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const redditUrls = launch.reddit_posts || [];
      const stats = {};

      for (const post of redditUrls) {
        const url = post.url;
        const matches = url.match(/comments\/([a-zA-Z0-9]+)/);
        if (matches && matches[1]) {
          const postId = matches[1];
          const response = await fetch("/api/reddit/post/" + postId, {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_REDDIT_ACCESS_TOKEN}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            stats[url] = data;
          } else {
            setError("Failed to fetch Reddit stats. Please try again later.");
          }
        }
      }

      setRedditStats(stats);
    } catch (error) {
      console.error("Error fetching Reddit stats:", error);
      setError(
        "An error occurred while fetching stats. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (type, index) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const updatedPosts = {
        reddit_posts: [...launch.reddit_posts],
        twitter_posts: [...launch.twitter_posts],
      };

      if (type === "reddit") {
        updatedPosts.reddit_posts.splice(index, 1);
      } else {
        updatedPosts.twitter_posts.splice(index, 1);
      }

      const { error } = await supabase
        .from("business_launches")
        .update({
          reddit_posts: updatedPosts.reddit_posts,
          twitter_posts: updatedPosts.twitter_posts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", launch.id);

      if (error) throw error;

      // Refresh Reddit stats
      await fetchRedditStats();
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLaunch = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Process new Reddit URLs
      const newRedditList = newRedditUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url && url.includes("reddit.com"))
        .map((url) => ({ url }));

      // Process new Twitter URLs
      const newTwitterList = newTwitterUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(
          (url) => url && (url.includes("twitter.com") || url.includes("x.com"))
        )
        .map((url) => ({ url }));

      // Combine existing and new URLs
      const updatedRedditPosts = [
        ...(launch.reddit_posts || []),
        ...newRedditList,
      ];
      const updatedTwitterPosts = [
        ...(launch.twitter_posts || []),
        ...newTwitterList,
      ];

      const { error } = await supabase
        .from("business_launches")
        .update({
          reddit_posts: updatedRedditPosts,
          twitter_posts: updatedTwitterPosts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", launch.id);

      if (error) throw error;

      // Refresh Reddit stats for new posts
      await fetchRedditStats();

      // Reset form
      setNewRedditUrls("");
      setNewTwitterUrls("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating launch:", error);
      setError("Failed to update launch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 shadow-lg border border-gray-700/30 hover:border-gray-700/50 cursor-pointer"
      onClick={() => !isEditing && setIsExpanded(!isExpanded)}
    >
      <div className="space-y-4">
        {/* Header with app info, date and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center overflow-hidden border border-gray-700/30">
              {business?.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium text-gray-400">
                  {business?.name?.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-white">
                {business?.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1 rounded-full border border-orange-500/20">
                  <span className="text-sm text-white">
                    {new Date(launch.launch_date).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(launch.launch_date).toLocaleTimeString(
                      undefined,
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="text-gray-400 hover:text-orange-400 p-2 rounded-lg hover:bg-orange-400/10 transition-all duration-200"
              title={isEditing ? "Cancel editing" : "Edit launch"}
            >
              {isEditing ? (
                <FiX className="w-4 h-4" />
              ) : (
                <FiEdit2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(launch.id);
              }}
              className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-all duration-200"
              title="Delete launch"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Add Reddit URLs
              </label>
              <textarea
                value={newRedditUrls}
                onChange={(e) => setNewRedditUrls(e.target.value)}
                placeholder="Paste Reddit URLs here&#10;One URL per line"
                rows={3}
                className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                {newRedditUrls.split("\n").filter((url) => url.trim()).length}{" "}
                URLs added
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Add Twitter URLs
              </label>
              <textarea
                value={newTwitterUrls}
                onChange={(e) => setNewTwitterUrls(e.target.value)}
                placeholder="Paste Twitter URLs here&#10;One URL per line"
                rows={3}
                className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                {newTwitterUrls.split("\n").filter((url) => url.trim()).length}{" "}
                URLs added
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdateLaunch}
                disabled={
                  isSubmitting ||
                  (!newRedditUrls.trim() && !newTwitterUrls.trim())
                }
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewRedditUrls("");
                  setNewTwitterUrls("");
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-700/50 text-white rounded-lg text-sm font-medium hover:bg-gray-700/70 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Reddit Posts */}
            {launch.reddit_posts?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-orange-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Reddit Posts
                </h3>
                <div className="space-y-3">
                  {launch.reddit_posts.map((post, index) => (
                    <div key={index} className="group relative">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-all duration-300 group border border-gray-700/30 hover:border-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FiExternalLink className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-orange-400 group-hover:text-orange-300 transition-colors">
                                  r/{post.url.split("/r/")[1].split("/")[0]}
                                </span>
                                {redditStats[post.url]?.title && (
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                )}
                                {redditStats[post.url]?.title && (
                                  <span className="text-sm text-white line-clamp-1">
                                    {redditStats[post.url].title}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-400">
                                Loading...
                              </span>
                            </div>
                          ) : redditStats[post.url] ? (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                                <span className="text-xs text-orange-400">
                                  ↑
                                </span>
                                <span className="text-sm font-medium text-white">
                                  {redditStats[post.url].score}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 bg-gray-700/30 px-3 py-1.5 rounded-full">
                                <span className="text-xs text-gray-400">
                                  Comments:
                                </span>
                                <span className="text-sm font-medium text-white">
                                  {redditStats[post.url].numComments}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 bg-gray-700/30 px-3 py-1.5 rounded-full">
                                <span className="text-xs text-gray-400">
                                  Ratio:
                                </span>
                                <span className="text-sm font-medium text-white">
                                  {(
                                    redditStats[post.url].upvoteRatio * 100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost("reddit", index);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500"
                        title="Delete post"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Twitter Posts */}
            {launch.twitter_posts?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Twitter Posts
                </h3>
                <div className="space-y-3">
                  {launch.twitter_posts.map((post, index) => (
                    <div key={index} className="group relative">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-all duration-300 group border border-gray-700/30 hover:border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <FiExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          <span className="text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                            View Tweet
                          </span>
                        </div>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost("twitter", index);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500"
                        title="Delete post"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BusinessLaunches({ business, onLaunchAdded }) {
  const [launches, setLaunches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [redditUrls, setRedditUrls] = useState("");
  const [twitterUrls, setTwitterUrls] = useState("");
  const [launchDate, setLaunchDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLaunch, setSelectedLaunch] = useState(null);

  useEffect(() => {
    fetchLaunches();
  }, [business.id]);

  const fetchLaunches = async () => {
    const { data, error } = await supabase
      .from("business_launches")
      .select("*")
      .eq("business_id", business.id)
      .order("launch_date", { ascending: false });

    if (error) {
      console.error("Error fetching launches:", error);
      return;
    }

    setLaunches(data || []);
  };

  const handleSaveLaunch = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Process Reddit URLs
      const redditList = redditUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url && url.includes("reddit.com"))
        .map((url) => ({ url }));

      // Process Twitter URLs
      const twitterList = twitterUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(
          (url) => url && (url.includes("twitter.com") || url.includes("x.com"))
        )
        .map((url) => ({ url }));

      if (redditList.length === 0 && twitterList.length === 0) {
        setError("Please add at least one valid Reddit or Twitter URL");
        return;
      }

      if (selectedLaunch) {
        // Update existing launch
        const { error } = await supabase
          .from("business_launches")
          .update({
            reddit_posts: [
              ...(selectedLaunch.reddit_posts || []),
              ...redditList,
            ],
            twitter_posts: [
              ...(selectedLaunch.twitter_posts || []),
              ...twitterList,
            ],
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedLaunch.id);

        if (error) throw error;
      } else {
        // Create new launch
        const { error } = await supabase.from("business_launches").insert([
          {
            business_id: business.id,
            launch_date: new Date(launchDate).toISOString(),
            reddit_posts: redditList,
            twitter_posts: twitterList,
          },
        ]);

        if (error) throw error;
      }

      setShowForm(false);
      setRedditUrls("");
      setTwitterUrls("");
      setLaunchDate(new Date().toISOString().split("T")[0]);
      setSelectedLaunch(null);
      fetchLaunches();
      onLaunchAdded();
    } catch (error) {
      console.error("Error saving launch:", error);
      setError("Failed to save launch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLaunch = async (launchId) => {
    if (!confirm("Are you sure you want to delete this launch?")) return;

    try {
      const { error } = await supabase
        .from("business_launches")
        .delete()
        .eq("id", launchId);

      if (error) throw error;
      fetchLaunches();
    } catch (error) {
      console.error("Error deleting launch:", error);
      setError("Failed to delete launch. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900/30 rounded-xl p-6 space-y-4 border border-gray-700/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center overflow-hidden border border-gray-700/30">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-medium text-gray-400">
                {business.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">{business.name}</h2>
            <p className="text-sm text-gray-400">{launches.length} launches</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedLaunch(launches[0]); // Select the most recent launch
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
          >
            Add Links
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-4 p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {selectedLaunch ? "Add Links to Launch" : "Create New Launch"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedLaunch(null);
                setRedditUrls("");
                setTwitterUrls("");
                setError(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          {!selectedLaunch && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Launch Date
              </label>
              <input
                type="datetime-local"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Reddit URLs
            </label>
            <textarea
              value={redditUrls}
              onChange={(e) => setRedditUrls(e.target.value)}
              placeholder="Paste Reddit URLs here&#10;One URL per line"
              rows={3}
              className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
            <p className="text-xs text-gray-400 mt-1">
              {redditUrls.split("\n").filter((url) => url.trim()).length} URLs
              added
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Twitter URLs
            </label>
            <textarea
              value={twitterUrls}
              onChange={(e) => setTwitterUrls(e.target.value)}
              placeholder="Paste Twitter URLs here&#10;One URL per line"
              rows={3}
              className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
            <p className="text-xs text-gray-400 mt-1">
              {twitterUrls.split("\n").filter((url) => url.trim()).length} URLs
              added
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSaveLaunch}
            disabled={
              isSubmitting || (!redditUrls.trim() && !twitterUrls.trim())
            }
            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : selectedLaunch ? (
              "Add Links"
            ) : (
              "Create Launch"
            )}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {launches.map((launch) => (
          <Launch
            key={launch.id}
            launch={launch}
            onDelete={handleDeleteLaunch}
            businesses={[business]}
          />
        ))}
      </div>
    </div>
  );
}

export default function LaunchPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [businessesWithLaunches, setBusinessesWithLaunches] = useState([]);
  const [error, setError] = useState(null);
  const [showAddLaunch, setShowAddLaunch] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [redditUrls, setRedditUrls] = useState("");
  const [twitterUrls, setTwitterUrls] = useState("");
  const [launchDate, setLaunchDate] = useState(
    new Date().toISOString().split(".")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) {
      fetchBusinesses();
    }
  }, [user]);

  const handleSaveLaunch = async () => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      if (!selectedBusiness) {
        setFormError("Please select a business");
        return;
      }

      // Process Reddit URLs
      const redditList = redditUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url && url.includes("reddit.com"))
        .map((url) => ({ url }));

      // Process Twitter URLs
      const twitterList = twitterUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(
          (url) => url && (url.includes("twitter.com") || url.includes("x.com"))
        )
        .map((url) => ({ url }));

      if (redditList.length === 0 && twitterList.length === 0) {
        setFormError("Please add at least one valid Reddit or Twitter URL");
        return;
      }

      const { error } = await supabase.from("business_launches").insert([
        {
          business_id: selectedBusiness.id,
          launch_date: new Date(launchDate).toISOString(),
          reddit_posts: redditList,
          twitter_posts: twitterList,
        },
      ]);

      if (error) throw error;

      // Reset form
      setShowAddLaunch(false);
      setSelectedBusiness(null);
      setRedditUrls("");
      setTwitterUrls("");
      setLaunchDate(new Date().toISOString().split(".")[0]);
      fetchBusinesses();
    } catch (error) {
      console.error("Error saving launch:", error);
      setFormError("Failed to save launch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      // Get all businesses
      const { data: allBusinesses, error: businessesError } = await supabase
        .from("businesses")
        .select("id, name, logo_url")
        .order("name");

      if (businessesError) throw businessesError;

      // Get businesses with launches
      const { data: launches, error: launchesError } = await supabase
        .from("business_launches")
        .select("business_id");

      if (launchesError) throw launchesError;

      const businessIdsWithLaunches = [
        ...new Set(launches.map((l) => l.business_id)),
      ];
      const businessesWithLaunches = allBusinesses.filter((b) =>
        businessIdsWithLaunches.includes(b.id)
      );

      setBusinesses(allBusinesses);
      setBusinessesWithLaunches(businessesWithLaunches);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Launch Tracker</h1>
            <p className="text-sm text-gray-400 mt-1">
              Track and monitor your launches
            </p>
          </div>
          <button
            onClick={() => setShowAddLaunch(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
          >
            Add New Launch
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {showAddLaunch && (
          <div className="bg-gray-800/50 rounded-lg p-6 space-y-4 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Add New Launch</h2>
              <button
                onClick={() => {
                  setShowAddLaunch(false);
                  setSelectedBusiness(null);
                  setRedditUrls("");
                  setTwitterUrls("");
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Business
                </label>
                <select
                  value={selectedBusiness?.id || ""}
                  onChange={(e) => {
                    const business = businesses.find(
                      (b) => b.id === e.target.value
                    );
                    setSelectedBusiness(business);
                  }}
                  className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                >
                  <option value="">Select a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Launch Date
                </label>
                <input
                  type="datetime-local"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Reddit URLs
                </label>
                <textarea
                  value={redditUrls}
                  onChange={(e) => setRedditUrls(e.target.value)}
                  placeholder="Paste Reddit URLs here&#10;One URL per line"
                  rows={3}
                  className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {redditUrls.split("\n").filter((url) => url.trim()).length}{" "}
                  URLs added
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Twitter URLs
                </label>
                <textarea
                  value={twitterUrls}
                  onChange={(e) => setTwitterUrls(e.target.value)}
                  placeholder="Paste Twitter URLs here&#10;One URL per line"
                  rows={3}
                  className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {twitterUrls.split("\n").filter((url) => url.trim()).length}{" "}
                  URLs added
                </p>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-400">{formError}</p>
                </div>
              )}

              <button
                onClick={handleSaveLaunch}
                disabled={
                  isSubmitting ||
                  !selectedBusiness ||
                  (!redditUrls.trim() && !twitterUrls.trim())
                }
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Launch"
                )}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {businessesWithLaunches.map((business) => (
            <BusinessLaunches
              key={business.id}
              business={business}
              onLaunchAdded={fetchBusinesses}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
