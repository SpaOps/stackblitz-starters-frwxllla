import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaName, sopTopic, staffRoles, currentProcess, painPoints, tools } =
    await req.json();

  const prompt = `You are an expert med spa operations consultant. Based on the intake information below, generate a comprehensive, professional Standard Operating Procedure (SOP) document.

Med Spa Name: ${spaName}
SOP Topic: ${sopTopic}
Staff Roles Involved: ${staffRoles}
Current Process: ${currentProcess}
Pain Points / What Goes Wrong: ${painPoints}
Tools & Software Used: ${tools}

Generate a complete SOP with the following structure:
- Title (specific and professional)
- Purpose (1-2 sentences)
- Scope (who this applies to)
- 4-5 major sections, each with:
  - A clear heading
  - 4-6 specific, actionable steps a new hire could follow
  - Role assignments where relevant

Format your response ONLY as a JSON object with this exact structure:
{
  "title": "string",
  "purpose": "string",
  "scope": "string",
  "owner": "string (primary role responsible)",
  "category": "string (one of: Patient Experience, Clinical Operations, Staff Management, Sales & Revenue, Facility & Compliance)",
  "sections": [
    {
      "heading": "string",
      "steps": ["string", "string"]
    }
  ]
}

Return ONLY the JSON. No markdown, no explanation, no backticks.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.map((b: any) => b.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const sop = JSON.parse(clean);
    return NextResponse.json(sop);
  } catch {
    return NextResponse.json({ error: 'Failed to parse SOP' }, { status: 500 });
  }
}
