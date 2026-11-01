import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Public uptime check for an external monitor. Reveals only ok/not-ok and the NAMES of missing settings, never values.
export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CLERK_SECRET_KEY",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_CORE",
    "STRIPE_PRICE_PREMIUM",
  ];
  const missing = required.filter((k) => !process.env[k]);

  let database = false;
  try {
    const { error } = await createAdminClient().from("clients").select("id", { head: true, count: "exact" }).limit(1);
    database = !error;
  } catch {
    database = false;
  }

  const ok = database && missing.length === 0;
  return NextResponse.json({ ok, database, config: missing.length === 0, missing }, { status: ok ? 200 : 503 });
}
