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

  return (
    <div className={`w-full min-h-screen ${fontVariables}`}>
      <Navbar styles={styles} business={business} />
      <main className={styles.layout.background}>
        {/* Hero Section */}
        <motion.section
          className={`relative min-h-screen ${styles.layout.surface}`}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div
            className={`absolute inset-0 ${styles.section.primary} opacity-5`}
          />

          <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20">
            <div className="text-center max-w-4xl mx-auto">
              {/* New feature badge */}
              <motion.div
                {...fadeUp}
                className={`inline-block mb-6 px-4 py-1 ${styles.utils.highlight} rounded-full`}
              >
                <span className={styles.text.accent}>
                  {hero.badge || "New: AI-Powered Templates Available →"}
                </span>
              </motion.div>

              {/* Hero content */}
              <motion.h1
                {...fadeUp}
                className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${styles.text.primary}`}
              >
                {hero.title}
              </motion.h1>

              <motion.p
                {...fadeUp}
                transition={{ delay: 0.1 }}
                className={`text-xl md:text-2xl mb-12 leading-relaxed ${styles.text.secondary}`}
              >
                {hero.subtitle}
              </motion.p>

              {/* CTA Button */}
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-16"
              >
                <motion.button
                  whileHover={{ scale: 1.05, rotate: [-0.5, 0.5, -0.5, 0] }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative px-10 py-5 text-xl font-bold transition-all duration-300 
                    ${styles.button.primary} rounded-2xl
                    bg-gradient-to-r from-primary via-accent to-primary 
                    bg-[length:200%_100%] bg-[0%] hover:bg-[100%]
                    shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]
                    hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.8)]
                    border-2 border-primary/20`}
                >
                  <span className="relative z-10 bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                    {hero.cta}
                  </span>
                </motion.button>
              </motion.div>

              {/* Metrics */}
              {hero.metrics && (
                <motion.div
                  {...fadeUp}
                  transition={{ delay: 0.4 }}
                  className={`mt-16 pt-8 border-t ${styles.utils.divider}`}
                >
                  <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {hero.metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className={`${styles.card} p-6 backdrop-blur-sm transition-all duration-300`}
                      >
                        <div className={styles.text.accent}>
                          {renderIcon(metric.iconName)}
                        </div>
                        <div
                          className={`text-3xl font-bold mb-1 ${styles.text.primary}`}
                        >
                          {metric.value}
                        </div>
                        <div className={styles.text.muted}>{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        {features && features.length > 0 && (
          <motion.section
            className={`relative py-32 ${styles.layout.background}`}
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="relative max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.card} ${styles.utils.highlight} p-8 transition-all duration-300`}
                  >
                    <div className={`text-3xl mb-4 ${styles.text.accent}`}>
                      {renderIcon(feature.iconName)}
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                    >
                      {feature.title}
                    </h3>
                    <p className={`mb-6 ${styles.text.secondary}`}>
                      {feature.description}
                    </p>
                    <div
                      className={`flex items-center justify-between pt-6 border-t ${styles.utils.divider}`}
                    >
                      <span className={styles.text.accent}>
                        {feature.metrics}
                      </span>
                      <span className={styles.text.muted}>
                        {feature.detail}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Process Section */}
        {process && process.steps && (
          <motion.section className={`relative py-32 ${styles.layout.primary}`}>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="relative max-w-7xl mx-auto px-4">
              <div className="text-center mb-20">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`text-4xl font-bold mb-6 ${styles.text.primary}`}
                >
                  {process.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
                >
                  {process.subtitle}
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {process.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.card} p-8 transition-all duration-300`}
                  >
                    <div
                      className={`text-2xl font-bold mb-4 ${styles.text.accent}`}
                    >
                      {step.number}
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                    >
                      {step.title}
                    </h3>
                    <p className={`mb-6 ${styles.text.secondary}`}>
                      {step.description}
                    </p>
                    <div className={`pt-6 border-t ${styles.utils.divider}`}>
                      <span className={styles.text.muted}>{step.detail}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Testimonials Section */}
        {testimonials && testimonials.items && (
          <motion.section className={`relative py-32 ${styles.layout.surface}`}>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="relative max-w-7xl mx-auto px-4">
              <div className="text-center mb-20">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`text-4xl font-bold mb-6 ${styles.text.primary}`}
                >
                  {testimonials.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
                >
                  {testimonials.subtitle}
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {testimonials.items.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.card} p-8`}
                  >
                    <p className={`mb-6 ${styles.text.secondary}`}>
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-full mr-4 ${styles.utils.highlight} flex items-center justify-center`}
                      >
                        <span
                          className={`text-xl font-bold ${styles.text.accent}`}
                        >
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div
                          className={`text-lg font-semibold ${styles.text.primary}`}
                        >
                          {testimonial.author}
                        </div>
                        <div className={styles.text.muted}>
                          {testimonial.role}
                        </div>
                        <div className={`mt-1 text-sm ${styles.text.accent}`}>
                          {testimonial.company.result}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        <section id="pricing" className="py-12 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Pricing Plans
            </h2>
            <PricingPlans
              pricingPlans={business.pricing_plans}
              stripeConnectId={business.stripe_account_id}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
