import OpenAI from "openai";
import { defaultContent } from "@/app/landing/page";

const openai = new OpenAI();

export async function POST(req) {
  try {
    const { businessInfo, brandingResults } = await req.json();

    // Use the defaultContent structure as a template
    const prompt = `Generate landing page content for a ${
      businessInfo.niche
    } business named "${brandingResults.name}".
    The content should follow this exact structure but be customized for the business:
    ${JSON.stringify(defaultContent, null, 2)}
    
    Make sure to:
    1. Keep all the same fields and structure
    2. Customize all text for the specific business
    3. Keep similar tone and style
    4. Use realistic metrics and testimonials
    5. Maintain professional pricing structure`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a professional copywriter specializing in landing pages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(completion.choices[0].message.content);

    return Response.json({ content });
  } catch (error) {
    console.error("Failed to generate content:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
