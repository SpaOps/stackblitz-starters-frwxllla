"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type SOP = {
  id: string;
  title: string;
  category: string | null;
  purpose: string | null;
  scope: string | null;
  owner: string | null;
  sections: any;
};

const font = "'Helvetica Neue', sans-serif";
const serif = "'Georgia', serif";

export default function SignOffPage() {
  const params = useParams();
  const raw = params?.sopId;
  const sopId = Array.isArray(raw) ? raw[0] : (raw as string);

  const [sop, setSop] = useState<SOP | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sopId) return;
    async function load() {
      try {
        const res = await fetch(`/api/signoff/${sopId}`);
        if (!res.ok) {
          setStatus("notfound");
          return;
        }
        const json = await res.json();
        setSop(json.sop);
        setStatus("ready");
      } catch {
        setStatus("notfound");
      }
    }
    load();
  }, [sopId]);

  async function submit() {
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (!agreed) return setError("Please check the box to confirm you have read this procedure.");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/signoff/${sopId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffName: name, staffEmail: email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#faf8f5", color: "#2c2420", fontFamily: serif, padding: "32px 20px 80px" };
  const card: React.CSSProperties = { maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #e8e0d4", borderRadius: 4, overflow: "hidden" };
  const input: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid #e8e0d4", borderRadius: 2, fontFamily: font, fontSize: 14, color: "#2c2420", boxSizing: "border-box" };

  if (status === "loading") {
    return <main style={wrap}><p style={{ textAlign: "center", fontFamily: font, color: "#8b7b74" }}>Loading procedure...</p></main>;
  }

  if (status === "notfound" || !sop) {
    return (
      <main style={wrap}>
        <div style={{ ...card, padding: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 400, fontStyle: "italic" }}>This link isn't valid.</h1>
          <p style={{ fontFamily: font, fontSize: 14, color: "#8b7b74", marginTop: 12 }}>Please ask your manager for a new sign-off link.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={card}>
        <div style={{ background: "#2c2420", padding: "32px 36px" }}>
          <div style={{ fontFamily: font, fontSize: 11, color: "#c4a886", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>
            {sop.category || "Procedure"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: "#faf8f5", lineHeight: 1.25 }}>{sop.title}</h1>
          {sop.owner && <div style={{ fontFamily: font, fontSize: 13, color: "#c4a886", marginTop: 12 }}>Owner: {sop.owner}</div>}
        </div>

        <div style={{ padding: "32px 36px", fontFamily: font }}>
          {sop.purpose && (
            <div style={{ background: "#faf8f5", border: "1px solid #e8e0d4", borderRadius: 4, padding: 18, marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "#8b6f5e", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Purpose</div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{sop.purpose}</p>
              {sop.scope && <p style={{ fontSize: 12, color: "#8b7b74", marginTop: 8 }}><strong>Scope:</strong> {sop.scope}</p>}
            </div>
          )}

          {Array.isArray(sop.sections) && sop.sections.map((sec: any, i: number) => (
            <div key={i} style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: serif, fontSize: 19, fontWeight: 500, paddingBottom: 8, borderBottom: "1px solid #e8e0d4", marginBottom: 14 }}>
                {i + 1}. {sec.heading}
              </h2>
              {Array.isArray(sec.steps) && sec.steps.map((step: string, j: number) => (
                <p key={j} style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10, paddingLeft: 12 }}>
                  <span style={{ color: "#c4a886", marginRight: 8 }}>{j + 1}.</span>{step}
                </p>
              ))}
            </div>
          ))}

          <div style={{ borderTop: "2px solid #2c2420", paddingTop: 28, marginTop: 36 }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 400, fontStyle: "italic" }}>Thank you, {name.split(" ")[0]}.</h2>
                <p style={{ fontSize: 14, color: "#8b7b74", marginTop: 10 }}>Your sign-off has been recorded.</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Staff sign-off</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input style={input} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                  <input style={input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5, cursor: "pointer" }}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
                    I have read and understand this procedure.
                  </label>
                  {error && <p style={{ color: "#b3412e", fontSize: 13 }}>{error}</p>}
                  <button
                    onClick={submit}
                    disabled={submitting}
                    style={{ padding: "14px", background: "#8b6f5e", color: "#faf8f5", border: "none", borderRadius: 2, fontFamily: font, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? "Submitting..." : "Sign off"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
