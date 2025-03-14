import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthCookiePrefix } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");
  const host = request.headers.get("host");

  console.log("🔑 Auth Callback:", {
    code,
    error,
    error_description,
    host,
    cookiePrefix: getAuthCookiePrefix(host),
    url: requestUrl.toString(),
  });

  // Handle error cases
  if (error || !code) {
    console.error("❌ Auth callback error:", {
      error,
      error_description,
      code,
    });

    // Construct error URL with query parameters
    const loginUrl = new URL("/login", `http://${host}`);
    if (error) {
      loginUrl.searchParams.set("error", error);
      loginUrl.searchParams.set("error_description", error_description || "");
    }

    return NextResponse.redirect(loginUrl);
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
      options: {
        cookieOptions: {
          name: getAuthCookiePrefix(host),
          domain: ".joinblocks.me",
          path: "/",
          secure: true,
        },
      },
    });

    const { data, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      throw sessionError;
    }

    console.log("✅ Session established:", {
      user: data?.user?.email,
      session: data?.session?.access_token ? "Valid" : "Invalid",
    });

    const redirectUrl = new URL("/dashboard", `http://${host}`);
    console.log("↩️ Redirecting to:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("🔥 Auth error:", error);

    // Construct error URL
    const loginUrl = new URL("/login", `http://${host}`);
    loginUrl.searchParams.set("error", "auth_error");
    loginUrl.searchParams.set(
      "error_description",
      error.message || "Authentication failed"
    );

    return NextResponse.redirect(loginUrl);
  }
}
