import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { businessInfo } = await req.json();

    console.log("💰 API Pricing - Received business info:", businessInfo);

    const prompt = `Generate a minimal starter pricing plan for a ${businessInfo.niche} business.
The business offers: ${businessInfo.product}
Core feature/benefit: ${businessInfo.mainFeature}
Target audience: ${businessInfo.targetAudience}

The revenue strategy has to be based on the core feature/benefit, market for the product, and the target audience.

Important: Generate a plan with ONLY THE SINGLE MOST ESSENTIAL FEATURE.

Return ONLY a raw JSON object (no markdown, no code fences) with this structure:
{
  "name": "plan name",
  "price": "price in USD (should be entry-level pricing)",
  "billingPeriod": "monthly",
  "mainFeature": "the single core feature",
  "description": "short plan description focusing on the core feature",
  "features": ["only the single most essential feature"],
  "cta": "call to action text",
  "setupFee": "setup fee in USD",
  "limitations": "clear usage limits"
}

Focus on making the single-feature plan attractive and valuable while keeping it minimalistic (one feature only).
IMPORTANT: Return only the raw JSON object, no markdown formatting or code fences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a JSON API that returns only valid JSON objects without any markdown formatting or explanation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const generatedText = completion.choices[0].message.content;
    console.log("✅ API Pricing - Generated pricing:", generatedText);

    // Clean the response by removing any markdown code fences or extra formatting
    const cleanedText = generatedText
      .replace(/```json\n?/, "") // Remove opening code fence
      .replace(/```\n?$/, "") // Remove closing code fence
      .trim(); // Remove any extra whitespace

    try {
      const pricingPlan = JSON.parse(cleanedText);
      return NextResponse.json({ pricing_plans: [pricingPlan] });
    } catch (parseError) {
      console.error("❌ API Pricing - JSON Parse Error:", parseError);
      console.error("Raw text:", generatedText);
      console.error("Cleaned text:", cleanedText);
      throw new Error("Failed to parse pricing plan JSON");
    }
  } catch (error) {
    console.error("❌ API Pricing - Error:", error);
    return NextResponse.json(
      { error: "Failed to generate pricing plan" },
      { status: 500 }
    );
  }
}
