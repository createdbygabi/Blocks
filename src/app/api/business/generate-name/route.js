import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { businessInfo } = await req.json();

    if (!businessInfo) {
      return NextResponse.json(
        { error: "Missing business info" },
        { status: 400 }
      );
    }

    console.log("🚀 API Business Name - Received business info:", businessInfo);
    console.log(
      "🔑 API Business Name - Checking OpenAI token:",
      process.env.OPENAI_API_KEY ? "Present" : "Missing"
    );

    const prompt = `
      Generate 5 creative and memorable business names based on these details:
      - Niche: ${businessInfo.niche}
      - Main Feature/Product: ${businessInfo.product}
      - Pain Point Solved: ${businessInfo.pain_point}
      - Target Audience: ${businessInfo.target_audience}

      Requirements:
      - Names should be unique and brandable
      - Should be short (< 8 characters)
      - One word only
      - Should be easy to remember and spell
      - Could include wordplay or clever combinations
      - Must be suitable for a SaaS business
      - Should hint at the value proposition
      - No generic terms like "Solutions" or "Technologies"
      - Return only the names, one per line
      - No special characters, only one name per line


      Examples of good SaaS names:
      - Shopify (ecommerce platform)
      - Calendly (scheduling tool)
      - Mailchimp (email marketing)
      - Notion (productivity tool)
      - Figma (design tool)

      Order them by how catchy they are
    `;
    console.log("📝 API Business Name - Generated prompt:", prompt);

    console.log("🤖 API Business Name - Calling OpenAI...");
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });
    console.log("📦 API Business Name - Raw OpenAI response:", completion);

    const names = completion.choices[0].message.content
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    console.log("✅ API Business Name - Generated names:", names);

    return NextResponse.json({ names });
  } catch (error) {
    console.error("❌ API Business Name - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate names" },
      { status: 500 }
    );
  }
}
