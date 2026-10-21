import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { findClient, resolveOrg } from "@/lib/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const org = await resolveOrg(userId, orgId, orgRole, req.headers.get("x-org-id"));
  const client = await findClient(supabase, userId, org.orgId);

  if (!client) return NextResponse.json({ sops: [], signoffs: [], canManage: org.canManage });

  const { data, error } = await supabase
    .from("sops")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load SOPs:", error);
    return NextResponse.json({ error: "Failed to load SOPs" }, { status: 500 });
  }

  const sops = data ?? [];
  let signoffs: any[] = [];

  if (sops.length > 0) {
    const { data: signoffRows, error: signoffError } = await supabase
      .from("signoffs")
      .select("id, sop_id, staff_name, staff_email, signed_at")
      .eq("client_id", client.id)
      .order("signed_at", { ascending: false });

    if (signoffError) {
      console.error("Failed to load sign-offs:", signoffError);
    } else {
      signoffs = signoffRows ?? [];
    }
  }

  return NextResponse.json({ sops, signoffs, canManage: org.canManage });
}
