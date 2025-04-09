import { NextResponse } from "next/server";
import { headers } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysis, product, marketingTool } = await request.json();

    if (!analysis || !product) {
      return NextResponse.json(
        { error: "Analysis text and product are required" },
        { status: 400 }
      );
    }

    const prompt = `
Based on this analysis of high engaging posts:
${analysis}

Analyze these patterns and craft 10 highly engaging subreddit titles, following these same succesful title structures to promote a tool that help saas founders/entrepeneurs write highly converting copywriting (with ai) for their landing page, i also built a tool that scan your a hero section and suggest improvements (for engineering as marketing purposes)`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o",
      // temperature: 0.7,
    });

    const generatedTitles = completion.choices[0].message.content;

    return NextResponse.json({ titles: generatedTitles });
  } catch (error) {
    console.error("Error in generate-titles route:", error);
    return NextResponse.json(
      { error: "Failed to generate titles" },
      { status: 500 }
    );
  }
}
