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

    const {
      subredditName,
      limit = 30,
      sort = "hot",
      time = "day",
      after = null,
    } = await request.json();

    if (!subredditName) {
      return NextResponse.json(
        { error: "Subreddit name is required" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const response = await fetch(
      `${REDDIT_BASE_URL}/r/${subredditName}/${sort}.json?limit=${limit}&t=${time}${
        after ? `&after=${after}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "MyApp/1.0.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subreddit posts");
    }

    const data = await response.json();
    const posts = data.data.children.map((post) => ({
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      score: post.data.score,
      url: post.data.url,
      permalink: `https://reddit.com${post.data.permalink}`,
      created: new Date(post.data.created_utc * 1000).toISOString(),
      numComments: post.data.num_comments,
      isSelfPost: post.data.is_self,
      selftext: post.data.selftext,
    }));

    return NextResponse.json({
      posts,
      after: data.data.after, // Return the after parameter for pagination
    });
  } catch (error) {
    console.error("Error in posts route:", error);
    return NextResponse.json(
      { error: "Failed to fetch subreddit posts" },
      { status: 500 }
    );
  }
}
