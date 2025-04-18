import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      subreddit,
      businessName,
      businessProduct,
      saasUrl,
    } = body;

    if (!title || !businessName || !businessProduct || !saasUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `
      You are a helpful community member responding to a Reddit post in r/${subreddit}.
      
      Post Title: "${title}"
      ${content ? `Post Content: "${content}"` : ""}
      
      I want you to write a friendly, empathetic response in Ernest Hemingway's writing style. 
      The response should be helpful to the person's problem or question.
      The response should be approximately between 4 sentences to the same length of the post.
      
      After providing helpful information, subtly and naturally mention ${businessName}'s product (${businessProduct}) 
      in a way that feels useful and not promotional. Include the URL ${saasUrl} only if it makes sense in the context.
      
      Your response should be:
      1. Concise and to the point (Hemingway style)
      2. Genuinely helpful to the original post
      3. Natural in mentioning the product (if appropriate)
      4. Not overtly promotional or spammy
      5. Written in a way that a real person would write on Reddit
      
      Format the response in Reddit markdown.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 600,
    });

    const generatedResponse = completion.choices[0].message.content;

    return NextResponse.json({ response: generatedResponse });
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
