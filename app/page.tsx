"use client";
import { useState } from "react";

const SAMPLE_SOPS = [
  {
    id: 1, category: "Patient Experience", icon: "✦",
    title: "New Patient Intake & Consultation",
    owner: "Front Desk Coordinator",
    lastUpdated: "April 2025",
    sections: [
      { heading: "Pre-Appointment Preparation", steps: ["Confirm appointment 24 hours in advance via automated text", "Prepare new patient packet: intake forms, consent forms, HIPAA notice", "Review any prior medical history submitted via online portal", "Assign consultation room and notify provider of patient background"] },
      { heading: "Day-Of Arrival", steps: ["Greet patient by name within 30 seconds of entry", "Offer beverage (still water, sparkling water, or herbal tea)", "Guide patient to complete any remaining intake forms on iPad", "Capture before photos with patient consent — use standard lighting setup"] },
      { heading: "Consultation Flow", steps: ["Provider reviews intake form prior to entering the room", "Conduct skin analysis using Visia Complexion Analysis System if applicable", "Present 2–3 treatment options with pricing — never lead with the most expensive", "Document all consultation notes in EMR within 2 hours"] },
      { heading: "Post-Consultation", steps: ["Hand patient a printed treatment summary and pricing sheet", "Offer to schedule follow-up before they leave", "Send thank-you text within 4 hours of departure", "Log consultation outcome in CRM: booked, undecided, or lost"] }
    ]
  },
  {
    id: 2, category: "Clinical Operations", icon: "◈",
    title: "Botox Treatment Protocol",
    owner: "Injecting Provider (NP / PA / MD)",
    lastUpdated: "April 2025",
    sections: [
      { heading: "Pre-Treatment Checklist", steps: ["Verify signed consent form on file", "Confirm no blood thinners or alcohol in last 48 hours", "Review contraindications: pregnancy, neuromuscular disorders, active infection", "Photograph treatment area and document in patient chart"] },
      { heading: "Room Setup", steps: ["Set treatment chair to 45-degree recline", "Lay out sterile field: needles, alcohol swabs, gauze, saline, Botox vials", "Reconstitute Botox per standard protocol", "Label vial with reconstitution date and time"] },
      { heading: "Treatment Execution", steps: ["Cleanse treatment area with alcohol swab; allow 30 seconds to dry", "Mark injection points with white eyeliner pencil", "Inject at correct depth and angle per anatomical training protocol", "Apply light pressure post-injection"] },
      { heading: "Post-Treatment Instructions", steps: ["No lying down for 4 hours post-treatment", "Avoid strenuous exercise for 24 hours", "Results visible in 3–5 days, full effect at 14 days", "Schedule 2-week follow-up for touch-up assessment"] }
    ]
  },
  {
    id: 3, category: "Staff Management", icon: "◇",
    title: "New Staff Onboarding",
    owner: "Practice Manager",
    lastUpdated: "April 2025",
    sections: [
      { heading: "Week 1 — Orientation", steps: ["Complete HR paperwork: I-9, W-4, direct deposit, emergency contact", "Issue uniform, key fob, and system logins", "Shadow front desk for 2 full days before independent shift", "Complete HIPAA training module and sign acknowledgment form"] },
      { heading: "Week 2 — Role Training", steps: ["Complete role-specific SOP readings and sign off on each", "Practice scripts: phone greeting, rebooking, upsell offers", "Observe 3 full patient journeys from check-in to checkout", "Complete product knowledge quiz with minimum 80% passing score"] },
      { heading: "Week 3–4 — Supervised Practice", steps: ["Handle front desk independently with manager available on-site", "Complete first solo checkout and upsell attempt", "Receive mid-onboarding feedback session at day 14", "Set 30-60-90 day goals with direct supervisor"] },
      { heading: "30-Day Review", steps: ["Conduct formal performance review using standard rubric", "Review any patient feedback referencing staff member", "Confirm all SOPs have been signed off and filed in HR folder", "Celebrate wins publicly in team channel"] }
    ]
  },
  {
    id: 4, category: "Sales & Revenue", icon: "◉",
    title: "Membership & Package Sales",
    owner: "Front Desk / Patient Coordinator",
    lastUpdated: "April 2025",
    sections: [
      { heading: "Identifying the Opportunity", steps: ["Flag patients who have visited 2+ times in 90 days as membership candidates", "Review treatment history before appointment to identify recurring services", "Listen for patient language: 'I want to keep this up'"] },
      { heading: "The Offer Conversation", steps: ["Wait until after treatment, during checkout", "Lead with value: show savings comparison card", "Never present more than 2 membership options", "Log all offers and outcomes in CRM"] },
      { heading: "Closing & Processing", steps: ["Complete membership agreement in Jane App or MindBody", "Collect credit card on file for recurring billing", "Give patient membership welcome packet", "Send welcome email within 1 hour with member benefits summary"] }
    ]
  }
];

