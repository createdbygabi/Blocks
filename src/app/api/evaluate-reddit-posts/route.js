import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { posts, businessName, product, mainFeature, saasUrl } =
      await request.json();

    // Validate input
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: "Invalid input. Posts array is required." },
        { status: 400 }
      );
    }

    if (!businessName || !product) {
      return NextResponse.json(
        { error: "Business name and product are required." },
        { status: 400 }
      );
    }

    // Prepare posts for ChatGPT evaluation
    const postsForEvaluation = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      subreddit: post.subreddit,
    }));

    // Batch evaluate posts with ChatGPT
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at evaluating Reddit posts to determine if they're relevant for a SaaS product to engage with. 
          You'll be given a list of Reddit posts and a SaaS product description.
          
          For each post, you need to determine:
          1. Can we provide a HELPFUL response to this post? (yes/no)
          2. Can we plug the product in a natural way that addresses the user's pain point? (yes/no)
          
          Return your evaluation as JSON. Be strict - only say yes if there's a clear opportunity to be helpful AND plug the product.`,
        },
        {
          role: "user",
          content: `Evaluate these Reddit posts for the SaaS product "${product}" by ${businessName}.
          
          Product description: ${product} 
          Main feature: ${mainFeature}
          URL: ${saasUrl}
          
          Posts to evaluate:
          ${JSON.stringify(postsForEvaluation, null, 2)}
          
          For each post, evaluate:
          1. Can we provide a HELPFUL response (yes/no and why)
          2. Can we plug the product naturally (yes/no and why)
          
          Format your response as JSON:
          {
            "evaluations": [
              {
                "id": "post_id",
                "title": "post title",
                "canProvideHelpfulResponse": true/false,
                "helpfulResponseReason": "reason",
                "canPlugProduct": true/false,
                "plugProductReason": "reason"
              },
              ...
            ],
            "matchingPosts": ["id1", "id2", ...] // array of post IDs that satisfy both conditions
          }`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    // Parse the JSON response from GPT
    const evaluationResult = JSON.parse(response.choices[0].message.content);

    // Ensure proper structure
    if (
      !evaluationResult.evaluations ||
      !Array.isArray(evaluationResult.evaluations)
    ) {
      return NextResponse.json(
        { error: "Invalid response format from AI." },
        { status: 500 }
      );
    }

    // If matchingPosts isn't present, create it based on evaluations
    if (!evaluationResult.matchingPosts) {
      evaluationResult.matchingPosts = evaluationResult.evaluations
        .filter((e) => e.canProvideHelpfulResponse && e.canPlugProduct)
        .map((e) => e.id);
    }

    return NextResponse.json(evaluationResult);
  } catch (error) {
    console.error("Error evaluating Reddit posts:", error);
    return NextResponse.json(
      { error: "Failed to evaluate posts: " + error.message },
      { status: 500 }
    );
  }
}
