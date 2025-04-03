"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export function Navbar({ styles, business, onCtaClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!business) return null;

  const navItems = [
    { name: "Features", href: "/" },
    { name: "Pricing", href: "/" },
    { name: "Reviews", href: "/" },
    { name: "FAQ", href: "/" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <Link href="/" className="group flex items-center gap-3">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="h-12 w-12"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-2xl ${
                    styles.utils?.highlight ||
                    "bg-gradient-to-br from-blue-500 to-blue-600"
                  } flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105`}
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
                } transition-colors group-hover:text-blue-600`}
              >
                {business.name}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium 
                    ${styles.text?.secondary || "text-gray-600"}
                    hover:${styles.text?.primary || "text-gray-900"}
                    transition-all duration-200`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className={`px-4 py-2 rounded-xl text-sm font-medium 
                  ${styles.text?.secondary || "text-gray-600"}
                  hover:${styles.text?.primary || "text-gray-900"}
                  transition-all duration-200`}
              >
                Login
              </Link>
              <Link
                href="/"
                className={`px-5 py-2.5 rounded-xl text-sm font-medium
                  ${styles.button?.primary || "bg-blue-600 text-white"} 
                  transition-all duration-200
                  shadow-lg shadow-blue-500/20
                  hover:shadow-xl hover:shadow-blue-500/30
                  active:opacity-90`}
              >
                Get started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiX
                    className={`w-6 h-6 ${
                      styles.text?.primary || "text-gray-900"
                    }`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMenu
                    className={`w-6 h-6 ${
                      styles.text?.primary || "text-gray-900"
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="space-y-1.5 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium 
                      ${styles.text?.secondary || "text-gray-600"}
                      hover:${styles.text?.primary || "text-gray-900"}
                      transition-all duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-3 mt-3 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium 
                      ${styles.text?.secondary || "text-gray-600"}
                      hover:${styles.text?.primary || "text-gray-900"}
                      transition-all duration-200`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full px-4 py-3 rounded-xl text-base font-medium
                      ${styles.button?.primary || "bg-blue-600 text-white"}
                      transition-all duration-200
                      shadow-lg shadow-blue-500/20
                      hover:shadow-xl hover:shadow-blue-500/30
                      active:opacity-90`}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
