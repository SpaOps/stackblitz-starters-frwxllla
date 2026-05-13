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
        .clerk-card { background: transparent !important; box-shadow: none !import
