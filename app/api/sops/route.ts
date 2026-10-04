import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!client) return NextResponse.json({ sops: [] });

  const { data, error } = await supabase
    .from("sops")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load SOPs:", error);
    return NextResponse.json({ error: "Failed to load SOPs" }, { status: 500 });
  }

  return NextResponse.json({ sops: data ?? [] });
}
