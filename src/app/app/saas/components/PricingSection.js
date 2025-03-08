"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export function PricingSection({ styles, pricing, business, onCtaClick }) {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const emailInputRef = useRef(null);

  // Get the active plan (middle plan) from business pricing_plans
  const activePlan = business?.pricing_plans;
  console.log("active plan", activePlan);

  // Get the middle and pro plans from the landing page Content
  console.log("pricing", pricing);
  const middlePlan = pricing?.plans?.[0] || {
    name: "Middle",
    description: "Best for beginner creators",
    price: 5.33,
    features: [
      "5 connected social accounts",
      "10 posts/month",
      "Basic analytics",
      "Content calendar",
    ],
  };

  const proPlan = pricing?.plans?.[2] || {
    name: "Pro",
    description: "For marketing teams",
    price: 49.99,
    features: [
      "Unlimited social accounts",
      "Advanced analytics",
      "Team collaboration",
      "Priority support",
    ],
  };

  // Calculate yearly prices (12 months - 40% discount)
  const calculateYearlyPrice = (monthlyPrice) => {
    return Math.round(monthlyPrice * 12 * 0.6);
  };

  // Calculate yearly savings
  const calculateYearlySavings = (monthlyPrice) => {
    const yearlyTotal = monthlyPrice * 12;
    const discountedYearlyPrice = calculateYearlyPrice(monthlyPrice);
    return Math.round(yearlyTotal - discountedYearlyPrice);
  };

  // Add yearly prices to middle and pro Plans
  middlePlan.yearlyPrice = calculateYearlyPrice(middlePlan.price);
  proPlan.yearlyPrice = calculateYearlyPrice(proPlan.price);
  activePlan.yearlyPrice = calculateYearlyPrice(activePlan.price);

  const getFeatures = (plan) => {
    if (!plan) return [];

    const features = [];
    let i = 1;
    while (plan[`feature${i}`]) {
      features.push(plan[`feature${i}`]);
      i++;
    }
    return features;
  };

  return (
    <motion.section
      className={`relative py-24 ${styles.layout.surface}`}
      id="pricing"
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
            className={`text-3xl md:text-4xl font-bold mb-6 ${styles.text.primary}`}
          >
            {pricing?.title || "Simple pricing for every kitchen"}
          </h2>
          <p
            className={`text-lg text-center mb-8 text-gray-600 ${styles.text.secondary}`}
          >
            {pricing?.subtitle || "Choose the perfect plan for your family"}
          </p>
        </motion.div>

        {/* Pricing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <motion.div
            className={`inline-flex items-center p-1 rounded-full border ${styles.utils.highlight}`}
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all
                ${
                  billingPeriod === "monthly"
                    ? `${styles.text.primary} ${styles.utils.highlight}`
                    : `${styles.text.secondary} hover:${styles.text.accent}`
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium relative transition-all
                ${
                  billingPeriod === "yearly"
                    ? `${styles.button.primary} ${styles.utils.highlight}`
                    : `${styles.text.secondary} hover:${styles.text.accent}`
                }`}
            >
              Yearly
              <span
                className={`absolute -top-3 -right-3 px-2 py-1 text-xs font-medium rounded-full ${styles.utils.highlight} ${styles.text.accent}`}
              >
                40% OFF
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Active Plan (from business.pricing_plans) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`${styles.card} p-8 rounded-2xl border-2 ${styles.utils.highlight} relative`}
          >
            <div
              className={`absolute -top-3 -right-3 px-3 py-1 text-xs font-medium rounded-full ${styles.utils.highlight} ${styles.text.accent}`}
            >
              40% OFF
            </div>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles.utils.highlight} ${styles.text.accent} mb-4`}
            >
              Most popular
            </div>
            <h3 className={`text-xl font-bold mb-2 ${styles.text.primary}`}>
              {activePlan.name}
            </h3>
            <p className={`text-sm mb-6 ${styles.text.secondary}`}>
              {activePlan.description}
            </p>
            <div className="mb-6">
              <div className="flex items-start">
                <span className={`text-3xl font-bold ${styles.text.primary}`}>
                  $
                </span>
                <span className={`text-5xl font-bold ${styles.text.primary}`}>
                  {billingPeriod === "yearly"
                    ? Math.round(activePlan.price * 0.6)
                    : activePlan.price}
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                {billingPeriod === "yearly"
                  ? `Billed as $${activePlan.yearlyPrice}/year`
                  : `Billed monthly`}
              </p>
              {billingPeriod === "yearly" && (
                <p className={`text-sm ${styles.text.accent} mt-1`}>
                  Save ${activePlan.price * 12 - activePlan.yearlyPrice} with
                  yearly pricing (40% off)
                </p>
              )}
            </div>
            <ul className="space-y-4 mb-8">
              {getFeatures(activePlan).map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                  <span className={`text-sm ${styles.text.secondary}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <motion.button
              onClick={onCtaClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-xl text-sm font-medium
                ${styles.button.primary} transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Get started →
            </motion.button>
          </motion.div>

          {/* Middle Plan (Inactive) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${styles.card} p-8 rounded-2xl border border-gray-200/20 relative opacity-75 hover:opacity-100 transition-opacity`}
          >
            <div
              className={`absolute -top-3 -right-3 px-3 py-1 text-xs font-medium rounded-full ${styles.utils.highlight} ${styles.text.accent}`}
            >
              40% OFF
            </div>
            <h3 className={`text-xl font-bold mb-2 ${styles.text.primary}`}>
              {middlePlan.name}
            </h3>
            <p className={`text-sm mb-6 ${styles.text.secondary}`}>
              {middlePlan.description}
            </p>

            <div className="mb-6">
              <div className="flex items-start">
                <span className={`text-3xl font-bold ${styles.text.primary}`}>
                  $
                </span>
                <span className={`text-5xl font-bold ${styles.text.primary}`}>
                  {billingPeriod === "yearly"
                    ? Math.round(middlePlan.yearlyPrice / 12)
                    : middlePlan.price}
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                {billingPeriod === "yearly"
                  ? `Billed as $${middlePlan.yearlyPrice}/year`
                  : `Billed monthly`}
              </p>
              {billingPeriod === "yearly" && (
                <p className={`text-sm ${styles.text.accent} mt-1`}>
                  Save ${calculateYearlySavings(middlePlan.price)} with yearly
                  pricing (40% off)
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {middlePlan.feature1}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {middlePlan.feature2}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {middlePlan.feature3}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {middlePlan.feature4}
                </span>
              </li>
            </ul>

            {/* Middle Plan Button */}
            <button
              disabled
              className={`w-full py-3 rounded-xl text-sm font-medium
                ${styles.button.secondary} transition-all duration-200
                opacity-50 cursor-not-allowed`}
            >
              Coming soon
            </button>
          </motion.div>

          {/* Pro Plan (Inactive) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`${styles.card} p-8 rounded-2xl border border-gray-200/20 relative opacity-75 hover:opacity-100 transition-opacity`}
          >
            <div
              className={`absolute -top-3 -right-3 px-3 py-1 text-xs font-medium rounded-full ${styles.utils.highlight} ${styles.text.accent}`}
            >
              40% OFF
            </div>
            <h3 className={`text-xl font-bold mb-2 ${styles.text.primary}`}>
              {proPlan.name}
            </h3>
            <p className={`text-sm mb-6 ${styles.text.secondary}`}>
              {proPlan.description}
            </p>

            <div className="mb-6">
              <div className="flex items-start">
                <span className={`text-3xl font-bold ${styles.text.primary}`}>
                  $
                </span>
                <span className={`text-5xl font-bold ${styles.text.primary}`}>
                  {billingPeriod === "yearly"
                    ? Math.round(proPlan.yearlyPrice / 12)
                    : proPlan.price}
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                {billingPeriod === "yearly"
                  ? `Billed as $${proPlan.yearlyPrice}/year`
                  : `Billed monthly`}
              </p>
              {billingPeriod === "yearly" && (
                <p className={`text-sm ${styles.text.accent} mt-1`}>
                  Save ${calculateYearlySavings(proPlan.price)} with yearly
                  pricing (40% off)
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {getFeatures(proPlan).map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                  <span className={`text-sm ${styles.text.secondary}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Pro Plan Button */}
            <button
              disabled
              className={`w-full py-3 rounded-xl text-sm font-medium
                ${styles.button.secondary} transition-all duration-200
                opacity-50 cursor-not-allowed`}
            >
              Coming soon
            </button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
