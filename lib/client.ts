import { clerkClient } from "@clerk/nextjs/server";
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

// Works out which organization a request is for. Uses the session's active
// organization when present. Otherwise it asks Clerk for the user's real
// memberships, so a request can never claim an organization the user is not in:
// the organization the portal says is selected (if the user belongs to it),
// else the user's only organization.
export async function resolveOrgId(
  userId: string,
  sessionOrgId?: string | null,
  requestedOrgId?: string | null
): Promise<string | null> {
  if (sessionOrgId) return sessionOrgId;
  try {
    const memberships = await clerkClient.users.getOrganizationMembershipList({ userId });
    const ids = memberships.data.map((m) => m.organization.id);
    if (requestedOrgId && ids.includes(requestedOrgId)) return requestedOrgId;
    if (ids.length === 1) return ids[0];
    return null;
  } catch (err) {
    console.error("Failed to load organization memberships:", err);
    return null;
  }
}
