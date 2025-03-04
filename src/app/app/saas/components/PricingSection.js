"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export function PricingSection({ styles, pricing, business }) {
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  // Get the active plan (middle plan) from business pricing_plans
  const activePlan = business?.pricing_plans;
  console.log("active plan", activePlan);

  // Get the starter and pro plans from the landing page Content
  console.log("pricing", pricing);
  const starterPlan = pricing?.plans?.[0] || {
    name: "Starter",
    description: "Best for beginner creators",
    price: 5.33,
    yearlyPrice: 64,
    features: [
      "5 connected social accounts",
      "10 posts/month",
      "Basic analytics",
      "Content calendar",
    ],
  };

  const proPlan = pricing?.plans?.[2] || {
    name: "Agency",
    description: "For marketing teams",
    price: 49.99,
    yearlyPrice: 599,
    features: [
      "Unlimited social accounts",
      "Advanced analytics",
      "Team collaboration",
      "Priority support",
    ],
  };

  const handleSubscribe = async (plan) => {
    try {
      if (!business?.stripeConnectId) {
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
          plan,
          stripeConnectId: business.stripeConnectId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

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
            className={`text-4xl md:text-5xl font-bold mb-6 ${styles.text.primary}`}
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
          <motion.div className="inline-flex items-center p-1 rounded-full border border-gray-200/20">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all
                ${
                  billingPeriod === "monthly"
                    ? `${styles.text.primary} bg-white shadow-sm`
                    : styles.text.secondary
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium relative group transition-all
                ${
                  billingPeriod === "yearly"
                    ? `${styles.text.primary} bg-white shadow-sm`
                    : styles.text.secondary
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
          {/* Starter Plan (Inactive) */}
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
              {starterPlan.name}
            </h3>
            <p className={`text-sm mb-6 ${styles.text.secondary}`}>
              {starterPlan.description}
            </p>

            <div className="mb-6">
              <div className="flex items-start">
                <span className={`text-3xl font-bold ${styles.text.primary}`}>
                  $
                </span>
                <span className={`text-5xl font-bold ${styles.text.primary}`}>
                  {billingPeriod === "yearly"
                    ? Math.round(starterPlan.price * 0.6)
                    : starterPlan.price}
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                Billed as ${starterPlan.yearlyPrice}
                /year
              </p>
              <p className={`text-sm ${styles.text.accent} mt-1`}>
                Save ${starterPlan.yearlyPrice - starterPlan.price * 12} with
                yearly pricing (40% off)
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {starterPlan.feature1}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {starterPlan.feature2}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {starterPlan.feature3}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  {starterPlan.feature4}
                </span>
              </li>
            </ul>

            <button
              disabled
              className={`w-full py-3 rounded-xl text-sm font-medium
                ${styles.button.secondary} transition-all duration-200 opacity-50 cursor-not-allowed`}
            >
              Coming soon →
            </button>
          </motion.div>

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
                Billed as $
                {billingPeriod === "yearly"
                  ? activePlan.yearlyPrice
                  : activePlan.price * 12}
                /year
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubscribe(activePlan)}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-medium
                ${styles.button.primary} transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Loading..." : "Start 7 day free trial →"}
            </motion.button>
            <p className={`text-xs text-center mt-4 ${styles.text.muted}`}>
              $0.00 due today, cancel anytime
            </p>
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
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles.utils.highlight} ${styles.text.accent} mb-4`}
            >
              Enterprise
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
                    ? Math.round(proPlan.price * 0.6)
                    : proPlan.price}
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                Billed as ${proPlan.yearlyPrice}
                /year
              </p>
              <p className={`text-sm ${styles.text.accent} mt-1`}>
                Save ${proPlan.yearlyPrice - proPlan.price * 12} with yearly
                pricing (40% off)
              </p>
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

            <button
              disabled
              className={`w-full py-3 rounded-xl text-sm font-medium
                ${styles.button.secondary} transition-all duration-200 opacity-50 cursor-not-allowed`}
            >
              Coming soon →
            </button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
