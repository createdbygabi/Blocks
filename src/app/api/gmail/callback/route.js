import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    console.log("Gmail callback route reached");
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state");

    console.log("Callback parameters:", {
      code: code ? "present" : "missing",
      error: error || "none",
      state: state || "missing",
    });

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/admin/reddit-comments?error=${error}`
      );
    }

    if (!code) {
      console.error("No code parameter in callback");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/admin/reddit-comments?error=missing_code`
      );
    }

    if (!state) {
      console.error("No state parameter in callback");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/admin/reddit-comments?error=missing_state`
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received successfully:", tokens);

    // Calculate expiry date properly
    const expiryDate = new Date();
    if (tokens.expiry_date) {
      // If expiry_date is a timestamp
      expiryDate.setTime(tokens.expiry_date);
    } else if (tokens.expires_in) {
      // If we have expires_in (seconds until expiry)
      expiryDate.setTime(Date.now() + tokens.expires_in * 1000);
    } else {
      // Default to 1 hour if no expiry info
      expiryDate.setTime(Date.now() + 3600 * 1000);
    }

    const { error: upsertError } = await supabase
      .from("gmail_connections")
      .upsert({
        user_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expiry_date: expiryDate.toISOString(),
      });

    if (upsertError) {
      console.error("Error storing tokens:", upsertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/admin/reddit-comments?error=storage_failed`
      );
    }

    console.log("Gmail connection stored successfully");
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/admin/reddit-comments?success=true`
    );
  } catch (err) {
    console.error("Error in Gmail callback:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/admin/reddit-comments?error=callback_failed`
    );
  }
}
