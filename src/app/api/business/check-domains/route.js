import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { XMLParser } from "fast-xml-parser";
import { NextResponse } from "next/server";

const DNSIMPLE_TOKEN = process.env.DNSIMPLE_TOKEN;
const DNSIMPLE_ACCOUNT_ID = process.env.DNSIMPLE_ACCOUNT_ID;

export async function POST(req) {
  try {
    const { names } = await req.json();

    if (!names || !Array.isArray(names)) {
      return NextResponse.json(
        { error: "Invalid request: names array is required" },
        { status: 400 }
      );
    }

    // Take first 5 names
    const namesToCheck = names.slice(0, 5);
    const results = namesToCheck.map((name) => {
      const domain = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const domainWithExt = `${domain}.com`;

      // Simple simulation instead of real API calls
      const isAvailable = domain.length > 5;
      const domainResults = [
        {
          domain: domainWithExt,
          available: isAvailable,
          prices: isAvailable
            ? {
                registration_price: "14.99",
                renewal_price: "14.99",
                transfer_price: "14.99",
              }
            : null,
          premium: false,
          error: null,
        },
      ];

      return {
        name: name,
        domains: domainResults,
        cheapestDomain: isAvailable ? domainWithExt : null,
      };
    });

    console.log("✅ Final results:", results);
    return NextResponse.json(results); // Return array directly, not wrapped in { results }
  } catch (error) {
    console.error("❌ API Domains - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check domains" },
      { status: 500 }
    );
  }
}

/* Real API implementation (commented out for now)
export async function POST(req) {
  if (!process.env.DNSIMPLE_TOKEN) {
    console.error("❌ API Domains - Missing DNSimple token");
    return Response.json(
      { error: "Missing DNSimple API token" },
      { status: 500 }
    );
  }

  try {
    const { businessNames } = await req.json();
    const results = [];

    // Take first 5 names
    const namesToCheck = businessNames.slice(0, 5);
    console.log("🔍 API Domains - Checking names:", namesToCheck);

    for (const name of namesToCheck) {
      const domain = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const domainResults = [];

      // Only check .com extension
      const domainWithExt = `${domain}.com`;
      console.log(`\n🌐 Checking domain: ${domainWithExt}`);

      try {
        // First check domain availability
        const availabilityResponse = await fetch(
          `https://api.dnsimple.com/v2/156664/registrar/domains/${domainWithExt}/check`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.DNSIMPLE_TOKEN}`,
              Accept: "application/json",
            },
          }
        );

        const availabilityData = await availabilityResponse.json();
        
        if (availabilityData.data?.available) {
          const priceResponse = await fetch(
            `https://api.dnsimple.com/v2/156664/registrar/domains/${domainWithExt}/prices`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${process.env.DNSIMPLE_TOKEN}`,
                Accept: "application/json",
              },
            }
          );

          const priceData = await priceResponse.json();

          domainResults.push({
            domain: domainWithExt,
            available: true,
            prices: priceData.data,
            premium: priceData.data?.premium || false,
            error: null,
          });
        } else {
          domainResults.push({
            domain: domainWithExt,
            available: false,
            prices: null,
            premium: availabilityData.data?.premium || false,
            error: null,
          });
        }
      } catch (error) {
        domainResults.push({
          domain: domainWithExt,
          available: false,
          prices: null,
          error: error.message,
        });
      }

      results.push({
        name: name,
        domains: domainResults,
        cheapestDomain: domainResults[0]?.available ? domainWithExt : null,
      });
    }

    return Response.json({ results });
  } catch (error) {
    console.error("❌ API Domains - Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
*/
