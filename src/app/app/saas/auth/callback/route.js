import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthCookiePrefix } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const host = request.headers.get("host");

  console.log("🔑 Auth Callback:", {
    code,
    host,
    cookiePrefix: getAuthCookiePrefix(host),
  });

  if (!code) {
    console.error("❌ No code found in callback");
    return NextResponse.redirect(new URL("/login", `http://${host}`));
  }

  try {
    const supabase = createRouteHandlerClient({
      cookies,
      options: {
        cookieOptions: {
          name: getAuthCookiePrefix(host),
        },
      },
    });

    await supabase.auth.exchangeCodeForSession(code);

    const redirectUrl = new URL("/dashboard", `http://${host}`);
    console.log("↩️ Redirecting to:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("🔥 Auth error:", error);
    return NextResponse.redirect(new URL("/login", `http://${host}`));
  }
}
