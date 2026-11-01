import { createAdminClient } from "@/lib/supabase";

// Simple database-backed rate limiter (works across serverless instances).
// Returns true if the request is allowed, false if the limit is reached.
export async function allowRequest(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

    const { count, error } = await supabase
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("bucket", bucket)
      .eq("key", key)
      .gte("created_at", since);

    if (error) {
      // Never block real users because the limiter itself had a problem.
      console.error("Rate limit check failed:", error);
      return true;
    }
    if ((count ?? 0) >= limit) return false;

    await supabase.from("rate_limit_hits").insert({ bucket, key });

    // Occasionally clear out old rows so the table stays small.
    if (Math.random() < 0.02) {
      const cutoff = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
      await supabase.from("rate_limit_hits").delete().lt("created_at", cutoff);
    }
    return true;
  } catch (err) {
    console.error("Rate limit error:", err);
    return true;
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
