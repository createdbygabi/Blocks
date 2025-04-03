import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { OpenAI } from "openai";

const openai = new OpenAI();

// Hero section specific instructions
const HERO_INSTRUCTIONS = {
  title: {
    instructions:
      "Create a hero title for clarity, impact, and conversion potential. Focus on action words, emotional triggers, and word count. No mention of AI.",
    examples: [
      "Give your X posts the engagement they deserve",
      "Ship your startup in days, not weeks",
      "Save hours on social media posting",
      "Build & monetize your audience, fast",
    ],
  },
  subtitle: {
    instructions:
      "Create a hero subtitle for clarity, benefit focus, and how well it expands on the title. Check word count and emotional resonance. No mention of AI.",
    examples: [
      "AI-powered analytics that help you make smarter decisions in half the time",
      "The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app and make your first $ online fast.",
      "The simplest way to post and grow on all platforms. Built for creators and small teams without the ridiculous price tag.",
      "Get sales, growth and new networks. Faster than what you're currently trying.",
    ],
  },
};

export async function POST(request) {
  try {
    const headersList = headers();
    const subdomain = headersList.get("x-subdomain");
    console.log(
      "🎯 Hero Section API - Request received for subdomain:",
      subdomain
    );

    // Get the request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error(
        "❌ Hero Section API - Failed to parse request body:",
        error
      );
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { heroTitle, heroSubtitle, targetAudience, painPoint } = requestBody;

    console.log("🎯 Hero Section API - Request data:", {
      heroTitle,
      heroSubtitle,
      targetAudience,
      painPoint,
    });

    // Validate required fields
    const missingFields = [];
    if (!heroTitle) missingFields.push("heroTitle");
    if (!heroSubtitle) missingFields.push("heroSubtitle");
    if (!targetAudience) missingFields.push("targetAudience");
    if (!painPoint) missingFields.push("painPoint");

    if (missingFields.length > 0) {
      console.error(
        "❌ Hero Section API - Missing required fields:",
        missingFields
      );
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Construct the analysis prompt
    const prompt = `As an expert conversion copywriter, analyze the hero section of a landing page.

Current Hero Section:
Title: "${heroTitle}"
Subtitle: "${heroSubtitle}"
Target Audience: "${targetAudience}"
Pain Point: "${painPoint}"

Provide a quick, actionable analysis following this exact format:

QUICK ANALYSIS:
Relevance to Audience: [1 sentence, straight to the point]
Clarity: [1 sentence, straight to the point]
Action Words: [1 sentence, straight to the point]
Emotional Appeal: [1 sentence, straight to the point]
Value Proposition: [1 sentence, straight to the point]
Urgency: [1 sentence, straight to the point]
Solution Focus: [1 sentence, straight to the point]

Then provide 3 alternative headlines & subtitles that are better, based on relevance to the audience, clarity, action words, emotional appeal, value proposition, urgency, and solution focus. Here are some examples of good titles and subtitles:

Example Good Titles:
${HERO_INSTRUCTIONS.title.examples.map((ex) => `- "${ex}"`).join("\n")}

Example Good Subtitles:
${HERO_INSTRUCTIONS.subtitle.examples.map((ex) => `- "${ex}"`).join("\n")}
1. [Alternative headline]
2. [Alternative headline]
3. [Alternative headline]
4. [Alternative subtitle]
5. [Alternative subtitle]
6. [Alternative subtitle]

DO not mention AI in the analysis or recommendations.

Keep the analysis concise and actionable. Focus on specific improvements rather than scoring.`;

    console.log("🎯 Hero Section API - Calling OpenAI with prompt");

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert conversion copywriter who specializes in analyzing and optimizing landing page hero sections. Provide detailed, actionable feedback while maintaining a constructive tone. Always follow the exact format specified in the prompt.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("🎯 Hero Section API - Received OpenAI response");

    const analysis = completion.choices[0].message.content;
    console.log("🎯 Hero Section API - Analysis:", analysis);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    console.error("❌ Hero Section API - Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