const theme = {
  cream: "#FAF7F2", dark: "#1A1612", gold: "#C9A96E",
  goldLight: "#E8D5B0", rose: "#C4726A", sage: "#7A9E87",
  muted: "#6B6560", card: "#FFFFFF", border: "#E8E2D9",
};

const gs = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#FAF7F2;color:#1A1612;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .fu1{animation:fadeUp 0.7s 0.1s ease both}
  .fu2{animation:fadeUp 0.7s 0.2s ease both}
  .fu3{animation:fadeUp 0.7s 0.3s ease both}
  .fu4{animation:fadeUp 0.7s 0.4s ease both}
  .hl{transition:transform 0.2s ease,box-shadow 0.2s ease}
  .hl:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.12)}
  .sb{background:linear-gradient(90deg,#C9A96E 0%,#E8C97A 40%,#C9A96E 60%,#B8924A 100%);background-size:200% auto;animation:shimmer 3s linear infinite;}
`;

function Btn({ children, onClick, primary = false, full = false, disabled = false }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={primary && !disabled ? "sb hl" : "hl"}
      style={{ width: full ? "100%" : undefined, padding: "16px 32px", border: primary ? "none" : `1.5px solid ${theme.border}`, borderRadius: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.08em", cursor: disabled ? "not-allowed" : "pointer", textTransform: "uppercase" as const, background: primary && disabled ? theme.border : primary ? undefined : "transparent", color: primary && disabled ? theme.muted : primary ? theme.dark : theme.muted }}>
      {children}
    </button>
  );
}

function Nav({ right }: any) {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", borderBottom: `1px solid ${theme.border}`, background: theme.cream }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, letterSpacing: "0.05em" }}>
        Spa<span style={{ color: theme.gold }}>Ops</span>
      </div>
      {right}
    </nav>
  );
}

function Landing({ onStart }: any) {
  return (
    <div style={{ minHeight: "100vh", background: theme.cream }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
 <a href="/login" style={{fontSize:13,color:"#1A1612",textDecoration:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:500,padding:"10px 20px",border:"1.5px solid #E8E2D9",borderRadius:2,letterSpacing:"0.08em",textTransform:"uppercase" as const}}>Client Login</a>
  <Btn onClick={onStart}>Get Your Operations Manual</Btn>
</div>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "100px 48px 80px", textAlign: "center" }}>
        <div className="fu1" style={{ display: "inline-block", background: theme.goldLight, padding: "6px 16px", borderRadius: 2, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 32, fontWeight: 500 }}>Built exclusively for med spas</div>
        <h1 className="fu2" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(42px,7vw,76px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 28 }}>
          Your entire med spa,<br /><em style={{ color: theme.gold }}>documented in minutes.</em>
        </h1>
        <p className="fu3" style={{ fontSize: 17, color: theme.muted, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px", fontWeight: 300 }}>
          SpaOps interviews your team and instantly builds a professional operations manual for every role, treatment, and workflow — so your staff always knows exactly what to do.
        </p>
        <div className="fu4" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn primary onClick={onStart}>Build My Operations Manual Free →</Btn>
          <Btn onClick={() => document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" })}>See How It Works</Btn>
        </div>
      </section>

      <div style={{ background: theme.dark, padding: "40px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, textAlign: "center" }}>
          {[["72%", "of med spa staff turnover is caused by unclear expectations"], ["8 hrs", "saved per week on training and re-training staff"], ["3 days", "average time to onboard a new hire with SpaOps"]].map(([s, l]) => (
            <div key={s}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 300, color: theme.gold, marginBottom: 8 }}>{s}</div><div style={{ fontSize: 13, color: theme.goldLight, lineHeight: 1.5, fontWeight: 300 }}>{l}</div></div>
          ))}
        </div>
      </div>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 48px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 300, textAlign: "center", marginBottom: 56 }}>Everything your team needs to <em style={{ color: theme.gold }}>run like clockwork</em></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 28 }}>
          {[["✦","Done-For-You Manuals","Answer 6 questions about your spa. We write complete professional procedures for every workflow immediately."],["◈","Role-Based Access","Staff see only their relevant procedures. Injectors see clinical protocols. Front desk sees patient experience flows."],["◇","Monthly Updates","As your spa evolves we update your procedures automatically. No outdated manuals gathering dust."],["◉","Branded Staff Portal","Your staff logs into a clean beautiful portal branded to your spa. Looks like you built it yourself."]].map(([ic,ti,de])=>(
            <div key={ti as string} className="hl" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, padding: 32 }}>
              <div style={{ fontSize: 22, color: theme.gold, marginBottom: 14 }}>{ic}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 500, marginBottom: 10 }}>{ti}</h3>
              <p style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7, fontWeight: 300 }}>{de}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="portal" style={{ maxWidth: 700, margin: "0 auto", padding: "60px 48px 100px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, marginBottom: 12 }}>Simple, transparent pricing</h2>
        <p style={{ color: theme.muted, marginBottom: 40, fontWeight: 300 }}>One monthly retainer. Everything included.</p>
        <div style={{ background: theme.card, border: `2px solid ${theme.gold}`, borderRadius: 4, padding: 48, position: "relative" }}>
          <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: theme.gold, color: theme.dark, padding: "4px 20px", borderRadius: 2, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>Most Popular</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 60, fontWeight: 300 }}>$2,500<span style={{ fontSize: 18, color: theme.muted }}>/mo</span></div>
          <p style={{ color: theme.muted, margin: "10px 0 32px", fontWeight: 300 }}>Everything your med spa needs to run on systems</p>
          {["Unlimited done-for-you procedures","Branded staff portal","Monthly updates & maintenance","Role-based access for all staff","Dedicated onboarding call","Priority Slack support"].map(f=>(
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, textAlign: "left" }}>
              <span style={{ color: theme.sage }}>✓</span>
              <span style={{ fontSize: 14, fontWeight: 300 }}>{f}</span>
            </div>
          ))}
          <div style={{ marginTop: 28 }}><Btn primary full onClick={onStart}>Build My Operations Manual Free →</Btn></div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${theme.border}`, padding: "28px 48px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: theme.gold, marginBottom: 6 }}>SpaOps</div>
        <p style={{ fontSize: 12, color: theme.muted }}>© 2025 SpaOps — Built for med spas, by operators who get it.</p>
      </footer>
    </div>
  );
}

