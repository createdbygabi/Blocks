import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { XMLParser } from "fast-xml-parser";

const DNSIMPLE_TOKEN = process.env.DNSIMPLE_TOKEN;
const DNSIMPLE_ACCOUNT_ID = process.env.DNSIMPLE_ACCOUNT_ID;

export async function POST(req) {
  if (!process.env.DNSIMPLE_TOKEN) {
    console.error("❌ API Domains - Missing DNSimple token");
    return Response.json(
      {
        error: "Missing DNSimple API token",
      },
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

      // Check both .com and .co extensions
      for (const ext of [".com", ".co"]) {
        const domainWithExt = `${domain}${ext}`;
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
          console.log(
            `✨ Availability check for ${domainWithExt}:`,
            availabilityData
          );

          if (availabilityData.data?.available) {
            // Only check pricing if domain is available
            console.log(
              `✅ ${domainWithExt} is available, checking pricing...`
            );

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
            console.log(`💰 Price data for ${domainWithExt}:`, priceData);

            domainResults.push({
              domain: domainWithExt,
              available: true,
              prices: priceData.data,
              premium: priceData.data?.premium || false,
              error: null,
            });
          } else {
            console.log(`❌ ${domainWithExt} is not available`);
            domainResults.push({
              domain: domainWithExt,
              available: false,
              prices: null,
              premium: availabilityData.data?.premium || false,
              error: null,
            });
          }
        } catch (error) {
          console.error(`❌ Error checking ${domainWithExt}:`, error);
          domainResults.push({
            domain: domainWithExt,
            available: false,
            prices: null,
            error: error.message,
          });
        }
      }

      // Find the cheapest domain for this name group
      const availableDomains = domainResults.filter(
        (d) => d.available && d.prices
      );
      let cheapestDomainName = null;

      console.log(
        `\n💰 Available domains for ${name}:`,
        availableDomains.map((d) => ({
          domain: d.domain,
          price: d.prices.registration_price,
        }))
      );

      if (availableDomains.length > 0) {
        const cheapestDomain = availableDomains.reduce((min, curr) => {
          const minPrice = parseFloat(min.prices.registration_price);
          const currPrice = parseFloat(curr.prices.registration_price);
          console.log(
            `Comparing ${curr.domain}($${currPrice}) with ${min.domain}($${minPrice})`
          );
          return currPrice < minPrice ? curr : min;
        });

        cheapestDomainName = cheapestDomain.domain;
        console.log(
          `✨ Cheapest domain for ${name}: ${cheapestDomainName} ($${cheapestDomain.prices.registration_price})`
        );
      }

      results.push({
        name: name,
        domains: domainResults.map((d) => ({
          ...d,
          prices: d.prices
            ? {
                ...d.prices,
                registration_price: parseFloat(d.prices.registration_price),
              }
            : null,
        })),
        cheapestDomain: cheapestDomainName,
      });
    }

    console.log("✅ Final results:", JSON.stringify(results, null, 2));
    return Response.json({ results });
  } catch (error) {
    console.error("❌ API Domains - Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
