"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FAF7F2 0%, #F2EDE6 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      fontFamily: "'DM Sans', sans-serif",
      color: "#1A1612"
    }}>
      <div style={{
        maxWidth: 560,
        width: "100%",
        background: "#FFFFFF",
        border: "1px solid #E8E2D9",
        borderRadius: 4,
        padding: "56px 48px",
        textAlign: "center",
        boxShadow: "0 12px 48px rgba(0,0,0,0.06)"
      }}>
        <div style={{
          width: 64,
          height: 64,
          margin: "0 auto 28px",
          borderRadius: "50%",
          background: "#C9A96E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          color: "#1A1612",
          fontWeight: 600
        }}>✓</div>

        <div style={{
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#C9A96E",
          marginBottom: 16,
          fontWeight: 500
        }}>Subscription Confirmed</div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 42,
          fontWeight: 300,
          lineHeight: 1.15,
          marginBottom: 16
        }}>
          Welcome to <em style={{ color: "#C9A96E" }}>SpaOps.</em>
        </h1>

        <p style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#6B6560",
          marginBottom: 36,
          fontWeight: 300
        }}>
          Your subscription is active. Within the next 24 hours, you'll receive a welcome email from Corwin to schedule your onboarding call and get your team set up.
        </p>

        <div style={{
          background: "#FAF7F2",
          border: "1px solid #E8E2D9",
          borderRadius: 4,
          padding: "20px 24px",
          marginBottom: 32,
          textAlign: "left"
        }}>
          <div style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#C9A96E",
            fontWeight: 500,
            marginBottom: 12
          }}>What happens next</div>
          <div style={{ fontSize: 13, lineHeight: 1.9, color: "#1A1612" }}>
            <div>1. Check your inbox for a confirmation receipt from Stripe</div>
            <div>2. We'll reach out within 24 hours to schedule onboarding</div>
            <div>3. Your branded staff portal will be set up and ready before our call</div>
          </div>
        </div>

        <a href="/login" style={{
          display: "inline-block",
          padding: "16px 40px",
          background: "#C9A96E",
          color: "#1A1612",
          textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: 2
        }}>
          Sign In to Your Portal
        </a>

        <p style={{
          marginTop: 32,
          fontSize: 12,
          color: "#B5A49A",
          fontStyle: "italic"
        }}>
          Questions? Reply to your confirmation email or call (210) 446-6404.
        </p>

        <p style={{
          marginTop: 24,
          fontSize: 11,
          color: "#C9A96E",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 500
        }}>
          Less Binder. More Business.
        </p>
      </div>
    </main>
  );
}
