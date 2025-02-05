"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
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
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import {
  landingThemes,
  getThemeClasses,
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
} from "../fonts";
import { exportPage, EXPORT_FORMATS } from "@/lib/exportManager";
import { useRouter } from "next/navigation";
import {
  getUserLandingPage,
  saveLandingPage,
  exportLandingPage,
} from "@/lib/db";
import { DEFAULT_PAGE, TEST_USER_ID } from "@/lib/types";
import { useUser } from "@/hooks/useUser";
import CopywritingSettings from "../components/CopywritingSettings";
import Toast from "../components/Toast";

// Debug print for font loading
console.log("Font objects:", {
  inter: inter,
  plusJakarta: plusJakarta,
  dmSans: dmSans,
  spaceGrotesk: spaceGrotesk,
  crimsonPro: crimsonPro,
  workSans: workSans,
});

// Font variables string
const fontVariables = `${inter.variable} ${plusJakarta.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${crimsonPro.variable} ${workSans.variable}`;

// Debug print for font variables
console.log("Font variables string:", fontVariables);

// Font combinations that complement each other perfectly
const fontCombos = {
  modernSans: {
    heading: "font-dm-sans",
    subheading: "font-plus-jakarta",
    body: "font-inter",
  },
  techMono: {
    heading: "font-space-grotesk",
    subheading: "font-work-sans",
    body: "font-inter",
  },
  elegantSerif: {
    heading: "font-crimson-pro",
    subheading: "font-work-sans",
    body: "font-plus-jakarta",
  },
  geometric: {
    heading: "font-dm-sans",
    subheading: "font-work-sans",
    body: "font-inter",
  },
};

