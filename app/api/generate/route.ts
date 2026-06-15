import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

// Recognized med spa procedure keywords -- reject anything that doesn't match
const MED_SPA_KEYWORDS = [
  "botox", "dysport", "xeomin", "jeuveau", "neurotoxin", "neuromodulator",
  "filler", "juvederm", "restylane", "sculptra", "radiesse", "belotero",
  "kybella", "prp", "prp facial", "vampire facial",
  "laser", "ipl", "photofacial", "bbl", "fraxel", "co2", "resurfacing",
  "microneedling", "rf microneedling", "morpheus", "vivace", "sylfirm",
  "hydrafacial", "facial", "chemical peel", "glycolic", "vi peel", "cosmelan",
  "coolsculpting", "cryolipolysis", "emsculpt", "emtone", "velashape",
  "ultherapy", "thermage", "sofwave", "skin tightening",
  "weight loss", "semaglutide", "tirzepatide", "ozempic", "wegovy",
  "iv therapy", "iv infusion", "vitamin iv", "nad", "glutathione",
  "hair removal", "laser hair", "waxing",
  "lash", "brow", "microblading", "pmu", "permanent makeup",
  "body contouring", "cellulite", "stretch marks",
  "consultation", "intake", "consent", "charting", "checkout", "scheduling",
  "staff", "training", "onboarding", "cleaning", "sanitation", "sterilization",
  "infection control", "hipaa", "compliance", "billing", "refund", "cancellation",
  "social media", "photography", "before and after", "patient communication",
  "emergency", "adverse event", "allergy", "reaction", "protocol"
];

function isValidMedSpaTopic(topic: string): boolean {
  if (!topic || topic.trim().length < 3) return false;
  if (topic.trim().length > 200) return false;
  const lower = topic.toLowerCase();
  return MED_SPA_KEYWORDS.some(keyword => lower.includes(keyword));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spaName, sopTopic, staffRoles, currentProcess, painPoints, tools } = body;

    if (!spaName || !sopTopic) {
      return NextResponse.json(
        { error: "Spa name and SOP topic are required." },
        { status: 400 }
      );
    }

    if (!isValidMedSpaTopic(sopTopic)) {
      return NextResponse.json(
        { error: "Please enter a valid med spa procedure or operational topic (e.g. Botox Consent Process, HydraFacial Protocol, Staff Onboarding)." },
        { status: 400 }
      );
    }

    const prompt = `You are an expert med spa operations consultant. Generate a comprehensive SOP based on this information:
Med Spa Name: ${spaName}
SOP Topic: ${sopTopic}
Staff Roles: ${staffRoles}
Current Process: ${currentProcess}
Pain Points: ${painPoints}
Tools Used: ${tools}
Respond ONLY with a valid JSON object in exactly this format with no other text:
{
  "title": "string",
  "purpose": "string",
  "scope": "string",
  "owner": "string",
  "category": "Patient Experience",
  "sections": [
    {
      "heading": "string",
      "steps": ["string", "string", "string"]
    }
  ]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 });
    }

    const cleaned = jsonMatch[0]
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}")
      .replace(/[\x00-\x1F\x7F]/g, " ");

    const sop = JSON.parse(cleaned);

    // If user is logged in, save the SOP to Supabase
    try {
      const { userId } = await auth();
      if (userId) {
        const supabase = createAdminClient();

        // Find or create the client record
        let { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("clerk_user_id", userId)
          .single();

        if (!client) {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              clerk_user_id: userId,
              email: "pending@unknown.com",
              spa_name: spaName
            })
            .select("id")
            .single();
          client = newClient;
        }

        if (client) {
          await supabase.from("sops").insert({
            client_id: client.id,
            title: sop.title,
            category: sop.category,
            purpose: sop.purpose,
            scope: sop.scope,
            owner: sop.owner,
            sections: sop.sections
          });
        }
      }
    } catch (saveErr) {
      // Don't fail the response if save fails -- just log it
      console.error("Failed to save SOP to Supabase:", saveErr);
    }

    return NextResponse.json(sop);

  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
