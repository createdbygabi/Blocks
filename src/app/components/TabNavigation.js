"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

const tabs = [
  {
    name: "App Settings",
    href: "/",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    name: "Landing Page Editor",
    href: "/landing",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    name: "Content Creation",
    href: "/content",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    name: "Payment Settings",
    href: "/payment",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
];

export function TabNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isHovering && !isCollapsed) {
      const timer = setTimeout(() => setIsCollapsed(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isHovering, isCollapsed]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      router.push("/login");
    }
  };

  if (pathname === "/landing") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`fixed left-0 top-0 h-screen bg-black border-r border-gray-800 z-50 transition-[width] duration-300 flex flex-col ${
        isCollapsed && !isHovering ? "w-[72px]" : "w-[240px]"
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex-1 p-4">
        <div className="mb-8">
          <div className="flex items-center h-6">
            <div className="w-8 flex items-center justify-center shrink-0">
              <Image
                src="/images/logo.png"
                alt="Blocks Logo"
                width={24}
                height={24}
                className="rounded"
              />
            </div>
            <div
              className={
                isCollapsed && !isHovering ? "hidden" : "ml-3 min-w-[144px]"
              }
            >
              <h1 className="text-base font-semibold truncate">Blocks</h1>
              <p className="text-xs text-gray-500 truncate">Build with AI</p>
            </div>
          </div>
          {user && (
            <div
              className={isCollapsed && !isHovering ? "hidden" : "px-2 mt-4"}
            >
              <p className="text-[10px] text-gray-300 truncate">{user.email}</p>
            </div>
          )}
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`group flex items-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <div className="flex items-center h-9 w-full">
                  <div className="px-3 flex items-center">
                    <div className="w-4 h-4 shrink-0">{tab.icon}</div>
                    <span
                      className={
                        isCollapsed && !isHovering
                          ? "hidden"
                          : "ml-3 text-sm font-medium truncate min-w-[144px]"
                      }
                    >
                      {tab.name}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Button */}
      <div className="p-4">
        <button
          onClick={handleSignOut}
          className={`w-full group flex items-center rounded-lg transition-all duration-300 bg-white text-black hover:bg-gray-100 ${
            isCollapsed && !isHovering ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center h-9 w-full">
            <div className="px-3 flex items-center">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span
                className={
                  isCollapsed && !isHovering
                    ? "hidden"
                    : "ml-3 text-sm font-medium tracking-wide truncate min-w-[144px]"
                }
              >
                Sign Out
              </span>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
