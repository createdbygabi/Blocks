import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function processPayment({
  amount,
  connectedAccountId,
  metadata = {},
}) {
  try {
    // Create PaymentIntent
    const response = await fetch("/api/stripe/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        connectedAccountId,
        metadata,
      }),
    });

    const { clientSecret, error } = await response.json();

    if (error) {
      throw new Error(error);
    }

    // Initialize payment sheet
    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement("card"),
          billing_details: {
            // Add billing details if needed
          },
        },
      });

    if (confirmError) {
      throw new Error(confirmError.message);
    }

    return paymentIntent;
  } catch (error) {
    console.error("Payment Processing Error:", error);
    throw error;
  }
}

export async function createStripeConnectAccount(businessData) {
  const account = await stripe.accounts.create({
    type: "standard",
    country: businessData.country,
    email: businessData.email,
    business_type: businessData.businessType,
    company: {
      name: businessData.businessName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account;
}
