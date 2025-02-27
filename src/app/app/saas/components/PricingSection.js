"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export function PricingSection({ styles, pricingPlans, stripeConnectId }) {
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);

  // Get the active plan (middle plan) from pricingPlans
  const activePlan = pricingPlans?.[0] || {
    name: "Creator",
    description: "Best for growing creators",
    price: 10,
    yearlyPrice: 129,
    features: [
      "15 connected social accounts",
      "Unlimited posts",
      "Schedule posts",
      "Content studio access",
    ],
  };

  const handleSubscribe = async (plan) => {
    try {
      if (!stripeConnectId) {
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
          stripeConnectId,
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

  return (
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
            className={`text-4xl md:text-5xl font-bold mb-6 ${styles.text.primary}`}
          >
            Get more views,{" "}
            <span className={styles.text.accent}>with less effort.</span>
          </h2>
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
          <div className="flex items-center gap-2">
            <span className={`text-sm ${styles.text.secondary}`}>
              Free trial
            </span>
            <button
              onClick={() => setFreeTrialEnabled(!freeTrialEnabled)}
              className={`w-12 h-6 rounded-full ${styles.utils.highlight} p-1 transition-all`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  styles.text.accent
                } bg-current transform transition-transform
                  ${freeTrialEnabled ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan (Static) */}
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
              Starter
            </h3>
            <p className={`text-sm mb-6 ${styles.text.secondary}`}>
              Best for beginner creators
            </p>

            <div className="mb-6">
              <div className="flex items-start">
                <span className={`text-3xl font-bold ${styles.text.primary}`}>
                  $
                </span>
                <span className={`text-5xl font-bold ${styles.text.primary}`}>
                  5
                </span>
                <span className={`text-2xl font-bold ${styles.text.primary}`}>
                  .33
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                Billed as $64/year
              </p>
              <p className={`text-sm ${styles.text.accent} mt-1`}>
                Save $44 with yearly pricing (40% off)
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  5 connected social accounts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  Basic scheduling
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  Content calendar
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

          {/* Creator Plan (Active) */}
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
              {activePlan.features.map((feature, index) => (
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

          {/* Pro Plan (Static) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`${styles.card} p-8 rounded-2xl border border-gray-200/20 relative opacity-75 hover:opacity-100 transition-opacity`}
          >
            {/* Pro plan content similar to Starter plan but with different values */}
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
              Agency
            </h3>
            <p className={`text-sm mb-6 ${styles.text.secondary}`}>
              For marketing teams
            </p>

            {/* Similar price structure as other plans */}
            <div className="mb-6">
              <div className="flex items-start">
                <span className={`text-3xl font-bold ${styles.text.primary}`}>
                  $
                </span>
                <span className={`text-5xl font-bold ${styles.text.primary}`}>
                  49
                </span>
                <span className={`text-2xl font-bold ${styles.text.primary}`}>
                  .99
                </span>
                <span className={`ml-2 text-sm ${styles.text.secondary}`}>
                  /month
                </span>
              </div>
              <p className={`text-sm ${styles.text.secondary} mt-2`}>
                Billed as $599/year
              </p>
              <p className={`text-sm ${styles.text.accent} mt-1`}>
                Save $399 with yearly pricing (40% off)
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  Unlimited social accounts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  Advanced analytics
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  Team collaboration
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className={`w-5 h-5 ${styles.text.accent} mt-0.5`} />
                <span className={`text-sm ${styles.text.secondary}`}>
                  Priority support
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
        </div>
      </div>
    </motion.section>
  );
}
