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

Generate a JSON response with this structure:
{
  "name": "plan name (should indicate it's a basic/essential tier)",
  "price": "price in USD (should be entry-level pricing)",
  "billingPeriod": "monthly",
  "mainFeature": "the single core feature",
  "description": "short plan description focusing on the core feature",
  "features": ["only the single most essential feature"],
  "cta": "call to action text",
  "trialDays": number of trial days,
  "setupFee": "setup fee in USD",
  "limitations": "clear usage limits"
}

Focus on making the single-feature plan attractive and valuable while keeping it minimalistic (one feature only).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: false,
    });

    const generatedText = completion.choices[0].message.content;
    console.log("✅ API Pricing - Generated pricing:", generatedText);

    const pricingPlan = JSON.parse(generatedText);

    return NextResponse.json({ pricing_plans: [pricingPlan] });
  } catch (error) {
    console.error("❌ API Pricing - Error:", error);
    return NextResponse.json(
      { error: "Failed to generate pricing plan" },
      { status: 500 }
    );
  }
}
