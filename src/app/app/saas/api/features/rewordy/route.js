import OpenAI from "openai";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    const systemPrompt = `You are an expert English language correction system. Your task is to:

1. Identify and correct grammar, spelling, and punctuation errors
2. Maintain the original meaning and style of the text
3. Don't delete any sentences
4. Do not change correct phrases or rewrite content
5. Focus only on making the text grammatically correct and natural
6. Provide clear explanations for each correction

Return your response in this exact JSON format (very important):
{
  "correctedText": "the full corrected text",
  "corrections": [
    {
      "original": "the original incorrect text",
      "corrected": "the corrected version",
      "type": "grammar|spelling|punctuation",
      "explanation": "brief explanation of why this needed correction"
    }
  ]
}

Make sure to only return valid JSON, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    let result;
    try {
      result = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse GPT response:", e);
      throw new Error("Invalid response format from AI");
    }

    // Process corrections to create inline markers
    const corrections = result.corrections.map((correction) => ({
      text: correction.corrected,
      type: correction.type,
      explanation: correction.explanation,
    }));

    return NextResponse.json({
      correctedText: result.correctedText,
      corrections,
      status: "success",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process text" },
      { status: 500 }
    );
  }
}
