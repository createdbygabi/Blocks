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

    // Create a prompt for domain name generation
    const prompt = `Generate 10 unique and creative domain name suggestions for a business with the following details:
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

    Format the response as a JSON array of strings, where each string is a domain name.`;

    // Generate domain names using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a domain name expert who creates unique, memorable, and brandable domain names.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse the response to get the array of domains
    const response = completion.choices[0].message.content;
    console.log("🚀 response", response);
    let domains;
    try {
      domains = JSON.parse(response);
      console.log("🚀 domains", domains);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return NextResponse.json(
        { error: "Failed to parse domain suggestions" },
        { status: 500 }
      );
    }

    // Ensure we have exactly 10 domains
    if (!Array.isArray(domains) || domains.length !== 10) {
      return NextResponse.json(
        { error: "Invalid number of domain suggestions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("Error generating domain names:", error);
    return NextResponse.json(
      { error: "Failed to generate domain names" },
      { status: 500 }
    );
  }
}
