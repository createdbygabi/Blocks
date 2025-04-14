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

export async function GET(request, { params }) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const postId = params.id;
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Get a fresh access token for each request
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${REDDIT_BASE_URL}/api/info?id=t3_${postId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "Blocks/1.0.0",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    const post = data.data.children[0]?.data;

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      score: post.score,
      numComments: post.num_comments,
      upvoteRatio: post.upvote_ratio,
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      createdUtc: post.created_utc,
    });
  } catch (error) {
    console.error("Error in post route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Reddit post" },
      { status: 500 }
    );
  }
}
