import OpenAI from "openai";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateSymbol(businessInfo) {
  const symbolPrompt = `Generate a SINGLE word that represents the most iconic and recognizable symbol for this business:
  - Business niche: ${businessInfo.niche}
  - Main feature: ${businessInfo.main_feature}
  - Target audience: ${businessInfo.target_audience}

  Requirements:
  - Must be a single word representing a visual symbol (e.g., "lightning" for speed, "leaf" for nature)
  - Must be universally recognizable
  - Must be simple enough to work as a logo
  - Must capture the essence of the business
  - Must be timeless and not trendy
  - Must not be abstract or a concept but a physical object
  
  Examples:
  - Fast shipping service → "lightning"
  - Eco-friendly products → "leaf"
  - Cloud storage → "cloud"
  - AI technology → "brain"
  - Security service → "shield"
  

  Return ONLY the single word, nothing else, no special characters.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: symbolPrompt }],
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 10,
  });

  return completion.choices[0].message.content.trim().toLowerCase();
}

async function uploadToS3(imageUrl, businessId) {
  try {
    // Fetch the image from Replicate
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    const key = `logos/${businessId}-${Date.now()}.png`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: "image/png",
      })
    );

    // Return the S3 URL
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function POST(req) {
  try {
    const { businessInfo } = await req.json();
    console.log("🚀 API Logo - Starting generation process");

    // Step 1: Generate the symbolic word
    console.log("generated businessInfo", businessInfo);
    console.log("🎯 API Logo - Generating symbol word");
    const symbol = await generateSymbol(businessInfo);
    console.log("✨ API Logo - Generated symbol:", symbol);

    // Step 2: Create the logo prompt
    const logoPrompt = `a minimal ${symbol} symbol as a logo, fully filled with black color on white background, vector style, clean lines, simple`;

    console.log("🎨 API Logo - Final prompt:", logoPrompt);

    const requestBody = {
      input: {
        prompt: logoPrompt,
        prompt_upsampling: true,
      },
    };

    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error("❌ API Logo - Replicate error:", result.error);
      throw new Error(result.error);
    }

    // Upload the image to S3
    const s3Url = await uploadToS3(result.output, businessInfo.id);
    console.log("📦 API Logo - Uploaded to S3:", s3Url);

    return Response.json({
      imageUrl: s3Url,
      symbol,
      prompt: logoPrompt,
    });
  } catch (error) {
    console.error("❌ API Logo - Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
}
