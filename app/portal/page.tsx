"use client";
export const dynamic = 'force-dynamic';

import { useUser, useOrganization, UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { useEffect, useState } from "react";


type SOP = {
  id: string;
  title: string;
  category: string | null;
  purpose: string | null;
  scope: string | null;
  owner: string | null;
  sections: any;
  created_at: string;
  edited_at?: string | null;
};

type Signoff = {
  id: string;
  sop_id: string;
  staff_name: string;
  staff_email: string | null;
  signed_at: string;
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function PortalPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const [sops, setSops] = useState<SOP[]>([]);
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSop, setActiveSop] = useState<SOP | null>(null);

  // Load SOPs through the server (verifies Clerk login, scopes to this client)
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadSops() {
      setLoading(true);
      try {
        const res = await fetch("/api/sops", { headers: organization?.id ? { "x-org-id": organization.id } : {} });
        if (!res.ok) throw new Error("Failed to load SOPs");
        const json = await res.json();
        setSops(json.sops || []);
        setSignoffs(json.signoffs || []);
        setCanManage(json.canManage === true);
        setSubStatus(json.subscription?.status ?? null);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSops();
  }, [user, isLoaded, organization?.id]);

  async function startCheckout(plan: "core" | "premium") {
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(organization?.id ? { "x-org-id": organization.id } : {}) },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Could not start checkout.");
      window.location.href = json.url;
    } catch (err: any) {
      setCheckoutError(err.message || "Could not start checkout.");
      setCheckoutBusy(false);
    }
  }

  async function openBilling() {
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: organization?.id ? { "x-org-id": organization.id } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Could not open billing.");
      window.location.href = json.url;
    } catch (err: any) {
      setCheckoutError(err.message || "Could not open billing.");
      setCheckoutBusy(false);
    }
  }

  const subscribed = subStatus === "active" || subStatus === "trialing";

  // Only sign-offs made after an SOP's last edit count as current.
  const editedAt: Record<string, string | null | undefined> = {};
  sops.forEach(s => { editedAt[s.id] = s.edited_at; });
  const signoffCounts: Record<string, number> = {};
  signoffs.forEach(s => {
    const edited = editedAt[s.sop_id];
    if (edited && new Date(s.signed_at) < new Date(edited)) return;
    signoffCounts[s.sop_id] = (signoffCounts[s.sop_id] || 0) + 1;
  });

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
          <span className="hdr-spa">{organization?.name || user?.firstName || "Your Spa"}</span>
        </div>
        <div className="hdr-right">
          <a href="/" className="hdr-link">Home</a>
          {canManage && subscribed && <a href="/?new=1" className="hdr-link">Generate New SOP</a>}
          <OrganizationSwitcher afterSelectOrganizationUrl="/portal" afterCreateOrganizationUrl="/portal" />
          <UserButton />
        </div>
      </header>

      <div className="page">
        {activeSop ? (
          <SOPDetail
            sop={activeSop}
            signoffs={signoffs.filter(s => s.sop_id === activeSop.id)}
            canManage={canManage}
            orgId={organization?.id}
            onBack={() => setActiveSop(null)}
            onSaved={(updated: SOP) => {
              setSops(prev => prev.map(x => (x.id === updated.id ? updated : x)));
              setActiveSop(updated);
            }}
          />
        ) : (
          <>
            <div className="welcome-row">
              <div>
                <h1 className="welcome-title">Good {getTimeOfDay()}, {user?.firstName || "there"}.</h1>
                <p className="welcome-sub">
                  {loading ? "Loading your library..." : `${sops.length} SOP${sops.length === 1 ? "" : "s"} in your library`}
                </p>
              </div>
              {subStatus === "active" || subStatus === "trialing" ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div className="welcome-badge"><span className="badge-dot" />Active subscription</div>
                  {canManage && (
                    <button className="empty-btn" disabled={checkoutBusy} onClick={openBilling}>Manage billing</button>
                  )}
                  {checkoutError && <span style={{ color: "#b3261e", fontSize: 13 }}>{checkoutError}</span>}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="welcome-badge" style={{ opacity: 0.8 }}>
                    {subStatus === "past_due" ? "Payment past due" : subStatus === "canceled" ? "Subscription canceled" : "No active subscription"}
                  </span>
                  {canManage && (
                    <>
                      <button className="empty-btn" disabled={checkoutBusy} onClick={() => startCheckout("core")}>Subscribe: Pro $1,499/mo</button>
                      <button className="empty-btn" disabled={checkoutBusy} onClick={() => startCheckout("premium")}>Concierge $2,500/mo</button>
                    </>
                  )}
                  {checkoutError && <span style={{ color: "#b3261e", fontSize: 13 }}>{checkoutError}</span>}
                </div>
              )}
            </div>

            {!loading && sops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">Your library is empty.</div>
                <p className="empty-text">
                  {!canManage
                    ? "Your library is empty. An admin on your team can add the first SOP."
                    : subscribed
                    ? "Generate your first SOP and it will save here automatically."
                    : "Subscribe above to start building your library. Your SOPs will save here automatically."}
                </p>
                {canManage && subscribed && <a href="/?new=1" className="empty-btn">Generate Your First SOP</a>}
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
                      <p className={`card-signed ${signoffCounts[sop.id] ? "has" : ""}`}>
                        {signoffCounts[sop.id] ? `${signoffCounts[sop.id]} staff sign-off${signoffCounts[sop.id] === 1 ? "" : "s"}` : "No sign-offs yet"}
                      </p>
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
        .card-signed { font-family: 'Helvetica Neue', sans-serif; font-size: 12px; color: #b5a49a; }
        .card-signed.has { color: #4f8a67; font-weight: 600; }
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

function SOPDetail({ sop, signoffs, canManage, orgId, onBack, onSaved }: {
  sop: SOP; signoffs: Signoff[]; canManage: boolean; orgId?: string; onBack: () => void; onSaved: (s: SOP) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [draft, setDraft] = useState<{ title: string; owner: string; purpose: string; scope: string; sections: { heading: string; steps: string[] }[] }>({
    title: "", owner: "", purpose: "", scope: "", sections: [],
  });

  const isCurrent = (s: Signoff) => !sop.edited_at || new Date(s.signed_at) >= new Date(sop.edited_at);
  const currentCount = signoffs.filter(isCurrent).length;
  const outdatedCount = signoffs.length - currentCount;

  function startEdit() {
    setDraft({
      title: sop.title || "",
      owner: sop.owner || "",
      purpose: sop.purpose || "",
      scope: sop.scope || "",
      sections: (Array.isArray(sop.sections) ? sop.sections : []).map((sec: any) => ({
        heading: sec.heading || "",
        steps: Array.isArray(sec.steps) ? [...sec.steps] : [],
      })),
    });
    setEditError("");
    setEditing(true);
  }

  function setSection(i: number, patch: Partial<{ heading: string; steps: string[] }>) {
    setDraft(d => ({ ...d, sections: d.sections.map((sec, k) => (k === i ? { ...sec, ...patch } : sec)) }));
  }

  async function saveEdit() {
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/sops/${sop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(orgId ? { "x-org-id": orgId } : {}) },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok || !json.sop) throw new Error(json.error || "Could not save your changes.");
      onSaved(json.sop);
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message || "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/signoff/${sop.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="detail-wrap">
      <button onClick={onBack} className="back-btn">← Back to library</button>
      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-cat">{sop.category}</div>
          <h1 className="detail-title">{sop.title}</h1>
          {sop.owner && <div className="detail-owner">Owner: <span>{sop.owner}</span></div>}
          {sop.edited_at && <div className="detail-owner">Last edited {formatDateTime(sop.edited_at)}</div>}
          {canManage && !editing && <button className="edit-btn" onClick={startEdit}>Edit this SOP</button>}
        </div>
        <div className="detail-body">
          <div className="so-block">
            <div className="so-head">
              <div>
                <div className="detail-label">Staff sign-offs</div>
                <div className="so-count">{signoffs.length === 0 ? "No one has signed off yet" : `${currentCount} signed`}</div>
                {outdatedCount > 0 && <div className="so-note">{outdatedCount} signed an earlier version and need to sign again. They can use the same link.</div>}
              </div>
              <button className="so-copy" onClick={copyLink}>{copied ? "✓ Link copied" : "Copy sign-off link"}</button>
            </div>
            {signoffs.length > 0 && (
              <div className="so-scroll">
                <table className="so-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Signed</th></tr>
                  </thead>
                  <tbody>
                    {signoffs.map(s => (
                      <tr key={s.id}>
                        <td>{s.staff_name}</td>
                        <td>{s.staff_email}</td>
                        <td>{formatDateTime(s.signed_at)}{!isCurrent(s) && <span className="so-old"> · before last edit</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {editing && (
            <div className="edit-form">
              <label className="ef-label">Title</label>
              <input className="ef-input" value={draft.title} maxLength={200} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
              <label className="ef-label">Owner</label>
              <input className="ef-input" value={draft.owner} maxLength={200} onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))} />
              <label className="ef-label">Purpose</label>
              <textarea className="ef-input" rows={3} value={draft.purpose} maxLength={1500} onChange={e => setDraft(d => ({ ...d, purpose: e.target.value }))} />
              <label className="ef-label">Scope</label>
              <textarea className="ef-input" rows={2} value={draft.scope} maxLength={1500} onChange={e => setDraft(d => ({ ...d, scope: e.target.value }))} />
              {draft.sections.map((sec, i) => (
                <div key={i} className="ef-section">
                  <div className="ef-row">
                    <input className="ef-input" placeholder="Section heading" value={sec.heading} maxLength={200} onChange={e => setSection(i, { heading: e.target.value })} />
                    <button className="ef-del" onClick={() => setDraft(d => ({ ...d, sections: d.sections.filter((_, k) => k !== i) }))}>Remove section</button>
                  </div>
                  {sec.steps.map((step, j) => (
                    <div key={j} className="ef-row">
                      <span className="step-num">{j + 1}</span>
                      <textarea className="ef-input" rows={2} value={step} maxLength={1000} onChange={e => setSection(i, { steps: sec.steps.map((x, k) => (k === j ? e.target.value : x)) })} />
                      <button className="ef-del" onClick={() => setSection(i, { steps: sec.steps.filter((_, k) => k !== j) })}>Remove</button>
                    </div>
                  ))}
                  <button className="ef-add" onClick={() => setSection(i, { steps: [...sec.steps, ""] })}>+ Add step</button>
                </div>
              ))}
              <button className="ef-add" onClick={() => setDraft(d => ({ ...d, sections: [...d.sections, { heading: "", steps: [""] }] }))}>+ Add section</button>
              {signoffs.length > 0 && <p className="ef-warn">Saving marks earlier staff sign-offs as signed before the last edit, so your team knows to sign the new version.</p>}
              {editError && <p className="ef-err">{editError}</p>}
              <div className="ef-actions">
                <button className="ef-save" disabled={saving} onClick={saveEdit}>{saving ? "Saving..." : "Save changes"}</button>
                <button className="ef-cancel" disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          )}
          {!editing && sop.purpose && (
            <div className="detail-purpose">
              <div className="detail-label">Purpose</div>
              <p>{sop.purpose}</p>
              {sop.scope && <p className="detail-scope"><strong>Scope:</strong> {sop.scope}</p>}
            </div>
          )}
          {!editing && Array.isArray(sop.sections) && sop.sections.map((sec: any, i: number) => (
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
        .edit-btn { margin-top: 18px; padding: 10px 16px; background: transparent; border: 1px solid #c4a886; border-radius: 2px; color: #c4a886; font-family: inherit; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; }
        .edit-btn:hover { background: #c4a886; color: #2c2420; }
        .so-note { font-size: 12px; color: #a0522d; margin-top: 6px; max-width: 420px; line-height: 1.5; }
        .so-old { color: #a0522d; font-size: 11px; }
        .edit-form { margin-bottom: 32px; }
        .ef-label { display: block; font-size: 11px; color: #8b6f5e; letter-spacing: .1em; text-transform: uppercase; font-weight: 600; margin: 14px 0 6px; }
        .ef-input { width: 100%; border: 1px solid #e8e0d4; border-radius: 2px; padding: 10px 12px; font-family: inherit; font-size: 14px; line-height: 1.5; color: #2c2420; background: #fff; resize: vertical; }
        .ef-input:focus { outline: none; border-color: #8b6f5e; }
        .ef-section { border: 1px solid #e8e0d4; border-radius: 4px; padding: 16px; margin-top: 18px; background: #faf8f5; }
        .ef-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
        .ef-del, .ef-add, .ef-cancel { background: none; border: none; color: #8b7b74; font-family: inherit; font-size: 12px; cursor: pointer; padding: 6px 4px; white-space: nowrap; }
        .ef-del:hover, .ef-add:hover, .ef-cancel:hover { color: #8b6f5e; }
        .ef-add { margin-top: 6px; }
        .ef-warn { font-size: 12px; color: #8b7b74; margin-top: 18px; line-height: 1.5; }
        .ef-err { font-size: 13px; color: #b3261e; margin-top: 12px; }
        .ef-actions { display: flex; gap: 12px; align-items: center; margin-top: 20px; }
        .ef-save { padding: 12px 22px; background: #8b6f5e; color: #faf8f5; border: none; border-radius: 2px; font-family: inherit; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; }
        .ef-save:disabled { opacity: .6; cursor: default; }
        .so-block { border: 1px solid #e8e0d4; border-radius: 4px; padding: 20px; margin-bottom: 32px; }
        .so-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .so-count { font-family: 'Georgia', serif; font-size: 20px; color: #2c2420; }
        .so-copy { padding: 10px 16px; background: transparent; border: 1px solid #e8e0d4; border-radius: 2px; color: #8b7b74; font-family: inherit; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; cursor: pointer; }
        .so-copy:hover { border-color: #8b6f5e; color: #8b6f5e; }
        .so-scroll { overflow-x: auto; margin-top: 16px; }
        .so-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .so-table th { text-align: left; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #8b6f5e; padding: 8px 12px 8px 0; border-bottom: 1px solid #e8e0d4; }
        .so-table td { padding: 10px 12px 10px 0; border-bottom: 1px solid #f1ebe2; color: #2c2420; white-space: nowrap; }
      `}</style>
    </div>
  );
}
