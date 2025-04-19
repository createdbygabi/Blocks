import { NextResponse } from "next/server";
import https from "https";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Reddit URL is required" },
        { status: 400 }
      );
    }

    // Extract post ID from URL if needed
    let targetUrl = url;
    let postId = null;

    // Try to extract post ID from different URL formats
    const commentMatch = url.match(/comments\/([a-zA-Z0-9]+)/);
    if (commentMatch) {
      postId = commentMatch[1];
      // Use the .json extension to get the JSON representation directly
      targetUrl = `https://www.reddit.com${url.substring(
        url.indexOf("/comments/")
      )}.json`;
      console.log(`Using Reddit JSON endpoint: ${targetUrl}`);
    } else {
      // Check if the URL itself is a post ID (t3_xxx format)
      const directIdMatch = url.match(/t3_([a-zA-Z0-9]+)/);
      if (directIdMatch) {
        postId = directIdMatch[1];
        targetUrl = `https://api.reddit.com/api/info/?id=t3_${postId}`;
        console.log(`Using Reddit API endpoint for post ID ${postId}`);
      }
    }

    console.log(`Fetching content from: ${targetUrl}`);

    // Make direct fetch
    const directResult = await makeSimpleRequest(targetUrl);
    console.log(`Direct fetch status: ${directResult.status}`);

    // Try to parse the response as JSON if possible
    let parsedData = null;
    if (directResult.data && typeof directResult.data === "string") {
      try {
        parsedData = JSON.parse(directResult.data);
        console.log("Successfully parsed response as JSON");

        // Check for the direct format shown in the example (single listing with t3 post)
        if (
          parsedData?.kind === "Listing" &&
          parsedData?.data?.children?.length > 0
        ) {
          console.log("=== DIRECT LISTING FORMAT DETECTED ===");
          const post = parsedData.data.children[0].data;

          console.log("=== POST DATA (DIRECT LISTING) ===");
          console.log("Title:", post.title);
          console.log("Author:", post.author);
          console.log("Subreddit:", post.subreddit);
          console.log("Text:", post.selftext || "[No text content]");
          console.log("SELFTEXT CONTENT:", post.selftext);
          console.log("URL:", post.url);

          // Log the full selftext for debugging
          console.log("COMPLETE SELFTEXT:");
          console.log(post.selftext);
        }
        // Log if we have complete post data
        else if (Array.isArray(parsedData) && parsedData.length >= 2) {
          console.log("=== FULL REDDIT POST + COMMENTS STRUCTURE DETECTED ===");

          // Post data
          if (parsedData[0]?.data?.children?.[0]?.data) {
            const post = parsedData[0].data.children[0].data;
            console.log("=== POST DATA ===");
            console.log("Title:", post.title);
            console.log("Author:", post.author);
            console.log("Subreddit:", post.subreddit);
            console.log("Text:", post.selftext || "[No text content]");
            console.log("SELFTEXT CONTENT:", post.selftext);
            console.log("URL:", post.url);
            console.log(
              "Created:",
              new Date(post.created_utc * 1000).toISOString()
            );
          }

          // Comments data
          if (parsedData[1]?.data?.children) {
            console.log(
              `=== COMMENTS DATA (${parsedData[1].data.children.length} comments) ===`
            );
            const topLevelComments = parsedData[1].data.children
              .filter((c) => c.kind === "t1")
              .map((c) => ({
                author: c.data.author,
                body: c.data.body,
                score: c.data.score,
                created: new Date(c.data.created_utc * 1000).toISOString(),
              }));

            console.log(
              `First 3 comments:`,
              JSON.stringify(topLevelComments.slice(0, 3), null, 2)
            );
          }
        }
        // API info endpoint format
        else if (
          parsedData?.data?.children &&
          parsedData.data.children.length > 0
        ) {
          const post = parsedData.data.children[0].data;
          console.log("=== POST DATA (API INFO ENDPOINT) ===");
          console.log("Title:", post.title);
          console.log("Author:", post.author);
          console.log("Subreddit:", post.subreddit);
          console.log("Text:", post.selftext || "[No text content]");
          console.log("SELFTEXT CONTENT:", post.selftext);
          console.log("URL:", post.url);
          console.log(
            "Created:",
            new Date(post.created_utc * 1000).toISOString()
          );
        }
      } catch (parseError) {
        console.log("Response is not valid JSON:", parseError);
        console.log("=== RAW RESPONSE DATA (first 500 chars) ===");
        console.log(directResult.data.substring(0, 500));
      }
    }

    // Return the full data without truncation
    return NextResponse.json({
      status: directResult.status,
      headers: directResult.headers,
      responseData: directResult.data,
      parsedData: parsedData,
      error: directResult.error,
      source: "direct",
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      {
        error: `API error: ${error.message}`,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

// Function to make a simple HTTP request and return raw results
async function makeSimpleRequest(url) {
  return new Promise((resolve) => {
    // Parse the URL
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        // Use a descriptive Reddit-friendly User-Agent as per Reddit API guidelines
        "User-Agent": "blocks-app/1.0 by blocks_admin_app",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
    };

    console.log("Request options:", JSON.stringify(options));

    const req = https.request(options, (res) => {
      console.log(`Response status: ${res.statusCode}`);
      console.log(`Response headers:`, JSON.stringify(res.headers));

      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        console.log(`Total response size: ${responseData.length} bytes`);

        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData,
          error: res.statusCode >= 400 ? `HTTP error ${res.statusCode}` : null,
        });
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error.message);
      resolve({
        status: -1,
        headers: {},
        data: null,
        error: `Request error: ${error.message}`,
      });
    });

    req.end();
  });
}
