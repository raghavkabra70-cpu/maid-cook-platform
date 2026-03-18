// ─── backend/src/config/stripe.ts ───
// Stripe configuration for payments

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

// Subscription plans (for future premium cook listings)
export const PLANS = {
  free: {
    name: "Starter",
    price: 0,
    features: ["Basic profile", "Up to 5 inquiries/month", "Standard listing"],
  },
  pro: {
    name: "Professional",
    priceId: "price_xxx", // Replace with actual Stripe Price ID
    price: 499, // ₹499/month
    features: [
      "Verified badge",
      "Unlimited inquiries",
      "Priority listing",
      "Analytics dashboard",
      "Featured in search",
    ],
  },
};
