import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT_TEMPLATE = `You are a Midjourney prompt expert. Your task is to create a natural-sounding prompt from the provided parameters.

IMPORTANT:
1. Use commas to separate parameters, not ::
2. Combine parameters naturally (e.g., "gothic cat" instead of "cat, gothic")
3. Keep it concise - don't add unnecessary descriptions
4. Only use the elements provided in the input
5. Make it flow naturally while preserving the original meaning
6. Don't add any new artistic elements or descriptors

Input: {userPrompt}

Return only the enhanced prompt, nothing else.`;

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: PROMPT_TEMPLATE.replace("{userPrompt}", prompt),
        },
      ],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 100,
    });

    const enhancedPrompt = completion.choices[0].message.content.trim();

    // Get a preview of potential variations
    const variations = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Create 2 variations by rearranging the existing elements into natural phrases. Use commas to separate elements.
DO NOT add new descriptors or elements.

Original: "${enhancedPrompt}"

Return only the 2 variations separated by |||, nothing else.`,
        },
      ],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 150,
    });

    const promptVariations = variations.choices[0].message.content
      .split("|||")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 2);

    return Response.json({
      enhancedPrompt,
      variations: promptVariations,
      tokens: {
        promptTokens: completion.usage.prompt_tokens,
        variationTokens: variations.usage.prompt_tokens,
      },
    });
  } catch (error) {
    console.error("Mijurn API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
