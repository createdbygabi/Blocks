"use client";

import Link from "next/link";
import { motion } from "framer-motion";
// import { useAuth } from "@/hooks/useAuth";
// import { siteConfig } from "@/lib/config";

export function Navbar({ styles, business }) {
  // const { user } = useAuth();
  const user = null;

  // Handle null/undefined business object
  if (!business) {
    console.log("⚠️ No business data provided to Navbar");
    return null;
  }

  console.log("🏢 Navbar business data:", business);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-8 w-auto"
              />
            )}
            <span className={`text-lg font-bold ${styles.text.primary}`}>
              {business.name}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className={`text-sm ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className={`text-sm ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              Pricing
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                  ${styles.button.primary} transition-all duration-200
                  hover:opacity-90 hover:shadow-sm active:opacity-100`}
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}
