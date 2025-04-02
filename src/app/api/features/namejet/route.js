import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { businessName, businessType, keywords, industry, targetAudience } =
      body;

    // Validate required fields
    if (
      !businessName ||
      !businessType ||
      !keywords ||
      !industry ||
      !targetAudience
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🚀 API NameJet - Received business info:", {
      businessName,
      businessType,
      keywords,
      industry,
      targetAudience,
    });

    const prompt = `
      Generate 10 unique and creative domain name suggestions for a business with the following details:
      - Business Name: ${businessName}
      - Business Type: ${businessType}
      - Keywords: ${keywords}
      - Industry: ${industry}
      - Target Audience: ${targetAudience}

      Requirements:
      1. Each domain should be unique and memorable
      2. Include common TLDs (.com, .io, .app, .ai, .dev)
      3. Keep domains short and easy to spell
      4. Avoid hyphens and numbers unless they make sense
      5. Make sure they're brandable and professional
      6. Consider the business type and industry
      7. Target the specified audience

      Examples of good domain names:
      - shopify.com (ecommerce platform)
      - calendly.io (scheduling tool)
      - mailchimp.com (email marketing)
      - notion.so (productivity tool)
      - figma.com (design tool)
      - tailwindcss.com (CSS framework)

      Return only the domain names, one per line
      Make sure to include one domain per line, nothing else
      Order them by how catchy and memorable they are
    `;

    console.log("📝 API NameJet - Generated prompt:", prompt);

    console.log("🤖 API NameJet - Calling OpenAI...");
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });
    console.log("📦 API NameJet - Raw OpenAI response:", completion);

    const domains = completion.choices[0].message.content
      .split("\n")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

    console.log("✅ API NameJet - Generated domains:", domains);

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("❌ API NameJet - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate domain names" },
      { status: 500 }
    );
  }
}
