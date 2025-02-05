import { supabase } from "./supabase";

// Get all reels for a user
export async function getUserReels(user_id) {
  if (!user_id) throw new Error("User ID is required");

  const { data, error } = await supabase
    .from("instagram_reels")
    .select("*")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Create a new reel
export async function createReel(
  user_id,
  {
    format_number,
    niche,
    content,
    scheduled_for = null,
    status = "pending", // pending, scheduled, published
    generation_status = "pending",
  }
) {
  if (!user_id) throw new Error("User ID is required");

  const { data, error } = await supabase
    .from("instagram_reels")
    .insert([
      {
        user_id,
        format_number,
        niche,
        content,
        scheduled_for,
        status,
        generation_status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update reel status
export async function updateReelStatus(reel_id, status) {
  const { data, error } = await supabase
    .from("instagram_reels")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reel_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Schedule a reel
export async function scheduleReel(reel_id, scheduled_for) {
  const { data, error } = await supabase
    .from("instagram_reels")
    .update({
      scheduled_for,
      status: "scheduled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", reel_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add this new function to handle video URL updates
export async function updateReelVideo(
  reel_id,
  {
    video_url,
    status = "completed",
    generation_status,
    error_message = null,
    updated_at,
  }
) {
  const { data, error } = await supabase
    .from("instagram_reels")
    .update({
      video_url,
      status,
      generation_status,
      error_message,
      updated_at: updated_at || new Date().toISOString(),
    })
    .eq("id", reel_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
