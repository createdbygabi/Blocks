import { getSaasData } from "./lib/db";
import { headers } from "next/headers";
import { LandingPage } from "./components/LandingPage";
import { Metadata } from "next";

// Fade up animation variant
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Generate metadata for the page
export async function generateMetadata() {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");

  try {
    const data = await getSaasData(subdomain);

    if (!data) {
      return {
        title: "Site Not Found",
        description: `No site found for subdomain: ${subdomain}`,
      };
    }

    const business = data.business;
    const content = data.landing?.content;

    return {
      title: `${business.name} ｜ ${
        data?.landingPage?.content?.hero?.title || "Welcome"
      }`,
      description:
        data?.landingPage?.content?.hero?.subtitle ||
        `Welcome to ${business.name}`,
      icons: {
        icon: business.logo_url || "/favicon.ico",
        apple: business.logo_url || "/apple-icon.png",
      },
      openGraph: {
        title: `${business.name} - ${
          data?.landingPage?.content?.hero?.title || "Welcome"
        }`,
        description:
          data?.landingPage?.content?.hero?.subtitle ||
          `Welcome to ${business.name}`,
        images: [business.logo_url || "/og-image.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: business.name,
        description:
          data?.landingPage?.content?.hero?.subtitle ||
          `Welcome to ${business.name}`,
        images: [business.logo_url || "/twitter-image.png"],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "Something went wrong while loading the site.",
    };
  }
}

export default async function SaasPage({ params, searchParams }) {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");
  console.log("🎯 SaaS Page - Subdomain:", subdomain);

  try {
    const data = await getSaasData(subdomain);

    if (!data) {
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

    return <LandingPage data={data} />;
  } catch (error) {
    console.error("Error in SaaS page:", error);
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
