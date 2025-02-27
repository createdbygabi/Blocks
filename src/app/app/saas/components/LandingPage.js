"use client";

import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiZap,
  FiStar,
  FiClock,
  FiBox,
  FiTrendingUp,
  FiLayers,
  FiActivity,
  FiMove,
  FiX,
  FiCheck,
  FiPlay,
  FiUpload,
} from "react-icons/fi";
import {
  landingThemes,
  designPresets,
  fontPresets,
  getStyles,
} from "@/lib/themes";
import {
  inter,
  plusJakarta,
  dmSans,
  spaceGrotesk,
  crimsonPro,
  workSans,
} from "@/app/app/fonts";
import { Navbar } from "./Navbar";
import { PricingPlans } from "./PricingPlans";
import { PricingSection } from "./PricingSection";
import { useState } from "react";

// Fade up animation variant
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export function LandingPage({ data }) {
  const { business, landingPage } = data;

  // Use landing page data or fallback to defaults
  const {
    theme: selectedTheme = landingThemes[0],
    design: selectedDesign = designPresets[0],
    font: selectedFont = fontPresets[0],
    content = {
      hero: {
        title: business.name,
        subtitle: business.main_feature,
        cta: "Get Started",
      },
    },
  } = landingPage || {};

  console.log("🚀 Landing Page Data:", { business, landingPage });

  // Extract content sections
  const {
    hero,
    features,
    testimonials,
    process,
    comparison,
    pricing,
    faq,
    final,
  } = content;

  // Find the theme from landingThemes that matches the selected theme
  const theme =
    landingThemes.find((t) => t.id === selectedTheme?.id) || landingThemes[0];
  const design =
    designPresets.find((d) => d.id === selectedDesign?.id) || designPresets[0];
  const font =
    fontPresets.find((f) => f.id === selectedFont?.id) || fontPresets[0];

  const styles = getStyles(theme, design, font);
  const fontVariables = `${inter.variable} ${plusJakarta.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${crimsonPro.variable} ${workSans.variable}`;

  // Helper function to render icons
  const renderIcon = (iconName) => {
    const icons = {
      layers: <FiLayers className="w-6 h-6" />,
      activity: <FiActivity className="w-6 h-6" />,
      clock: <FiClock className="w-6 h-6" />,
      box: <FiBox className="w-6 h-6" />,
      "trending-up": <FiTrendingUp className="w-6 h-6" />,
      zap: <FiZap className="w-6 h-6" />,
    };
    return icons[iconName] || null;
  };

  const [openFaq, setOpenFaq] = useState(null);

  const faqItems = [
    {
      question: "What social platforms do you support?",
      answer:
        "We support all major social media platforms including Twitter/X, Instagram, LinkedIn, Facebook, TikTok, YouTube, Bluesky, Threads, and Pinterest.",
    },
    {
      question: "How many social accounts can I connect?",
      answer:
        "The number of social accounts you can connect depends on your plan. Free users can connect up to 3 accounts, while paid plans allow for 15+ connections.",
    },
    {
      question: "What is a social account?",
      answer:
        "A social account is any individual profile or page you manage on a social media platform. For example, your Instagram profile or Facebook page counts as one social account.",
    },
    {
      question: "How many posts can I make and schedule per month?",
      answer:
        "Our paid plans include unlimited posts and scheduling. Free plans are limited to 10 posts per month.",
    },
    {
      question: "Will my posts get less reach using this app?",
      answer:
        "No, your posts will get the same reach as if you posted directly on the platform. We use official APIs to ensure maximum performance and visibility.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. No long-term contracts or commitments required.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.",
    },
    {
      question: "I have another question",
      answer:
        "Please reach out to our support team at support@postbridge.com and we'll be happy to help!",
    },
  ];

  return (
    <div className={`w-full min-h-screen ${fontVariables}`}>
      <Navbar styles={styles} business={business} />
      <main className={`w-full ${styles.layout.background}`}>
        {/* Hero Section */}
        <motion.section
          className={`relative min-h-[90vh] flex items-center ${styles.layout.surface}`}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div
            className={`absolute inset-0 ${styles.section.primary} opacity-5`}
          />

          <div className="relative w-full max-w-6xl mx-auto px-4 mb-12">
            {landingPage.hero_image ? (
              // Two-column layout with image
              <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 md:gap-8 items-center pt-165 md:pt-32 mx-2">
                {/* Left column - Content */}
                <div className="max-w-2xl text-center md:text-left">
                  {/* New feature badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-block mb-6 md:mb-8 py-2 ${styles.utils.highlight} rounded-full`}
                  >
                    <span
                      className={`text-sm font-medium tracking-wide ${styles.text.accent}`}
                    >
                      {hero.badge || "✨ AI-Powered Landing Pages in Minutes →"}
                    </span>
                  </motion.div>

                  {/* Title and subtitle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h1
                      className={`text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 ${styles.text.primary}`}
                    >
                      {hero.title ||
                        "Schedule your content everywhere in seconds"}
                    </h1>
                    <p
                      className={`text-base md:text-xl mb-6 md:mb-8 ${styles.text.secondary}`}
                    >
                      {hero.subtitle ||
                        "The simplest way to post and grow on all platforms. Built for creators and small teams without the ridiculous price tag."}
                    </p>
                  </motion.div>

                  {/* Feature list */}
                  {/* <motion.ul
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-2 md:space-y-3 mb-6 md:mb-8 max-w-lg mx-auto md:mx-0"
                  >
                    {[
                      "Post to all major platforms in one click",
                      "Schedule content for the perfect posting time",
                      "Customize content for each platform",
                      "Generate viral videos using our studio templates",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full ${styles.utils.highlight} flex items-center justify-center`}
                        >
                          <FiCheck
                            className={`w-3 h-3 ${styles.text.accent}`}
                          />
                        </div>
                        <span
                          className={`text-sm md:text-base ${styles.text.secondary}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </motion.ul> */}

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${styles.button.primary} px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold`}
                  >
                    Try it for free
                    <span className="ml-2">→</span>
                  </motion.button>

                  {/* Testimonial Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 mb-12 md:mb-0 flex flex-col md:flex-row items-center md:items-start gap-4"
                  >
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <img
                          key={i}
                          src={`/testimonials/avatar${i}.jpg`}
                          alt=""
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-center md:items-start gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-5 h-5"
                            fill="#f5cb44"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className={`text-sm ${styles.text.secondary}`}>
                        Loved by <span className="font-bold">2,500</span> small
                        businesses
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Right column - Platform Icons */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-full max-w-lg md:max-w-none mx-auto mb-8 md:mb-0"
                >
                  <div className="relative aspect-square">
                    <img
                      src={landingPage.hero_image}
                      alt="Platform preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </motion.div>
              </div>
            ) : (
              // Current centered layout
              <div className="text-center max-w-4xl mx-auto">
                {/* New feature badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`inline-block mb-8 px-5 py-2 ${styles.utils.highlight} rounded-full`}
                >
                  <span
                    className={`text-sm font-medium tracking-wide ${styles.text.accent}`}
                  >
                    {hero.badge || "✨ AI-Powered Landing Pages in Minutes →"}
                  </span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight ${styles.text.primary}`}
                >
                  {hero.title || (
                    <>
                      Schedule your content
                      <br />
                      <span className={styles.text.accent}>
                        everywhere in seconds
                      </span>
                    </>
                  )}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto ${styles.text.secondary}`}
                >
                  {hero.subtitle}
                </motion.p>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex justify-center gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${styles.button.primary} px-8 py-4 rounded-xl text-lg font-bold`}
                  >
                    {hero.cta || "Get Started Free"}
                    <span className="ml-2">→</span>
                  </motion.button>
                </motion.div>

                {/* Testimonial Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-12 flex flex-col items-center gap-4"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img
                        key={i}
                        src={`/testimonials/avatar${i}.jpg`}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="#f5cb44"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className={`text-sm ${styles.text.secondary}`}>
                      Loved by <span className="font-bold">2,500+</span> small
                      businesses
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <section className={`py-16 ${styles.layout.surface}`}>
          <div className="max-w-7xl mx-auto px-4">
            {/* Featured Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${styles.card} max-w-3xl mx-auto p-8 rounded-2xl relative`}
            >
              {/* Success Metrics */}
              <div
                className={`absolute -top-3 -right-3 px-4 py-2 rounded-full text-sm font-medium ${styles.utils.highlight} ${styles.text.accent}`}
              >
                10x faster workflow
              </div>

              {/* Profile and Quote */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left: Profile */}
                <div className="flex-shrink-0 text-center md:text-left">
                  <img
                    src="/testimonials/user1.jpg"
                    alt="Sarah Chen"
                    className="w-16 h-16 rounded-full object-cover mx-auto md:mx-0 mb-3"
                  />
                  <div className={`font-semibold ${styles.text.primary}`}>
                    Sarah Chen
                  </div>
                  <div className={`text-sm ${styles.text.secondary}`}>
                    Digital Marketing Manager
                  </div>
                  <div className={`text-sm ${styles.text.accent} mt-1`}>
                    @socialmedia_sarah
                  </div>
                </div>

                {/* Right: Quote and Results */}
                <div>
                  <blockquote className={`text-xl ${styles.text.primary} mb-4`}>
                    "I was spending 3 hours every day manually posting content.
                    Now I schedule a week's worth of content in just 15 minutes.
                    This tool has literally given me my weekends back!"
                  </blockquote>

                  {/* Results */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100/10">
                    <div>
                      <div
                        className={`text-2xl font-bold ${styles.text.accent}`}
                      >
                        85%
                      </div>
                      <div className={`text-sm ${styles.text.secondary}`}>
                        Time saved
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold ${styles.text.accent}`}
                      >
                        2.3x
                      </div>
                      <div className={`text-sm ${styles.text.secondary}`}>
                        Engagement
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold ${styles.text.accent}`}
                      >
                        12k+
                      </div>
                      <div className={`text-sm ${styles.text.secondary}`}>
                        New followers
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100/10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${styles.text.accent}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className={`text-sm ${styles.text.muted}`}>
                  Verified Customer • 6 months ago
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pain Points Section */}
        <motion.section className={`relative py-20 ${styles.layout.surface}`}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative max-w-6xl mx-auto px-4">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${styles.text.primary}`}
              >
                Posting content shouldn't be this{" "}
                <span className={`${styles.text.accent}`}>hard</span>
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${styles.text.secondary} opacity-80`}
              >
                Other solutions and tools...
              </p>
            </motion.div>

            {/* Pain Points Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`${styles.card} p-8 hover:bg-white/5 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-red-500/10`}>
                    <FiClock className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Manually posting
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      Hours of time you can't get back - spent posting your
                      content 1 by 1 to each platform (ouch)
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`${styles.card} p-8 hover:bg-white/5 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-red-500/10`}>
                    <FiBox className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Unfairly expensive
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      You're not an enterprise, or a Fortune 500 company, so why
                      are you paying as much as one?
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`${styles.card} p-8 hover:bg-white/5 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-red-500/10`}>
                    <FiLayers className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Features you don't need
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      99 features and you only need one... but you'll have to
                      pay for all of them.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`${styles.card} p-8 hover:bg-white/5 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-red-500/10`}>
                    <FiActivity className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Complex tools
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      The learning curve is steeper than a UFO's flight path.
                      Houston, we have a problem!
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Growth & Benefits Section */}
        <motion.section className={`relative py-24 ${styles.layout.surface}`}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative max-w-6xl mx-auto px-4">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${styles.text.primary}`}
              >
                Grow your social reach with{" "}
                <span className={styles.text.accent}>less effort</span>
                <br />
                for <span className={styles.text.accent}>less money</span>
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${styles.text.secondary} opacity-80`}
              >
                Using post bridge features...
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Cross-posting Feature */}
                <div className="flex gap-4">
                  <div className={`p-2 rounded-xl ${styles.utils.highlight}`}>
                    <FiZap className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Cross-posting
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      Upload your content to post bridge and post it to any of
                      your connected social media accounts; including posting to
                      all platforms at the same time.
                    </p>
                  </div>
                </div>

                {/* Scheduling Feature */}
                <div className="flex gap-4">
                  <div className={`p-2 rounded-xl ${styles.utils.highlight}`}>
                    <FiClock className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Scheduling
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      Plan and schedule your content for optimal posting times
                      across all platforms.
                    </p>
                  </div>
                </div>

                {/* Content Management */}
                <div className="flex gap-4">
                  <div className={`p-2 rounded-xl ${styles.utils.highlight}`}>
                    <FiLayers className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Content management
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      Organize and manage all your content in one central
                      location.
                    </p>
                  </div>
                </div>

                {/* Content Studio */}
                <div className="flex gap-4">
                  <div className={`p-2 rounded-xl ${styles.utils.highlight}`}>
                    <FiBox className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      Content Studio
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      Create and edit content directly within the platform.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`${styles.card} p-8 rounded-2xl`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Watch views grow
                  </h3>
                  <div
                    className={`text-5xl font-bold ${styles.text.accent} mb-2`}
                  >
                    6,932,049
                  </div>
                  <p className={`${styles.text.secondary}`}>Potential views</p>
                </div>

                <div
                  className={`h-48 w-full bg-black/10 rounded-xl mb-6 relative overflow-hidden`}
                >
                  {/* Add your graph/chart component here */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full ${styles.button.primary} py-3 rounded-xl`}
                >
                  Start Growing Now
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section className={`relative py-24 ${styles.layout.surface}`}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative max-w-6xl mx-auto px-4">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div
                className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full ${styles.utils.highlight}`}
              >
                <FiZap className={`w-5 h-5 ${styles.text.accent}`} />
                <span className={`text-sm font-medium ${styles.text.accent}`}>
                  Simple 3-step process
                </span>
              </div>
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${styles.text.primary}`}
              >
                Get started in{" "}
                <span className={styles.text.accent}>minutes</span>
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${styles.text.secondary} opacity-80`}
              >
                No complex setup. No learning curve. Just results.
              </p>
            </motion.div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative ${styles.card} p-8 rounded-2xl`}
              >
                <div
                  className={`absolute -top-4 -left-4 w-12 h-12 rounded-full ${styles.utils.highlight} flex items-center justify-center border-4 ${styles.layout.surface}`}
                >
                  <span className={`text-xl font-bold ${styles.text.accent}`}>
                    1
                  </span>
                </div>
                <div className="pt-4">
                  <h3
                    className={`text-xl font-semibold mb-4 ${styles.text.primary}`}
                  >
                    Connect your accounts
                  </h3>
                  <p className={`${styles.text.secondary} mb-6`}>
                    Link your social media profiles with one click. We support
                    all major platforms.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className={`p-2 rounded-lg bg-black/10`}>
                      <img
                        src="/icons/instagram.svg"
                        alt="Instagram"
                        className="w-6 h-6"
                      />
                    </div>
                    <div className={`p-2 rounded-lg bg-black/10`}>
                      <img
                        src="/icons/twitter.svg"
                        alt="Twitter"
                        className="w-6 h-6"
                      />
                    </div>
                    {/* Add more platform icons */}
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`relative ${styles.card} p-8 rounded-2xl`}
              >
                <div
                  className={`absolute -top-4 -left-4 w-12 h-12 rounded-full ${styles.utils.highlight} flex items-center justify-center border-4 ${styles.layout.surface}`}
                >
                  <span className={`text-xl font-bold ${styles.text.accent}`}>
                    2
                  </span>
                </div>
                <div className="pt-4">
                  <h3
                    className={`text-xl font-semibold mb-4 ${styles.text.primary}`}
                  >
                    Upload your content
                  </h3>
                  <p className={`${styles.text.secondary} mb-6`}>
                    Drag & drop your content or create it directly in our
                    studio. One content, all platforms.
                  </p>
                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${styles.utils.divider} text-center`}
                  >
                    <FiUpload
                      className={`w-8 h-8 mx-auto mb-2 ${styles.text.muted}`}
                    />
                    <span className={`text-sm ${styles.text.muted}`}>
                      Drag files here
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`relative ${styles.card} p-8 rounded-2xl`}
              >
                <div
                  className={`absolute -top-4 -left-4 w-12 h-12 rounded-full ${styles.utils.highlight} flex items-center justify-center border-4 ${styles.layout.surface}`}
                >
                  <span className={`text-xl font-bold ${styles.text.accent}`}>
                    3
                  </span>
                </div>
                <div className="pt-4">
                  <h3
                    className={`text-xl font-semibold mb-4 ${styles.text.primary}`}
                  >
                    Schedule & publish
                  </h3>
                  <p className={`${styles.text.secondary} mb-6`}>
                    Set it and forget it. We'll post your content at the perfect
                    time for maximum engagement.
                  </p>
                  <div
                    className={`flex items-center gap-2 ${styles.text.accent}`}
                  >
                    <FiClock className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Auto-scheduling enabled
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mt-16 p-8 rounded-2xl bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 max-w-3xl mx-auto text-center`}
            >
              <h3 className={`text-2xl font-bold mb-4 ${styles.text.primary}`}>
                Ready to streamline your social media?
              </h3>
              <p className={`${styles.text.secondary} mb-6 max-w-xl mx-auto`}>
                Join thousands of creators who are saving time and growing
                faster with our platform.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.button.primary} px-8 py-4 rounded-xl text-lg font-bold`}
              >
                Get Started Free
                <span className="ml-2">→</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        <section id="pricing" className="py-12 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Pricing Plans
            </h2>
            <PricingSection
              styles={styles}
              pricingPlans={business.pricing_plans}
              stripeConnectId={business.stripe_account_id}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`py-24 ${styles.layout.surface}`}>
          <div className="max-w-4xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className={`text-sm font-medium ${styles.text.accent}`}>
                FAQ
              </span>
              <h2
                className={`text-3xl md:text-4xl font-bold mt-2 ${styles.text.primary}`}
              >
                Frequently Asked Questions
              </h2>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.card} rounded-xl overflow-hidden`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <h3
                      className={`text-lg font-semibold ${styles.text.primary}`}
                    >
                      {item.question}
                    </h3>
                    <span
                      className={`text-2xl ${
                        styles.text.accent
                      } transition-transform duration-200 ${
                        openFaq === index ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className={`px-6 pb-6 ${styles.text.secondary}`}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <motion.section className={`py-32 md:py-40 ${styles.layout.surface}`}>
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto py-8"
            >
              <h2
                className={`text-4xl md:text-5xl font-bold mb-8 ${styles.text.primary}`}
              >
                Get more views,{" "}
                <span className={styles.text.accent}>with less effort</span>
              </h2>
              <p className={`text-lg mb-12 ${styles.text.secondary}`}>
                Post to all platforms in 30 seconds instead of 30 minutes.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.button.primary} px-8 py-4 rounded-xl text-lg font-bold`}
              >
                Try for free
                <span className="ml-2">→</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer
        className={`py-16 ${styles.layout.surface} border-t ${styles.border}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg ${styles.utils.highlight} flex items-center justify-center`}
                >
                  <span className={`text-lg font-bold ${styles.text.accent}`}>
                    {business.name.charAt(0)}
                  </span>
                </div>
                <span
                  className={`text-base font-medium ${styles.text.primary}`}
                >
                  {business.name}
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary}`}>
                Post content to multiple social media platforms at the same
                time, all-in-one place. Cross posting made easy.
              </p>
              <p className={`text-sm ${styles.text.muted}`}>
                Copyright © {new Date().getFullYear()} - All rights reserved
              </p>
            </div>

            {/* Links Column */}
            <div>
              <h3
                className={`text-sm font-semibold mb-4 ${styles.text.primary}`}
              >
                LINKS
              </h3>
              <ul className={`space-y-3 text-sm ${styles.text.secondary}`}>
                <li>
                  <a href="/support">Support</a>
                </li>
                <li>
                  <a href="/pricing">Pricing</a>
                </li>
                <li>
                  <a href="/blog">Blog</a>
                </li>
                <li>
                  <a href="/affiliates">Affiliates</a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3
                className={`text-sm font-semibold mb-4 ${styles.text.primary}`}
              >
                LEGAL
              </h3>
              <ul className={`space-y-3 text-sm ${styles.text.secondary}`}>
                <li>
                  <a href="/terms">Terms of services</a>
                </li>
                <li>
                  <a href="/privacy">Privacy policy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
