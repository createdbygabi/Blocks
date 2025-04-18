"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

function CompactFeedbackItem({ feedback }) {
  const formattedDate = new Date(feedback.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

  // Add fallback for missing email
  const email = feedback.submitted_by_email || "anonymous";
  const firstLetter =
    email !== "anonymous" ? email.charAt(0).toUpperCase() : "A";

  return (
    <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-800/50 rounded-lg group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0 flex items-center justify-center">
          <span className="text-blue-400 text-sm">{firstLetter}</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm text-gray-300 truncate">
            {feedback.message}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">{formattedDate}</span>
            <span className="text-gray-600">•</span>
            <span className="text-blue-400">{email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessFeedbackSection({ business, feedbackList = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <span className="text-blue-400 font-medium">
                {business.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">{business.name}</h3>
            <div className="text-sm text-gray-400">
              {feedbackList.length} feedback items
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-800">
          <div className="divide-y divide-gray-800">
            {feedbackList.map((feedback) => (
              <CompactFeedbackItem key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [feedbackByBusiness, setFeedbackByBusiness] = useState({});
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, byBusiness: {} });

  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Starting data fetch...");

      // First, fetch all businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select("id, name, logo_url")
        .order("name");

      if (businessesError) throw businessesError;
      console.log("Fetched businesses:", businessesData?.length, "businesses");
      console.log("Business data:", businessesData);

      // Then fetch all feedback with business details
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (feedbackError) throw feedbackError;
      console.log("Fetched feedback:", feedbackData?.length, "feedback items");
      console.log("Raw feedback data:", feedbackData);

      // Calculate statistics
      const statsData = {
        total: feedbackData?.length || 0,
        byBusiness: {},
      };

      // Organize feedback by business more efficiently
      const feedbackMap = {};
      feedbackData?.forEach((feedback) => {
        if (!feedbackMap[feedback.business_id]) {
          feedbackMap[feedback.business_id] = [];
          statsData.byBusiness[feedback.business_id] = 0;
        }
        feedbackMap[feedback.business_id].push(feedback);
        statsData.byBusiness[feedback.business_id]++;
      });

      console.log("Organized feedback map:", feedbackMap);
      console.log("Statistics:", statsData);

      setBusinesses(businessesData || []);
      setFeedbackByBusiness(feedbackMap);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the sorted businesses for better performance
  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => {
      const countA = stats.byBusiness[a.id] || 0;
      const countB = stats.byBusiness[b.id] || 0;
      return countB - countA; // Sort by feedback count, most first
    });
  }, [businesses, stats.byBusiness]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Stats */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">User Feedback</h1>
              <p className="text-gray-400 mt-1">
                {stats.total} total feedback items across {businesses.length}{" "}
                SaaS products
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Feedback</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">
                {businesses.length}
              </div>
              <div className="text-sm text-gray-400">SaaS Products</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {sortedBusinesses.map((business) => (
            <BusinessFeedbackSection
              key={business.id}
              business={business}
              feedbackList={feedbackByBusiness[business.id] || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
