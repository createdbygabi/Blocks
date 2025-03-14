import { supabase } from "@/lib/supabase";

export class SocialMarketingService {
  constructor(userId) {
    this.userId = userId;
  }

  async generateVideoContent(businessId, scheduledDate) {
    try {
      // First get the business info to generate relevant content
      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (!business) {
        throw new Error("Business not found");
      }

      // Generate video content using the API
      const response = await fetch("/api/social/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          scheduled_for:
            scheduledDate ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate video content");
      }

      const videoData = await response.json();

      // Save to social_content table with needs_approval status
      const { data: savedContent, error } = await supabase
        .from("social_content")
        .insert({
          business_id: businessId,
          content_type: "reel",
          status: "needs_approval",
          content: videoData,
          scheduled_for:
            scheduledDate ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Use provided date or default to tomorrow
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return savedContent;
    } catch (error) {
      console.error("Failed to generate video content:", error);
      throw error;
    }
  }

  async publishContent(contentId) {
    try {
      // Get the content to publish
      const { data: content } = await supabase
        .from("social_content")
        .select("*, businesses(*)")
        .eq("id", contentId)
        .single();

      if (!content) {
        throw new Error("Content not found");
      }

      // Publish to Instagram using the API
      const response = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.content,
          businessId: content.business_id,
          platform: "instagram",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish content");
      }

      // Update content status
      const { error } = await supabase
        .from("social_content")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Failed to publish content:", error);
      throw error;
    }
  }

  async generateBulkContent(limit = 5) {
    try {
      // Get all businesses that need content
      const { data: businesses } = await supabase
        .from("businesses")
        .select("*")
        .limit(limit);

      const results = [];
      for (const business of businesses) {
        try {
          const content = await this.generateVideoContent(business.id);
          results.push(content);
        } catch (error) {
          console.error(`Failed for business ${business.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to generate bulk content:", error);
      throw error;
    }
  }

  async publishScheduledContent() {
    try {
      // Get all pending content that's scheduled for now or earlier
      const { data: pendingContent } = await supabase
        .from("social_content")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString());

      const results = [];
      for (const content of pendingContent || []) {
        try {
          await this.publishContent(content.id);
          results.push(content.id);
        } catch (error) {
          console.error(`Failed to publish content ${content.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to publish scheduled content:", error);
      throw error;
    }
  }
}
