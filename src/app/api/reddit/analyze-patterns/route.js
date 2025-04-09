import { NextResponse } from "next/server";
import { headers } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { posts } = await request.json();

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: "Posts array is required" },
        { status: 400 }
      );
    }

    // Sort posts by score to focus on most successful
    const sortedPosts = posts.sort((a, b) => b.score - a.score);

    // Format top 10 posts for analysis
    const topPosts = sortedPosts
      .slice(0, 40)
      .map(
        (post, index) => `${index + 1}. "${post.title}" (${post.score} upvotes)`
      )
      .join("\n");

    const prompt = `Analyze these top-performing Reddit post titles and provide a concise, data-driven breakdown:

1. ALL TOP 3 PATTERNS IN THE 40 TOP POSTS RANKED BY FREQUENCY (cite all examples, EVERY post):
Example format:
"[Pattern Name] - Used in X posts
- Original post: "[Exact Title]" (Y upvotes)
- Original post 2: "[Exact Title]" (Y upvotes)
- Original post x: "[Exact Title]" (Y upvotes)
- Template: "[Pattern with [TERMS]]""

Posts to analyze:
${topPosts}

Be extremely specific and always reference actual posts from the data. Make sure to use all posts as examples (40), meaning you should correctly include all 40 posts in your analysis. Don't use any words other than the analysis itself.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a data-driven content analyzer. Focus on patterns that appear multiple times in the data and always cite specific examples. Be concise and quantitative in your analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o",
      temperature: 0.5,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error in analyze-patterns route:", error);
    return NextResponse.json(
      { error: "Failed to analyze post patterns" },
      { status: 500 }
    );
  }
}
