import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { videoUrl } = await request.json();
    console.log("🔄 Received delete request for video:", videoUrl);

    if (!videoUrl) {
      console.error("❌ No video URL provided in request");
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Extract the key from the S3 URL
    const url = new URL(videoUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    console.log("🔑 Extracted S3 key:", key);

    // Delete the object from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    console.log("📤 Sending delete command to S3...");
    await s3Client.send(command);
    console.log("✅ Successfully deleted object from S3");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