const QUESTIONS = [
  { id: "spaName", label: "What is the name of your med spa?", placeholder: "e.g. Lumière Aesthetics" },
  { id: "sopTopic", label: "What procedure or workflow do you need documented first?", placeholder: "e.g. Botox treatment protocol, new patient intake..." },
  { id: "staffRoles", label: "What staff roles are involved?", placeholder: "e.g. Front desk, injecting NP, practice manager" },
  { id: "currentProcess", label: "How does this process work today?", placeholder: "e.g. Patient comes in, front desk checks them in..." },
  { id: "painPoints", label: "What goes wrong or gets inconsistent?", placeholder: "e.g. Staff forget to take before photos..." },
  { id: "tools", label: "What software or tools do you use?", placeholder: "e.g. Jane App, Mindbody, Square, Slack..." },
];

function Intake({ onDone }: any) {
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const filled = QUESTIONS.every(q => (answers[q.id] || "").trim());

  async function generate() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
      });
      const sop = await res.json();
      if (sop.error) throw new Error(sop.error);
      onDone({ ...sop, id: Date.now(), lastUpdated: new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}), icon: ({"Patient Experience":"✦","Clinical Operations":"◈","Staff Management":"◇","Sales & Revenue":"◉","Facility & Compliance":"◆"} as any)[sop.category]||"✦", spaName: answers.spaName });
    } catch (e: any) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: theme.cream }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${theme.goldLight}`, borderTopColor: theme.gold, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 24 }} />
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300 }}>Building your operations manual…</h2>
      <p style={{ color: theme.muted, marginTop: 8, fontWeight: 300 }}>This takes about 15 seconds.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.cream }}>
      <Nav right={<span style={{ fontSize: 13, color: theme.muted }}>Free Operations Manual</span>} />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: theme.goldLight, padding: "5px 14px", borderRadius: 2, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18, fontWeight: 500 }}>6 Quick Questions</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 300, marginBottom: 10 }}>Tell us about your spa</h1>
          <p style={{ color: theme.muted, fontSize: 15, fontWeight: 300, lineHeight: 1.6 }}>Answer these questions and we'll build a complete professional operations procedure in under 30 seconds.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {QUESTIONS.map((q, i) => (
            <div key={q.id}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{i + 1}. {q.label}</label>
              <textarea value={answers[q.id] || ""} onChange={e => setAnswers((a: any) => ({ ...a, [q.id]: e.target.value }))} placeholder={q.placeholder} rows={2}
                style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${answers[q.id] ? theme.gold : theme.border}`, borderRadius: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 14, background: theme.card, resize: "vertical", outline: "none", lineHeight: 1.6, fontWeight: 300 }} />
            </div>
          ))}
        </div>
        {error && <p style={{ color: theme.rose, marginTop: 12, fontSize: 13 }}>{error}</p>}
        <div style={{ marginTop: 32 }}><Btn primary full disabled={!filled} onClick={generate}>Build My Operations Manual →</Btn></div>
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: theme.muted }}>No credit card required.</p>
      </div>
    </div>
  );
}

