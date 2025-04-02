import { headers } from "next/headers";
import HeroScoringClient from "./client";

export default function HeroScoringTool() {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");

  return <HeroScoringClient subdomain={subdomain} />;
}
