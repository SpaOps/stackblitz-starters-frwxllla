import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { planForPriceId, verifyWebhook } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  if (!verifyWebhook(rawBody, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminClient();

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const clientId = s.client_reference_id || s.metadata?.client_id;
      if (clientId && s.mode === "subscription") {
        const { error } = await supabase
          .from("clients")
          .update({
            stripe_customer_id: s.customer,
            stripe_subscription_id: s.subscription,
            subscription_status: "active",
            plan: s.metadata?.plan ?? null,
          })
          .eq("id", clientId);
        if (error) throw error;
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object;
      const plan = planForPriceId(sub.items?.data?.[0]?.price?.id);
      const update: Record<string, any> = {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
      };
      if (plan) update.plan = plan;

      const clientId = sub.metadata?.client_id;
      const query = supabase.from("clients").update(update);
      const { error } = clientId
        ? await query.eq("id", clientId)
        : await query.eq("stripe_customer_id", sub.customer);
      if (error) throw error;
    }
  } catch (err) {
    console.error("Webhook handling failed:", err);
    // 500 makes Stripe retry later.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
