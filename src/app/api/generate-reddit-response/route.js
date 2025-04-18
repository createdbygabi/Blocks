import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const {
      title,
      content,
      subreddit,
      businessName,
      product,
      mainFeature,
      saasUrl,
    } = await request.json();

    // Validate input
    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!businessName || !product) {
      return NextResponse.json(
        { error: "Business name and product are required." },
        { status: 400 }
      );
    }

    // Generate response with ChatGPT
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful Reddit commenter representing a SaaS product. 
          Your goal is to provide genuinely helpful responses to Reddit posts while naturally mentioning your product if appropriate.
          
          Guidelines:
          1. Be genuinely helpful first - provide value beyond just promoting the product
          2. Mention the product only if it directly addresses the user's pain point or question
          3. Be conversational and casual, like a normal Reddit user
          4. Keep responses brief and to the point
          5. Don't be overly sales-y or promotional
          6. Use proper formatting for Reddit (e.g., **bold**, *italic*)
          
          Always respond in first person.`,
        },
        {
          role: "user",
          content: `I need you to create a helpful Reddit comment for this post in the r/${subreddit} subreddit.
          
          Post title: "${title}"
          ${content ? `Post content: "${content}"` : ""}
          
          I represent the SaaS product "${product}" by ${businessName}. 
          Main feature: ${mainFeature}
          URL: ${saasUrl}
          
          If you think this post is a good fit for mentioning our product, create a comment that:
          1. Provides genuinely helpful information first
          2. Naturally mentions our product and how it solves their problem
          3. Is conversational and doesn't sound like an advertisement
          
          If this post isn't a good fit for mentioning our product, just provide a helpful response without mentioning it.
          
          Remember to use proper Reddit formatting and keep it concise.`,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error generating Reddit response:", error);
    return NextResponse.json(
      { error: "Failed to generate response: " + error.message },
      { status: 500 }
    );
  }
}
