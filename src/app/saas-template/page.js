"use client";

import { useEffect, useState } from "react";

export default function SaasTemplate() {
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    // Get subdomain from x-subdomain header (set by middleware)
    const subdomain = document.cookie.match(/x-subdomain=([^;]+)/)?.[1] || "";
    console.log("🌐 SaaS Template - Headers:", {
      subdomain,
      hostname: window.location.hostname,
      cookies: document.cookie,
    });

    if (subdomain) {
      console.log(
        "🔍 SaaS Template - Using subdomain from headers:",
        subdomain
      );
      setSubdomain(subdomain);
    } else {
      // Fallback to hostname parsing
      const hostname = window.location.hostname;
      if (
        hostname.endsWith("localhost:3000") &&
        hostname !== "localhost:3000"
      ) {
        const parsedSubdomain = hostname.split(".")[0];
        console.log(
          "🔍 SaaS Template - Using parsed subdomain:",
          parsedSubdomain
        );
        setSubdomain(parsedSubdomain);
      } else {
        console.log("⚠️ SaaS Template - No valid subdomain detected");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to {subdomain}</h1>
        <p className="text-gray-400">This is your SaaS application</p>
        <p className="text-sm text-gray-500 mt-2">
          Subdomain: {subdomain || "none"}
        </p>
      </div>
    </div>
  );
}
