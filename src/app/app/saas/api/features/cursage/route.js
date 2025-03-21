import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    console.log("Cursage API called with prompt:", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a prompt clarity assistant for Cursor IDE.
          Your task is to improve the structure and clarity of the user's prompt WITHOUT changing its meaning or intent.
          
          Guidelines:
          1. Keep the original request exactly as intended
          2. Only add technical context if it's clearly implied
          3. Fix any grammatical issues that might cause confusion
          4. Structure the prompt in a clear format
          5. Remove filler words while keeping all important details
          6. NEVER add new requirements or change the original request
          7. NEVER remove specific requirements the user included
          
          Return the prompt with improved clarity but identical meaning.
          Do not add explanations - return only the refined prompt.`,
        },
        {
          role: "user",
          content: `Refine this prompt while keeping its exact meaning:\n\n${prompt}`,
        },
      ],
      temperature: 0.3, // Very low temperature to stay close to input
      max_tokens: 300,
    });

    const enhancedPrompt = completion.choices[0].message.content;
    console.log("Enhanced prompt:", enhancedPrompt);

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error("Error in Cursage API:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