// Fade up animation variant
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Update defaultContent to remove image dependencies and fix key issues
const defaultContent = {
  hero: {
    title: "Create Landing Pages That Convert",
    subtitle:
      "AI-powered landing page builder that helps you achieve 3x higher conversion rates",
    cta: "Start Free Trial",
    secondaryCta: "See Examples",
    metrics: [
      {
        id: "metric-1",
        value: "3,721+",
        label: "Pages Created",
        iconName: "layers",
      },
      {
        id: "metric-2",
        value: "89%",
        label: "Conversion Rate",
        iconName: "activity",
      },
      {
        id: "metric-3",
        value: "12min",
        label: "Avg. Build Time",
        iconName: "clock",
      },
    ],
    socialProof: {
      rating: 4.9,
      reviews: 847,
      platform: "Rated 4.9/5 on G2 Crowd",
    },
  },
  features: [
    {
      id: "feature-1",
      title: "Write Once, Convert Forever",
      description:
        "Our AI learns from your best-performing copy and continuously optimizes it. No more guesswork, just data-driven results.",
      iconName: "box",
      metrics: "83% better engagement",
      detail: "Trained on 1M+ successful landing pages",
    },
    {
      id: "feature-2",
      title: "Real-Time Optimization",
      description:
        "Watch your page evolve as visitors interact. Our smart analytics suggest improvements that actually make sense.",
      iconName: "trending-up",
      metrics: "2.4x conversion lift",
      detail: "Based on live user behavior",
    },
    {
      id: "feature-3",
      title: "Lightning-Fast Publishing",
      description:
        "Deploy changes instantly to any platform. Built-in CDN ensures your pages load blazingly fast, everywhere.",
      iconName: "zap",
      metrics: "0.8s average load time",
      detail: "99.9% uptime guaranteed",
    },
  ],
  results: {
    title: "Real Results, Real Numbers",
    subtitle: "See what our users achieve",
    cases: [
      {
        company: "TechStart Inc.",
        metric: "+127%",
        description: "Increase in conversion rate",
        logo: "/logos/1.png",
        time: "in 30 days",
      },
      {
        company: "GrowthLabs",
        metric: "2.1M",
        description: "Revenue generated",
        logo: "/logos/2.png",
        time: "in 6 months",
      },
      {
        company: "ScaleUp",
        metric: "-68%",
        description: "Reduction in CAC",
        logo: "/logos/3.png",
        time: "in 90 days",
      },
    ],
  },
  process: {
    title: "How It Actually Works",
    subtitle: "No magic, just smart technology and proven methods",
    steps: [
      {
        number: "01",
        title: "Choose Your Template",
        description:
          "Start with battle-tested layouts designed for conversion. Each template is based on real success stories.",
        detail: "20+ industry-specific templates",
      },
      {
        number: "02",
        title: "Customize & Optimize",
        description:
          "Our AI suggests changes based on your industry and goals. Edit freely or let automation guide you.",
        detail: "Smart A/B testing included",
      },
      {
        number: "03",
        title: "Launch & Learn",
        description:
          "Publish instantly and get actionable insights. Every visitor helps make your page better.",
        detail: "Real-time performance data",
      },
    ],
  },
  testimonials: {
    title: "Real Stories from Real Users",
    subtitle: "See how others are growing their business",
    items: [
      {
        id: "testimonial-1",
        quote:
          "I was skeptical about AI-powered tools, but this is different. It actually understands conversion psychology and applies it intelligently.",
        author: "Sarah Chen",
        role: "Growth Lead at TechFlow",
        company: {
          name: "TechFlow",
          detail: "B2B SaaS • Series A",
          result: "+143% demo bookings",
        },
      },
      {
        id: "testimonial-2",
        quote:
          "Finally, a landing page builder that thinks like a marketer. The AI suggestions are surprisingly good - it's like having a conversion expert on the team.",
        author: "Marcus Rodriguez",
        role: "Marketing Director",
        company: {
          name: "GrowthX",
          detail: "D2C Brand • $5M ARR",
          result: "2.8x ROAS improvement",
        },
      },
    ],
  },
  comparison: {
    title: "Why Teams Choose Us",
    subtitle: "See how we compare to traditional solutions",
    items: [
      {
        feature: "Time to Launch",
        us: "15 minutes average",
        others: "2-3 days typical",
        detail: "Based on user data from 10,000+ launches",
      },
      {
        feature: "Conversion Rate",
        us: "5.7% average",
        others: "2.3% industry standard",
        detail: "Measured across all industries",
      },
      {
        feature: "Ongoing Optimization",
        us: "Continuous & automated",
        others: "Manual & periodic",
        detail: "AI-powered improvements",
      },
    ],
  },
  pricing: {
    title: "Transparent Pricing, No Surprises",
    subtitle: "Start free, scale when ready",
    plans: [
      {
        name: "Launch",
        price: "$0",
        period: "forever",
        perfect: "Perfect for testing and small projects",
        features: [
          "3 Active Landing Pages",
          "Core Analytics",
          "Community Support",
          "Basic AI Suggestions",
          "1,000 Monthly Visitors",
        ],
        limitations: "No credit card required",
        cta: "Start Building Free",
      },
      {
        name: "Scale",
        price: "$49",
        period: "/month",
        perfect: "For growing businesses and teams",
        popular: true,
        features: [
          "Unlimited Landing Pages",
          "Advanced Analytics & Heatmaps",
          "Priority Support (24/7)",
          "Full AI Capabilities",
          "100,000 Monthly Visitors",
          "Custom Domains",
          "Team Collaboration",
        ],
        savings: "Save 20% yearly",
        cta: "Start 14-Day Trial",
      },
    ],
  },
  faq: {
    title: "Common Questions",
    items: [
      {
        question: "Do I need technical skills to use this?",
        answer:
          "Not at all. Our visual editor and AI assistant handle the technical stuff. If you can use PowerPoint, you can build high-converting landing pages.",
      },
      {
        question: "How does the AI optimization work?",
        answer:
          "Our AI analyzes visitor behavior, A/B test results, and conversion patterns across millions of sessions. It suggests improvements based on what's actually working in your industry.",
      },
      // ... more FAQs
    ],
  },
  final: {
    title: "Ready to Convert More Visitors?",
    subtitle: "Join 3,721+ businesses already growing with us",
    guarantee: "14-day free trial • No credit card required • Cancel anytime",
    cta: "Start Building Free",
    secondaryCta: "Talk to Sales",
  },
};

