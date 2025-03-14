import { Client } from "@notionhq/client";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ATTRIBUTE_WEIGHTS = {
  pain_points: 0.5, // Most important
  goals: 0.3, // Second most important
  interests: 0.2, // Least important but still relevant
};

export class ReelMatcher {
  constructor(notionClient) {
    this.notion = notionClient;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async getEmbedding(text) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async getOrCreateEmbeddings(texts, cacheKey) {
    // Check cache first
    const { data: cached } = await this.supabase
      .from("embeddings_cache")
      .select("embedding")
      .eq("text_hash", cacheKey)
      .single();

    if (cached) {
      return cached.embedding;
    }

    // Generate new embedding
    const embedding = await this.getEmbedding(texts.join(" "));

    // Cache the result
    await this.supabase.from("embeddings_cache").insert({
      text_hash: cacheKey,
      embedding,
      created_at: new Date(),
    });

    return embedding;
  }

  calculateCosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async calculateSemanticMatchScore(saasAttrs, reelAttrs) {
    const scores = await Promise.all(
      Object.keys(ATTRIBUTE_WEIGHTS).map(async (attr) => {
        const saasText = saasAttrs[attr].join(" ");
        const reelText = reelAttrs[attr].join(" ");

        const saasHash = `saas_${attr}_${Buffer.from(saasText).toString(
          "base64"
        )}`;
        const reelHash = `reel_${attr}_${Buffer.from(reelText).toString(
          "base64"
        )}`;

        const [saasEmbedding, reelEmbedding] = await Promise.all([
          this.getOrCreateEmbeddings(saasAttrs[attr], saasHash),
          this.getOrCreateEmbeddings(reelAttrs[attr], reelHash),
        ]);

        const similarity = this.calculateCosineSimilarity(
          saasEmbedding,
          reelEmbedding
        );
        return similarity * ATTRIBUTE_WEIGHTS[attr];
      })
    );

    return scores.reduce((sum, score) => sum + score, 0);
  }

  async findTopMatches(saasAttributes, count = 10) {
    try {
      // Fetch all reels from Notion
      const response = await this.notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        page_size: 150,
      });

      // Calculate semantic similarity scores for all reels
      const scoredReels = await Promise.all(
        response.results.map(async (reel) => {
          const reelData = this.mapNotionPropertiesToReel(reel);
          const score = await this.calculateSemanticMatchScore(
            saasAttributes,
            reelData
          );
          return { reel: reelData, score };
        })
      );

      // Sort by score and return top matches
      return scoredReels
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map(({ reel, score }) => ({
          ...reel,
          match_score: score,
          match_confidence: Math.round(score * 100) + "%",
        }));
    } catch (error) {
      console.error("Error finding top matches:", error);
      throw error;
    }
  }

  mapNotionPropertiesToReel(notionPage) {
    return {
      id: notionPage.id,
      pain_points: notionPage.properties.pain_points.multi_select.map(
        (item) => item.name
      ),
      goals: notionPage.properties.goals.multi_select.map((item) => item.name),
      interests: notionPage.properties.interests.multi_select.map(
        (item) => item.name
      ),
      url: notionPage.properties.VideoUrl.url,
      thumbnail: notionPage.properties.ThumbnailUrl.url,
      title: notionPage.properties.Title.title[0].plain_text,
      description: notionPage.properties.Description.rich_text[0].plain_text,
    };
  }
}
