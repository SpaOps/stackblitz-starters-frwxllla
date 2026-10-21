import crypto from "crypto";

// Minimal Stripe helpers using fetch, so no extra package is needed.

export const PLANS = {
  core: { name: "SpaOps Core", priceEnv: "STRIPE_PRICE_CORE" },
  premium: { name: "SpaOps Premium", priceEnv: "STRIPE_PRICE_PREMIUM" },
} as const;

export type PlanKey = keyof typeof PLANS;

export function priceIdForPlan(plan: PlanKey): string | undefined {
  return process.env[PLANS[plan].priceEnv];
}

export function planForPriceId(priceId?: string | null): PlanKey | null {
  if (!priceId) return null;
  for (const key of Object.keys(PLANS) as PlanKey[]) {
    if (priceIdForPlan(key) === priceId) return key;
  }
  return null;
}

// Flattens nested objects into Stripe's form encoding: a[b][c]=1
function encode(params: Record<string, any>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") out.push(...encode(v, key));
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}

export async function stripeRequest(path: string, params: Record<string, any>) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encode(params).join("&"),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Stripe error:", json?.error);
    throw new Error(json?.error?.message || "Stripe request failed");
  }
  return json;
}

// Verifies the Stripe-Signature header against the raw request body.
export function verifyWebhook(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    })
  );
  const t = parts["t"];
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!t || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return sigs.some((s) => {
    const a = Buffer.from(s, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
