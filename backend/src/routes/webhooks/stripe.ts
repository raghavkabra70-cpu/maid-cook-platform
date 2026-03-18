// ─── backend/src/routes/webhooks/stripe.ts ───
// Stripe webhook handler for subscription events

import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/config/stripe";
import { createAdminClient } from "@/config/supabase-server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_CONFIG.webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase
          .from("profiles")
          .update({ verified: true })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;
      if (userId) {
        await supabase
          .from("profiles")
          .update({ verified: false })
          .eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
