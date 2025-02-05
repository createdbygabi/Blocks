"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import Toast from "../components/Toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  IoWallet,
  IoCash,
  IoCard,
  IoStorefront,
  IoBusinessSharp,
  IoMailOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoRefreshCircle,
} from "react-icons/io5";
import { getUserBusiness, saveBusiness } from "@/lib/db";
import { getStripeAccount, saveStripeAccount } from "@/lib/stripeDb";
import { supabase } from "@/lib/supabase";

// Initialize Stripe with publishable key
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentSettings() {
  const { user } = useUser();
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [stripeAccount, setStripeAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    businessName: "",
    businessType: "company",
    country: "US",
  });

  // Fetch Stripe account on component mount
  useEffect(() => {
    async function fetchStripeAccount() {
      if (!user?.id) return;

      try {
        const business = await getUserBusiness(user.id);
        if (business) {
          const account = await getStripeAccount(business.id);
          if (account) {
            setStripeAccount(account);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Stripe account:", error);
        setMessage({ type: "error", text: "Failed to load Stripe account" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStripeAccount();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-stripe-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Stripe account");
      }

      // Redirect to Stripe Connect onboarding
      window.location.href = data.stripeAccountLink;
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IoRefreshCircle className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (stripeAccount) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Stripe Account Status</h2>
            <div className="flex items-center">
              {stripeAccount.details_submitted ? (
                <IoCheckmarkCircle className="text-green-500 text-2xl" />
              ) : (
                <IoCloseCircle className="text-red-500 text-2xl" />
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <StatusItem
              icon={<IoBusinessSharp />}
              label="Account ID"
              value={stripeAccount.account_id}
            />

            <StatusItem
              icon={<IoWallet />}
              label="Payouts"
              value={stripeAccount.payouts_enabled ? "Enabled" : "Disabled"}
              status={stripeAccount.payouts_enabled}
            />

            <StatusItem
              icon={<IoCard />}
              label="Charges"
              value={stripeAccount.charges_enabled ? "Enabled" : "Disabled"}
              status={stripeAccount.charges_enabled}
            />

            <StatusItem
              icon={<IoCash />}
              label="Details Submitted"
              value={
                stripeAccount.details_submitted ? "Complete" : "Incomplete"
              }
              status={stripeAccount.details_submitted}
            />
          </div>

          {!stripeAccount.details_submitted && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">
                Your account setup is incomplete. Please visit the Stripe
                dashboard to complete your account information.
              </p>
              <a
                href={`https://dashboard.stripe.com/account`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-500 hover:text-blue-700"
              >
                Complete Setup →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the existing form if no Stripe account exists
  return (
    <div className="relative container mx-auto px-6 py-12 max-w-[1400px]">
      <Toast
        message={message?.text}
        type={message?.type}
        onClose={() => setMessage(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-10 mb-16">
        <div>
          <h1 className="text-[2.5rem] font-semibold tracking-[-0.02em] bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
            Connect Your Stripe Account
          </h1>
          <p className="mt-2 text-[#a1a1aa] text-lg">
            Set up payments to start receiving your earnings
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 max-w-2xl"
        onSubmit={handleSubmit}
      >
        {/* Business Information */}
        <div className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <IoBusinessSharp className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Business Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full bg-[#27272a] rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 border border-[#3f3f46] transition-all"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full bg-[#27272a] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/40 border border-[#3f3f46] transition-all"
              >
                <option value="company">Company</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full bg-[#27272a] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/40 border border-[#3f3f46] transition-all"
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <IoMailOutline className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Contact Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-[#27272a] rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 border border-[#3f3f46] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-[#27272a] rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 border border-[#3f3f46] transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "bg-red-500 hover:bg-red-600" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting...
            </span>
          ) : (
            "Connect Stripe Account"
          )}
        </button>
      </motion.form>
    </div>
  );
}

// Helper component for status items
function StatusItem({ icon, label, value, status }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="text-gray-600 text-xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </div>
      {status !== undefined && (
        <div
          className={`px-3 py-1 rounded-full text-sm ${
            status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status ? "Active" : "Inactive"}
        </div>
      )}
    </div>
  );
}
