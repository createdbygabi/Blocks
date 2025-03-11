import { NextResponse } from "next/server";

const LOCAL_DOMAIN = "localhost:3000";
const PRODUCTION_DOMAIN = "joinblocks.me";

export async function middleware(request) {
  const hostname = request.headers.get("host");
  const pathname = request.nextUrl.pathname;
  const currentHost =
    process.env.NODE_ENV === "production" ? PRODUCTION_DOMAIN : LOCAL_DOMAIN;

  // Check if this is a subdomain
  const isSubdomain =
    hostname !== currentHost &&
    (hostname.endsWith(LOCAL_DOMAIN) || hostname.endsWith(PRODUCTION_DOMAIN));

  if (isSubdomain) {
    // Extract subdomain (handles both local and production)
    const subdomain = hostname.replace(`.${currentHost}`, "");
    console.log("🔍 Subdomain Flow:", { subdomain, pathname });

    // Add subdomain to headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-subdomain", subdomain);

    // Define routes that should be rewritten
    const REWRITE_ROUTES = {
      "/login": "/app/saas/login",
      "/success": "/app/saas/success",
      "/dashboard": "/app/saas/dashboard",
    };

    // Handle specific route rewrites
    if (pathname in REWRITE_ROUTES) {
      const rewritePath = REWRITE_ROUTES[pathname];
      console.log(`🔄 Rewriting ${pathname} to:`, rewritePath);
      return NextResponse.rewrite(new URL(rewritePath, request.url), {
        headers: requestHeaders,
      });
    }

    // Handle dynamic routes (API and auth)
    if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
      const rewritePath = `/app/saas${pathname}`;
      console.log(`🔌 Rewriting to:`, rewritePath);
      return NextResponse.rewrite(new URL(rewritePath, request.url), {
        headers: requestHeaders,
      });
    }

    // Default rewrite for subdomain
    return NextResponse.rewrite(new URL("/app/saas", request.url), {
      headers: requestHeaders,
    });
  }

  // Pass through all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except Next.js static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
