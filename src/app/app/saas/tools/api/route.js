import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request) {
  try {
    const headersList = headers();
    const subdomain = headersList.get("x-subdomain");

    // Get the tool name from the URL
    const toolName = request.nextUrl.pathname.split("/").pop();

    // You can implement shared functionality here
    // For example, getting tool usage statistics, common settings, etc.

    return NextResponse.json({
      success: true,
      data: {
        toolName,
        // Other shared data
      },
    });
  } catch (error) {
    console.error("Tools API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
