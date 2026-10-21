import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { findClient, resolveOrg } from "@/lib/client";
import { PLANS, PlanKey, priceIdForPlan, stripeRequest } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await resolveOrg(userId, orgId, orgRole, req.headers.get("x-org-id"));
    if (!org.canManage) {
      return NextResponse.json({ error: "Only organization admins can manage billing." }, { status: 403 });
    }

    const { plan } = await req.json();
    if (!(plan in PLANS)) {
      return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    }
    const priceId = priceIdForPlan(plan as PlanKey);
    if (!priceId || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Billing is not configured yet." }, { status: 500 });
    }

    const supabase = createAdminClient();
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "pending@unknown.com";

    let client: any = await findClient(supabase, userId, org.orgId);
    if (!client) {
      const { data: created, error } = await supabase
        .from("clients")
        .insert({ clerk_user_id: userId, clerk_org_id: org.orgId, email, spa_name: "My Spa" })
        .select("id, email")
        .single();
      if (error || !created) {
        console.error("Failed to create client for checkout:", error);
        return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
      }
      client = created;
    }

    const { data: row } = await supabase
      .from("clients")
      .select("id, email, stripe_customer_id, subscription_status")
      .eq("id", client.id)
      .single();

    if (row && ["active", "trialing", "past_due"].includes(row.subscription_status ?? "")) {
      return NextResponse.json({ error: "This spa already has a subscription." }, { status: 409 });
    }

    let customerId = row?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripeRequest("customers", {
        email,
        metadata: { client_id: client.id },
      });
      customerId = customer.id;
      await supabase.from("clients").update({ stripe_customer_id: customerId }).eq("id", client.id);
    }

    const origin = req.nextUrl.origin;
    const session = await stripeRequest("checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      client_reference_id: client.id,
      line_items: { 0: { price: priceId, quantity: 1 } },
      allow_promotion_codes: "true",
      metadata: { client_id: client.id, plan },
      subscription_data: { metadata: { client_id: client.id, plan } },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/portal`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
