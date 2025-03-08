"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export function Navbar({ styles, business, onCtaClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!business) {
    console.log("⚠️ No business data provided to Navbar");
    return null;
  }

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Reviews", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-gray-200/80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <Link href="/" className="flex items-center gap-2.5">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="h-8 w-auto"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-xl ${
                    styles.utils?.highlight || "bg-blue-500"
                  } flex items-center justify-center shadow-sm`}
                >
                  <span
                    className={`text-lg font-bold ${
                      styles.text?.accent || "text-white"
                    }`}
                  >
                    {business.name.charAt(0)}
                  </span>
                </div>
              )}
              <span
                className={`text-lg font-semibold ${
                  styles.text?.primary || "text-gray-900"
                }`}
              >
                {business.name}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    styles.text?.secondary || "text-gray-600"
                  } hover:${
                    styles.text?.primary || "text-gray-900"
                  } hover:bg-gray-100/80 transition-all`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  styles.text?.secondary || "text-gray-600"
                } hover:${
                  styles.text?.primary || "text-gray-900"
                } hover:bg-gray-100/80 transition-all`}
              >
                Login
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCtaClick}
                className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${styles.button?.primary || "bg-blue-600 text-white"} 
                  transition-all duration-200 shadow-sm
                  hover:opacity-90 hover:shadow-md active:opacity-100`}
              >
                Get started
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100/80"
          >
            {isMenuOpen ? (
              <FiX
                className={`w-6 h-6 ${styles.text?.primary || "text-gray-900"}`}
              />
            ) : (
              <FiMenu
                className={`w-6 h-6 ${styles.text?.primary || "text-gray-900"}`}
              />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? "auto" : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="space-y-1 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                  styles.text?.secondary || "text-gray-600"
                } hover:${
                  styles.text?.primary || "text-gray-900"
                } hover:bg-gray-100/80`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                  styles.text?.secondary || "text-gray-600"
                } hover:${
                  styles.text?.primary || "text-gray-900"
                } hover:bg-gray-100/80`}
              >
                Login
              </Link>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsMenuOpen(false);
                  onCtaClick();
                }}
                className={`w-full mt-2 px-4 py-2.5 rounded-lg text-base font-mediu^m
                  ${styles.button?.primary || "bg-blue-600 text-white"}
                  transition-all duration-200 shadow-sm
                  hover:opacity-90 hover:shadow-md active:opacity-100`}
              >
                Get started
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
