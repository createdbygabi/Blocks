import { NextResponse } from "next/server";

// Sample video templates that we'll rotate through
const SAMPLE_VIDEOS = [
  {
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
    duration: 15,
    caption:
      "Transform your workflow with AI-powered automation 🚀 #SaaS #Automation #Tech",
  },
  {
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
    duration: 30,
    caption:
      "Boost your productivity by 10x with our smart tools ⚡️ #Productivity #Business #AI",
  },
  {
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
    duration: 20,
    caption:
      "The future of work is here! See how our AI assistant helps you work smarter 🤖 #FutureOfWork #AI",
  },
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { business_id, scheduled_for } = body;

    if (!business_id || !scheduled_for) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get a random video template
    const template =
      SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];

    // Safely format the date
    let formattedDate;
    try {
      formattedDate = new Date(scheduled_for).toISOString().split("T")[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      formattedDate = new Date().toISOString().split("T")[0];
    }

    // Mock video generation response
    const mockVideo = {
      url: template.videoUrl,
      thumbnail: template.thumbnailUrl,
      title: `Generated Content - ${formattedDate}`,
      description: template.caption,
      duration: `00:${template.duration}`,
      resolution: "1080x1920",
      format: "mp4",
      generated_at: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json(mockVideo);
  } catch (error) {
    console.error("Error generating video:", error);
    return NextResponse.json(
      { error: "Failed to generate video content" },
      { status: 500 }
    );
  }
}

async function findBestMatchingReel(businessAttributes) {
  try {
    const response = await fetch("/api/reel/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_id: businessAttributes.id,
      }),
    });

    if (!response.ok) throw new Error("Failed to match reels");

    const data = await response.json();
    return data.matches[0].reel; // Get the best match
  } catch (error) {
    console.error("Error matching reels:", error);
    throw error;
  }
}
