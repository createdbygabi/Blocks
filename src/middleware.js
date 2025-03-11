import { NextResponse } from "next/server";

export async function middleware(request) {
  const hostname = request.headers.get("host");
  const pathname = request.nextUrl.pathname;
  console.log("🌐 Middleware Start:", { hostname, pathname });

  // Only handle subdomains
  if (hostname.endsWith("localhost:3000") && hostname !== "localhost:3000") {
    const subdomain = hostname.split(".")[0];
    console.log("🔍 Subdomain Flow:", { subdomain, pathname });

    // Add subdomain to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-subdomain", subdomain);

    // Handle special paths for subdomains
    if (pathname === "/login") {
      console.log("🔐 Rewriting subdomain login to:", "/app/saas/login");
      const loginUrl = new URL("/app/saas/login", request.url);
      return NextResponse.rewrite(loginUrl, {
        headers: requestHeaders,
      });
    }

    if (pathname === "/success") {
      console.log("🔐 Rewriting subdomain success to:", "/app/saas/success");
      const successUrl = new URL("/app/saas/success", request.url);
      return NextResponse.rewrite(successUrl, {
        headers: requestHeaders,
      });
    }

    if (pathname === "/dashboard") {
      console.log(
        "📊 Rewriting subdomain dashboard to:",
        "/app/saas/dashboard"
      );
      const dashboardUrl = new URL("/app/saas/dashboard", request.url);
      return NextResponse.rewrite(dashboardUrl, {
        headers: requestHeaders,
      });
    }

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      console.log("🔌 Rewriting API route to:", `/app/saas${pathname}`);
      const apiUrl = new URL(`/app/saas${pathname}`, request.url);
      return NextResponse.rewrite(apiUrl, {
        headers: requestHeaders,
      });
    }

    // Handle auth callback
    if (pathname.startsWith("/auth/")) {
      console.log("🔑 Rewriting auth route to:", `/app/saas${pathname}`);
      const authUrl = new URL(`/app/saas${pathname}`, request.url);
      return NextResponse.rewrite(authUrl, {
        headers: requestHeaders,
      });
    }

    // Rewrite to /saas for all other subdomain paths
    const saasUrl = new URL("/app/saas", request.url);
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
