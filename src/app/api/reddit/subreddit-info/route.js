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

    const { subredditName } = await request.json();

    if (!subredditName) {
      return NextResponse.json(
        { error: "Subreddit name is required" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    // Fetch subreddit info
    const aboutResponse = await fetch(
      `${REDDIT_BASE_URL}/r/${subredditName}/about.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "MyApp/1.0.0",
        },
      }
    );

    if (!aboutResponse.ok) {
      throw new Error(
        `Failed to fetch subreddit info: ${aboutResponse.status}`
      );
    }

    const aboutData = await aboutResponse.json();

    // Fetch recent posts to calculate posts in last 24h
    const postsResponse = await fetch(
      `${REDDIT_BASE_URL}/r/${subredditName}/new.json?limit=100`,
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

    // Format the response
    const subredditInfo = {
      name: aboutData.data.display_name,
      title: aboutData.data.title,
      description:
        aboutData.data.public_description || aboutData.data.description,
      subscribers: aboutData.data.subscribers || 0,
      url: aboutData.data.url,
      over18: aboutData.data.over18,
      created: new Date(aboutData.data.created_utc * 1000).toISOString(),
      icon_img: aboutData.data.icon_img || null,
      community_icon: aboutData.data.community_icon || null,
      recentPosts,
    };

    return NextResponse.json(subredditInfo);
  } catch (error) {
    console.error("Error in subreddit-info route:", error);
    return NextResponse.json(
      { error: "Failed to fetch subreddit information" },
      { status: 500 }
    );
  }
}
