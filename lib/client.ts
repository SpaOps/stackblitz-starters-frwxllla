import { createAdminClient } from "@/lib/supabase";

type Supa = ReturnType<typeof createAdminClient>;

export type ClientRecord = { id: string; email: string };

// Finds the spa (client) record for a signed-in user. Server-only.
//
// With an active Clerk organization, everyone in that organization shares one
// record. The first time a user opens an organization, it claims the record
// that user created before organizations existed, so their SOPs carry over.
// Without an organization, it falls back to the user's own unclaimed record.
export async function findClient(
  supabase: Supa,
  userId: string,
  orgId?: string | null
): Promise<ClientRecord | null> {
  if (orgId) {
    const { data: byOrg } = await supabase
      .from("clients")
      .select("id, email")
      .eq("clerk_org_id", orgId)
      .maybeSingle();
    if (byOrg) return byOrg;

    const { data: legacy } = await supabase
      .from("clients")
      .select("id, email")
      .eq("clerk_user_id", userId)
      .is("clerk_org_id", null)
      .order("created_at", { ascending: true })
      .limit(1);

    const mine = legacy?.[0];
    if (mine) {
      const { error } = await supabase
        .from("clients")
        .update({ clerk_org_id: orgId })
        .eq("id", mine.id);
      if (error) {
        console.error("Failed to attach client record to organization:", error);
        return null;
      }
      return mine;
    }
    return null;
  }

  const { data } = await supabase
    .from("clients")
    .select("id, email")
    .eq("clerk_user_id", userId)
    .is("clerk_org_id", null)
    .order("created_at", { ascending: true })
    .limit(1);

  return data?.[0] ?? null;
}