export default function LandingPageEditor() {
  const router = useRouter();
  const { user } = useUser();
  const [content, setContent] = useState(defaultContent);
  const [currentTheme, setCurrentTheme] = useState(landingThemes[0]);
  const [currentDesign, setCurrentDesign] = useState(designPresets[0]);
  const [currentFont, setCurrentFont] = useState(fontPresets[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  // Load user's landing page
  useEffect(() => {
    const loadPage = async () => {
      if (!user) return;

      try {
        const page = await getUserLandingPage(user.id);
        if (page) {
          setContent(page.content || defaultContent);
          setCurrentTheme(page.theme || landingThemes[0]);
          setCurrentDesign(page.design || designPresets[0]);
          setCurrentFont(page.font || fontPresets[0]);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to load page:", error);
        setIsInitialized(true);
      }
    };
    loadPage();
  }, [user]);

  // Manual save function
  const handleSave = async () => {
    if (!isInitialized || !user) return;

    setIsSaving(true);
    setSaveStatus("Saving...");
    try {
      // Save everything in one operation
      const pageData = {
        content: content || defaultContent,
        theme: currentTheme || landingThemes[0],
        design: currentDesign || designPresets[0],
        font: currentFont || fontPresets[0],
      };

      await saveLandingPage(user.id, pageData);

      setSaveStatus("Changes saved!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Failed to save changes:", error);
      setSaveStatus("Failed to save");
      setTimeout(() => setSaveStatus(""), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle content updates
  const handleContentUpdate = (newContent) => {
    console.log("🔄 Content update received:", newContent);
    setContent(newContent);
  };

  // Handle theme updates
  const handleThemeUpdate = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  // Handle design updates
  const handleDesignUpdate = (newDesign) => {
    setCurrentDesign(newDesign);
  };

  // Handle font updates
  const handleFontUpdate = (newFont) => {
    setCurrentFont(newFont);
  };

  // Export function
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Get the latest data from database
      const pageData = await exportLandingPage(user.id);

      const { blob, filename } = await exportPage(
        pageData,
        EXPORT_FORMATS.NEXT_PROJECT // Always export as Next.js project
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get combined styles including fonts
  const styles = useMemo(() => {
    const fontStyle = fontCombos[currentFont?.id] || fontCombos.modernSans;

    // Debug print for current font selection
    console.log("Current font selection:", {
      id: currentFont?.id,
      fontStyle,
      className: inter.className, // Example of direct font class
      variable: inter.variable, // Example of font variable
    });

    const computedStyles = getStyles(currentTheme, currentDesign, currentFont);

    // Add font classes based on selected font
    computedStyles.text = {
      ...computedStyles.text,
      heading: `${computedStyles.text.heading} ${fontStyle.heading}`,
      subheading: `${computedStyles.text.subheading} ${fontStyle.subheading}`,
      body: `${computedStyles.text.body} ${fontStyle.body}`,
    };

    // Debug print for computed styles
    console.log("Final computed styles with fonts:", computedStyles.text);

    return computedStyles;
  }, [currentTheme, currentDesign, currentFont]);

  // Debug print for rendered classes
  useEffect(() => {
    console.log("Rendered with font variables:", fontVariables);
    console.log(
      "Root element classes:",
      `w-full min-h-screen ${fontVariables}`
    );
  }, [fontVariables]);

  // Helper function to render icons
  const renderIcon = (iconName) => {
    switch (iconName) {
      case "layers":
        return <FiLayers />;
      case "activity":
        return <FiActivity />;
      case "clock":
        return <FiClock />;
      case "box":
        return <FiBox className="w-6 h-6" />;
      case "trending-up":
        return <FiTrendingUp className="w-6 h-6" />;
      case "zap":
        return <FiZap className="w-6 h-6" />;
      default:
        return null;
    }
  };

  // Get the current text to display for a field
  const getDisplayText = (path, originalText) => {
    console.log(
      "🔍 Getting display text for path:",
      path,
      "Preview state:",
      previewContent
    );
    if (!previewContent) return originalText;

    // Split the path into section and field
    const [section, ...fieldPath] = path.split(".");

    // If this section is being previewed
    if (previewContent.section === section) {
      // Navigate through the preview content using the field path
      const newText = fieldPath.reduce(
        (obj, key) => obj?.[key],
        previewContent.content
      );

      console.log("📝 New text for", path, ":", newText);
      if (newText === undefined) return originalText;

      // If it's an object (like features array), return original during preview
      if (typeof newText === "object") return originalText;

      return newText;
    }

    return originalText;
  };

  // Update the hero section rendering to use getDisplayText
  return (
    <div className={`w-full min-h-screen ${fontVariables}`}>
      <Toast />

      {/* Add CopywritingSettings component */}
      <CopywritingSettings
        content={content}
        onContentUpdate={handleContentUpdate}
        styles={styles}
      />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")}
        className={`fixed top-6 left-6 z-50 px-4 py-2 ${styles.button.secondary} rounded-full text-sm font-medium backdrop-blur-sm transition-all group flex items-center`}
      >
        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </motion.button>

      {/* Save Status Indicator */}
      {saveStatus && (
        <div className="fixed bottom-6 right-6 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-sm">
          {saveStatus}
        </div>
      )}

      {/* Theme Switcher */}
      <ThemeSwitcher
        currentTheme={currentTheme}
        onThemeChange={handleThemeUpdate}
        currentDesign={currentDesign}
        onDesignChange={handleDesignUpdate}
        currentFont={currentFont}
        onFontChange={handleFontUpdate}
        isExporting={isExporting}
        onExport={handleExport}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Main Content */}
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
                  New: AI-Powered Templates Available →
                </span>
              </motion.div>

              {/* Hero content */}
              <motion.h1
                {...fadeUp}
                className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${styles.text.primary}`}
              >
                {content.hero.title}
              </motion.h1>

              <motion.p
                {...fadeUp}
                transition={{ delay: 0.1 }}
                className={`text-xl md:text-2xl mb-12 leading-relaxed ${styles.text.secondary}`}
              >
                {content.hero.subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
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
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ zIndex: -1 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{
                      x: ["0%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ borderRadius: "1rem" }}
                  />
                  <span className="relative z-10 bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                    {content.hero.cta}
                  </span>
                  <div className="absolute inset-0 rounded-2xl ring-4 ring-primary/30 group-hover:ring-primary/50 transition-all" />
                </motion.button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.4 }}
                className={`mt-16 pt-8 border-t ${styles.utils.divider}`}
              >
                <div className="flex items-center justify-center mb-8">
                  <div
                    className={`flex items-center gap-4 ${styles.utils.highlight} rounded-full px-6 py-3`}
                  >
                    {/* Star rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-5 h-5 ${styles.text.accent} fill-current`}
                        />
                      ))}
                    </div>

                    {/* User count */}
                    <div
                      className={`text-lg font-medium ${styles.text.primary}`}
                    >
                      Loved by <span className="font-bold">100,000+</span>{" "}
                      founders
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div
                    className={`${styles.card} p-6 backdrop-blur-sm transition-all duration-300`}
                  >
                    <div className={styles.text.accent}>
                      <FiLayers className="w-6 h-6" />
                    </div>
                    <div
                      className={`text-3xl font-bold mb-1 ${styles.text.primary}`}
                    >
                      3,721+
                    </div>
                    <div className={styles.text.muted}>Pages Created</div>
                  </div>
                  <div
                    className={`${styles.card} p-6 backdrop-blur-sm transition-all duration-300`}
                  >
                    <div className={styles.text.accent}>
                      <FiActivity className="w-6 h-6" />
                    </div>
                    <div
                      className={`text-3xl font-bold mb-1 ${styles.text.primary}`}
                    >
                      89%
                    </div>
                    <div className={styles.text.muted}>Conversion Rate</div>
                  </div>
                  <div
                    className={`${styles.card} p-6 backdrop-blur-sm transition-all duration-300`}
                  >
                    <div className={styles.text.accent}>
                      <FiClock className="w-6 h-6" />
                    </div>
                    <div
                      className={`text-3xl font-bold mb-1 ${styles.text.primary}`}
                    >
                      12min
                    </div>
                    <div className={styles.text.muted}>Avg. Build Time</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className={`relative py-32 ${styles.layout.background}`}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-4xl font-bold mb-6 ${styles.text.primary}`}
              >
                Features That Drive Results
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
              >
                Everything you need to create high-converting landing pages,
                backed by data
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`${styles.card} ${styles.utils.highlight} p-8 transition-all duration-300`}
              >
                <div className={`text-3xl mb-4 ${styles.text.accent}`}>
                  <FiBox className="w-6 h-6" />
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                >
                  Write Once, Convert Forever
                </h3>
                <p className={`mb-6 ${styles.text.secondary}`}>
                  Our AI learns from your best-performing copy and continuously
                  optimizes it. No more guesswork, just data-driven results.
                </p>
                <div
                  className={`flex items-center justify-between pt-6 border-t ${styles.utils.divider}`}
                >
                  <span className={styles.text.accent}>
                    83% better engagement
                  </span>
                  <span className={styles.text.muted}>
                    Trained on 1M+ successful landing pages
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`${styles.card} ${styles.utils.highlight} p-8 transition-all duration-300`}
              >
                <div className={`text-3xl mb-4 ${styles.text.accent}`}>
                  <FiTrendingUp className="w-6 h-6" />
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                >
                  Real-Time Optimization
                </h3>
                <p className={`mb-6 ${styles.text.secondary}`}>
                  Watch your page evolve as visitors interact. Our smart
                  analytics suggest improvements that actually make sense.
                </p>
                <div
                  className={`flex items-center justify-between pt-6 border-t ${styles.utils.divider}`}
                >
                  <span className={styles.text.accent}>
                    2.4x conversion lift
                  </span>
                  <span className={styles.text.muted}>
                    Based on live user behavior
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`${styles.card} ${styles.utils.highlight} p-8 transition-all duration-300`}
              >
                <div className={`text-3xl mb-4 ${styles.text.accent}`}>
                  <FiZap className="w-6 h-6" />
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                >
                  Lightning-Fast Publishing
                </h3>
                <p className={`mb-6 ${styles.text.secondary}`}>
                  Deploy changes instantly to any platform. Built-in CDN ensures
                  your pages load blazingly fast, everywhere.
                </p>
                <div
                  className={`flex items-center justify-between pt-6 border-t ${styles.utils.divider}`}
                >
                  <span className={styles.text.accent}>
                    0.8s average load time
                  </span>
                  <span className={styles.text.muted}>
                    99.9% uptime guaranteed
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Process Section */}
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
                How It Actually Works
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
              >
                No magic, just smart technology and proven methods
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {content.process.steps.map((step, index) => (
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
                  <div
                    className={`flex items-center justify-between pt-6 border-t ${styles.utils.divider}`}
                  >
                    <span className={styles.text.muted}>{step.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          className={`relative py-32 ${styles.layout.background}`}
        >
          <div className="absolute inset-0 opacity-5" />
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-4xl font-bold mb-6 ${styles.text.primary}`}
              >
                Real Stories from Real Users
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
              >
                See how others are growing their business
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {content.testimonials.items.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${styles.card} p-8 transition-all duration-300`}
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Comparison Section */}
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
                Why Teams Choose Us
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
              >
                See how we compare to traditional solutions
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {content.comparison.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${styles.card} p-8 transition-all duration-300`}
                >
                  <h3
                    className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                  >
                    {item.feature}
                  </h3>
                  <div
                    className={`flex items-center justify-between mb-4 ${styles.text.accent}`}
                  >
                    <span className="text-2xl font-bold">{item.us}</span>
                    <span className={styles.text.muted}>{item.others}</span>
                  </div>
                  <div className={styles.text.muted}>{item.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          className={`relative py-32 ${styles.layout.background}`}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-4xl font-bold mb-6 ${styles.text.primary}`}
              >
                Transparent Pricing, No Surprises
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
              >
                Start free, scale when ready
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {content.pricing.plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${styles.card} ${
                    plan.popular ? styles.utils.highlight : ""
                  } p-8 transition-all duration-300`}
                >
                  <h3
                    className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                  >
                    {plan.name}
                  </h3>
                  <div
                    className={`flex items-center justify-between mb-4 ${styles.text.accent}`}
                  >
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={styles.text.muted}>{plan.period}</span>
                  </div>
                  <p className={`mb-6 ${styles.text.secondary}`}>
                    {plan.perfect}
                  </p>
                  <ul className={`mb-6 ${styles.text.secondary}`}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>{feature}</li>
                    ))}
                  </ul>
                  {plan.limitations && (
                    <p className={styles.text.muted}>{plan.limitations}</p>
                  )}
                  {plan.savings && (
                    <p className={styles.text.accent}>{plan.savings}</p>
                  )}
                  <button
                    className={`px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 ${styles.button.primary}`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
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
                Common Questions
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {content.faq.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${styles.card} p-8 transition-all duration-300`}
                >
                  <h3
                    className={`text-xl font-semibold mb-3 ${styles.text.primary}`}
                  >
                    {item.question}
                  </h3>
                  <p className={`mb-6 ${styles.text.secondary}`}>
                    {item.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final Section */}
        <motion.section
          className={`relative py-32 ${styles.layout.background}`}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-4xl font-bold mb-6 ${styles.text.primary}`}
              >
                Ready to Convert More Visitors?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-xl max-w-3xl mx-auto ${styles.text.secondary}`}
              >
                Join 3,721+ businesses already growing with us
              </motion.p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                className={`px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 ${styles.button.primary}`}
              >
                {content.final.cta}
              </button>
              <button
                className={`px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 ${styles.button.secondary}`}
              >
                {content.final.secondaryCta}
              </button>
            </div>

            <div className={styles.text.muted}>{content.final.guarantee}</div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
