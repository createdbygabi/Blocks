"use client";

import { usePathname } from "next/navigation";
import { AnimatedWrapper } from "./AnimatedWrapper";
import { useUser } from "@/hooks/useUser";
import AppNotifications from "./AppNotifications";

export function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isNoNavPage = pathname === "/landing" || pathname === "/onboarding";
  const { user, loading } = useUser();

  if (pathname === "/login") {
    return <AnimatedWrapper>{children}</AnimatedWrapper>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <main
        className={`w-full min-h-screen ${
          isNoNavPage ? "" : "pl-[300px] pt-12"
        }`}
      >
        <AnimatedWrapper>{children}</AnimatedWrapper>
      </main>
      {/* <AppNotifications /> */}
    </>
  );
}
