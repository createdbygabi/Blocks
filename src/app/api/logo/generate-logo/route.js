import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSymbol(businessInfo) {
  const symbolPrompt = `Generate a SINGLE word that represents the most iconic and recognizable symbol for this business:
  - Business niche: ${businessInfo.niche}
  - Main feature: ${businessInfo.main_feature}
  - Target audience: ${businessInfo.target_audience}

  Requirements:
  - Must be a single word representing a visual symbol (e.g., "lightning" for speed, "leaf" for nature)
  - Must be universally recognizable
  - Must be simple enough to work as a logo
  - Must capture the essence of the business
  - Must be timeless and not trendy
  - Must not be abstract or a concept but a physical object
  
  Examples:
  - Fast shipping service → "lightning"
  - Eco-friendly products → "leaf"
  - Cloud storage → "cloud"
  - AI technology → "brain"
  - Security service → "shield"
  

  Return ONLY the single word, nothing else, no special characters.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: symbolPrompt }],
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 10,
  });

  return completion.choices[0].message.content.trim().toLowerCase();
}

export async function POST(req) {
  try {
    const { businessInfo } = await req.json();
    console.log("🚀 API Logo - Starting generation process");

    // Step 1: Generate the symbolic word
    console.log("generated businessInfo", businessInfo);
    console.log("🎯 API Logo - Generating symbol word");
    const symbol = await generateSymbol(businessInfo);
    console.log("✨ API Logo - Generated symbol:", symbol);

    // Step 2: Create the logo prompt
    const logoPrompt = `a minimal ${symbol} symbol as a logo, fully filled with black color on white background, vector style, clean lines, simple`;

    console.log("🎨 API Logo - Final prompt:", logoPrompt);

    const requestBody = {
      input: {
        prompt: logoPrompt,
        prompt_upsampling: true,
      },
    };

    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error("❌ API Logo - Replicate error:", result.error);
      throw new Error(result.error);
    }

    const imageUrl = result.output;
    console.log("🖼️ API Logo - Final image URL:", imageUrl);

    return Response.json({
      imageUrl,
      symbol, // Return the symbol for reference
      prompt: logoPrompt, // Return the final prompt used
    });
  } catch (error) {
    console.error("❌ API Logo - Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
}
