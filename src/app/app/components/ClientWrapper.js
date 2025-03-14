"use client";

import { usePathname } from "next/navigation";
import { AnimatedWrapper } from "./AnimatedWrapper";
import { useUser } from "@/hooks/useUser";
import AppNotifications from "./AppNotifications";

export function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isNoNavPage =
    pathname === "/app/onboarding" ||
    pathname === "/app/login" ||
    pathname === "/app/landing";
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
          isNoNavPage
            ? ""
            : "lg:pl-[70px] pt-[60px] lg:pt-12 px-4 sm:px-6 lg:px-8"
        }`}
      >
        <AnimatedWrapper>{children}</AnimatedWrapper>
      </main>
      {/* <AppNotifications /> */}
    </>
  );
}
