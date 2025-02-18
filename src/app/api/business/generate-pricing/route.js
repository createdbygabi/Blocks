import { OpenAIStream } from "@/lib/openai";
import { StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { businessInfo } = await req.json();

    const prompt = `Generate a minimal starter pricing plan for a ${businessInfo.niche} business.
The business offers: ${businessInfo.product}
Core feature/benefit: ${businessInfo.mainFeature}
Target audience: ${businessInfo.targetAudience}

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

Focus on making the single-feature plan attractive and valuable while keeping it simple.
The price should reflect that this is a focused, single-feature offering.`;

    const response = await OpenAIStream(prompt);
    return new StreamingTextResponse(response);
  } catch (error) {
    console.error("Pricing generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate pricing plan" }),
      { status: 500 }
    );
  }
}
