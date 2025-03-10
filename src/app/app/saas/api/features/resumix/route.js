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

    const { jobDescription, experience } = await request.json();

    const systemPrompt = `You are an expert resume writer and career coach. Your task is to transform the user's experience into compelling experience bullets content that's perfectly tailored for their target job. Follow these guidelines:

1. Analyze the job description for key requirements, skills, and preferences
2. Match the user's experience with these requirements
3. Use strong action verbs and quantifiable achievements
4. Incorporate relevant keywords from the job description naturally
5. Focus on impact and results
6. Use concise, professional language
7. Format the content in clear bullet points
8. Highlight transferable skills when applicable
9. No bullshit language, keep it simple and professional

Bullet Points:
Follow a structured format like STAR (Situation - the situation you had to deal with
Task - the task you were given to do
Action - the action you took
Result - what happened as a result of your action and what you learned from the experience), XYZ ( stands for the achievement or task you accomplished.
Y represents the measurable outcome or the impact of your action.
Z details how you achieved it, the method or approach you used.), or CAR (Challenge - the challenge you faced
Action - the action you took
Result - the outcome of your action).
Use bullet points (1–2 lines, ideally 1 sentence each).
Begin each with a strong past-tense action verb (e.g., analyzed, designed, developed).
Make sure to display metrics and results as numbers in every bullet point (very important)

Style:
Avoid personal pronouns (I, we, my, our).
Do not end bullets with periods.
Use digits for numbers and avoid unnecessary adjectives/adverbs.
Do not overemphasize software skills; focus on underlying technical capabilities.


Output Format:
- Povide optimized bullet points for each experience of the candidate
- Ansswer in the same language as the candidate inputs
- Cover every experience of the candidate, 4 to 5 bullets per experience`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\nCandidate Experience:\n${experience}`,
        },
      ],
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content;

    return NextResponse.json({
      content: generatedContent,
      status: "success",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume content" },
      { status: 500 }
    );
  }
}
