"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ADMIN_USER_ID = "911d26f9-2fe3-4165-9659-2cd038471795";

export default function RedditPostsPage() {
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
  const [activeTab, setActiveTab] = useState("pending");
  const [generatingResponseFor, setGeneratingResponseFor] = useState(null);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [todayRepliedCount, setTodayRepliedCount] = useState(0);
  const [businessReplies, setBusinessReplies] = useState({});
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showEvaluationDetails, setShowEvaluationDetails] = useState({});
  const [savedResponses, setSavedResponses] = useState({});

  useEffect(() => {
    if (user && user.id !== ADMIN_USER_ID) {
      router.push("/");
      return;
    }

    if (user?.id === ADMIN_USER_ID) {
      fetchData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count replies by business
    const businessReplies = {};
    let totalTodayReplies = 0;

    Object.entries(redditContent).forEach(([businessId, items]) => {
      const todayReplies = items.filter((item) => {
        if (item.status === "replied") {
          const itemDate = new Date(item.updated_at || item.created_at);
          return itemDate >= today;
        }
        return false;
      }).length;

      const totalReplies = items.filter(
        (item) => item.status === "replied"
      ).length;

      businessReplies[businessId] = {
        today: todayReplies,
        total: totalReplies,
      };

      totalTodayReplies += todayReplies;
    });

    setTodayRepliedCount(totalTodayReplies);
    // Store the business-specific counts
    setBusinessReplies(businessReplies);
  }, [redditContent]);

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

      // Initialize expanded state only for new businesses
      setExpandedBusinesses((prev) => {
        const newExpanded = { ...prev };
        businessesResponse.data.forEach((business) => {
          if (!(business.id in newExpanded)) {
            newExpanded[business.id] = false;
          }
        });
        return newExpanded;
      });

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
      contentResponse.data
        .filter((item) => {
          if (activeTab === "pending") {
            return item.status !== "not_relevant" && item.status !== "replied";
          } else if (activeTab === "evaluated") {
            // Show posts that have been evaluated (regardless of status)
            return item.evaluation_date !== null && item.status !== "replied";
          } else if (activeTab === "ready") {
            // Show only evaluated posts that are matches and haven't been replied to
            return (
              item.is_matching === true &&
              item.status !== "replied" &&
              item.status !== "not_relevant"
            );
          } else if (activeTab === "replied") {
            return item.status === "replied";
          }
          return false;
        })
        .forEach((item) => {
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

      // Load saved responses from the database
      const { data: savedResponsesData, error: savedResponsesError } =
        await supabase
          .from("reddit_comments_content")
          .select("id, generated_response")
          .filter("generated_response", "not.is", null);

      if (!savedResponsesError && savedResponsesData) {
        const responseMap = {};
        savedResponsesData.forEach((item) => {
          if (item.generated_response) {
            responseMap[item.id] = item.generated_response;
          }
        });
        setSavedResponses(responseMap);
      }

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
      const subredditMatch = email.body.match(/Reddit Posts \(\/r\/([^)]+)\)/);
      console.log("Subreddit match:", subredditMatch);

      if (!subredditMatch) {
        console.log(
          "No subreddit match found in email body or not a Reddit Post"
        );
        return;
      }

      const postType = "posts";
      const subreddit = subredditMatch[1];
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
          body: email.body,
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
      const seenUrls = new Set(); // Track seen URLs to detect duplicates

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
          // Check if line contains Reddit content AND specifically "Reddit Posts" (not Comments)
          else if (line.includes("Reddit Posts") && line.includes("/r/")) {
            // Extract type, subreddit, and title
            const match = line.match(
              /Reddit (Posts) \(\/r\/([^)]+)\): ([^\n]+)/
            );
            if (match) {
              const [_, type, subreddit, title] = match;

              // Find the URL in the next line
              const nextLine = lines[lines.indexOf(line) + 1];
              const urlMatch = nextLine?.match(/(https:\/\/[^\s]+)/);

              if (urlMatch) {
                // Extract the actual Reddit URL if this is an F5Bot URL
                let redditUrl = urlMatch[1];
                if (redditUrl.includes("f5bot.com/url")) {
                  try {
                    const urlObj = new URL(redditUrl);
                    const encodedRedditUrl = urlObj.searchParams.get("u");
                    if (encodedRedditUrl) {
                      redditUrl = decodeURIComponent(encodedRedditUrl);
                      console.log(
                        "Extracted Reddit URL from F5Bot:",
                        redditUrl
                      );
                    }
                  } catch (err) {
                    console.error(
                      "Error extracting Reddit URL from F5Bot:",
                      err
                    );
                    // Continue with the original URL if extraction fails
                  }
                }

                const url = redditUrl;

                // Check if this URL has been seen before
                if (seenUrls.has(url)) {
                  console.log(
                    `⚠️ DUPLICATE URL DETECTED in email parse: ${url}`
                  );
                  console.log(`  Email ID: ${email.id}`);
                  console.log(`  Keyword: ${currentKeyword}`);
                  console.log(`  Title: ${title}`);
                } else {
                  seenUrls.add(url);
                }

                // Extract full content body after URL line until next keyword or end
                let contentBody = "";
                let bodyIndex = lines.indexOf(line) + 1; // Start right after URL line

                // Continue reading lines until we hit the next keyword or F5Bot footer
                while (
                  bodyIndex < lines.length &&
                  !lines[bodyIndex].trim().startsWith("Keyword:") &&
                  !lines[bodyIndex].trim().startsWith("Do you have comments") &&
                  !lines[bodyIndex]
                    .trim()
                    .startsWith("You are receiving this email")
                ) {
                  if (lines[bodyIndex].trim()) {
                    if (contentBody) contentBody += " "; // Add space between paragraphs
                    contentBody += lines[bodyIndex].trim();
                  }
                  bodyIndex++;
                }

                console.log("📝 Extracted Reddit content body:", {
                  title,
                  bodyLength: contentBody.length,
                  bodyPreview:
                    contentBody.substring(0, 100) +
                    (contentBody.length > 100 ? "..." : ""),
                });

                allContent.push({
                  keyword: currentKeyword,
                  type,
                  subreddit,
                  title,
                  url: redditUrl, // Use the actual Reddit URL, not the F5Bot one
                  body: contentBody, // Full multi-line content
                  emailId: email.id,
                  emailDate: email.date,
                });
              }
            }
          }
        });
      });

      // After pushing to allContent array, add a log to check
      console.log(
        "📋 ALL CONTENT ITEMS:",
        allContent.map((item) => ({
          title: item.title,
          hasBody: !!item.body,
          bodyLength: item.body ? item.body.length : 0,
        }))
      );

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

        // Log all keywords for each business that might match this content
        if (matchingBusinesses.length > 0) {
          console.log(
            `Content with keyword "${content.keyword}" matched with:`,
            matchingBusinesses.map(([businessId, keywords]) => ({
              businessId,
              matchingKeywords: keywords.filter(
                (k) =>
                  content.keyword.toLowerCase().includes(k.toLowerCase()) ||
                  k.toLowerCase().includes(content.keyword.toLowerCase())
              ),
            }))
          );
        }

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
      console.log(
        "🔗 MATCHED CONTENT:",
        matchedContent.map((item) => ({
          title: item.title,
          business_id: item.business_id || "NO MATCH",
          hasBody: !!item.body,
          bodyLength: item.body ? item.body.length : 0,
        }))
      );

      // Step 6: Save content to database and mark emails as processed
      console.log("Step 6: Saving to database...");

      // First, log content grouped by URL to see duplicates
      const contentByUrl = {};
      matchedContent.forEach((content) => {
        if (!contentByUrl[content.url]) {
          contentByUrl[content.url] = [];
        }
        contentByUrl[content.url].push({
          keyword: content.keyword,
          business_id: content.business_id,
          title: content.title.substring(0, 30),
        });
      });

      // Log URLs that have multiple entries
      console.log("🔍 CHECKING FOR DUPLICATES:");
      Object.entries(contentByUrl)
        .filter(([_, items]) => items.length > 1)
        .forEach(([url, items]) => {
          console.log(`⚠️ DUPLICATE URL: ${url}`);
          console.log(`Found ${items.length} items with same URL:`);
          console.table(items);
        });

      // Deduplicate matchedContent by URL before creating contentToSave
      // This ensures each URL only appears once in our final array
      const uniqueContent = [];
      const uniqueUrls = new Set();

      matchedContent.forEach((content) => {
        if (content.business_id && !uniqueUrls.has(content.url)) {
          uniqueUrls.add(content.url);
          uniqueContent.push(content);
        }
      });

      console.log(
        `Reduced from ${matchedContent.length} matched items to ${uniqueContent.length} unique items after URL deduplication.`
      );

      // Save matched content to reddit_comments_content
      const contentToSave = uniqueContent.map((content) => {
        // Log the URL being saved to help with debugging
        console.log(`Saving content with URL: ${content.url}`);

        return {
          business_id: content.business_id,
          keyword: content.keyword,
          type: content.type,
          subreddit: content.subreddit,
          title: content.title,
          url: content.url,
          content_body: content.body, // Add the content body here!
          email_id: content.emailId,
          email_date: content.emailDate,
          created_at: new Date().toISOString(),
        };
      });

      console.log(
        "💾 CONTENT TO SAVE:",
        contentToSave.map((item) => ({
          title: item.title,
          hasContentBody: !!item.content_body,
          contentBodyLength: item.content_body ? item.content_body.length : 0,
          contentBodyPreview: item.content_body
            ? item.content_body.substring(0, 30) + "..."
            : "N/A",
        }))
      );

      // Around line ~500 - Log the database operation attempt
      if (contentToSave.length > 0) {
        console.log("🔄 ATTEMPTING DATABASE SAVE with content_body field");
        const { data, error: contentError } = await supabase
          .from("reddit_comments_content")
          .upsert(contentToSave, {
            onConflict: "url",
            ignoreDuplicates: false, // Change to false to update existing records
          });

        if (contentError) {
          console.error("❌ DATABASE ERROR:", contentError);
          setNotification(`Error saving content: ${contentError.message}`);
        } else {
          console.log("✅ DATABASE SAVE SUCCESSFUL");

          // Add verification query
          const { data: verifyData, error: verifyError } = await supabase
            .from("reddit_comments_content")
            .select("id, url, content_body")
            .in(
              "url",
              contentToSave.map((item) => item.url)
            );

          if (verifyError) {
            console.error("❌ VERIFICATION ERROR:", verifyError);
          } else {
            console.log(
              "✅ VERIFIED SAVED DATA:",
              verifyData.map((item) => ({
                urlSnippet: item.url.substring(0, 15) + "...",
                hasContentBody: !!item.content_body,
                contentBodyLength: item.content_body
                  ? item.content_body.length
                  : 0,
              }))
            );
          }
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

  const updateContentStatus = async (contentId, newStatus) => {
    try {
      // Start loading
      setLoading(true);

      // Update in database
      const { data, error } = await supabase
        .from("reddit_comments_content")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId)
        .select(); // Add this to get the updated row

      if (error) {
        console.error("Error updating status:", error);
        throw error;
      }

      // Get the updated content
      const updatedContent = data[0];

      // Update local state with precise targeting
      setRedditContent((prev) => {
        // Create deep copy of previous state
        const newContent = JSON.parse(JSON.stringify(prev));

        // Find which business contains this content
        let businessId = null;
        Object.keys(newContent).forEach((bid) => {
          const index = newContent[bid].findIndex(
            (item) => item.id === contentId
          );
          if (index !== -1) {
            businessId = bid;
            // Update the content with all fields from database response
            newContent[bid][index] = {
              ...newContent[bid][index],
              ...updatedContent,
            };

            // If status changed to not_relevant or replied and active tab is pending,
            // or if status changed to pending and active tab is replied,
            // remove from current view
            if (
              (activeTab === "pending" &&
                (newStatus === "not_relevant" || newStatus === "replied")) ||
              (activeTab === "replied" && newStatus !== "replied")
            ) {
              newContent[bid] = newContent[bid].filter(
                (item) => item.id !== contentId
              );
            }
          }
        });

        return newContent;
      });

      // Show success notification
      setNotification(`Status updated to ${newStatus}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const generateResponse = async (item, business) => {
    try {
      setResponseLoading(true);
      setGeneratingResponseFor(item.id);
      setNotification("Generating response for post...");

      console.log("GENERATING RESPONSE FOR CONTENT:", {
        id: item.id,
        business_id: item.business_id,
        title: item.title,
        url: item.url,
        subreddit: item.subreddit,
        status: item.status,
        is_matching: item.is_matching,
        created_at: item.created_at,
      });

      // Extract the actual Reddit URL if this is an F5Bot URL
      let redditUrl = item.url;
      if (item.url.includes("f5bot.com/url")) {
        try {
          const urlObj = new URL(item.url);
          const encodedRedditUrl = urlObj.searchParams.get("u");
          if (encodedRedditUrl) {
            redditUrl = decodeURIComponent(encodedRedditUrl);
            console.log("Extracted Reddit URL:", redditUrl);

            // Update the URL in the database
            const { error: urlUpdateError } = await supabase
              .from("reddit_comments_content")
              .update({
                url: redditUrl,
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.id);

            if (urlUpdateError) {
              console.error("Error updating post URL:", urlUpdateError);
            } else {
              console.log("Updated post URL in database");
            }
          }
        } catch (err) {
          console.error("Error extracting Reddit URL:", err);
        }
      }

      // Construct the Reddit JSON URL directly for testing
      const jsonUrl = redditUrl.endsWith(".json")
        ? redditUrl
        : `${redditUrl}.json`;
      console.log("Reddit JSON URL:", jsonUrl);

      // Simple API fetch to get the raw Reddit response
      setNotification("Fetching Reddit content data...");
      console.log(`Fetching content for: ${jsonUrl}`);

      try {
        const response = await fetch("/api/fetch-reddit-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: redditUrl, // The API will handle appending .json
          }),
        });

        const result = await response.json();

        // Log raw response data
        console.log("REDDIT API RESPONSE - STATUS:", result.status);
        console.log("REDDIT API RESPONSE - HEADERS:", result.headers);
        console.log("REDDIT API RESPONSE - ERROR:", result.error);

        if (!result.responseData) {
          console.error("No response data from Reddit API");
          throw new Error("Failed to fetch Reddit content");
        }

        // Extract post content and data from the response
        let postTitle = item.title;
        let postContent = item.content_body || "";
        let postSubreddit = item.subreddit;

        try {
          // Try to parse the response data as JSON if it is JSON
          const jsonData = JSON.parse(result.responseData);
          console.log("REDDIT API RESPONSE - PARSED JSON:", jsonData);

          // Check for the direct Listing format
          if (
            jsonData?.kind === "Listing" &&
            jsonData?.data?.children?.length > 0
          ) {
            console.log("=== DIRECT LISTING FORMAT DETECTED ===");
            const post = jsonData.data.children[0].data;

            postTitle = post.title || postTitle;
            postSubreddit = post.subreddit || postSubreddit;

            console.log("DIRECT POST DETAILS:", {
              title: post.title,
              author: post.author,
              selftext: post.selftext,
              subreddit: post.subreddit,
            });

            // Check if this is a crosspost with removed content
            if (
              post.selftext === "[removed]" &&
              post.crosspost_parent_list &&
              post.crosspost_parent_list.length > 0
            ) {
              // Use content from the original post in the crosspost
              const originalPost = post.crosspost_parent_list[0];
              postContent = originalPost.selftext || "";
              console.log(
                "Using content from crossposted original:",
                postContent.substring(0, 100) + "..."
              );
            } else {
              postContent = post.selftext || "";
            }

            console.log("DIRECT SELFTEXT CONTENT:", postContent);
          }
          // Log important parts of the parsed JSON if it exists (standard post+comments format)
          else if (
            jsonData[0] &&
            jsonData[0].data &&
            jsonData[0].data.children
          ) {
            const post = jsonData[0].data.children[0]?.data;

            postTitle = post.title || postTitle;
            postSubreddit = post.subreddit || postSubreddit;

            console.log("POST DETAILS:", {
              title: post.title,
              author: post.author,
              selftext: post.selftext,
              subreddit: post.subreddit,
              num_comments: post.num_comments,
            });

            // Check if this is a crosspost with removed content
            if (
              post.selftext === "[removed]" &&
              post.crosspost_parent_list &&
              post.crosspost_parent_list.length > 0
            ) {
              // Use content from the original post in the crosspost
              const originalPost = post.crosspost_parent_list[0];
              postContent = originalPost.selftext || "";
              console.log(
                "Using content from crossposted original:",
                postContent.substring(0, 100) + "..."
              );
            } else {
              postContent = post.selftext || "";
            }

            console.log("SELFTEXT CONTENT:", postContent);

            // Log all comments if they exist
            if (jsonData[1] && jsonData[1].data && jsonData[1].data.children) {
              console.log("COMMENT COUNT:", jsonData[1].data.children.length);
              console.log(
                "FIRST 3 COMMENTS:",
                jsonData[1].data.children.slice(0, 3).map((c) => ({
                  author: c.data?.author,
                  body: c.data?.body,
                  score: c.data?.score,
                }))
              );
            }
          }

          // Update the database with the fetched content
          if (postContent && postContent !== "[deleted]") {
            const { error: updateContentError } = await supabase
              .from("reddit_comments_content")
              .update({
                title: postTitle,
                content_body: postContent,
                subreddit: postSubreddit,
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.id);

            if (updateContentError) {
              console.error("Error updating post content:", updateContentError);
            } else {
              console.log(
                `Updated database with ${postContent.length} chars of content`
              );
            }
          }
        } catch (e) {
          console.log(
            "REDDIT API RESPONSE - RAW DATA (not JSON):",
            result.responseData
          );
          console.error("Error parsing Reddit response:", e);
        }

        // Now generate a response using ChatGPT
        setNotification("Generating response with ChatGPT...");

        // Use business data for response generation
        const saasUrl = business?.subdomain
          ? `${business.subdomain}.joinblocks.me`
          : "";

        const generateResponse = await fetch("/api/generate-reddit-response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: item.id,
            title: postTitle,
            content: postContent,
            subreddit: postSubreddit,
            businessName: business?.name || "",
            product: business?.product || "",
            mainFeature: business?.main_feature || "",
            saasUrl: saasUrl,
          }),
        });

        if (!generateResponse.ok) {
          console.error(
            "Failed to generate response:",
            await generateResponse.text()
          );
          throw new Error("Failed to generate response with ChatGPT");
        }

        const responseData = await generateResponse.json();

        // Log the generated response
        console.log("CHATGPT GENERATED RESPONSE:", responseData.response);

        // Save the generated response
        const generatedText = responseData.response;
        setGeneratedResponse(generatedText);

        // Save to database
        const { error: updateError } = await supabase
          .from("reddit_comments_content")
          .update({
            generated_response: generatedText,
            response_generated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        if (updateError) {
          console.error("Error saving response to database:", updateError);
        } else {
          // Update local state
          setSavedResponses((prev) => ({
            ...prev,
            [item.id]: generatedText,
          }));
          console.log("Saved response to database for post ID:", item.id);
          setNotification("Generated and saved response with ChatGPT");
        }
      } catch (err) {
        console.error(
          "Error fetching Reddit content or generating response:",
          err
        );
        setError("Failed to generate response: " + err.message);
      }
    } catch (err) {
      console.error("Error generating response:", err);
      setError("Failed to generate response: " + err.message);
    } finally {
      setResponseLoading(false);
      setGeneratingResponseFor(null);
    }
  };

  // Function to mark a post as replied to
  const markAsReplied = async (contentId) => {
    try {
      setLoading(true);

      // Update status in database
      const { error } = await supabase
        .from("reddit_comments_content")
        .update({
          status: "replied",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      if (error) {
        throw error;
      }

      setNotification("Marked as replied successfully");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error marking as replied:", err);
      setError("Failed to mark as replied: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResponseToClipboard = () => {
    navigator.clipboard.writeText(generatedResponse);
    setNotification("Response copied to clipboard");
    setTimeout(() => setNotification(null), 3000);
  };

  // NEW FUNCTION: Batch evaluate Reddit posts with ChatGPT
  const evaluateRedditPosts = async () => {
    try {
      setLoading(true);
      setNotification("Evaluating Reddit posts with ChatGPT...");

      // Fetch all pending Reddit posts
      const { data: pendingPosts, error: postsError } = await supabase
        .from("reddit_comments_content")
        .select("id, title, content_body, business_id, subreddit")
        .eq("status", "pending");

      if (postsError) throw postsError;

      if (!pendingPosts || pendingPosts.length === 0) {
        setNotification("No pending posts to evaluate");
        return;
      }

      console.log(`Found ${pendingPosts.length} pending posts to evaluate`);

      // Group posts by business_id for efficiency
      const postsByBusiness = {};
      pendingPosts.forEach((post) => {
        if (!postsByBusiness[post.business_id]) {
          postsByBusiness[post.business_id] = [];
        }
        postsByBusiness[post.business_id].push(post);
      });

      // Evaluate posts for each business
      const allResults = [];
      for (const [businessId, posts] of Object.entries(postsByBusiness)) {
        // Fetch business data
        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("id, name, product, subdomain, main_feature")
          .eq("id", businessId)
          .single();

        if (businessError) {
          console.error(
            `Error fetching business ${businessId}:`,
            businessError
          );
          continue;
        }

        // Construct the SaaS URL
        const saasUrl = `${business.subdomain}.joinblocks.me`;

        // Evaluate all posts for this business
        const response = await fetch("/api/evaluate-reddit-posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            posts: posts.map((post) => ({
              id: post.id,
              title: post.title,
              content: post.content_body || "",
              subreddit: post.subreddit,
            })),
            businessName: business.name,
            product: business.product,
            mainFeature: business.main_feature,
            saasUrl,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to evaluate posts for ${business.name}`);
        }

        const result = await response.json();
        console.log(`Evaluation results for ${business.name}:`, result);

        // Add to all results
        allResults.push({
          business: business.name,
          businessId: business.id,
          evaluationResults: result.evaluations,
          matchingPosts: result.matchingPosts,
        });

        // Save evaluation results to database for each post
        const evaluationUpdates = result.evaluations.map((postEval) => {
          const isMatch = result.matchingPosts.includes(postEval.id);
          return {
            id: postEval.id,
            is_helpful: postEval.canProvideHelpfulResponse,
            helpful_reason: postEval.helpfulResponseReason,
            can_plug_product: postEval.canPlugProduct,
            plug_product_reason: postEval.plugProductReason,
            is_matching: isMatch,
            evaluation_date: new Date().toISOString(),
          };
        });

        // Batch update posts with evaluation results
        if (evaluationUpdates.length > 0) {
          for (const update of evaluationUpdates) {
            const { error: updateError } = await supabase
              .from("reddit_comments_content")
              .update({
                is_helpful: update.is_helpful,
                helpful_reason: update.helpful_reason,
                can_plug_product: update.can_plug_product,
                plug_product_reason: update.plug_product_reason,
                is_matching: update.is_matching,
                evaluation_date: update.evaluation_date,
              })
              .eq("id", update.id);

            if (updateError) {
              console.error(`Error updating post ${update.id}:`, updateError);
            }
          }
        }
      }

      console.log("All evaluation results:", allResults);
      setEvaluationResults(allResults);
      setShowEvaluationModal(true);
      setNotification(
        `Evaluated ${pendingPosts.length} posts for relevance and product fit`
      );

      // Refresh data to show updated evaluation results
      fetchData();

      // Return results
      return allResults;
    } catch (err) {
      console.error("Error evaluating Reddit posts:", err);
      setError("Failed to evaluate posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to test with a single post
  const testWithSinglePost = async () => {
    try {
      setLoading(true);
      setNotification("Testing with a ready Reddit post...");

      // Get all ready posts first to see what's available
      const { data: allReadyPosts, error: readyError } = await supabase
        .from("reddit_comments_content")
        .select(
          "id, url, title, subreddit, business_id, content_body, status, is_matching"
        )
        .eq("is_matching", true)
        .not("status", "eq", "replied")
        .not("status", "eq", "not_relevant")
        .order("created_at", { ascending: false });

      if (readyError) {
        console.error("Error fetching all ready posts:", readyError);
        throw readyError;
      }

      console.log(
        `Found ${allReadyPosts?.length || 0} total ready posts:`,
        allReadyPosts
      );

      // Get the first "ready" post (matching posts that aren't replied to or not relevant)
      const { data: readyPosts, error: postsError } = await supabase
        .from("reddit_comments_content")
        .select(
          "id, url, title, subreddit, business_id, content_body, status, is_matching, created_at"
        )
        .eq("is_matching", true)
        .not("status", "eq", "replied")
        .not("status", "eq", "not_relevant")
        .order("created_at", { ascending: false })
        .limit(1);

      if (postsError) {
        console.error("Error fetching first ready post:", postsError);
        throw postsError;
      }

      if (!readyPosts || readyPosts.length === 0) {
        console.error("No ready posts found to test with");
        setError(
          "No ready posts found to test with. Please evaluate some posts first."
        );
        return;
      }

      const testPost = readyPosts[0];
      console.log("SELECTED POST FOR TESTING:", {
        id: testPost.id,
        business_id: testPost.business_id,
        title: testPost.title,
        url: testPost.url,
        subreddit: testPost.subreddit,
        status: testPost.status,
        is_matching: testPost.is_matching,
        created_at: testPost.created_at,
      });

      // Extract the actual Reddit URL if this is an F5Bot URL
      let redditUrl = testPost.url;
      if (testPost.url.includes("f5bot.com/url")) {
        try {
          const urlObj = new URL(testPost.url);
          const encodedRedditUrl = urlObj.searchParams.get("u");
          if (encodedRedditUrl) {
            redditUrl = decodeURIComponent(encodedRedditUrl);
            console.log("Extracted Reddit URL:", redditUrl);

            // Update the URL in the database
            const { error: urlUpdateError } = await supabase
              .from("reddit_comments_content")
              .update({
                url: redditUrl,
                updated_at: new Date().toISOString(),
              })
              .eq("id", testPost.id);

            if (urlUpdateError) {
              console.error("Error updating post URL:", urlUpdateError);
            } else {
              // Update our test post object with the new URL
              testPost.url = redditUrl;
              console.log("Updated test post URL in database");
            }
          }
        } catch (err) {
          console.error("Error extracting Reddit URL:", err);
        }
      }

      // Construct the Reddit JSON URL directly for testing
      const jsonUrl = redditUrl.endsWith(".json")
        ? redditUrl
        : `${redditUrl}.json`;
      console.log("Reddit JSON URL:", jsonUrl);

      // Get the business for this post
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", testPost.business_id)
        .single();

      if (businessError) {
        throw businessError;
      }

      // Simple API fetch to get the raw Reddit response
      setNotification("Fetching Reddit content data...");
      console.log(`Fetching content for: ${jsonUrl}`);

      try {
        const response = await fetch("/api/fetch-reddit-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: redditUrl, // The API will handle appending .json
          }),
        });

        const result = await response.json();

        // Log raw response data
        console.log("REDDIT API RESPONSE - STATUS:", result.status);
        console.log("REDDIT API RESPONSE - HEADERS:", result.headers);
        console.log("REDDIT API RESPONSE - ERROR:", result.error);

        if (result.responseData) {
          // Log the full response data
          console.log("REDDIT API RESPONSE - FULL DATA:", result.responseData);

          console.log(
            "REDDIT API RESPONSE - DATA (first 500 chars):",
            result.responseData.substring(0, 500)
          );
          try {
            // Try to parse the response data as JSON if it is JSON
            const jsonData = JSON.parse(result.responseData);
            console.log("REDDIT API RESPONSE - PARSED JSON:", jsonData);

            // Check for the direct Listing format
            if (
              jsonData?.kind === "Listing" &&
              jsonData?.data?.children?.length > 0
            ) {
              console.log("=== DIRECT LISTING FORMAT DETECTED ===");
              const post = jsonData.data.children[0].data;

              console.log("DIRECT POST DETAILS:", {
                title: post.title,
                author: post.author,
                selftext: post.selftext,
                subreddit: post.subreddit,
              });

              // Log the selftext specifically as requested
              console.log("DIRECT SELFTEXT CONTENT:", post.selftext);
            }

            // Log important parts of the parsed JSON if it exists
            if (jsonData[0] && jsonData[0].data && jsonData[0].data.children) {
              console.log("POST DETAILS:", {
                title: jsonData[0].data.children[0]?.data?.title,
                author: jsonData[0].data.children[0]?.data?.author,
                selftext: jsonData[0].data.children[0]?.data?.selftext,
                subreddit: jsonData[0].data.children[0]?.data?.subreddit,
                num_comments: jsonData[0].data.children[0]?.data?.num_comments,
              });

              // Log the selftext specifically as requested
              console.log(
                "SELFTEXT CONTENT:",
                jsonData[0].data.children[0]?.data?.selftext
              );

              // Extract post content for ChatGPT
              let postContent = "";
              const postData = jsonData[0].data.children[0]?.data;

              // Check if this is a crosspost and the original has content
              if (
                postData.selftext === "[removed]" &&
                postData.crosspost_parent_list &&
                postData.crosspost_parent_list.length > 0
              ) {
                // Use the content from the original post
                const originalPost = postData.crosspost_parent_list[0];
                postContent = originalPost.selftext || "";
                console.log(
                  "Using content from crossposted original:",
                  postContent
                );
              } else {
                // Use the content from this post
                postContent = postData.selftext || "";
              }

              // Now generate a response using ChatGPT
              setNotification("Generating response with ChatGPT...");

              const generateResponse = await fetch(
                "/api/generate-reddit-response",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    postId: testPost.id,
                    title: postData.title,
                    content: postContent,
                    subreddit: postData.subreddit,
                    businessName: business?.name || "",
                    product: business?.product || "",
                    mainFeature: business?.main_feature || "",
                    saasUrl: business?.subdomain
                      ? `${business.subdomain}.joinblocks.me`
                      : "",
                  }),
                }
              );

              if (generateResponse.ok) {
                const responseData = await generateResponse.json();

                // Log the generated response
                console.log(
                  "CHATGPT GENERATED RESPONSE:",
                  responseData.response
                );

                // Save the generated response to the database
                if (testPost.id) {
                  const { error: updateError } = await supabase
                    .from("reddit_comments_content")
                    .update({
                      generated_response: responseData.response,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", testPost.id);

                  if (updateError) {
                    console.error(
                      "Error saving generated response:",
                      updateError
                    );
                  } else {
                    console.log(
                      "Saved response to database for post ID:",
                      testPost.id
                    );
                    setNotification(
                      "Generated and saved response with ChatGPT"
                    );
                  }
                }
              } else {
                console.error(
                  "Failed to generate response:",
                  await generateResponse.text()
                );
                setError("Failed to generate response with ChatGPT");
              }
            }

            // Log all comments if they exist
            if (jsonData[1] && jsonData[1].data && jsonData[1].data.children) {
              console.log("COMMENT COUNT:", jsonData[1].data.children.length);
              console.log(
                "FIRST 3 COMMENTS:",
                jsonData[1].data.children.slice(0, 3).map((c) => ({
                  author: c.data?.author,
                  body: c.data?.body,
                  score: c.data?.score,
                }))
              );
            }
          } catch (e) {
            console.log(
              "REDDIT API RESPONSE - RAW DATA (not JSON):",
              result.responseData
            );
          }
        }

        setNotification(
          "Test completed. Check console logs for raw Reddit API response."
        );
      } catch (err) {
        console.error("Error fetching Reddit content:", err);
        setError("Reddit content fetch failed: " + err.message);
      }

      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Error in test function:", err);
      setError("Test failed: " + err.message);
    } finally {
      setLoading(false);
    }
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
              Reddit Posts Monitor
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">Reddit Posts</h2>
            <div className="flex gap-2">
              <button
                onClick={evaluateRedditPosts}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                Evaluate Posts with ChatGPT
              </button>
              <button
                onClick={testWithSinglePost}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm font-medium transition-colors"
              >
                Test Single Post
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  setNotification("Testing with specific post ID: c93rdt...");

                  fetch("/api/fetch-reddit-content", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      url: "t3_c93rdt",
                    }),
                  })
                    .then((response) => response.json())
                    .then((result) => {
                      console.log(
                        "SPECIFIC POST TEST - STATUS:",
                        result.status
                      );
                      console.log(
                        "SPECIFIC POST TEST - HEADERS:",
                        result.headers
                      );
                      console.log("SPECIFIC POST TEST - ERROR:", result.error);

                      if (result.responseData) {
                        console.log(
                          "SPECIFIC POST TEST - DATA (first 500 chars):",
                          result.responseData.substring(0, 500)
                        );
                        try {
                          // Try to parse the response data as JSON if it is JSON
                          const jsonData = JSON.parse(result.responseData);
                          console.log(
                            "SPECIFIC POST TEST - PARSED JSON:",
                            jsonData
                          );
                        } catch (e) {
                          console.log(
                            "SPECIFIC POST TEST - RAW DATA (not JSON)"
                          );
                        }
                      }

                      setNotification(
                        "Test with specific post ID completed. Check console logs."
                      );
                    })
                    .catch((err) => {
                      console.error("Error testing specific post:", err);
                      setError(
                        "Test with specific post ID failed: " + err.message
                      );
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                Test ID: c93rdt
              </button>
              <button
                onClick={() => setShowEvaluationModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                View Evaluation Report
              </button>
              <div className="flex rounded-lg border border-gray-700 p-1">
                <button
                  onClick={() => handleTabChange("pending")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "pending"
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  To Process
                </button>
                <button
                  onClick={() => handleTabChange("evaluated")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "evaluated"
                      ? "bg-purple-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Evaluated
                </button>
                <button
                  onClick={() => handleTabChange("ready")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "ready"
                      ? "bg-amber-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Ready to Respond
                </button>
                <button
                  onClick={() => handleTabChange("replied")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "replied"
                      ? "bg-green-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Replied{" "}
                  {todayRepliedCount > 0 && `(${todayRepliedCount} today)`}
                </button>
              </div>
            </div>
          </div>

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
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-400">
                          {activeTab === "pending" ? (
                            `(${content.length} to process)`
                          ) : activeTab === "evaluated" ? (
                            `(${content.length} evaluated)`
                          ) : activeTab === "ready" ? (
                            `(${content.length} ready to respond)`
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="text-green-400">
                                {businessReplies[business.id]?.today > 0 && (
                                  <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs">
                                    {businessReplies[business.id]?.today} today
                                  </span>
                                )}
                              </span>
                              <span className="text-gray-400 ml-1">
                                ({businessReplies[business.id]?.total || 0}{" "}
                                total)
                              </span>
                            </span>
                          )}
                        </span>
                      </div>
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
                          className={`bg-gray-800 p-3 rounded-lg flex flex-col gap-3 ${
                            (activeTab === "evaluated" && item.is_matching) ||
                            activeTab === "ready"
                              ? "border-2 border-green-500/50"
                              : ""
                          }`}
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
                              {(activeTab === "evaluated" ||
                                activeTab === "ready") && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span
                                    className={`whitespace-nowrap px-2 py-0.5 rounded ${
                                      item.is_matching
                                        ? "bg-green-500/20 text-green-300"
                                        : "bg-yellow-500/20 text-yellow-300"
                                    }`}
                                  >
                                    {item.is_matching ? "Match" : "No Match"}
                                  </span>
                                </>
                              )}
                              {savedResponses[item.id] && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded whitespace-nowrap">
                                    Response Ready
                                  </span>
                                </>
                              )}
                            </div>
                            <h4 className="text-sm font-medium line-clamp-2">
                              {item.title}
                            </h4>
                          </div>

                          {activeTab === "evaluated" && (
                            <div className="border-t border-gray-700/50 pt-2">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      item.is_helpful
                                        ? "bg-green-500/20 text-green-300"
                                        : "bg-red-500/20 text-red-300"
                                    }`}
                                  >
                                    {item.is_helpful
                                      ? "Helpful"
                                      : "Not Helpful"}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      item.can_plug_product
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-red-500/20 text-red-300"
                                    }`}
                                  >
                                    {item.can_plug_product
                                      ? "Can Plug Product"
                                      : "Cannot Plug"}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    setShowEvaluationDetails((prev) => ({
                                      ...prev,
                                      [item.id]: !prev[item.id],
                                    }))
                                  }
                                  className="text-xs text-gray-400 hover:text-white"
                                >
                                  {showEvaluationDetails[item.id]
                                    ? "Hide Details"
                                    : "Show Details"}
                                </button>
                              </div>

                              {showEvaluationDetails[item.id] && (
                                <div className="text-xs space-y-2 mt-2 bg-gray-900 p-2 rounded">
                                  <div>
                                    <p className="text-green-400 font-medium mb-1">
                                      Can provide helpful response:
                                    </p>
                                    <p className="text-gray-300">
                                      {item.helpful_reason}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-blue-400 font-medium mb-1">
                                      Can plug product:
                                    </p>
                                    <p className="text-gray-300">
                                      {item.plug_product_reason}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === "ready" && savedResponses[item.id] && (
                            <div className="border-t border-gray-700/50 pt-2">
                              <div className="flex justify-between mb-2">
                                <div className="text-xs font-medium text-purple-300">
                                  Generated Response:
                                </div>
                                <button
                                  onClick={() => {
                                    // Removed modal opening - we're now showing the full response directly
                                    // setGeneratedResponse(savedResponses[item.id]);
                                    // setShowResponseModal(true);
                                  }}
                                  className="text-xs text-gray-400 hover:text-white cursor-default"
                                >
                                  Full Response
                                </button>
                              </div>
                              <div className="text-xs bg-gray-900 p-2 rounded text-gray-300 whitespace-pre-wrap">
                                {savedResponses[item.id]}
                              </div>
                            </div>
                          )}

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
                            {item.evaluation_date &&
                              activeTab !== "evaluated" &&
                              activeTab !== "ready" && (
                                <div
                                  className={`px-2 sm:px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                    item.is_matching
                                      ? "bg-green-500/20 border-green-500/30 text-green-300"
                                      : "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                                  }`}
                                >
                                  <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                                    {item.is_matching
                                      ? "Good Match"
                                      : "Poor Match"}
                                  </span>
                                </div>
                              )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-700/50">
                            <div className="flex flex-wrap gap-2 items-center">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap"
                              >
                                View on Reddit →
                              </a>
                              <button
                                onClick={() => generateResponse(item, business)}
                                disabled={
                                  responseLoading &&
                                  generatingResponseFor === item.id
                                }
                                className={`text-sm px-3 py-1 rounded-md ${
                                  responseLoading &&
                                  generatingResponseFor === item.id
                                    ? "bg-purple-500/30 text-purple-300"
                                    : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                                }`}
                              >
                                {responseLoading &&
                                generatingResponseFor === item.id ? (
                                  <>
                                    <span className="inline-block mr-2 h-3 w-3 rounded-full border-2 border-purple-300 border-t-transparent animate-spin"></span>
                                    Generating...
                                  </>
                                ) : savedResponses[item.id] ? (
                                  "Regenerate Response"
                                ) : (
                                  "Generate Response"
                                )}
                              </button>

                              {activeTab === "ready" &&
                                savedResponses[item.id] && (
                                  <button
                                    onClick={() => markAsReplied(item.id)}
                                    className="text-sm px-3 py-1 rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                  >
                                    Mark as Replied
                                  </button>
                                )}
                            </div>
                            <select
                              value={item.status || "pending"}
                              onChange={(e) => {
                                updateContentStatus(item.id, e.target.value);
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
              post notifications.
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

        {/* Add Evaluation Results Modal */}
        {showEvaluationModal && evaluationResults && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Post Evaluation Results
                </h3>
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {evaluationResults.map((result, index) => (
                  <div
                    key={index}
                    className="mb-6 border-b border-gray-800 pb-6"
                  >
                    <h4 className="text-lg font-semibold mb-2">
                      {result.business}
                    </h4>

                    {result.matchingPosts?.length > 0 ? (
                      <div className="mb-4">
                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg mb-3">
                          <h5 className="font-medium text-green-400 mb-2">
                            ✅ {result.matchingPosts.length} Matching Posts
                          </h5>
                          <div className="space-y-2">
                            {result.evaluationResults
                              .filter((postEval) =>
                                result.matchingPosts.includes(postEval.id)
                              )
                              .map((postEval, i) => (
                                <div
                                  key={i}
                                  className="bg-gray-800 p-3 rounded border border-gray-700"
                                >
                                  <p className="text-sm mb-2 line-clamp-2">
                                    <span className="text-blue-400 mr-1">
                                      [{postEval.id}]
                                    </span>
                                    {postEval.title}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className="bg-green-500/10 p-2 rounded">
                                      <p className="text-green-400 font-medium mb-1">
                                        Can provide helpful response:
                                      </p>
                                      <p>{postEval.helpfulResponseReason}</p>
                                    </div>
                                    <div className="bg-blue-500/10 p-2 rounded">
                                      <p className="text-blue-400 font-medium mb-1">
                                        Can plug product:
                                      </p>
                                      <p>{postEval.plugProductReason}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-yellow-400 mb-4">
                        No matching posts found
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-400 mb-2">
                        All Evaluated Posts ({result.evaluationResults.length})
                      </h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {result.evaluationResults.map((postEval, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded text-xs ${
                              result.matchingPosts.includes(postEval.id)
                                ? "bg-green-900/20 border border-green-800"
                                : "bg-gray-800 border border-gray-700"
                            }`}
                          >
                            <p className="line-clamp-1">
                              <span
                                className={
                                  result.matchingPosts.includes(postEval.id)
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }
                              >
                                [{postEval.id}]
                              </span>{" "}
                              {postEval.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Response</h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-white whitespace-pre-wrap">
                  {generatedResponse}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={copyResponseToClipboard}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
