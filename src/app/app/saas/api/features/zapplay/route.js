import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { fileName, fileType } = await request.json();

    // Generate a unique file name to prevent collisions
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${crypto
      .randomBytes(16)
      .toString("hex")}.${fileExtension}`;

    // Create the S3 upload command
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `zapplay/${uniqueFileName}`,
      ContentType: fileType,
    });

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600,
    });

    // Construct the public URL for the file
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/zapplay/${uniqueFileName}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
