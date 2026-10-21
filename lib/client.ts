import { clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

type Supa = ReturnType<typeof createAdminClient>;

// Accounts that never need a subscription (owner / demo account).
export const OWNER_EMAILS = ["corwin@getspaops.com"];

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

export type OrgContext = {
  orgId: string | null;
  // Admins (and people not in any organization) can create and change SOPs.
  // Members of an organization can only read.
  canManage: boolean;
};

// Works out which organization a request is for, and whether the user is an
// admin of it. Uses the session's active organization when present. Otherwise
// it asks Clerk for the user's real memberships, so a request can never claim
// an organization the user is not in: the organization the portal says is
// selected (if the user belongs to it), else the user's only organization.
export async function resolveOrg(
  userId: string,
  sessionOrgId?: string | null,
  sessionOrgRole?: string | null,
  requestedOrgId?: string | null
): Promise<OrgContext> {
  if (sessionOrgId) {
    return { orgId: sessionOrgId, canManage: sessionOrgRole === "org:admin" };
  }
  try {
    const memberships = await clerkClient.users.getOrganizationMembershipList({ userId });
    const list = memberships.data;
    const chosen =
      (requestedOrgId && list.find((m) => m.organization.id === requestedOrgId)) ||
      (list.length === 1 ? list[0] : null);
    if (chosen) {
      return { orgId: chosen.organization.id, canManage: chosen.role === "org:admin" };
    }
    return { orgId: null, canManage: true };
  } catch (err) {
    console.error("Failed to load organization memberships:", err);
    // Fail closed for reads is not possible here, but never grant manage rights on error.
    return { orgId: null, canManage: false };
  }
}
