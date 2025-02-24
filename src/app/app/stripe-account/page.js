"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { getUserBusiness } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export default function StripeAccountPage() {
  const { user } = useUser();
  const [business, setBusiness] = useState(null);
  const [stripeAccount, setStripeAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessages, setStatusMessages] = useState([]);

  // Helper to add status messages
  const addStatus = (message) => {
    setStatusMessages((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), message },
    ]);
  };

  // Initial load - get business and stripe info
  useEffect(() => {
    if (user?.id) {
      fetchBusinessAndStripeInfo();
    }
  }, [user?.id]);

  async function fetchBusinessAndStripeInfo() {
    try {
      addStatus("1. Fetching business information...");
      const businessData = await getUserBusiness(user.id);
      console.log("Business Data:", businessData);
      setBusiness(businessData);
      addStatus(`2. Business found: ${businessData?.id}`);

      console.log(
        "Stripe account ID from business:",
        businessData?.stripe_account_id
      );
      console.log("Stripe accounts array:", businessData?.stripe_accounts);

      if (businessData?.stripe_accounts?.[0]?.account_id) {
        const stripeAccountId = businessData.stripe_accounts[0].account_id;
        addStatus(`3. Found Stripe account ID: ${stripeAccountId}`);
        console.log("Fetching Stripe details for account:", stripeAccountId);

        const response = await fetch(
          `/api/stripe/account-info?accountId=${stripeAccountId}`
        );
        const data = await response.json();
        console.log("Stripe API response:", data);

        if (!response.ok) throw new Error(data.error);
        setStripeAccount(data.account);
        addStatus("4. Successfully fetched Stripe account details");
      } else {
        console.log("No stripe account found in business data:", businessData);
        addStatus("3. No Stripe account found for this business");
      }
    } catch (error) {
      console.error("Failed to fetch info:", error);
      setError(error.message);
      addStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const formData = new FormData(e.target);

      // Get current auth state
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      console.log("1. Current auth state:", {
        contextUser: user,
        authUser: authUser,
        idsMatch: user?.id === authUser?.id,
      });

      const accountData = {
        userId: user.id,
        email: formData.get("email"),
        country: formData.get("country"),
        business_type: formData.get("business_type"),
        company: {
          name: formData.get("company_name"),
        },
      };

      console.log("2. Sending account data:", accountData);

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();
      console.log("3. API response:", data);

      if (!response.ok) throw new Error(data.error);

      await fetchBusinessAndStripeInfo();
    } catch (error) {
      console.error("4. Submit error:", error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Stripe Account</h1>

      {/* Status Messages */}
      <div className="mb-6 bg-gray-900 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">
          Status Log:
        </h2>
        <div className="space-y-1">
          {statusMessages.map((status, index) => (
            <div key={index} className="text-sm">
              <span className="text-gray-500">{status.time}</span>
              <span className="text-gray-300 ml-2">{status.message}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {business?.stripe_accounts?.[0]?.account_id && stripeAccount ? (
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Account ID" value={stripeAccount.id} />
            <InfoItem
              label="Business Type"
              value={stripeAccount.business_type}
            />
            <InfoItem label="Country" value={stripeAccount.country} />
            <InfoItem label="Email" value={stripeAccount.email} />

            <InfoItem
              label="Charges Enabled"
              value={stripeAccount.charges_enabled ? "Yes" : "No"}
              status={stripeAccount.charges_enabled}
            />
            <InfoItem
              label="Payouts Enabled"
              value={stripeAccount.payouts_enabled ? "Yes" : "No"}
              status={stripeAccount.payouts_enabled}
            />
            <InfoItem
              label="Details Submitted"
              value={stripeAccount.details_submitted ? "Yes" : "No"}
              status={stripeAccount.details_submitted}
            />
          </div>

          {stripeAccount.requirements?.currently_due?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">
                Required Information
              </h3>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <ul className="list-disc list-inside text-yellow-500">
                  {stripeAccount.requirements.currently_due.map(
                    (requirement) => (
                      <li key={requirement}>
                        {requirement.replace(/_/g, " ")}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}

          {stripeAccount.capabilities && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stripeAccount.capabilities).map(
                  ([key, value]) => (
                    <InfoItem
                      key={key}
                      label={key.replace(/_/g, " ")}
                      value={value}
                      status={value === "active"}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {stripeAccount.external_accounts?.data?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">External Accounts</h3>
              <div className="space-y-4">
                {stripeAccount.external_accounts.data.map((account) => (
                  <div key={account.id} className="bg-[#27272a] rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      {account.object === "bank_account"
                        ? "Bank Account"
                        : "Card"}
                    </p>
                    <p className="font-medium text-white">
                      {account.bank_name || account.brand} •••• {account.last4}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-4 text-yellow-500">
            No Stripe account found. Create one below:
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email}
                className="w-full p-2 border rounded bg-[#27272a] border-[#3f3f46]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                name="country"
                className="w-full p-2 border rounded bg-[#27272a] border-[#3f3f46]"
                required
              >
                <option value="FR">France</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Business Type
              </label>
              <select
                name="business_type"
                className="w-full p-2 border rounded bg-[#27272a] border-[#3f3f46]"
                required
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                className="w-full p-2 border rounded bg-[#27272a] border-[#3f3f46]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Stripe Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, status }) {
  return (
    <div className="p-4 bg-[#27272a] rounded-lg">
      <p className="text-sm text-gray-400">{label}</p>
      <div className="flex justify-between items-center">
        <p className="font-medium text-white">{value}</p>
        {status !== undefined && (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status
                ? "bg-green-500/20 text-green-500"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {status ? "Active" : "Inactive"}
          </span>
        )}
      </div>
    </div>
  );
}
