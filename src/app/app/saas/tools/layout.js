import React from "react";
import { ClientNavbar } from "../components/ClientNavbar";
import { headers } from "next/headers";
import { getSaasData } from "../lib/db";

export async function generateMetadata() {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");

  try {
    const data = await getSaasData(subdomain);
    if (!data) return { title: "Site Not Found" };

    const business = data.business;

    return {
      title: `${business.name} - Tools`,
      description: `Tools and analytics for ${business.name}`,
      icons: {
        icon: business.logo_url || "/favicon.ico",
        apple: business.logo_url || "/apple-icon.png",
      },
      openGraph: {
        title: `${business.name} - Tools`,
        description: `Tools and analytics for ${business.name}`,
        images: [business.logo_url || "/og-image.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: `${business.name} - Tools`,
        description: `Tools and analytics for ${business.name}`,
        images: [business.logo_url || "/twitter-image.png"],
      },
    };
  } catch (error) {
    return { title: "Error" };
  }
}

export default async function ToolsLayout({ children }) {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");
  console.log("🎯 Tools Layout - Subdomain:", subdomain);

  try {
    console.log("🔍 Tools Layout - Fetching data for subdomain:", subdomain);
    const data = await getSaasData(subdomain);
    console.log("📦 Tools Layout - Received data:", data);

    if (!data) {
      console.log("❌ Tools Layout - No data found for subdomain:", subdomain);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
            <p className="text-gray-400">
              No site found for subdomain: {subdomain}
            </p>
          </div>
        </div>
      );
    }

    console.log("✅ Tools Layout - Rendering with data:", {
      business: data.business,
      landingPage: data.landingPage,
    });

    // Create a wrapper component that will pass the data to children
    const Wrapper = ({ children }) => {
      return React.cloneElement(children, { data });
    };

    return (
      <div className="w-full min-h-screen">
        <ClientNavbar
          styles={{
            layout: { background: "bg-white", surface: "bg-white" },
            text: {
              primary: "text-gray-900",
              secondary: "text-gray-600",
              accent: "text-blue-600",
            },
            button: { primary: "bg-blue-600 text-white hover:bg-blue-700" },
            utils: { highlight: "bg-blue-50" },
            border: "border-gray-200",
          }}
          business={data.business}
        />
        <main className="w-full bg-white">
          <Wrapper>{children}</Wrapper>
        </main>
        <footer className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <img
                      src={
                        data.business.logo_url ||
                        `https://ui-avatars.com/api/?name=${subdomain}&background=0D9488&color=fff`
                      }
                      alt={data.business.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-base font-medium text-gray-900">
                    {data.business.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Tools and analytics for {data.business.name}
                </p>
                <p className="text-sm text-gray-400">
                  Copyright © {new Date().getFullYear()} - All rights reserved
                </p>
              </div>

              {/* Links Column */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-900">
                  LINKS
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <a href="/support">Support</a>
                  </li>
                  <li>
                    <a href="/pricing">Pricing</a>
                  </li>
                  <li>
                    <a href="/blog">Blog</a>
                  </li>
                  <li>
                    <a href="/affiliates">Affiliates</a>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-900">
                  LEGAL
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <a href="/terms">Terms of services</a>
                  </li>
                  <li>
                    <a href="/privacy">Privacy policy</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("❌ Tools Layout - Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-400">
            Something went wrong while loading the site.
          </p>
        </div>
      </div>
    );
  }
}
