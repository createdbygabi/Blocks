import { NextResponse } from "next/server";
import { headers } from "next/headers";

const REDDIT_CLIENT_ID = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_BASE_URL = "https://oauth.reddit.com";

async function getAccessToken() {
  try {
    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get Reddit access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Reddit access token:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, limit = 10 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const response = await fetch(
      `${REDDIT_BASE_URL}/subreddits/search.json?q=${encodeURIComponent(
        query
      )}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "MyApp/1.0.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search subreddits");
    }

    const data = await response.json();
    const subreddits = await Promise.all(
      data.data.children.map(async (subreddit) => {
        // Get recent posts count
        const postsResponse = await fetch(
          `${REDDIT_BASE_URL}/r/${subreddit.data.display_name}/new.json?limit=100`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "User-Agent": "MyApp/1.0.0",
            },
          }
        );

        let recentPosts = 0;
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          const oneDayAgo = Date.now() / 1000 - 24 * 60 * 60;
          recentPosts = postsData.data.children.filter(
            (post) => post.data.created_utc > oneDayAgo
          ).length;
        }

        return {
          name: subreddit.data.display_name,
          title: subreddit.data.title,
          description: subreddit.data.public_description,
          subscribers: subreddit.data.subscribers,
          url: subreddit.data.url,
          over18: subreddit.data.over18,
          created: new Date(subreddit.data.created_utc * 1000).toISOString(),
          recentPosts,
        };
      })
    );

    return NextResponse.json({ subreddits });
  } catch (error) {
    console.error("Error in search route:", error);
    return NextResponse.json(
      { error: "Failed to search subreddits" },
      { status: 500 }
    );
  }
}
