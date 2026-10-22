import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { findClient, resolveOrg } from "@/lib/client";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// Admins edit a generated SOP in place. The edit time is recorded so older
// staff sign-offs can be flagged as "signed before last edit".
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sopId: string } }
) {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!UUID.test(params.sopId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const org = await resolveOrg(userId, orgId, orgRole, req.headers.get("x-org-id"));
    if (!org.canManage) {
      return NextResponse.json({ error: "Only organization admins can edit SOPs." }, { status: 403 });
    }

    const supabase = createAdminClient();
    const client = await findClient(supabase, userId, org.orgId);
    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // The SOP must belong to this spa.
    const { data: existing } = await supabase
      .from("sops")
      .select("id")
      .eq("id", params.sopId)
      .eq("client_id", client.id)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const title = clean(body?.title, 200);
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!Array.isArray(body?.sections) || body.sections.length > 30) {
      return NextResponse.json({ error: "Invalid sections." }, { status: 400 });
    }

    const sections = body.sections
      .map((sec: any) => ({
        heading: clean(sec?.heading, 200),
        steps: (Array.isArray(sec?.steps) ? sec.steps : [])
          .slice(0, 40)
          .map((s: unknown) => clean(s, 1000))
          .filter((s: string) => s.length > 0),
      }))
      .filter((sec: { heading: string; steps: string[] }) => sec.heading || sec.steps.length > 0);

    if (sections.length === 0) {
      return NextResponse.json({ error: "Add at least one section with a step." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("sops")
      .update({
        title,
        purpose: clean(body?.purpose, 1500) || null,
        scope: clean(body?.scope, 1500) || null,
        owner: clean(body?.owner, 200) || null,
        sections,
        edited_at: now,
        updated_at: now,
      })
      .eq("id", params.sopId)
      .eq("client_id", client.id)
      .select("*")
      .single();

    if (error || !updated) {
      console.error("Failed to update SOP:", error);
      return NextResponse.json({ error: "Could not save your changes." }, { status: 500 });
    }

    return NextResponse.json({ sop: updated });
  } catch (err) {
    console.error("SOP edit error:", err);
    return NextResponse.json({ error: "Could not save your changes." }, { status: 500 });
  }
}
