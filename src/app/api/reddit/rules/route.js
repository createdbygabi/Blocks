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
      throw new Error("Failed to get access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
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

    // Fetch subreddit rules
    const rulesResponse = await fetch(
      `${REDDIT_BASE_URL}/r/${subredditName}/about/rules.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "MyApp/1.0.0",
        },
      }
    );

    if (!rulesResponse.ok) {
      throw new Error("Failed to fetch subreddit rules");
    }

    const rulesData = await rulesResponse.json();

    // Fetch subreddit about info for posting requirements
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
      throw new Error("Failed to fetch subreddit info");
    }

    const aboutData = await aboutResponse.json();

    const rules = rulesData.rules.map((rule) => ({
      shortName: rule.short_name,
      description: rule.description,
      kind: rule.kind,
    }));

    const requirements = {
      minKarma: aboutData.data.min_karma || 0,
      minAccountAge: aboutData.data.min_account_age || 0,
      isRestricted: aboutData.data.subreddit_type === "restricted",
      isPrivate: aboutData.data.subreddit_type === "private",
    };

    return NextResponse.json({ rules, requirements });
  } catch (error) {
    console.error("Error in rules route:", error);
    return NextResponse.json(
      { error: "Failed to fetch subreddit rules" },
      { status: 500 }
    );
  }
}
