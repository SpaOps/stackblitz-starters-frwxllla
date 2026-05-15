export const dynamic = 'force-dynamic';
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignIn, useAuth } from "@clerk/nextjs";

export default function LoginPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push("/portal");
  }, [isSignedIn, router]);

  return (
    <main className="root">
      <div className="bg-layer" />
      <div className="lines-layer" />

      <aside className="left">
        <div className="left-inner">
          <div className="logo-wrap">
            <span className="logo">SpaOps</span>
            <span className="logo-tag">Client Portal</span>
          </div>
          <div className="left-body">
            <h1 className="left-title">
              Your protocols.<br />
              Your team.<br />
              <em>All in one place.</em>
            </h1>
            <p className="left-sub">
              Sign in to access your med spa's SOP library,
              staff sign-off tracker, and compliance dashboard.
            </p>
          </div>
          <div className="features">
            {[
              { icon: "◈", label: "SOP Library", desc: "All protocols, always current" },
              { icon: "◎", label: "Staff Sign-Offs", desc: "Track team acknowledgments" },
              { icon: "◇", label: "Compliance Ready", desc: "Audit-proof documentation" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="feature">
                <span className="feat-icon">{icon}</span>
                <div>
                  <div className="feat-label">{label}</div>
                  <div className="feat-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="left-legal">
            SpaOps generates operational SOPs. All clinical protocols
            should be reviewed by your Medical Director before implementation.
          </p>
        </div>
      </aside>

      <section className="right">
        <div className="right-inner">
          <div className="sign-in-header">
            <h2 className="sign-in-title">Welcome back</h2>
            <p className="sign-in-sub">Sign in with Google or your email — no password needed.</p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: "clerk-root",
                card: "clerk-card",
                headerTitle: "clerk-hide",
                headerSubtitle: "clerk-hide",
                socialButtonsBlockButton: "clerk-social-btn",
                dividerLine: "clerk-divider-line",
                dividerText: "clerk-divider-text",
                formFieldLabel: "clerk-field-label",
                formFieldInput: "clerk-field-input",
                formButtonPrimary: "clerk-submit-btn",
              },
            }}
            redirectUrl="/portal"
            signUpUrl="/sign-up"
          />
          <p className="not-client">
            Not a client yet?{" "}
            <a href="/pricing" className="pricing-link">See pricing →</a>
          </p>
        </div>
      </section>

      <style jsx global>{`
        .clerk-root { width: 100% !important; }
        .clerk-card { background: transparent !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; border: none !important; }
        .clerk-hide { display: none !important; }
        .clerk-social-btn { background: #fff !important; border: 1px solid #e8e0d4 !important; border-radius: 2px !important; height: 48px !important; font-family: 'Helvetica Neue', sans-serif !important; font-size: 13px !important; font-weight: 600 !important; color: #2c2420 !important; }
        .clerk-social-btn:hover { border-color: #8b6f5e !important; }
        .clerk-divider-line { background: #e8e0d4 !important; }
        .clerk-divider-text { font-family: 'Helvetica Neue', sans-serif !important; font-size: 11px !important; color: #b5a49a !important; letter-spacing: .08em !important; text-transform: uppercase !important; }
        .clerk-field-label { font-family: 'Helvetica Neue', sans-serif !important; font-size: 11px !important; font-weight: 600 !important; letter-spacing: .08em !important; text-transform: uppercase !important; color: #8b7b74 !important; }
        .clerk-field-input { border: 1px solid #e8e0d4 !important; border-radius: 2px !important; background: #faf8f5 !important; font-size: 15px !important; color: #2c2420 !important; height: 48px !important; }
        .clerk-field-input:focus { border-color: #8b6f5e !important; box-shadow: none !important; }
        .clerk-submit-btn { background: #8b6f5e !important; border-radius: 2px !important; height: 52px !important; font-family: 'Helvetica Neue', sans-serif !important; font-size: 13px !important; font-weight: 700 !important; letter-spacing: .08em !important; text-transform: uppercase !important; }
        .clerk-submit-btn:hover { background: #7a5f4f !important; }
      `}</style>

      <style jsx>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .root { min-height: 100vh; display: flex; font-family: 'Georgia', serif; position: relative; overflow: hidden; }
        .bg-layer { position: fixed; inset: 0; z-index: 0; background: linear-gradient(135deg, #faf8f5 0%, #f2ede6 100%); }
        .lines-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; background-image: repeating-linear-gradient(90deg, rgba(139,111,94,.04) 0px, rgba(139,111,94,.04) 1px, transparent 1px, transparent 80px); }
        .left { position: relative; z-index: 1; width: 480px; flex-shrink: 0; background: #2c2420; display: flex; align-items: stretch; }
        .left-inner { padding: 56px 48px; display: flex; flex-direction: column; width: 100%; }
        .logo-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 64px; }
        .logo { font-size: 22px; font-weight: 700; color: #c4a886; letter-spacing: .04em; }
        .logo-tag { font-family: 'Helvetica Neue', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: rgba(196,168,134,.5); border: 1px solid rgba(196,168,134,.2); padding: 3px 10px; border-radius: 20px; }
        .left-body { flex: 1; }
        .left-title { font-size: 38px; font-weight: 400; line-height: 1.15; color: #f0ede8; margin-bottom: 20px; }
        .left-title em { color: #c4a886; font-style: italic; }
        .left-sub { font-family: 'Helvetica Neue', sans-serif; font-size: 14px; color: rgba(240,237,232,.5); line-height: 1.7; max-width: 320px; margin-bottom: 48px; }
        .features { display: flex; flex-direction: column; gap: 20px; margin-bottom: 48px; }
        .feature { display: flex; align-items: flex-start; gap: 16px; }
        .feat-icon { font-size: 18px; color: #c4a886; margin-top: 1px; flex-shrink: 0; }
        .feat-label { font-size: 14px; color: #f0ede8; margin-bottom: 3px; }
        .feat-desc { font-family: 'Helvetica Neue', sans-serif; font-size: 12px; color: rgba(240,237,232,.4); }
        .left-legal { font-family: 'Helvetica Neue', sans-serif; font-size: 10px; color: rgba(240,237,232,.2); line-height: 1.6; border-top: 1px solid rgba(196,168,134,.1); padding-top: 20px; }
        .right { position: relative; z-index: 1; flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
        .right-inner { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 28px; }
        .sign-in-header { text-align: center; }
        .sign-in-title { font-size: 32px; font-weight: 400; font-style: italic; color: #2c2420; margin-bottom: 10px; }
        .sign-in-sub { font-family: 'Helvetica Neue', sans-serif; font-size: 13px; color: #8b7b74; line-height: 1.6; }
        .not-client { font-family: 'Helvetica Neue', sans-serif; font-size: 12px; color: #b5a49a; text-align: center; }
        .pricing-link { color: #8b6f5e; text-decoration: none; }
        .pricing-link:hover { color: #7a5f4f; }
        @media (max-width: 860px) {
          .root { flex-direction: column; }
          .left { width: 100%; }
          .left-inner { padding: 36px 28px; }
          .left-title { font-size: 28px; }
          .features { display: none; }
          .left-legal { display: none; }
          .logo-wrap { margin-bottom: 28px; }
        }
      `}</style>
    </main>
  );
}
