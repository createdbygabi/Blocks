import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    console.log("Gmail connect route reached");

    const { userId } = await req.json();
    console.log("User ID:", userId);

    if (!userId) {
      console.error("No user ID provided");
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
      ],
      prompt: "consent",
      state: userId,
    });

    console.log("Auth URL generated successfully");

    return new Response(JSON.stringify({ authUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in Gmail connect route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to initiate Gmail connection" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
