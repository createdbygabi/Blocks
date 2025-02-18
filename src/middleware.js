import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.headers.get("host");
  console.log("🌐 Middleware - Hostname:", hostname);

  // Only handle *.localhost:3000 domains
  if (!hostname.endsWith("localhost:3000")) {
    console.log("⏭️ Skipping - Not a localhost:3000 domain");
    return NextResponse.next();
  }

  // Skip if it's the main domain (localhost:3000)
  if (hostname === "localhost:3000") {
    console.log("⏭️ Skipping - Main domain");
    return NextResponse.next();
  }

  // Get subdomain (everything before .localhost:3000)
  const subdomain = hostname.split(".")[0];
  console.log("🔍 Middleware - Detected subdomain:", subdomain);

  // Create response
  const response = NextResponse.rewrite(new URL("/saas-template", request.url));

  // Set subdomain in cookie
  response.cookies.set("x-subdomain", subdomain);

  console.log("🔄 Middleware - Rewriting to SaaS template");
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
