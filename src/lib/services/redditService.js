import { supabase } from "@/lib/supabase";

export class RedditService {
  constructor() {
    this.baseUrl = "/api/reddit";
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
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

  async getRelatedSubreddits(subredditName, limit = 10) {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/related-subreddits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subredditName, limit }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch related subreddits: ${response.status}`
        );
      }

      const data = await response.json();
      return data.relatedSubreddits || [];
    } catch (error) {
      console.error("Error getting related subreddits:", error);
      return [];
    }
  }

  async getUserRecentActivity(username) {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/user-activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.subreddits || [];
    } catch (error) {
      console.error("Error getting user activity:", error);
      return [];
    }
  }

  async generateSubredditGraphData(subredditName, depth = 2) {
    try {
      const nodes = new Set();
      const links = new Set();

      const processSubreddit = async (name, currentDepth = 0) => {
        if (currentDepth >= depth || nodes.has(name)) return;

        nodes.add(name);
        const related = await this.getRelatedSubreddits(name);

        for (const relatedSub of related) {
          nodes.add(relatedSub.name);
          links.add(
            JSON.stringify({
              source: name,
              target: relatedSub.name,
              value: relatedSub.strength,
            })
          );

          if (currentDepth < depth - 1) {
            await processSubreddit(relatedSub.name, currentDepth + 1);
          }
        }
      };

      await processSubreddit(subredditName);

      return {
        nodes: Array.from(nodes).map((name) => ({
          id: name,
          name: name,
          group: 1,
        })),
        links: Array.from(links).map((link) => JSON.parse(link)),
      };
    } catch (error) {
      console.error("Error generating graph data:", error);
      throw error;
    }
  }

  async findMostRelevantSubreddits(businessInfo, limit = 6) {
    try {
      // Extract keywords from business info
      const keywords = [
        businessInfo.name,
        businessInfo.industry,
        ...(businessInfo.target_audience?.split(",").map((k) => k.trim()) ||
          []),
        ...(businessInfo.keywords?.split(",").map((k) => k.trim()) || []),
      ].filter(Boolean);

      // Search for subreddits using keywords
      const subredditPromises = keywords.map((keyword) =>
        this.searchSubreddits(keyword, 10)
      );
      const subredditResults = await Promise.all(subredditPromises);

      // Flatten and deduplicate results
      const uniqueSubreddits = new Map();
      subredditResults.flat().forEach((subreddit) => {
        if (!uniqueSubreddits.has(subreddit.name)) {
          uniqueSubreddits.set(subreddit.name, {
            ...subreddit,
            relevanceScore: 0,
          });
        }
      });

      // Calculate relevance scores
      for (const subreddit of uniqueSubreddits.values()) {
        // Get related subreddits to analyze user overlap
        const related = await this.getRelatedSubreddits(subreddit.name, 5);

        // Calculate relevance score based on:
        // 1. Subscriber count (weight: 0.3)
        // 2. Recent activity (weight: 0.3)
        // 3. User overlap with other relevant subreddits (weight: 0.4)
        const subscriberScore =
          Math.min(subreddit.subscribers / 1000000, 1) * 0.3;
        const activityScore = Math.min(subreddit.recentPosts / 100, 1) * 0.3;
        const overlapScore =
          related.reduce((acc, rel) => acc + rel.strength, 0) * 0.4;

        subreddit.relevanceScore =
          subscriberScore + activityScore + overlapScore;
      }

      // Sort by relevance score and return top results
      return Array.from(uniqueSubreddits.values())
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error("Error finding relevant subreddits:", error);
      throw error;
    }
  }

  async getSubredditInfo(subredditName) {
    try {
      // Check cache first
      const cacheKey = `subreddit-${subredditName}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }

      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/subreddit-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subredditName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subreddit info: ${response.status}`);
      }

      const data = await response.json();
      const result = {
        name: subredditName,
        title: data.title || subredditName,
        description: data.description || "No description available",
        subscribers: data.subscribers || 0,
        recentPosts: data.recentPosts || 0,
        isNsfw: data.over18 || false,
        created: data.created || null,
        icon: data.icon_img || data.community_icon || null,
        url: data.url || `https://reddit.com/r/${subredditName}`,
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error("Error fetching subreddit info:", error);
      return {
        name: subredditName,
        title: subredditName,
        description: "Unable to load details",
        subscribers: 0,
        recentPosts: 0,
        isNsfw: false,
        created: null,
        icon: null,
        url: `https://reddit.com/r/${subredditName}`,
      };
    }
  }

  async getPosts(subredditName, options = {}) {
    const { limit = 30, sort = "hot", time = "day", after = null } = options;

    const response = await fetch(`/api/reddit/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
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
      throw new Error("Failed to fetch posts");
    }

    return response.json();
  }

  // Add test post functionality
  async submitPost(subredditName, postData) {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/test-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          subredditName,
          title: postData.title,
          text: postData.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit test post");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error submitting test post:", error);
      throw error;
    }
  }
}
