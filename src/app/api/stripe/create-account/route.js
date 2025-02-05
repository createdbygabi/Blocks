import { NextResponse } from "next/server";
import { getUserBusiness } from "@/lib/db";

export async function POST(request) {
  try {
    console.log("API Route - Starting request handling");

    const requestData = await request.json();
    console.log("API Route - Received data:", requestData);

    const { userId } = requestData;

    if (!userId) {
      console.log("API Route - No userId provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("API Route - Getting business for user:", userId);
    const business = await getUserBusiness(userId);
    console.log("API Route - Business lookup result:", business);

    if (!business) {
      console.log("API Route - No business found");
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // For testing, just return the business data
    return NextResponse.json({
      message: "Business found",
      business,
    });
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
