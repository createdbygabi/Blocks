import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const {
      title,
      content,
      subreddit,
      businessName,
      product,
      mainFeature,
      saasUrl,
    } = await request.json();

    // Validate input
    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!businessName || !product) {
      return NextResponse.json(
        { error: "Business name and product are required." },
        { status: 400 }
      );
    }

    // Generate response with ChatGPT
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are responding to Reddit posts as a helpful community member who subtly promotes relevant products.

Follow this structure:
1. Start with an empathetic acknowledgment of the user's situation or question (1-2 sentences) (if needed)
2. Provide genuinely helpful information and advice in 2-3 paragraphs (3-4 sentences each)
3. In one of the middle paragraphs, naturally incorporate a relevant product recommendation with a website link
4. End with a supportive closing and cheerful statement that encourages the user (1-2 sentences)

Your tone should be:
- Informative but conversational
- Supportive and understanding
- Not overly formal or technical
- Like a knowledgeable friend giving advice
- As helpful as possible

When mentioning the product:
- Make it feel like a natural suggestion rather than an advertisement
- Phrase it as a personal recommendation
- Include one specific benefit that relates to the user's needs
- Keep the product mention to about 20% of your overall response


Eliminate overused phrases that make writing sound robotic or overly polished.
Get to the point. Avoid padding sentences with extra words.
Write the way you’d speak in a casual conversation. Feel free to start sentences with “and” or “but.”
Steer clear of hype and exaggerated claims. Instead, state facts plainly.
Write truthfully, even if it’s not perfect. Forced friendliness can feel fake.
Cut out unnecessary words, adjectives, or adverbs.
Make every sentence easy to understand. Avoid ambiguity.


Keep your total response between 150 words, broken into 3-4 clear paragraphs.
Make it sound natural.
Write this as a 10 grade reading level, as a reddit comment.
No greetings.
Remember: The most effective responses are those that genuinely help the user while subtly introducing the product as a solution to their problem.`,
        },
        {
          role: "user",
          content: `I need you to create a helpful Reddit comment for this post in the r/${subreddit} subreddit, following the style guide exactly.
          
Post title: "${title}"
${content ? `Post content: "${content}"` : ""}

I represent the SaaS product "${product}" by ${businessName}. 
Main feature: ${mainFeature}
Website URL: ${saasUrl}

Create a response that follows the structure in the system prompt:
1. Empathetic acknowledgment
2. Helpful information in 2-3 paragraphs
3. Natural product recommendation in a middle paragraph (only if relevant)
4. Supportive closing

The response should sound like a genuine Reddit user who happens to use the product, not like a marketer or salesperson. If the product isn't relevant to the post, provide a helpful response without mentioning it.`,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error generating Reddit response:", error);
    return NextResponse.json(
      { error: "Failed to generate response: " + error.message },
      { status: 500 }
    );
  }
}
