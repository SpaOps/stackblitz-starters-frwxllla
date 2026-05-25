import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Recognized med spa procedure keywords — reject anything that doesn't match
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
    // Auth gate — must be signed in
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to generate SOPs." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { spaName, sopTopic, staffRoles, currentProcess, painPoints, tools } = body;

    // Validate required fields
    if (!spaName || !sopTopic) {
      return NextResponse.json(
        { error: "Spa name and SOP topic are required." },
        { status: 400 }
      );
    }

    // Validate that the topic is a real med spa procedure or operation
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

    const sop = JSON.parse(jsonMatch[0]);
    return NextResponse.json(sop);

  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
