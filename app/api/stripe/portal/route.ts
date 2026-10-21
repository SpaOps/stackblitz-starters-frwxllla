import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { findClient, resolveOrg } from "@/lib/client";
import { stripeRequest } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Opens Stripe's hosted billing page (update card, view invoices, cancel).
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

    const supabase = createAdminClient();
    const client = await findClient(supabase, userId, org.orgId);
    if (!client) {
      return NextResponse.json({ error: "No billing account found." }, { status: 404 });
    }

    const { data: row } = await supabase
      .from("clients")
      .select("stripe_customer_id")
      .eq("id", client.id)
      .maybeSingle();

    if (!row?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found." }, { status: 404 });
    }

    const session = await stripeRequest("billing_portal/sessions", {
      customer: row.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/portal`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json({ error: "Could not open billing." }, { status: 500 });
  }
}
