"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClaimStatus = "queued" | "filing" | "submitted" | "processing" | "approved" | "paid" | "rejected" | "needs_info";

interface Claim {
  id: string;
  name: string;
  category: string;
  estimated_amount: number;
  actual_amount?: number;
  status: ClaimStatus;
  is_priority: boolean;
  timeline: string;
  updated_at: string;
  detail?: string;
  reference?: string;
  needs_info_reason?: string;
  user_confirmed_receipt?: boolean;
  fee_charged?: boolean;
}

// ─── Mock data (replaced by real Supabase queries when connected) ─────────────

const MOCK_CLAIMS: Claim[] = [
  { id: "c1", name: "Earned Income Tax Credit", category: "Federal Tax Credit", estimated_amount: 2800, status: "filing", is_priority: true, timeline: "Typically 8–12 weeks", updated_at: "Today", detail: "We are preparing your amended return with the IRS." },
  { id: "c2", name: "State Unclaimed Property", category: "Unclaimed Property", estimated_amount: 1200, status: "submitted", is_priority: false, timeline: "Typically 4–8 weeks", updated_at: "3 days ago", detail: "Claim submitted to California State Controller's Office.", reference: "CA-2026-8821" },
  { id: "c3", name: "Child Tax Credit (Amended)", category: "Federal Tax Credit", estimated_amount: 2000, actual_amount: 1980, status: "paid", is_priority: false, timeline: "Completed", updated_at: "1 week ago", detail: "Funds deposited. Awaiting your confirmation.", user_confirmed_receipt: false },
  { id: "c4", name: "State Renter Credit", category: "State Tax Credit", estimated_amount: 400, status: "needs_info", is_priority: false, timeline: "Paused", updated_at: "2 days ago", needs_info_reason: "We need a copy of your lease agreement for 2024 to complete this claim.", detail: "Please upload your lease agreement to proceed." },
  { id: "c5", name: "American Opportunity Tax Credit", category: "Federal Tax Credit", estimated_amount: 2500, status: "queued", is_priority: false, timeline: "Typically 8–16 weeks", updated_at: "Today" },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string; dot: string }> = {
  queued:     { label: "Queued",     color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
  filing:     { label: "Filing",     color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  submitted:  { label: "Submitted",  color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" },
  processing: { label: "Processing", color: "#ea580c", bg: "#fff7ed", dot: "#f97316" },
  approved:   { label: "Approved",   color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e" },
  paid:       { label: "Paid",       color: "#10B981", bg: "#ecfdf5", dot: "#10B981" },
  rejected:   { label: "Rejected",   color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
  needs_info: { label: "Needs Info", color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
};

// ─── Claim Card ───────────────────────────────────────────────────────────────

function ClaimCard({ claim, onConfirmReceipt }: { claim: Claim; onConfirmReceipt: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[claim.status];

  return (
    <div className="border border-slate-200 rounded overflow-hidden bg-white">
      <button type="button" onClick={() => setExpanded((o) => !o)} className="w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-navy text-sm" style={{ fontFamily: "var(--font-fraunces)" }}>{claim.name}</p>
              {claim.is_priority && (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded text-white" style={{ background: "#d97706" }}>PRIORITY</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{claim.category}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="font-semibold text-sm" style={{ color: "#10B981" }}>
              ~${(claim.actual_amount ?? claim.estimated_amount).toLocaleString()}
            </p>
            <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>{claim.timeline}</span>
          <span>Updated {claim.updated_at}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 text-sm text-slate-600 space-y-3">
          {claim.detail && <p>{claim.detail}</p>}
          {claim.reference && <p className="text-xs">Reference: <span className="font-mono font-semibold text-navy">{claim.reference}</span></p>}

          {/* Needs Info */}
          {claim.status === "needs_info" && claim.needs_info_reason && (
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <p className="text-xs font-semibold text-purple-700 mb-1">Action required</p>
              <p className="text-xs text-purple-600 mb-3">{claim.needs_info_reason}</p>
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-purple-300 rounded py-3 text-center text-xs text-purple-500 hover:border-purple-500 transition-colors">
                  Upload document
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>
          )}

          {/* Confirm receipt */}
          {claim.status === "paid" && !claim.user_confirmed_receipt && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
              <p className="text-sm font-semibold text-navy mb-1">Did you receive this money?</p>
              <p className="text-xs text-slate-600 mb-3">
                We believe ${(claim.actual_amount ?? claim.estimated_amount).toLocaleString()} has been deposited. Please confirm so we can process our fee.
              </p>
              <div className="flex gap-2">
                <button onClick={() => onConfirmReceipt(claim.id)} className="flex-1 py-2 rounded text-xs font-semibold text-white transition-colors" style={{ background: "#10B981" }}>
                  Yes, I received it
                </button>
                <button className="px-3 py-2 rounded text-xs text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors">
                  Not yet
                </button>
                <button className="px-3 py-2 rounded text-xs text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  Problem
                </button>
              </div>
            </div>
          )}

          {claim.status === "paid" && claim.user_confirmed_receipt && (
            <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-2 flex items-center gap-2 text-xs text-emerald-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Receipt confirmed. Fee charged.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ClaimWatch Banner ────────────────────────────────────────────────────────

function ClaimWatchBanner({ successAmount, profileId }: { successAmount: number; profileId: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-[#0A2540] rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-1">
        <p className="text-white font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>
          ${successAmount.toLocaleString()} deposited. Want us to keep watching?
        </p>
        <p className="text-slate-400 text-sm mt-1">New unclaimed property, settlements, and benefits appear regularly. We&apos;ll notify you instantly when something new matches your profile.</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button className="px-4 py-2 rounded font-semibold text-white text-sm transition-colors hover:opacity-90" style={{ background: "#10B981" }}>
          ClaimWatch — $7.99/mo
        </button>
        <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: accent ? "#10B981" : "#0A2540" }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage({ params }: { params: Promise<{ profile_id: string }> }) {
  const [profileId, setProfileId] = useState("");
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [activeNav, setActiveNav] = useState<"claims" | "account" | "help">("claims");

  useEffect(() => { params.then((p) => setProfileId(p.profile_id)); }, [params]);

  const totalEstimated = claims.reduce((s, c) => s + c.estimated_amount, 0);
  const totalRecovered = claims.filter((c) => c.status === "paid" && c.user_confirmed_receipt).reduce((s, c) => s + (c.actual_amount ?? 0), 0);
  const feeOwed = claims.filter((c) => c.status === "paid" && !c.fee_charged).reduce((s, c) => s + (c.actual_amount ?? 0) * 0.20, 0);
  const activeClaims = claims.filter((c) => !["paid", "rejected"].includes(c.status)).length;
  const hasPaidClaim = claims.some((c) => c.status === "paid");
  const paidAmount = claims.filter((c) => c.status === "paid").reduce((s, c) => s + (c.actual_amount ?? 0), 0);

  const handleConfirmReceipt = (claimId: string) => {
    setClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, user_confirmed_receipt: true } : c));
    // In production: POST to /api/confirm-receipt → charge Stripe
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>

      {/* Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
          <nav className="flex items-center gap-1">
            {(["claims", "account", "help"] as const).map((tab) => (
              <button
                key={tab} type="button" onClick={() => setActiveNav(tab)}
                className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition-colors ${activeNav === tab ? "bg-navy text-white" : "text-slate-500 hover:text-navy"}`}
                style={activeNav === tab ? { background: "#0A2540" } : {}}
              >
                {tab === "claims" ? "My Claims" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        {/* ClaimWatch success banner */}
        {hasPaidClaim && <ClaimWatchBanner successAmount={paidAmount} profileId={profileId} />}

        {/* Claims tab */}
        {activeNav === "claims" && (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <MetricCard label="Estimated Recovery" value={`$${totalEstimated.toLocaleString()}`} sub="across all claims" accent />
              <MetricCard label="Recovered So Far" value={`$${totalRecovered.toLocaleString()}`} sub="confirmed" />
              <MetricCard label="Claims Filed" value={String(activeClaims)} sub="active" />
              {feeOwed > 0 && <MetricCard label="Our Fee (20%)" value={`$${Math.round(feeOwed).toLocaleString()}`} sub="due on confirmation" />}
            </div>

            {/* Claims list */}
            <h2 className="text-lg font-semibold text-navy mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>Your claims</h2>
            <div className="flex flex-col gap-3 mb-10">
              {claims.map((c) => <ClaimCard key={c.id} claim={c} onConfirmReceipt={handleConfirmReceipt} />)}
            </div>

            {/* Audit report upsell */}
            <div className="border border-slate-200 rounded-lg p-5 bg-white flex items-start gap-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2540" strokeWidth="1.75" className="shrink-0 mt-0.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-navy text-sm" style={{ fontFamily: "var(--font-fraunces)" }}>Financial Audit Report — $24</p>
                <p className="text-sm text-slate-500 mt-1">Full breakdown of what we checked, what you qualify for, and tax optimization tips for next year.</p>
                <button className="mt-3 px-4 py-2 rounded text-sm font-semibold text-navy border border-navy hover:bg-navy hover:text-white transition-colors">
                  Buy report
                </button>
              </div>
            </div>
          </>
        )}

        {/* Account tab */}
        {activeNav === "account" && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-navy mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>Account</h2>
            <div className="flex flex-col gap-4 text-sm text-slate-600">
              <div><p className="text-xs text-slate-400 mb-1">Profile ID</p><p className="font-mono text-xs text-slate-500">{profileId}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Payment method</p><p>Visa ending in 4242</p></div>
              <div><p className="text-xs text-slate-400 mb-1">ClaimWatch</p><p>Not subscribed · <button className="underline text-navy">Subscribe for $7.99/mo</button></p></div>
              <button className="mt-2 text-sm text-red-400 hover:text-red-600 transition-colors text-left">Request data deletion</button>
            </div>
          </div>
        )}

        {/* Help tab */}
        {activeNav === "help" && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-navy mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>Help</h2>
            <div className="flex flex-col gap-4 text-sm text-slate-600">
              <p>Questions about your claims? Email us at <a href="mailto:support@owed.com" className="underline text-navy">support@owed.com</a></p>
              <p>We respond within <strong>24 hours</strong> on business days.</p>
              <Link href="/#faq" className="underline text-navy">View FAQ →</Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
