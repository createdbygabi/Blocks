"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
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
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-8 w-auto"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-lg ${styles.utils.highlight} flex items-center justify-center`}
              >
                <span className={`text-lg font-bold ${styles.text.accent}`}>
                  {business.name.charAt(0)}
                </span>
              </div>
            )}
            <span className={`text-base font-medium ${styles.text.primary}`}>
              {business.name}
            </span>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-9">
            {/* Main Nav Items */}
            <Link
              href="#features"
              className={`text-[17px] font-medium ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className={`text-[17px] font-medium ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              Pricing
            </Link>
            <Link
              href="#reviews"
              className={`text-[17px] font-medium ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              Reviews
            </Link>
            <Link
              href="#platforms"
              className={`text-[17px] font-medium ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              Platforms
            </Link>
            <Link
              href="#faq"
              className={`text-[17px] font-medium ${styles.text.secondary} hover:${styles.text.primary} transition-colors`}
            >
              FAQ
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className={`text-[15px] font-medium ${styles.text.secondary} hover:${styles.text.primary} transition-colors hidden sm:block`}
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className={`inline-flex items-center px-4 py-2 text-[15px] font-medium rounded-lg
                  ${styles.button.primary} transition-all duration-200
                  hover:opacity-90 hover:shadow-md active:opacity-100`}
              >
                Try it free
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}
