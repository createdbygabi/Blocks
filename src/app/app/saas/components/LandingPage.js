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
import { PricingSection } from "./PricingSection";
import { Testimonials } from "./Testimonials";
import { useState, useRef } from "react";

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
    theme_id = 0, // Get theme_id directly from landingPage
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
  const { hero, painPoints, howItWorks, benefits, pricing, faq, final } =
    content;

  // Use theme_id directly from the landing page to get the theme
  const theme = landingThemes[theme_id] || landingThemes[0];
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
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const emailInputRef = useRef(null);

  const scrollToHeroAndFocus = () => {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Focus the email input after scrolling
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 500); // Wait for scroll to complete
  };

  const faqItems = faq?.items || [
    {
      question: "Can I customize for dietary restrictions?",
      answer:
        "Yes! We support all major dietary preferences including vegetarian, vegan, keto, paleo, gluten-free, and more.",
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

  const handleSubscribe = async (e) => {
    e.preventDefault(); // Prevent form submission

    if (!email) {
      alert("Please enter your email first");
      return;
    }

    try {
      if (!business?.stripe_account_id) {
        console.error("No Stripe Connect account ID found");
        return;
      }

      setLoading(true);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: business.pricing_plans, // Use the business's active plan
          stripeConnectId: business.stripe_account_id,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
          customerEmail: email, // Pass the email to pre-fill checkout
          businessId: business.id, // Add business ID
          businessSubdomain: business.subdomain, // Add business subdomain
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Checkout error details:", data); // This will show the full error response
        throw new Error(data.details || "Failed to create checkout session");
      }

      const { sessionUrl } = data;
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen ${fontVariables}`}>
      <Navbar
        styles={styles}
        business={business}
        onCtaClick={scrollToHeroAndFocus}
      />
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
                      {hero.badge || "✨ AI-Powered Meal Planning in Minutes →"}
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
                      {hero.title || "Plan your meals, save time and money"}
                    </h1>
                    <p
                      className={`text-base md:text-xl mb-6 md:mb-8 ${styles.text.secondary}`}
                    >
                      {hero.subtitle ||
                        "The easiest way to plan meals, generate shopping lists, and cook delicious food. Perfect for busy families."}
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

                  {/* Updated CTA Form */}
                  <motion.form
                    onSubmit={handleSubscribe}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
                  >
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={loading}
                      className={`w-full sm:w-auto min-w-[300px] px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg ${styles.input}`}
                    />
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${styles.button.primary} w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold disabled:opacity-50`}
                    >
                      {loading ? "Loading..." : hero?.cta || "Get Started"}
                      {!loading && <span className="ml-2">→</span>}
                    </motion.button>
                  </motion.form>

                  {/* Testimonial Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 mb-12 md:mb-0 flex flex-col md:flex-row items-center md:items-start gap-4"
                  >
                    <div className="flex -space-x-2">
                      {landingPage?.hero_icons?.map((imgNumber) => (
                        <img
                          key={imgNumber}
                          src={`/images/hero/face_${imgNumber}.jpg`}
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
                    {hero?.badge || "✨ AI-Powered Meal Planning in Minutes →"}
                  </span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight ${styles.text.primary}`}
                >
                  {hero?.title || (
                    <>
                      Plan your meals,
                      <br />
                      <span className={styles.text.accent}>
                        save time and money
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
                  {hero?.subtitle}
                </motion.p>

                {/* Updated CTA Form */}
                <motion.form
                  onSubmit={handleSubscribe}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-col sm:flex-row gap-2 justify-center items-center"
                >
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    className={`w-full sm:w-auto min-w-[300px] px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg ${styles.input}`}
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${styles.button.primary} w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold disabled:opacity-50`}
                  >
                    {loading ? "Loading..." : hero?.cta || "Get Started"}
                    {!loading && <span className="ml-2">→</span>}
                  </motion.button>
                </motion.form>

                {/* Testimonial Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-12 flex flex-col items-center gap-4"
                >
                  <div className="flex -space-x-2">
                    {landingPage?.hero_icons?.map((imgNumber) => (
                      <img
                        key={imgNumber}
                        src={`${process.env.NEXT_PUBLIC_APP_URL}/images/hero/face_${imgNumber}.jpg`}
                        alt=""
                        className="w-11 h-11 rounded-full border-4 border-white dark:border-white"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="#fce063"
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
        {/* <Testimonials styles={styles} testimonial={data.testimonials} /> */}

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
                {painPoints?.title ||
                  "Meal planning shouldn't be this stressful"}
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${styles.text.secondary} opacity-80`}
              >
                {painPoints?.subtitle ||
                  "Traditional meal planning is time-consuming, wasteful, and often leads to expensive takeout. There's a smarter way to feed your family."}
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
                    <FiBox className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      {painPoints?.items?.[0]?.title || "Wasted groceries"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {painPoints?.items?.[0]?.description ||
                        "Throwing away expired food because you didn't have a plan? Your wallet feels the pain."}
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
                    <FiClock className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      {painPoints?.items?.[1]?.title || "Last-minute takeout"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {painPoints?.items?.[1]?.description ||
                        "When you're tired and hungry, another $50 disappears on delivery apps."}
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
                      {painPoints?.items?.[2]?.title || "Recipe overwhelm"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {painPoints?.items?.[2]?.description ||
                        "Endless scrolling through recipes, never knowing what to make. Decision paralysis is real!"}
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
                      {painPoints?.items?.[3]?.title || "Shopping chaos"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {painPoints?.items?.[3]?.description ||
                        "Multiple trips to the store, forgotten ingredients, and disorganized lists. The struggle is real."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Benefits & Features Section */}
        <motion.section
          className={`relative py-24 ${styles.layout.surface}`}
          id="features"
        >
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
                className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${styles.text.primary}`}
              >
                {benefits?.title ||
                  "Save time and money\nwith smarter meal planning"}
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${styles.text.secondary} opacity-80`}
              >
                {benefits?.subtitle ||
                  "Powerful features that make meal planning and cooking effortless"}
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
                  <div
                    className={`p-2.5 rounded-lg ${styles.utils.highlight} w-fit h-fit`}
                  >
                    <FiZap className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      {benefits?.features?.[0]?.title || "Cross-posting"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {benefits?.features?.[0]?.description ||
                        "Upload your content to post bridge and post it to any of your connected social media accounts; including posting to all platforms at the same time."}
                    </p>
                  </div>
                </div>

                {/* Scheduling Feature */}
                <div className="flex gap-4">
                  <div
                    className={`p-2.5 rounded-lg ${styles.utils.highlight} w-fit h-fit`}
                  >
                    <FiClock className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      {benefits?.features?.[1]?.title || "Scheduling"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {benefits?.features?.[1]?.description ||
                        "Plan and schedule your content for optimal posting times across all platforms."}
                    </p>
                  </div>
                </div>

                {/* Content Management */}
                <div className="flex gap-4">
                  <div
                    className={`p-2.5 rounded-lg ${styles.utils.highlight} w-fit h-fit`}
                  >
                    <FiLayers className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      {benefits?.features?.[2]?.title || "Content management"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {benefits?.features?.[2]?.description ||
                        "Organize and manage all your content in one central location."}
                    </p>
                  </div>
                </div>

                {/* Content Studio */}
                <div className="flex gap-4">
                  <div
                    className={`p-2.5 rounded-lg ${styles.utils.highlight} w-fit h-fit`}
                  >
                    <FiBox className={`w-6 h-6 ${styles.text.accent}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${styles.text.primary}`}
                    >
                      {benefits?.features?.[3]?.title || "Content Studio"}
                    </h3>
                    <p className={`${styles.text.secondary} leading-relaxed`}>
                      {benefits?.features?.[3]?.description ||
                        "Create and edit content directly within the platform."}
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
                <div className={`text-center mb-6 ${styles.text.primary}`}>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefits?.stats?.title || "Watch views grow"}
                  </h3>
                  <div
                    className={`text-5xl font-bold ${styles.text.accent} mb-2`}
                  >
                    {benefits?.stats?.value || "6,932,049"}
                  </div>
                  <p className={`${styles.text.secondary}`}>
                    {benefits?.stats?.label || "Potential views"}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full ${styles.button.primary} py-3 rounded-xl`}
                >
                  {benefits?.stats?.cta || "Start Growing Now"}
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
                className={`text-3xl md:text-4xl font-bold mb-6 ${styles.text.primary}`}
              >
                {howItWorks?.title || "Get started in minutes"}
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${styles.text.secondary} opacity-80`}
              >
                {howItWorks?.subtitle ||
                  "No complex setup. No learning curve. Just results."}
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
                    {howItWorks?.steps?.[0]?.title || "Connect your accounts"}
                  </h3>
                  <p className={`${styles.text.secondary} mb-6`}>
                    {howItWorks?.steps?.[0]?.description ||
                      "Link your social media profiles with one click. We support all major platforms."}
                  </p>
                  {/* <div className="flex flex-wrap gap-3">
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
                  </div> */}
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
                    {howItWorks?.steps?.[1]?.title || "Upload your content"}
                  </h3>
                  <p className={`${styles.text.secondary} mb-6`}>
                    {howItWorks?.steps?.[1]?.description ||
                      "Drag & drop your content or create it directly in our studio. One content, all platforms."}
                  </p>
                  {/* <div
                    className={`p-4 rounded-lg border-2 border-dashed ${styles.utils.divider} text-center`}
                  >
                    <FiUpload
                      className={`w-8 h-8 mx-auto mb-2 ${styles.text.muted}`}
                    />
                    <span className={`text-sm ${styles.text.muted}`}>
                      {howItWorks?.steps?.[1]?.uploadText || "Drag files here"}
                    </span>
                  </div> */}
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
                    {howItWorks?.steps?.[2]?.title || "Schedule & publish"}
                  </h3>
                  <p className={`${styles.text.secondary} mb-6`}>
                    {howItWorks?.steps?.[2]?.description ||
                      "Set it and forget it. We'll post your content at the perfect time for maximum engagement."}
                  </p>
                  {/* <div
                    className={`flex items-center gap-2 ${styles.text.accent}`}
                  >
                    <FiClock className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {howItWorks?.steps?.[2]?.statusText ||
                        "Auto-scheduling enabled"}
                    </span>
                  </div> */}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <PricingSection
          styles={styles}
          pricing={pricing}
          business={business}
          onCtaClick={scrollToHeroAndFocus}
        />

        {/* FAQ Section */}
        <section className={`py-24 ${styles.layout.surface}`} id="faq">
          <div className="max-w-4xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className={`text-sm font-medium ${styles.text.accent}`}>
                FAQ
              </span>
              <h2
                className={`text-3xl md:text-4xl font-bold mt-2 ${styles.text.primary}`}
              >
                {faq?.title || "Common questions"}
              </h2>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqItems?.map((item, index) => (
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
                      {item?.question}
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
                      {item?.answer}
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
                className={`text-3xl md:text-4xl font-bold mb-8 ${styles.text.primary}`}
              >
                {final?.title || "Start planning smarter meals today"}
              </h2>
              <p className={`text-lg mb-12 ${styles.text.secondary}`}>
                {final?.subtitle ||
                  "Stop stressing about dinner. Try it free for 14 days."}
              </p>
              <motion.button
                onClick={scrollToHeroAndFocus}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.button.primary} px-8 py-4 rounded-xl text-lg font-bold`}
              >
                {final?.cta || "Get started free"}
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
                    <img
                      src={business?.logo_url}
                      alt={business?.name}
                      className="w-full h-full object-cover"
                    />
                  </span>
                </div>
                <span
                  className={`text-base font-medium ${styles.text.primary}`}
                >
                  {business?.name}
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary}`}>
                {business?.description ||
                  "The easiest way to plan meals, generate shopping lists, and cook delicious food. Perfect for busy families."}
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
