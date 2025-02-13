export async function POST(req) {
  try {
    const { prompt } = await req.json();
    console.log("🚀 API Logo - Starting generation with prompt:", prompt);
    console.log(
      "🔑 API Logo - Checking token:",
      process.env.REPLICATE_API_TOKEN ? "Present" : "Missing"
    );

    const requestBody = {
      input: {
        prompt,
        prompt_upsampling: true,
      },
    };
    console.log("📦 API Logo - Request body:", requestBody);

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

    console.log("📡 API Logo - Response status:", response.status);
    const result = await response.json();
    console.log("✅ API Logo - Raw response:", result);

    if (result.error) {
      console.error("❌ API Logo - Replicate error:", result.error);
      throw new Error(result.error);
    }

    const imageUrl = result.output;
    console.log("🖼️ API Logo - Final image URL:", imageUrl);

    return Response.json({ imageUrl });
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
