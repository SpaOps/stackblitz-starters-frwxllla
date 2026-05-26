"use client";
export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/portal");
    }
  }, [isSignedIn, router]);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" as const, fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(135deg, #faf8f5 0%, #f2ede6 100%)" }} />

     <aside style={{ position: "relative", zIndex: 1, width: "min(480px, 100%)", flexShrink: 0, background: "#2c2420", display: "flex", alignItems: "stretch" }}>
        <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#c4a886", letterSpacing: ".04em" }}>SpaOps</span>
            <span style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "rgba(196,168,134,.5)", border: "1px solid rgba(196,168,134,.2)", padding: "3px 10px", borderRadius: 20 }}>Client Portal</span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 38, fontWeight: 400, lineHeight: 1.15, color: "#f0ede8", marginBottom: 20 }}>
              Your protocols.<br />Your team.<br /><em style={{ color: "#c4a886" }}>All in one place.</em>
            </h1>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 14, color: "rgba(240,237,232,.5)", lineHeight: 1.7, maxWidth: 320, marginBottom: 48 }}>
              Sign in to access your med spa's SOP library, staff sign-off tracker, and compliance dashboard.
            </p>
          </div>
          <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 10, color: "rgba(240,237,232,.2)", lineHeight: 1.6, borderTop: "1px solid rgba(196,168,134,.1)", paddingTop: 20 }}>
            SpaOps generates operational SOPs. All clinical protocols should be reviewed by your Medical Director before implementation.
          </p>
        </div>
      </aside>

      <section style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 28, textAlign: "center" }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 400, fontStyle: "italic", color: "#2c2420", marginBottom: 10 }}>Welcome back</h2>
            <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, color: "#8b7b74", lineHeight: 1.6 }}>Sign in with Google or your email — no password needed.</p>
          </div>

          <a href="https://accounts.getspaops.com/sign-in" style={{ display: "block", width: "100%", padding: "16px", background: "#8b6f5e", color: "#faf8f5", borderRadius: 2, fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, textDecoration: "none", textAlign: "center" as const }}>
            Sign In →
          </a>

          <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 12, color: "#b5a49a" }}>
            Not a client yet? <a href="/pricing.html" style={{ color: "#8b6f5e", textDecoration: "none" }}>See pricing.html →</a>
          </p>
        </div>
      </section>
    </main>
  );
}
