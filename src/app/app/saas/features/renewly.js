"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const getServiceIcon = (serviceName) => {
  // Convert service name to lowercase and remove spaces
  const cleanName = serviceName.toLowerCase().replace(/\s+/g, "");
  return `https://logo.clearbit.com/${cleanName}.com`;
};

export default function Renewly({ user }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    price: "",
    billingCycle: "monthly",
    nextBilling: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`/api/features/renewly?userId=${user.id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSubscriptions(data.subscriptions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/features/renewly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSubscription,
          userId: user.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSubscriptions([...subscriptions, data.subscription]);
      setNewSubscription({
        name: "",
        price: "",
        billingCycle: "monthly",
        nextBilling: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `/api/features/renewly?id=${id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete subscription");
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const monthlyTotal = subscriptions.reduce((total, sub) => {
    const price = parseFloat(sub.amount) || 0;
    return total + (sub.billing_cycle === "monthly" ? price : price / 12);
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  // If no user is logged in, show login message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Please log in
          </h3>
          <p className="text-gray-500">
            You need to be logged in to use this feature
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-32 bg-gray-700/50 rounded-lg" />
          <div className="h-4 w-48 bg-gray-700/30 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {/* <h2 className="text-2xl font-semibold text-[#4F46E5]">
            Subscription Tracker
          </h2> */}
          <p className="text-gray-500 mt-1">
            Keep track of your recurring expenses
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f74e2] text-white rounded-lg hover:bg-[#1c6ed8] transition-colors"
        >
          <span>+</span>
          Track New Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Monthly Expenses
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            ${monthlyTotal.toFixed(2)}
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Yearly Expenses
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            ${yearlyTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Add Subscription Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8"
          >
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Add New Subscription
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="Netflix, Spotify, etc."
                      value={newSubscription.name}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          name: e.target.value,
                        })
                      }
                      className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f74e2] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="9.99"
                      value={newSubscription.price}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          price: e.target.value,
                        })
                      }
                      className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f74e2] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Cycle
                    </label>
                    <select
                      value={newSubscription.billingCycle}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          billingCycle: e.target.value,
                        })
                      }
                      className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f74e2] focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Billing Date
                    </label>
                    <input
                      type="date"
                      value={newSubscription.nextBilling}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          nextBilling: e.target.value,
                        })
                      }
                      className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f74e2] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 bg-[#1f74e2] text-white rounded-lg hover:bg-[#1c6ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Adding Subscription...
                      </>
                    ) : (
                      "Add Subscription"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.map((sub, index) => (
          <div
            key={sub.id}
            className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-[#1f74e2] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={getServiceIcon(sub.service_name)}
                    alt={sub.service_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {sub.service_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-medium text-[#4F46E5]">
                      ${parseFloat(sub.amount).toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{sub.billing_cycle}</span>
                    <span>•</span>
                    <span>Next: {formatDate(sub.next_billing)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(sub.id)}
                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {subscriptions.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No subscriptions yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start tracking your recurring expenses
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f74e2] text-white rounded-lg hover:bg-[#1c6ed8] transition-colors"
            >
              <span>+</span>
              Add Your First Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
