import OpenAI from "openai";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanHtmlContent(html) {
  return (
    html
      // Convert headers to text with line breaks
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, "$1\n\n")
      // Convert paragraphs to line breaks
      .replace(/<p[^>]*>(.*?)<\/p>/g, "$1\n\n")
      // Convert lists
      .replace(/<ul[^>]*>|<\/ul>/g, "\n")
      .replace(/<ol[^>]*>|<\/ol>/g, "\n")
      .replace(/<li[^>]*>(.*?)<\/li>/g, "• $1\n")
      // Remove images, figures, and other complex elements
      .replace(/<figure[^>]*>.*?<\/figure>/gs, "")
      .replace(/<img[^>]*>/g, "")
      // Preserve line breaks
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<hr\s*\/?>/g, "\n---\n")
      // Remove all other HTML tags but keep their content
      .replace(/<[^>]*>/g, "")
      // Fix HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      // Fix spacing
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

async function fetchLinkedInPost(url) {
  try {
    console.log("\n📫 Fetching LinkedIn post");
    console.log("🔗 URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = await response.text();
    const contentMatch = html.match(
      /<p[^>]*data-test-id="main-feed-activity-card__commentary"[^>]*>(.*?)<\/p>/s
    );
    const content = contentMatch
      ? contentMatch[1].replace(/<[^>]*>/g, "").trim()
      : null;

    console.log("\n📝 Extracted LinkedIn content:");
    console.log("------------------------");
    console.log(content || "[No content found]");
    console.log("------------------------\n");

    return content || `[Could not fetch content from: ${url}]`;
  } catch (error) {
    console.error("\n❌ Error fetching LinkedIn post:", error.message);
    return `[Error fetching post: ${url}]`;
  }
}

async function fetchSubstackPost(url) {
  try {
    console.log("\n📚 Fetching Substack post");
    console.log("🔗 URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = await response.text();

    // Get the main content from the body markup div
    const contentMatch = html.match(
      /<div[^>]*class="[^"]*body markup[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="post-footer">|$)/
    );

    if (!contentMatch) {
      console.log("No content found");
      return `[Could not fetch content from: ${url}]`;
    }

    // Clean and return the content
    return cleanHtmlContent(contentMatch[1]);
  } catch (error) {
    console.error("\n❌ Error fetching Substack post:", error.message);
    return `[Error fetching post: ${url}]`;
  }
}

export async function POST(request) {
  console.log("\n🚀 Starting Newsletter Generation");
  try {
    const { linkedinUrls, substackUrls, businessName, businessId, userId } =
      await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First fetch the Substack newsletters to use as templates
    const substackContent = await Promise.all(
      (substackUrls || []).map((url) => fetchSubstackPost(url))
    );

    // Then fetch LinkedIn content
    const linkedinContent = await Promise.all(
      (linkedinUrls || []).map((url) => fetchLinkedInPost(url))
    );

    // Detect language from first LinkedIn post
    const detectedLanguage = linkedinContent[0]?.includes("é") ? "fr" : "en";

    const templateExamples = substackContent.join(
      "\n\n=== NEW TEMPLATE ===\n\n"
    );
    const linkedinPosts = linkedinContent.join("\n\n=== NEW POST ===\n\n");

    const systemPrompt =
      detectedLanguage === "fr"
        ? `Tu es un expert en rédaction de newsletters engaging. Ta tâche est de créer une newsletter en utilisant :

      1. STRUCTURE (à imiter) :
      Voici des exemples de newsletters dont tu dois t'inspirer pour la structure de la newsletter :

      ${templateExamples}

      2. CONTENU (à utiliser) :
      Voici les posts LinkedIn dont tu dois utiliser le contenu, le ton et le style pour créer la newsletter :

      ${linkedinPosts}

      Instructions :
      - Utilise la STRUCTURE des newsletters exemple comme guide pour :
        • La longueur des phrases
        • L'organisation en sections
      - Utilise le CONTENU des posts LinkedIn pour le contenu réel et le style de la newsletter
      - Garde les informations et le message des posts LinkedIn intacts
      - Ajoute beaucoup d'informations supplémentaires qui sont pertinentes et enrichissent la newsletter et la rendent plus captivante (tels que des exemples, des analogies et des anecdotes)`
        : `You are an expert in writing engaging newsletters. Your task is to create a newsletter using:

      1. STRUCTURE (to imitate):
      Here are newsletter examples to inspire the structure:

      ${templateExamples}

      2. CONTENT (to use):
      Here are the LinkedIn posts to use as content for the newsletter (using content, tone, and style):

      ${linkedinPosts}

      Instructions:
      - Use the STRUCTURE from the example newsletters as a guide for:
        • Sentence length
        • Section organization
      - Use the CONTENT from LinkedIn posts for the actual newsletter content and style
      - Keep the information and message from LinkedIn posts intact
      - Add a lot of additional informations that are relevant and enrich the newsletter and makes it more engaging (such as examples, analogies, anecdotes)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            "Please generate the newsletter following the instructions above.",
        },
      ],
      temperature: 0.7,
    });

    const generatedNewsletter = completion.choices[0].message.content;

    // Save the newsletter to the database
    const { data: savedNewsletter, error: saveError } = await supabaseAdmin
      .from("linkletter_newsletters")
      .insert({
        user_id: userId,
        business_id: businessId,
        content: generatedNewsletter,
        linkedin_urls: linkedinUrls,
        substack_urls: substackUrls,
        title: `Newsletter #${Date.now()}`,
        status: "draft",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving newsletter:", saveError);
      return NextResponse.json(
        { error: "Failed to save newsletter" },
        { status: 500 }
      );
    }

    // Fetch updated list of newsletters
    const { data: newsletters, error: fetchError } = await supabaseAdmin
      .from("linkletter_newsletters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching newsletters:", fetchError);
    }

    return NextResponse.json({
      newsletter: generatedNewsletter,
      savedNewsletter,
      newsletters: newsletters || [],
      status: "success",
      debug: {
        linkedinContent,
        substackContent,
        urlsProcessed: linkedinUrls?.length || 0,
        detectedLanguage,
      },
    });
  } catch (error) {
    console.error("\n❌ Error:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
