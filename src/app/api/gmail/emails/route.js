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
        console.log(`\n🔍 FETCHING MESSAGE: ${message.id}`);

        const { data: fullMessage } = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        console.log(`📧 Message ID: ${message.id}`);
        console.log(`📧 Message threadId: ${fullMessage.threadId}`);

        const subject = fullMessage.payload.headers.find(
          (header) => header.name === "Subject"
        )?.value;
        console.log(`📧 Subject: ${subject}`);

        // Log MIME structure
        console.log("📧 MIME Structure:");
        console.log(`  - mimeType: ${fullMessage.payload.mimeType}`);
        console.log(
          `  - parts count: ${
            fullMessage.payload.parts
              ? fullMessage.payload.parts.length
              : "No parts"
          }`
        );

        // Get email body
        let body = "";
        if (fullMessage.payload.parts) {
          console.log("📧 Message has parts, looking for text/plain part");

          // Log all parts for debugging
          fullMessage.payload.parts.forEach((part, idx) => {
            console.log(
              `  Part ${idx}: mimeType=${part.mimeType}, filename=${
                part.filename || "none"
              }, body size=${part.body.size}`
            );
            if (part.parts) {
              console.log(`    Nested parts: ${part.parts.length}`);
            }
          });

          const part = fullMessage.payload.parts.find(
            (part) => part.mimeType === "text/plain"
          );

          if (part) {
            console.log(
              `📧 Found text/plain part with size: ${part.body.size}`
            );

            const rawBody = Buffer.from(part.body.data, "base64").toString(
              "utf-8"
            );
            body = rawBody;

            console.log(`📧 Body length: ${body.length} characters`);
            console.log(
              `📧 Body preview (first 200 chars): ${body.substring(0, 200)}`
            );
            console.log(
              `📧 Body preview (last 200 chars): ${body.substring(
                body.length - 200
              )}`
            );

            // Check if body contains specific markers for F5Bot emails
            const hasKeywordMarker = body.includes("Keyword:");
            const hasRedditPostsMarker = body.includes("Reddit Posts");
            const hasRedditCommentsMarker = body.includes("Reddit Comments");

            console.log(
              `📧 F5Bot markers - Keyword: ${hasKeywordMarker}, Reddit Posts: ${hasRedditPostsMarker}, Reddit Comments: ${hasRedditCommentsMarker}`
            );
          } else {
            console.log("❌ No text/plain part found");

            // Try to find HTML part as fallback
            const htmlPart = fullMessage.payload.parts.find(
              (part) => part.mimeType === "text/html"
            );

            if (htmlPart) {
              console.log(
                `📧 Found HTML part with size: ${htmlPart.body.size}`
              );
              const htmlBody = Buffer.from(
                htmlPart.body.data,
                "base64"
              ).toString("utf-8");
              console.log(`📧 HTML body length: ${htmlBody.length} characters`);
            }
          }
        } else if (fullMessage.payload.body.data) {
          console.log("📧 Message has no parts, using body directly");
          console.log(`📧 Body data size: ${fullMessage.payload.body.size}`);

          const rawBody = Buffer.from(
            fullMessage.payload.body.data,
            "base64"
          ).toString("utf-8");
          body = rawBody;

          console.log(`📧 Body length: ${body.length} characters`);
          console.log(`📧 Body preview: ${body.substring(0, 200)}`);
        } else {
          console.log("❌ No body data found in message");
        }

        // Count occurrences of keywords in body
        if (body) {
          const keywordMatches = (body.match(/Keyword:/g) || []).length;
          const redditPostMatches = (body.match(/Reddit Posts/g) || []).length;
          const redditCommentMatches = (body.match(/Reddit Comments/g) || [])
            .length;

          console.log(
            `📧 Content counts - Keywords: ${keywordMatches}, Reddit Posts: ${redditPostMatches}, Reddit Comments: ${redditCommentMatches}`
          );

          // Check if body is being truncated
          if (body.endsWith("...") || body.includes("Content trimmed")) {
            console.log("⚠️ WARNING: Body appears to be truncated!");
          }
        }

        return {
          id: message.id,
          subject: subject,
          date: fullMessage.payload.headers.find(
            (header) => header.name === "Date"
          )?.value,
          body: body,
        };
      })
    );

    // Log summary of all processed emails
    console.log(`\n✅ Processed ${emails.length} emails`);
    console.log(
      `✅ Email body lengths: ${emails
        .map((e) => e.body?.length || 0)
        .join(", ")}`
    );
    console.log(
      `✅ F5Bot emails: ${
        emails.filter((e) => e.subject?.includes("F5Bot")).length
      }`
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
