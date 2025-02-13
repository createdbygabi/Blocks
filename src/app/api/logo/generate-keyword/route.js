import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { businessInfo } = await req.json();
    console.log("🚀 API Names - Received business info:", businessInfo);
    console.log(
      "🔑 API Names - Checking OpenAI token:",
      process.env.OPENAI_API_KEY ? "Present" : "Missing"
    );

    if (!businessInfo) {
      throw new Error("No business info provided");
    }

    const prompt = `
      Give me one object word that describes the business the best to make a logo based on this object
      - Product: ${businessInfo.product}

      Examples:
      For an AI resume builder, the word could be Notebook
      For a SaaS that helps with time management, the word could be Clock
      For a SaaS that helps with content creation, the word could be Pen
      For a SaaS that helps with task management, the word could be Checklist
      For a SaaS that helps with project management, the word could be Calendar
      For a SaaS that helps with email marketing, the word could be Envelope
      For a SaaS that generates landing pages, the word could be Website
      

      Requirements:
      - No special characters
      - Return only one word
      - The word should be a single object
      - No vague words with different meanings
    `;
    console.log("📝 API Names - Generated prompt:", prompt);

    console.log("🤖 API Names - Calling OpenAI...");
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });
    console.log("📦 API Names - Raw OpenAI response:", completion);

    const names = completion.choices[0].message.content
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    console.log("✅ API Names - Final processed names:", names);

    return Response.json({ names });
  } catch (error) {
    console.error("❌ API Names - Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
}
