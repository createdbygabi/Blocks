"use client";

import { usePathname } from "next/navigation";
import { AnimatedWrapper } from "./AnimatedWrapper";
import { useUser } from "@/hooks/useUser";

export function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/landing";
  console.log("isLandingPage", isLandingPage);

  const { user, loading } = useUser();

  // Don't protect the login page
  if (pathname === "/login") {
    return <AnimatedWrapper>{children}</AnimatedWrapper>;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <main
      className={`w-full min-h-screen ${
        isLandingPage ? "" : "pl-[300px] pt-12"
      }`}
    >
      <AnimatedWrapper>{children}</AnimatedWrapper>
    </main>
  );
}
