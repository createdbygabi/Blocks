import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook secret should be set in your environment variables
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const sig = headersList.get("stripe-signature");

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Retrieve the session with line items
      const expandedSession = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items", "customer"],
        }
      );

      // Extract relevant information
      const customerEmail = expandedSession.customer_details.email;
      const subscriptionId = expandedSession.subscription;
      const customerId = expandedSession.customer;
      const businessId = expandedSession.metadata?.business_id; // Assuming you added this in create-checkout-session

      // Store subscription information in Supabase
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          customer_email: customerEmail,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          business_id: businessId,
          status: "active",
          created_at: new Date().toISOString(),
        });

      if (subscriptionError) {
        console.error("Error storing subscription:", subscriptionError);
        return NextResponse.json(
          { error: "Error storing subscription" },
          { status: 500 }
        );
      }

      // Send confirmation email
      // You can implement your email sending logic here using services like SendGrid, AWS SES, etc.
      try {
        await sendConfirmationEmail(customerEmail, businessId);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't return error response here as the subscription is already stored
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to send confirmation email
async function sendConfirmationEmail(email, businessId) {
  // Implement your email sending logic here
  // Example using SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'your-verified-sender@example.com',
    subject: 'Welcome to Our Service!',
    text: 'Thank you for subscribing...',
    html: '<strong>Thank you for subscribing...</strong>',
  };
  
  await sgMail.send(msg);
  */
}
