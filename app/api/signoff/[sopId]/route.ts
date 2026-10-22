import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(
  _req: Request,
  { params }: { params: { sopId: string } }
) {
  const { sopId } = params;
  if (!UUID.test(sopId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sops")
    .select("id, title, category, purpose, scope, owner, sections")
    .eq("id", sopId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ sop: data });
}

export async function POST(
  req: Request,
  { params }: { params: { sopId: string } }
) {
  const { sopId } = params;
  if (!UUID.test(sopId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const staffName = String(body?.staffName ?? "").trim();
  const staffEmail = String(body?.staffEmail ?? "").trim().toLowerCase();

  if (!staffName || staffName.length > 100) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL.test(staffEmail) || staffEmail.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: sop } = await supabase
    .from("sops")
    .select("id, client_id, edited_at")
    .eq("id", sopId)
    .maybeSingle();

  if (!sop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("signoffs")
    .select("id, signed_at")
    .eq("sop_id", sopId)
    .eq("staff_email", staffEmail)
    .maybeSingle();

  if (existing) {
    // If the SOP was edited after this person signed, let them sign the new version.
    const outdated = sop.edited_at && new Date(existing.signed_at) < new Date(sop.edited_at);
    if (!outdated) {
      return NextResponse.json({ ok: true, alreadySigned: true });
    }
    const { error: resignError } = await supabase
      .from("signoffs")
      .update({ staff_name: staffName, signed_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (resignError) {
      console.error("Failed to update sign-off:", resignError);
      return NextResponse.json({ error: "Could not save your sign-off. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, resigned: true });
  }

  const { error } = await supabase.from("signoffs").insert({
    sop_id: sopId,
    client_id: sop.client_id,
    staff_name: staffName,
    staff_email: staffEmail,
    signed_at: new Date().toISOString(),
  });

  if (error?.code === "23505") {
    return NextResponse.json({ ok: true, alreadySigned: true });
  }

  if (error) {
    console.error("Failed to save sign-off:", error);
    return NextResponse.json({ error: "Could not save your sign-off. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
