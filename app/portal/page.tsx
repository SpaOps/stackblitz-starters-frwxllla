"use client";
export const dynamic = 'force-dynamic';

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SOP = {
  id: string;
  title: string;
  category: string | null;
  purpose: string | null;
  scope: string | null;
  owner: string | null;
  sections: any;
  created_at: string;
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function PortalPage() {
  const { user, isLoaded } = useUser();
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSop, setActiveSop] = useState<SOP | null>(null);

  // Load SOPs from Supabase
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadSops() {
      setLoading(true);
      try {
        // First get the client record
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("clerk_user_id", user!.id)
          .single();

        if (!client) {
          setSops([]);
          setLoading(false);
          return;
        }

        // Then fetch all their SOPs
        const { data: sopsData, error } = await supabase
          .from("sops")
          .select("*")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading SOPs:", error);
        }

        setSops(sopsData || []);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSops();
  }, [user, isLoaded]);

  const categories = ["All", ...Array.from(new Set(sops.map(s => s.category).filter(Boolean) as string[]))];

  const filtered = sops.filter(s => {
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

  return (
    <main className="root">
      <div className="grain" />
      <header className="hdr">
        <div className="hdr-left">
          <span className="logo">SpaOps</span>
          <span className="hdr-divider">·</span>
          <span className="hdr-spa">{user?.firstName || "Your Spa"}</span>
        </div>
        <div className="hdr-right">
          <a href="/" className="hdr-link">Generate New SOP</a>
          <UserButton />
        </div>
      </header>

      <div className="page">
        {activeSop ? (
          <SOPDetail sop={activeSop} onBack={() => setActiveSop(null)} />
        ) : (
          <>
            <div className="welcome-row">
              <div>
                <h1 className="welcome-title">Good {getTimeOfDay()}, {user?.firstName || "there"}.</h1>
                <p className="welcome-sub">
                  {loading ? "Loading your library..." : `${sops.length} SOP${sops.length === 1 ? "" : "s"} in your library`}
                </p>
              </div>
              <div className="welcome-badge"><span className="badge-dot" />Active subscription</div>
            </div>

            {!loading && sops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">Your library is empty.</div>
                <p className="empty-text">Head back to the home page and generate your first SOP. It'll save here automatically.</p>
                <a href="/" className="empty-btn">Generate Your First SOP</a>
              </div>
            ) : (
              <>
                <div className="toolbar">
                  <div className="search-wrap">
                    <input
                      className="search-input"
                      placeholder="Search SOPs..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="cat-filters">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        className={`cat-btn ${category === cat ? "active" : ""}`}
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sop-grid">
                  {filtered.length === 0 ? (
                    <div className="empty">No SOPs match your search.</div>
                  ) : filtered.map((sop) => (
                    <div key={sop.id} className="sop-card" onClick={() => setActiveSop(sop)}>
                      <div className="card-top">
                        <span className="card-cat">{sop.category || "General"}</span>
                      </div>
                      <h3 className="card-title">{sop.title}</h3>
                      <p className="card-updated">Created {formatDate(sop.created_at)}</p>
                      <div className="card-actions">
                        <button className="card-btn primary" onClick={(e) => { e.stopPropagation(); setActiveSop(sop); }}>
                          View SOP
                        </button>
                        <button className="card-btn secondary" onClick={(e) => { e.stopPropagation(); copySignOffLink(sop.id); }}>
                          {copied === sop.id ? "✓ Copied" : "Copy Link"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="footer-legal">
              SpaOps generates operational SOPs. All clinical protocols should be reviewed and approved by your Medical Director before implementation.
            </p>
          </>
        )}
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
        .empty-state { background: #fff; border: 1px solid #e8e0d4; border-radius: 4px; padding: 64px 32px; text-align: center; }
        .empty-title { font-family: 'Georgia', serif; font-size: 22px; font-style: italic; color: #2c2420; margin-bottom: 12px; }
        .empty-text { font-family: 'Helvetica Neue', sans-serif; font-size: 14px; color: #8b7b74; max-width: 380px; margin: 0 auto 24px; line-height: 1.6; }
        .empty-btn { display: inline-block; padding: 14px 28px; background: #8b6f5e; color: #faf8f5; text-decoration: none; font-family: 'Helvetica Neue', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; border-radius: 2px; }
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
        .sop-card { background: #fff; border: 1px solid #e8e0d4; border-radius: 3px; padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow .2s, transform .2s; cursor: pointer; }
        .sop-card:hover { box-shadow: 0 6px 24px rgba(44,36,32,.08); transform: translateY(-2px); }
        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .card-cat { font-family: 'Helvetica Neue', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8b6f5e; background: rgba(139,111,94,.08); padding: 3px 8px; border-radius: 20px; }
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

function SOPDetail({ sop, onBack }: { sop: SOP; onBack: () => void }) {
  return (
    <div className="detail-wrap">
      <button onClick={onBack} className="back-btn">← Back to library</button>
      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-cat">{sop.category}</div>
          <h1 className="detail-title">{sop.title}</h1>
          {sop.owner && <div className="detail-owner">Owner: <span>{sop.owner}</span></div>}
        </div>
        <div className="detail-body">
          {sop.purpose && (
            <div className="detail-purpose">
              <div className="detail-label">Purpose</div>
              <p>{sop.purpose}</p>
              {sop.scope && <p className="detail-scope"><strong>Scope:</strong> {sop.scope}</p>}
            </div>
          )}
          {Array.isArray(sop.sections) && sop.sections.map((sec: any, i: number) => (
            <div key={i} className="detail-section">
              <div className="section-head">
                <span className="section-num">{i + 1}</span>
                <h2 className="section-title">{sec.heading}</h2>
              </div>
              <div className="section-steps">
                {Array.isArray(sec.steps) && sec.steps.map((step: string, j: number) => (
                  <div key={j} className="step-row">
                    <span className="step-num">{j + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .detail-wrap { font-family: 'Helvetica Neue', sans-serif; }
        .back-btn { background: none; border: none; color: #8b7b74; cursor: pointer; font-size: 13px; margin-bottom: 24px; padding: 0; font-family: inherit; }
        .detail-card { background: #fff; border: 1px solid #e8e0d4; border-radius: 4px; overflow: hidden; }
        .detail-header { background: #2c2420; padding: 36px 44px; }
        .detail-cat { font-size: 11px; color: #c4a886; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
        .detail-title { font-family: 'Georgia', serif; font-size: 30px; font-weight: 400; color: #faf8f5; line-height: 1.2; margin-bottom: 16px; }
        .detail-owner { font-size: 13px; color: #8b7b74; }
        .detail-owner span { color: #c4a886; }
        .detail-body { padding: 36px 44px; color: #2c2420; }
        .detail-purpose { background: #faf8f5; border: 1px solid #e8e0d4; border-radius: 4px; padding: 20px; margin-bottom: 32px; }
        .detail-label { font-size: 11px; color: #8b6f5e; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; }
        .detail-purpose p { font-size: 14px; line-height: 1.7; }
        .detail-scope { font-size: 12px; color: #8b7b74; margin-top: 6px; }
        .detail-section { margin-bottom: 32px; }
        .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #e8e0d4; }
        .section-num { width: 26px; height: 26px; background: #2c2420; color: #c4a886; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; flex-shrink: 0; }
        .section-title { font-family: 'Georgia', serif; font-size: 20px; font-weight: 500; }
        .section-steps { padding-left: 36px; }
        .step-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
        .step-num { min-width: 22px; height: 22px; border: 1.5px solid #e8d5b0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #c4a886; font-weight: 500; flex-shrink: 0; margin-top: 2px; }
        .step-row p { font-size: 14px; line-height: 1.7; }
      `}</style>
    </div>
  );
}
