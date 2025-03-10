import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, businessId } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if user exists in subscriptions table
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("business_id", businessId)
      .eq("customer_email", email.toLowerCase())
      .eq("status", "active")
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. <a href="/#pricing" class="text-blue-400 hover:underline">Subscribe to access the app</a>',
          isHtml: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ hasAccess: true });
  } catch (error) {
    console.error("Verify subscription error:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription" },
      { status: 500 }
    );
  }
}
