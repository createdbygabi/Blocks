import { supabase } from "@/lib/supabase";

export class RedditService {
  constructor() {
    this.baseUrl = "/api/reddit";
  }

  async searchSubreddits(query, limit = 10) {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!response.ok) {
        throw new Error("Failed to search subreddits");
      }

      const data = await response.json();
      return data.subreddits.map((subreddit) => ({
        name: subreddit.name,
        title: subreddit.title,
        description: subreddit.description,
        subscribers: subreddit.subscribers,
        url: subreddit.url,
        over18: subreddit.over18,
        created: subreddit.created,
        recentPosts: subreddit.recentPosts || 0,
      }));
    } catch (error) {
      console.error("Error searching subreddits:", error);
      throw error;
    }
  }

  async getSubredditPosts(
    subredditName,
    limit = 30,
    sort = "hot",
    time = "day",
    after = null
  ) {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          subredditName,
          limit,
          sort,
          time,
          after,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subreddit posts");
      }

      const data = await response.json();
      return {
        posts: data.posts,
        after: data.after,
      };
    } catch (error) {
      console.error("Error fetching subreddit posts:", error);
      throw error;
    }
  }

  async findRelevantSubreddits(businessInfo) {
    try {
      console.log("\n=== Starting Reddit Search for SaaS ===");
      console.log("Business Info:", {
        name: businessInfo.name,
        industry: businessInfo.industry,
        target_audience: businessInfo.target_audience,
      });

      // Extract and process keywords
      const keywords = new Set();

      // Add business name if it exists
      if (businessInfo.name) {
        keywords.add(businessInfo.name);
      }

      // Add industry if it exists
      if (businessInfo.industry) {
        keywords.add(businessInfo.industry);
      }

      // Process target audience - split by commas
      if (businessInfo.target_audience) {
        const audienceKeywords = businessInfo.target_audience
          .split(",")
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0);
        audienceKeywords.forEach((keyword) => keywords.add(keyword));
      }

      // Convert Set to Array and filter out any undefined or empty values
      const processedKeywords = Array.from(keywords).filter(Boolean);

      console.log("\nExtracted Keywords:", processedKeywords);

      // Search for subreddits using each keyword
      console.log("\nSearching for subreddits with each keyword...");
      const subredditPromises = processedKeywords.map(async (keyword) => {
        console.log(`\nSearching for keyword: "${keyword}"`);
        const results = await this.searchSubreddits(keyword, 10);
        console.log(`Found ${results.length} subreddits for "${keyword}":`);
        results.forEach((sub) => {
          console.log(`- r/${sub.name} (${sub.subscribers} subscribers)`);
        });
        return results;
      });

      const subredditResults = await Promise.all(subredditPromises);
      console.log("\nTotal subreddits found:", subredditResults.flat().length);

      // Flatten and deduplicate results
      const uniqueSubreddits = new Map();
      subredditResults.flat().forEach((subreddit) => {
        if (!uniqueSubreddits.has(subreddit.name)) {
          uniqueSubreddits.set(subreddit.name, subreddit);
        }
      });

      console.log(
        "\nUnique subreddits after deduplication:",
        uniqueSubreddits.size
      );

      // Sort by subscriber count
      const sortedSubreddits = Array.from(uniqueSubreddits.values()).sort(
        (a, b) => b.subscribers - a.subscribers
      );

      console.log("\nFinal sorted subreddits by subscriber count:");
      sortedSubreddits.forEach((sub, index) => {
        console.log(`${index + 1}. r/${sub.name}`);
        console.log(`   Title: ${sub.title}`);
        console.log(`   Subscribers: ${sub.subscribers}`);
        console.log(`   Description: ${sub.description.substring(0, 100)}...`);
      });

      console.log("\n=== Reddit Search Complete ===\n");
      return sortedSubreddits;
    } catch (error) {
      console.error("\nError in findRelevantSubreddits:", error);
      throw error;
    }
  }

  async getAuthToken() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }
      return session.access_token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  }

  async getSubredditRules(subredditName) {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subredditName }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subreddit rules");
      }

      const data = await response.json();
      return {
        rules: data.rules || [],
        requirements: data.requirements || {
          minKarma: 0,
          minAccountAge: 0,
          isRestricted: false,
          isPrivate: false,
        },
      };
    } catch (error) {
      console.error("Error fetching subreddit rules:", error);
      throw error;
    }
  }
}
