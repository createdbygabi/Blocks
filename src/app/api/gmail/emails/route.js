import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get Gmail connection from Supabase
    const { data: gmailConnection, error: connectionError } = await supabase
      .from("gmail_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (connectionError || !gmailConnection) {
      return new Response(
        JSON.stringify({ error: "No Gmail connection found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Set up OAuth2 client with stored tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: gmailConnection.access_token,
      refresh_token: gmailConnection.refresh_token,
      token_type: gmailConnection.token_type,
      expiry_date: new Date(gmailConnection.expiry_date).getTime(),
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch recent emails
    const { data: messages } = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
    });

    if (!messages.messages) {
      return new Response(JSON.stringify({ emails: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get full message details
    const emails = await Promise.all(
      messages.messages.map(async (message) => {
        const { data: fullMessage } = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        // Get email body
        let body = "";
        if (fullMessage.payload.parts) {
          const part = fullMessage.payload.parts.find(
            (part) => part.mimeType === "text/plain"
          );
          if (part) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
          }
        } else if (fullMessage.payload.body.data) {
          body = Buffer.from(fullMessage.payload.body.data, "base64").toString(
            "utf-8"
          );
        }

        return {
          id: message.id,
          subject: fullMessage.payload.headers.find(
            (header) => header.name === "Subject"
          )?.value,
          date: fullMessage.payload.headers.find(
            (header) => header.name === "Date"
          )?.value,
          body: body,
        };
      })
    );

    return new Response(JSON.stringify({ emails }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch emails" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
