"use client";

import { useState } from "react";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function PricingPlans({ pricingPlans, stripeConnectId }) {
  const [loading, setLoading] = useState(false);

  // Extract the pricing_plans array from the data structure
  const plans = pricingPlans?.pricing_plans || [];

  const handleSubscribe = async (plan) => {
    try {
      if (!stripeConnectId) {
        console.error("No Stripe Connect account ID found");
        // You might want to show an error message to the user
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
        const error = await response.json();
        throw new Error(error.details || "Failed to create checkout session");
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // Handle error (show toast, error message, etc.)
    } finally {
      setLoading(false);
    }
  };

  // If no plans are available, show a message or return null
  if (!plans.length) {
    return (
      <div className="text-center py-8 text-gray-600">
        No pricing plans available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 py-8">
      {plans.map((plan) => (
        <div
          key={plan.id} // Changed from plan.name to plan.id
          className="border rounded-lg p-6 shadow-lg bg-white"
        >
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.description}</p>

          <div className="text-3xl font-bold mb-4">
            ${plan.price}
            <span className="text-lg font-normal text-gray-600">/month</span>
          </div>

          {plan.setupFee > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              Setup fee: ${plan.setupFee}
            </p>
          )}

          {plan.trialDays > 0 && (
            <p className="text-sm text-green-600 mb-4">
              {plan.trialDays} days free trial
            </p>
          )}

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Features:</h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {plan.limitations && (
            <p className="text-sm text-gray-600 mb-4">{plan.limitations}</p>
          )}

          <button
            onClick={() => handleSubscribe(plan)}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : plan.cta || "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
}
