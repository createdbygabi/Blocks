import { getSaasData } from "./lib/db";
import { headers } from "next/headers";
import { LandingPage } from "./components/LandingPage";

// Fade up animation variant
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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
