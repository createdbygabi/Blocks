import { NextResponse } from "next/server";

export async function middleware(request) {
  const hostname = request.headers.get("host");
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  console.log("🌐 Middleware Start:", {
    hostname,
    pathname,
    fullUrl: request.url,
    searchParams: Object.fromEntries(searchParams),
    protocol: request.nextUrl.protocol,
  });

  // Only handle subdomains
  const isLocalhost =
    hostname.endsWith("localhost:3000") && hostname !== "localhost:3000";
  const isProduction =
    hostname.endsWith("joinblocks.me") && hostname !== "joinblocks.me";

  if (isLocalhost || isProduction) {
    const subdomain = hostname.split(".")[0];
    console.log("🔍 Subdomain Flow:", {
      subdomain,
      pathname,
      isLocalhost,
      isProduction,
    });

    // Add subdomain to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-subdomain", subdomain);

    // Construct base URL for rewrites
    const baseUrl = isLocalhost
      ? `http://localhost:3000`
      : `https://${hostname}`;

    // Handle special paths for subdomains
    if (pathname === "/login") {
      console.log("🔐 Rewriting subdomain login to:", "/app/saas/login");
      const loginUrl = new URL("/app/saas/login", baseUrl);
      return NextResponse.rewrite(loginUrl, {
        headers: requestHeaders,
      });
    }

    if (pathname === "/success") {
      console.log("🔐 Rewriting subdomain success to:", "/app/saas/success");
      const successUrl = new URL("/app/saas/success", baseUrl);
      return NextResponse.rewrite(successUrl, {
        headers: requestHeaders,
      });
    }

    if (pathname.startsWith("/dashboard")) {
      console.log("📊 Rewriting dashboard path to:", `/app/saas${pathname}`);
      const dashboardUrl = new URL(`/app/saas${pathname}`, baseUrl);
      return NextResponse.rewrite(dashboardUrl, {
        headers: requestHeaders,
      });
    }

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      console.log("🔌 Rewriting API route to:", `/app/saas${pathname}`);
      const apiUrl = new URL(`/app/saas${pathname}`, baseUrl);
      return NextResponse.rewrite(apiUrl, {
        headers: requestHeaders,
      });
    }

    // Handle tool API routes
    if (pathname.startsWith("/app/saas/tools/api/")) {
      console.log("🛠️ Rewriting tool API route to:", pathname);
      return NextResponse.rewrite(new URL(pathname, baseUrl), {
        headers: requestHeaders,
      });
    }

    // Handle tool routes
    if (pathname.startsWith("/tools/")) {
      const toolPath = pathname.replace("/tools/", "");
      console.log(
        "🛠️ Rewriting tool route to:",
        `/app/saas/tools/${subdomain}/${toolPath}`
      );
      const toolUrl = new URL(
        `/app/saas/tools/${subdomain}/${toolPath}`,
        baseUrl
      );
      return NextResponse.rewrite(toolUrl, {
        headers: requestHeaders,
      });
    }

    // Handle auth callback
    if (pathname.startsWith("/auth/")) {
      const authUrl = new URL(`/app/saas${pathname}`, baseUrl);

      // Preserve all query parameters
      searchParams.forEach((value, key) => {
        authUrl.searchParams.set(key, value);
      });

      console.log("🔑 Auth Callback Debug:", {
        originalUrl: request.url,
        newUrl: authUrl.toString(),
        searchParams: Object.fromEntries(searchParams),
        authUrlSearchParams: Object.fromEntries(authUrl.searchParams),
        hostname,
        subdomain,
        baseUrl,
      });

      return NextResponse.rewrite(authUrl, {
        headers: requestHeaders,
      });
    }

    // Rewrite to /saas for all other subdomain paths
    const saasUrl = new URL("/app/saas", baseUrl);
    console.log("🔄 Rewriting to:", saasUrl.toString());

    return NextResponse.rewrite(saasUrl, {
      headers: requestHeaders,
    });
  }

  // Pass through all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths including API routes, but exclude static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