function SOPDoc({ sop, onBack }: any) {
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 13, marginBottom: 28, padding: 0 }}>← Back to all procedures</button>
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ background: theme.dark, padding: "36px 44px" }}>
          <div style={{ fontSize: 11, color: theme.goldLight, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{sop.category}</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 300, color: theme.cream, lineHeight: 1.2, marginBottom: 16 }}>{sop.title}</h1>
          <div style={{ fontSize: 13, color: theme.muted }}>Owner: <span style={{ color: theme.goldLight }}>{sop.owner}</span> · Updated {sop.lastUpdated}</div>
        </div>
        <div style={{ padding: "36px 44px" }}>
          {sop.purpose && <div style={{ background: theme.cream, border: `1px solid ${theme.border}`, borderRadius: 4, padding: 20, marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>Purpose</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{sop.purpose}</p>
            {sop.scope && <p style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}><b>Scope:</b> {sop.scope}</p>}
          </div>}
          {sop.sections.map((sec: any, si: number) => (
            <div key={si} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ width: 26, height: 26, background: theme.dark, color: theme.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{si + 1}</span>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 500 }}>{sec.heading}</h2>
              </div>
              <div style={{ paddingLeft: 36 }}>
                {sec.steps.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                    <span style={{ minWidth: 22, height: 22, border: `1.5px solid ${theme.goldLight}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: theme.gold, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                    <p style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Portal({ generatedSop, spaName }: any) {
  const [active, setActive] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const all = generatedSop ? [generatedSop, ...SAMPLE_SOPS] : SAMPLE_SOPS;
  const cats = ["All", ...Array.from(new Set(all.map((s: any) => s.category)))];
  const filtered = all.filter((s: any) => (cat === "All" || s.category === cat) && (s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())));
  const name = spaName || "Lumière Aesthetics";

  return (
    <div style={{ minHeight: "100vh", background: theme.cream }}>
      <nav style={{ background: theme.dark, padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: theme.cream }}>{name}</div><div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Powered by SpaOps</div></div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: theme.gold }}>Spa<span style={{ fontWeight: 600 }}>Ops</span></div>
      </nav>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 28px" }}>
        {active ? <SOPDoc sop={active} onBack={() => setActive(null)} /> : <>
          {generatedSop && <div style={{ background: "#7A9E8722", border: `1px solid ${theme.sage}`, borderRadius: 4, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: theme.sage }}>✓</span>
            <div><div style={{ fontSize: 13, fontWeight: 500 }}>Your procedure was just created!</div><div style={{ fontSize: 12, color: theme.muted, fontWeight: 300 }}>"{generatedSop.title}" has been added to your portal.</div></div>
          </div>}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 300, marginBottom: 4 }}>{name} <em style={{ color: theme.gold }}>Operations</em></h1>
            <p style={{ color: theme.muted, fontSize: 13, fontWeight: 300 }}>{all.length} standard operating procedures · Always up to date</p>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search procedures…" style={{ flex: 1, minWidth: 180, padding: "10px 14px", border: `1.5px solid ${theme.border}`, borderRadius: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 13, background: theme.card, outline: "none" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: "8px 14px", border: `1.5px solid ${cat === c ? theme.gold : theme.border}`, background: cat === c ? theme.gold : "transparent", color: cat === c ? theme.dark : theme.muted, borderRadius: 2, fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: cat === c ? 500 : 300 }}>{c}</button>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
            {filtered.map((sop: any) => (
              <div key={sop.id} onClick={() => setActive(sop)} className="hl" style={{ background: theme.card, border: `1px solid ${sop.id === generatedSop?.id ? theme.gold : theme.border}`, borderRadius: 4, padding: 26, cursor: "pointer", position: "relative" }}>
                {sop.id === generatedSop?.id && <div style={{ position: "absolute", top: 10, right: 10, background: theme.gold, color: theme.dark, fontSize: 9, padding: "2px 7px", borderRadius: 2, fontWeight: 500 }}>NEW</div>}
                <div style={{ fontSize: 20, color: theme.gold, marginBottom: 12 }}>{sop.icon}</div>
                <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{sop.category}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>{sop.title}</h3>
                <div style={{ fontSize: 11, color: theme.muted, fontWeight: 300 }}>Owner: {sop.owner}</div>
                <div style={{ marginTop: 16, fontSize: 12, color: theme.gold, fontWeight: 500 }}>View Procedure →</div>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [generatedSop, setGeneratedSop] = useState<any>(null);
  const [spaName, setSpaName] = useState("");

  function handleDone(sop: any) {
    setGeneratedSop(sop);
    setSpaName(sop.spaName || "");
    setView("portal");
  }

  return (
    <>
      <style>{gs}</style>
      {view === "landing" && <Landing onStart={() => setView("intake")} />}
      {view === "intake" && <Intake onDone={handleDone} />}
      {view === "portal" && <Portal generatedSop={generatedSop} spaName={spaName} />}
    </>
  );
}
