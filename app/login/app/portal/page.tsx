"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";

const MOCK_SOPS = [
  { id: "sop-001", title: "Botox Pre-Treatment Protocol", category: "Injectables", version: "v2.1", updated: "May 2026" },
  { id: "sop-002", title: "Laser Hair Removal Safety Checklist", category: "Laser", version: "v1.4", updated: "Apr 2026" },
  { id: "sop-003", title: "Chemical Peel Post-Care Instructions", category: "Skincare", version: "v3.0", updated: "May 2026" },
  { id: "sop-004", title: "Patient Intake & Consent Workflow", category: "Front Desk", version: "v2.2", updated: "Mar 2026" },
  { id: "sop-005", title: "Filler Injection Pre-Assessment", category: "Injectables", version: "v1.9", updated: "May 2026" },
  { id: "sop-006", title: "Emergency Response Protocol", category: "Safety", version: "v4.1", updated: "Jan 2026" },
];

const CATEGORIES = ["All", ...Array.from(new Set(MOCK_SOPS.map(s => s.category)))];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function PortalPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = MOCK_SOPS.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || s.category === category;
    return matchesSearch && matchesCategory;
  });

  const copySignOffLink = (sopId: string) => {
    const link = `${window.location.origin}/signoff/${sopId}`;
    navigator.clipboard.writeText(link);
    setCopied(sopId);
    setTimeout(() => setCopied(null), 2000);
  };

  const spaName = user?.firstName || "Your Spa";

  return (
    <main className="root">
      <div className="grain" />
      <header className="hdr">
        <div className="hdr-left">
          <span className="logo">SpaOps</span>
          <span className="hdr-divider">·</span>
          <span className="hdr-spa">{spaName}</span>
        </div>
        <div className="hdr-right">
          <a href="/dashboard/signoffs" className="hdr-link">Sign-off Dashboard</a>
          <UserButton />
        </div>
      </header>

      <div className="page">
        <div className="welcome-row">
          <div>
            <h1 className="welcome-title">Good {getTimeOfDay()}, {user?.firstName || "there"}.</h1>
            <p className="welcome-sub">{MOCK_SOPS.length} SOPs in your library · Last updated May 2026</p>
          </div>
          <div className="welcome-badge"><span className="badge-dot" />Active subscription</div>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <input className="search-input" placeholder="Search SOPs…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="cat-filters">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`cat-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="sop-grid">
          {filtered.length === 0 ? (
            <div className="empty">No SOPs match your search.</div>
          ) : filtered.map((sop) => (
            <div key={sop.id} className="sop-card">
              <div className="card-top">
                <span className="card-cat">{sop.category}</span>
                <span className="card-ver">{sop.version}</span>
              </div>
              <h3 className="card-title">{sop.title}</h3>
              <p className="card-updated">Updated {sop.updated}</p>
              <div className="card-actions">
                <a href={`/signoff/${sop.id}`} target="_blank" rel="noreferrer" className="card-btn primary">View SOP</a>
                <button className="card-btn secondary" onClick={() => copySignOffLink(sop.id)}>
                  {copied === sop.id ? "✓ Copied" : "Copy Link"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="footer-legal">SpaOps generates operational SOPs. All clinical protocols should be reviewed and approved by your Medical Director before implementation.</p>
      </div>

      <style jsx>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .root { min-height: 100vh; background: #faf8f5; color: #2c2420; font-family: 'Georgia', serif; position: relative; }
        .grain { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .025; }
        .hdr { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; background: rgba(250,248,245,.92); backdrop-filter: blur(8px); border-bottom: 1px solid #e8e0d4; }
        .hdr-left { display: flex; align-items: center; gap: 10px; }
        .logo { font-size: 18px; font-weight: 700; color: #8b6f5e; letter-spacing: .04em; }
        .hdr-divider { color: #e8e0d4; }
        .hdr-spa { font-family: 'Helvetica Neue', sans-serif; font-size: 13px; color: #8b7b74; }
        .hdr-right { display: flex; align-items: center; gap: 20px; }
        .hdr-link { font-family: 'Helvetica Neue', sans-serif; font-size: 12px; color: #8b7b74; text-decoration: none; transition: color .2s; }
        .hdr-link:hover { color: #8b6f5e; }
        .page { position: relative; z-index: 1; max-width: 1040px; margin: 0 auto; padding: 48px 32px 80px; display: flex; flex-direction: column; gap: 36px; }
        .welcome-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
        .welcome-title { font-size: 34px; font-weight: 400; font-style: italic; color: #2c2420; margin-bottom: 8px; }
        .welcome-sub { font-family: 'Helvetica Neue', sans-serif; font-size: 13px; color: #b5a49a; }
        .welcome-badge { display: flex; align-items: center; gap: 8px; font-family: 'Helvetica Neue', sans-serif; font-size: 11px; color: #8b7b74; border: 1px solid #e8e0d4; border-radius: 20px; padding: 6px 14px; background: #fff; }
        .badge-dot { width: 6px; height: 6px; background: #6dbf8b; border-radius: 50%; flex-shrink: 0; }
        .toolbar { display: flex; flex-direction: column; gap: 14px; }
        .search-wrap { max-width: 360px; }
        .search-input { width: 100%; padding: 11px 14px; border: 1px solid #e8e0d4; border-radius: 2px; background: #fff; font-family: 'Helvetica Neue', sans-serif; font-size: 13px; color: #2c2420; outline: none; }
        .search-input:focus { border-color: #8b6f5e; }
        .search-input::placeholder { color: #c4b8b2; }
        .cat-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .cat-btn { padding: 7px 16px; border: 1px solid #e8e0d4; border-radius: 20px; background: #fff; color: #8b7b74; font-family: 'Helvetica Neue', sans-serif; font-size: 12px; cursor: pointer; transition: all .2s; }
        .cat-btn:hover { border-color: #8b6f5e; color: #8b6f5e; }
        .cat-btn.active { background: #8b6f5e; border-color: #8b6f5e; color: #faf8f5; }
        .sop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .empty { grid-column: 1/-1; font-family: 'Helvetica Neue', sans-serif; font-size: 14px; color: #b5a49a; text-align: center; padding: 64px; border: 1px dashed #e8e0d4; border-radius: 3px; }
        .sop-card { background: #fff; border: 1px solid #e8e0d4; border-radius: 3px; padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow .2s, transform .2s; }
        .sop-card:hover { box-shadow: 0 6px 24px rgba(44,36,32,.08); transform: translateY(-2px); }
        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .card-cat { font-family: 'Helvetica Neue', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8b6f5e; background: rgba(139,111,94,.08); padding: 3px 8px; border-radius: 20px; }
        .card-ver { font-family: 'Helvetica Neue', sans-serif; font-size: 11px; color: #c4b8b2; }
        .card-title { font-size: 16px; font-weight: 400; line-height: 1.4; color: #2c2420; flex: 1; }
        .card-updated { font-family: 'Helvetica Neue', sans-serif; font-size: 11px; color: #c4b8b2; }
        .card-actions { display: flex; gap: 8px; margin-top: 4px; }
        .card-btn { flex: 1; padding: 10px; font-family: 'Helvetica Neue', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; border-radius: 2px; cursor: pointer; text-decoration: none; text-align: center; transition: all .2s; border: none; }
        .card-btn.primary { background: #8b6f5e; color: #faf8f5; }
        .card-btn.primary:hover { background: #7a5f4f; }
        .card-btn.secondary { background: transparent; color: #8b7b74; border: 1px solid #e8e0d4; }
        .card-btn.secondary:hover { border-color: #8b6f5e; color: #8b6f5e; }
        .footer-legal { font-family: 'Helvetica Neue', sans-serif; font-size: 11px; color: #c4b8b2; line-height: 1.6; border-top: 1px solid #e8e0d4; padding-top: 24px; }
        @media (max-width: 600px) {
          .page { padding: 28px 20px 60px; }
          .hdr { padding: 14px 20px; }
          .hdr-link { display: none; }
          .welcome-title { font-size: 26px; }
        }
      `}</style>
    </main>
  );
}
