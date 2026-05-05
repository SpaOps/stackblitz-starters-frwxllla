import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spaName, sopTopic, staffRoles, currentProcess, painPoints, tools } = body;

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
    console.log("Anthropic response:", JSON.stringify(data));
    
    const text = data.content?.[0]?.text || "";
    console.log("Raw text:", text);
    
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
