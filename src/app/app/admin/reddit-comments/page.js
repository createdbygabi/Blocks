"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

export default function RedditCommentsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [keywords, setKeywords] = useState("");
  const [businessKeywords, setBusinessKeywords] = useState({});
  const [redditContent, setRedditContent] = useState({});
  const [expandedBusinesses, setExpandedBusinesses] = useState({});

  useEffect(() => {
    if (user && user.id !== ADMIN_USER_ID) {
      router.push("/");
      return;
    }

    if (user?.id === ADMIN_USER_ID) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Initialize all businesses as collapsed when data is loaded
    if (businesses.length > 0) {
      const initialExpanded = businesses.reduce((acc, business) => {
        acc[business.id] = false;
        return acc;
      }, {});
      setExpandedBusinesses(initialExpanded);
    }
  }, [businesses]);

  const fetchData = async () => {
    try {
      const [businessesResponse, keywordsResponse, contentResponse] =
        await Promise.all([
          supabase
            .from("businesses")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.from("reddit_comments_keywords").select("*"),
          supabase
            .from("reddit_comments_content")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (businessesResponse.error) throw businessesResponse.error;
      if (keywordsResponse.error) throw keywordsResponse.error;
      if (contentResponse.error) throw contentResponse.error;

      console.log("Raw businesses data:", businessesResponse.data);
      console.log("Raw keywords data:", keywordsResponse.data);

      setBusinesses(businessesResponse.data);

      // Create a map of business_id to keywords
      const keywordsMap = {};
      keywordsResponse.data.forEach((item) => {
        console.log("Processing keyword item:", item);
        if (item.business_id && item.keywords) {
          keywordsMap[item.business_id] = item.keywords;
        } else {
          console.log(
            "Invalid keyword item - missing business_id or keywords:",
            item
          );
        }
      });

      console.log("Final keywords map:", keywordsMap);
      console.log(
        "Number of businesses with keywords:",
        Object.keys(keywordsMap).length
      );
      setBusinessKeywords(keywordsMap);

      // Create a map of business_id to content
      const contentMap = {};
      contentResponse.data.forEach((item) => {
        if (!contentMap[item.business_id]) {
          contentMap[item.business_id] = [];
        }
        contentMap[item.business_id].push(item);
      });

      // Sort content by email_date for each business
      Object.keys(contentMap).forEach((businessId) => {
        contentMap[businessId].sort((a, b) => {
          return new Date(b.email_date) - new Date(a.email_date);
        });
      });

      setRedditContent(contentMap);

      if (businessesResponse.data.length > 0 && !selectedBusiness) {
        setSelectedBusiness(businessesResponse.data[0].id);
      }
      checkGmailConnection();
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const parseEmail = async (email) => {
    console.log("Processing email:", email.subject);

    if (!email.subject.includes("F5Bot found something")) {
      console.log("Not an F5Bot email, skipping");
      return;
    }

    try {
      // Extract subreddit and title
      const subredditMatch = email.body.match(
        /Reddit (Comments|Posts) \(\/r\/([^)]+)\)/
      );
      console.log("Subreddit match:", subredditMatch);

      if (!subredditMatch) {
        console.log("No subreddit match found in email body");
        return;
      }

      const postType = subredditMatch[1].toLowerCase();
      const subreddit = subredditMatch[2];
      const title = email.body.split("): ")[1].split("\n")[0];
      const permalink =
        email.body.match(/https:\/\/www\.reddit\.com[^\s]+/)?.[0] || "";

      console.log("Extracted data:", {
        postType,
        subreddit,
        title,
        permalink,
      });

      // Check if this content is already in the database
      const { data: existingContent, error: checkError } = await supabase
        .from("reddit_content")
        .select("id")
        .eq("permalink", permalink)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking for existing content:", checkError);
      }

      if (existingContent) {
        console.log("Content already exists in database:", permalink);
        return;
      }

      // Find matching businesses based on keywords
      console.log("Available business keywords:", businessKeywords);

      const matchingBusinesses = Object.entries(businessKeywords).filter(
        ([_, keywords]) =>
          keywords.some((keyword) =>
            email.body.toLowerCase().includes(keyword.toLowerCase())
          )
      );

      console.log("Matching businesses:", matchingBusinesses);

      if (matchingBusinesses.length === 0) {
        console.log("No matching keywords found for content:", title);
        return;
      }

      // Store content for each matching business
      for (const [businessId, keywords] of matchingBusinesses) {
        const matchedKeywords = keywords.filter((keyword) =>
          email.body.toLowerCase().includes(keyword.toLowerCase())
        );

        console.log("Storing content for business:", {
          businessId,
          matchedKeywords,
          title,
        });

        const { data, error } = await supabase
          .from("reddit_content")
          .insert({
            business_id: businessId,
            subreddit,
            title,
            content: email.body,
            permalink,
            post_type: postType,
            matched_keywords: matchedKeywords,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error(
            "Error storing content for business:",
            businessId,
            error
          );
          continue;
        }

        console.log("Successfully stored content:", data);
      }

      // Refresh the data to show new content
      console.log("Refreshing data after storing content");
      fetchData();
    } catch (err) {
      console.error("Error parsing email:", err);
      setError("Failed to parse email");
    }
  };

  const getCurrentKeywords = () => {
    return businessKeywords[selectedBusiness] || [];
  };

  const addKeywords = async () => {
    if (!selectedBusiness || !keywords) return;

    try {
      const newKeywords = keywords.split(",").map((k) => k.trim());
      const currentKeywords = getCurrentKeywords();
      const updatedKeywords = [
        ...new Set([...currentKeywords, ...newKeywords]),
      ]; // Remove duplicates

      const { error } = await supabase.from("reddit_comments_keywords").upsert(
        {
          business_id: selectedBusiness,
          keywords: updatedKeywords,
        },
        {
          onConflict: "business_id",
          ignoreDuplicates: false,
        }
      );

      if (error) throw error;

      setKeywords("");
      setBusinessKeywords((prev) => ({
        ...prev,
        [selectedBusiness]: updatedKeywords,
      }));
    } catch (err) {
      console.error("Error adding keywords:", err);
      setError("Failed to add keywords");
    }
  };

  const deleteKeywords = async () => {
    if (!selectedBusiness) return;

    try {
      const { error } = await supabase
        .from("reddit_comments_keywords")
        .delete()
        .eq("business_id", selectedBusiness);

      if (error) throw error;

      setBusinessKeywords((prev) => {
        const newKeywords = { ...prev };
        delete newKeywords[selectedBusiness];
        return newKeywords;
      });
    } catch (err) {
      console.error("Error deleting keywords:", err);
      setError("Failed to delete keywords");
    }
  };

  const checkGmailConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("gmail_connections")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setGmailConnected(data && data.length > 0);
    } catch (err) {
      console.error("Error checking Gmail connection:", err);
      setError("Failed to check Gmail connection");
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = async () => {
    try {
      console.log("Initiating Gmail connection for user:", user?.id);
      const response = await fetch("/api/gmail/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate Gmail connection");
      }

      window.location.href = data.authUrl;
    } catch (err) {
      console.error("Error connecting Gmail:", err);
      setError(err.message);
    }
  };

  const fetchEmails = async () => {
    try {
      console.log("Step 1: Fetching emails...");
      setLoading(true);
      setNotification("Fetching emails...");
      const response = await fetch(`/api/gmail/emails?userId=${user?.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch emails");
      }

      console.log(
        "All fetched emails:",
        data.emails.map((email) => ({
          id: email.id,
          subject: email.subject,
          date: email.date,
          isF5Bot: email.subject?.includes("F5Bot found something"),
          firstLine: email.body?.split("\n")[0],
        }))
      );

      // Get list of already processed email IDs
      const { data: processedEmails } = await supabase
        .from("reddit_comments_processed_emails")
        .select("email_id");

      const processedEmailIds = new Set(
        processedEmails?.map((e) => e.email_id) || []
      );

      console.log("Already processed email IDs:", [...processedEmailIds]);

      // Filter out already processed emails and non-F5Bot emails
      const newEmails = data.emails.filter(
        (email) =>
          email.subject?.includes("F5Bot found something") &&
          !processedEmailIds.has(email.id)
      );

      console.log(
        "New F5Bot emails to process:",
        newEmails.map((email) => ({
          id: email.id,
          subject: email.subject,
          date: email.date,
          firstLine: email.body?.split("\n")[0],
        }))
      );

      setNotification(
        `Found ${newEmails.length} new F5Bot emails to process...`
      );
      console.log(`Found ${newEmails.length} new F5Bot emails to process`);

      // Process only new emails
      const allContent = [];
      const processedKeywords = new Set();

      newEmails.forEach((email) => {
        // Split email body into lines
        const lines = email.body.split("\n");
        let currentKeyword = "";

        lines.forEach((line) => {
          // Check if line starts with "Keyword:"
          if (line.trim().startsWith("Keyword:")) {
            // Extract only the first keyword from quotes if multiple exist
            const match = line.match(/Keyword: "([^"]+)"/);
            if (match) {
              // Take only the first keyword if there are multiple separated by comma
              currentKeyword = match[1].split(",")[0].trim();
              processedKeywords.add(currentKeyword);
              console.log("Extracted keyword:", currentKeyword);
            }
          }
          // Check if line contains Reddit content
          else if (line.includes("Reddit") && line.includes("/r/")) {
            // Extract type, subreddit, and title
            const match = line.match(
              /Reddit (Comments|Posts) \(\/r\/([^)]+)\): ([^\n]+)/
            );
            if (match) {
              const [_, type, subreddit, title] = match;

              // Find the URL in the next line
              const nextLine = lines[lines.indexOf(line) + 1];
              const urlMatch = nextLine?.match(/(https:\/\/[^\s]+)/);

              if (urlMatch) {
                allContent.push({
                  keyword: currentKeyword,
                  type,
                  subreddit,
                  title,
                  url: urlMatch[1],
                  emailId: email.id,
                  emailDate: email.date,
                });
              }
            }
          }
        });
      });

      setNotification(
        `Processing ${
          allContent.length
        } content items with keywords: ${Array.from(processedKeywords).join(
          ", "
        )}...`
      );
      console.log("All content found:", allContent);

      // Step 5: Match content with businesses based on keywords
      console.log("Step 5: Matching content with businesses...");
      const matchedContent = allContent.map((content) => {
        // Find matching businesses for this content's keyword
        const matchingBusinesses = Object.entries(businessKeywords).filter(
          ([_, keywords]) =>
            keywords.some(
              (keyword) =>
                content.keyword.toLowerCase().includes(keyword.toLowerCase()) ||
                keyword.toLowerCase().includes(content.keyword.toLowerCase())
            )
        );

        // If we found matching businesses, add the first one's ID
        if (matchingBusinesses.length > 0) {
          return {
            ...content,
            business_id: matchingBusinesses[0][0], // Take the first matching business ID
          };
        }

        return content;
      });

      const matchedCount = matchedContent.filter((c) => c.business_id).length;
      setNotification(
        `Found ${matchedCount} matches with business keywords...`
      );
      console.log("Matched content with businesses:", matchedContent);

      // Step 6: Save content to database and mark emails as processed
      console.log("Step 6: Saving to database...");

      // Save matched content to reddit_comments_content
      const contentToSave = matchedContent
        .filter((content) => content.business_id) // Only save content with matched business
        .map((content) => ({
          business_id: content.business_id,
          keyword: content.keyword,
          type: content.type,
          subreddit: content.subreddit,
          title: content.title,
          url: content.url,
          email_id: content.emailId,
          email_date: content.emailDate,
          created_at: new Date().toISOString(),
        }));

      if (contentToSave.length > 0) {
        const { error: contentError } = await supabase
          .from("reddit_comments_content")
          .upsert(contentToSave, {
            onConflict: "url",
            ignoreDuplicates: true,
          });

        if (contentError) {
          console.error("Error saving content:", contentError);
          setNotification(`Error saving content: ${contentError.message}`);
        }
      }

      // Mark all processed emails in reddit_comments_processed_emails
      const emailsToMark = newEmails.map((email) => ({
        email_id: email.id,
        processed_at: new Date().toISOString(),
      }));

      if (emailsToMark.length > 0) {
        const { error: processedError } = await supabase
          .from("reddit_comments_processed_emails")
          .insert(emailsToMark);

        if (processedError) {
          console.error("Error marking emails as processed:", processedError);
          setNotification(
            `Error marking emails as processed: ${processedError.message}`
          );
        }
      }

      const summary = `Processed ${newEmails.length} new emails, found ${allContent.length} content items with ${processedKeywords.size} keywords, saved ${contentToSave.length} matches to database.`;
      console.log(summary);
      setNotification(summary);

      // Refresh the data to show new content
      fetchData();

      setEmails(matchedContent);

      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error("Error in fetchEmails:", err);
      setError(err.message);
      setNotification(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (businessId) => {
    setExpandedBusinesses((prev) => ({
      ...prev,
      [businessId]: !prev[businessId],
    }));
  };

  if (!user || user.id !== ADMIN_USER_ID) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {notification && (
          <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-blue-500/10 text-blue-400 p-3 sm:p-4 rounded-lg border border-blue-500/20 shadow-lg text-sm sm:text-base">
            {notification}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-[3px] bg-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold">
              Reddit Comments Manager
            </h1>
          </div>
          {gmailConnected && (
            <button
              onClick={fetchEmails}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Fetch Last Emails
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 text-red-400 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Keywords Management Section */}
        <div className="mb-6 sm:mb-8 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Business Keywords
          </h2>
          <div className="flex flex-col gap-3 sm:gap-4">
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Keywords (comma separated)"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base"
              />
              <button
                onClick={addKeywords}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {selectedBusiness && (
            <div className="mt-3 sm:mt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-800 p-3 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {getCurrentKeywords().map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                  {getCurrentKeywords().length === 0 && (
                    <span className="text-gray-400 text-sm">
                      No keywords set
                    </span>
                  )}
                </div>
                {getCurrentKeywords().length > 0 && (
                  <button
                    onClick={deleteKeywords}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reddit Content Section */}
        <div className="mb-6 sm:mb-8 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Reddit Content
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {businesses.map((business) => {
              const content = redditContent[business.id] || [];
              if (content.length === 0) return null;
              const isExpanded = expandedBusinesses[business.id];

              return (
                <div
                  key={business.id}
                  className="space-y-3 border border-gray-800 rounded-lg p-3 sm:p-4"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleExpanded(business.id)}
                  >
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={`${business.name} logo`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-400">
                          {business.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-blue-400">
                        {business.name}
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-400">
                        ({content.length} items)
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isExpanded && (
                    <div className="grid gap-3 mt-3 sm:mt-4">
                      {content.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-800 p-3 rounded-lg flex flex-col gap-3"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded whitespace-nowrap">
                                {item.keyword}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400 whitespace-nowrap">
                                r/{item.subreddit}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400 whitespace-nowrap">
                                {item.type}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium line-clamp-2">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <div className="bg-indigo-500/20 px-2 sm:px-3 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-indigo-300 font-medium text-xs sm:text-sm whitespace-nowrap">
                                {new Date(item.email_date).toLocaleDateString(
                                  [],
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="bg-purple-500/20 px-2 sm:px-3 py-1.5 rounded-lg border border-purple-500/30 flex items-center gap-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400 shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                              </svg>
                              <span className="text-purple-300 font-medium text-xs sm:text-sm whitespace-nowrap">
                                {new Date(item.email_date).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-700/50">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap"
                            >
                              View on Reddit →
                            </a>
                            <select
                              value={item.status || "pending"}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const { error } = await supabase
                                    .from("reddit_comments_content")
                                    .update({
                                      status: newStatus,
                                      updated_at: new Date().toISOString(),
                                    })
                                    .eq("id", item.id);

                                  if (error) throw error;

                                  setRedditContent((prev) => ({
                                    ...prev,
                                    [business.id]: prev[business.id].map(
                                      (content) =>
                                        content.id === item.id
                                          ? {
                                              ...content,
                                              status: newStatus,
                                            }
                                          : content
                                    ),
                                  }));
                                } catch (error) {
                                  console.error(
                                    "Error updating status:",
                                    error
                                  );
                                }
                              }}
                              className={`w-full sm:w-auto text-xs sm:text-sm px-2 py-1 rounded border ${
                                item.status === "replied"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : item.status === "not_relevant"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              }`}
                            >
                              <option value="pending">To Process</option>
                              <option value="replied">Replied</option>
                              <option value="not_relevant">Not Relevant</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {Object.keys(redditContent).length === 0 && (
              <div className="text-center text-gray-400 py-6 sm:py-8 text-sm sm:text-base">
                No Reddit content found for any business
              </div>
            )}
          </div>
        </div>

        {/* Gmail Connection Section */}
        {!gmailConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Connect Gmail Account
            </h2>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Connect your Gmail account to automatically fetch and parse Reddit
              comment notifications.
            </p>
            <button
              onClick={connectGmail}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Connect Gmail
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">
                Recent Emails
              </h2>
              <button
                onClick={fetchEmails}
                className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {emails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">
                        {email.subject}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        {new Date(email.date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => parseEmail(email)}
                      className="w-full sm:w-auto px-3 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded text-sm font-medium transition-colors"
                    >
                      Parse
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
