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

    const { subredditName, title, text } = await request.json();

    if (!subredditName || !title || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    // Try to submit a test post
    const response = await fetch(`${REDDIT_BASE_URL}/api/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Blocks/1.0.0",
      },
      body: new URLSearchParams({
        sr: subredditName,
        kind: "self",
        title: title,
        text: text,
      }).toString(),
    });

    const data = await response.json();

    // Return the response which will include any error messages about karma requirements
    return NextResponse.json({
      success: response.ok,
      response: data,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Error in test-post route:", error);
    return NextResponse.json(
      { error: "Failed to submit test post", details: error.message },
      { status: 500 }
    );
  }
}
