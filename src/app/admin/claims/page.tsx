"use client";

import { useState } from "react";

type ClaimStatus = "queued" | "filing" | "submitted" | "processing" | "approved" | "paid" | "rejected" | "needs_info";

interface AdminClaim {
  id: string;
  user_name: string;
  user_email: string;
  ssn_last4: string;
  claim_type: string;
  source: string;
  estimated_amount: number;
  actual_amount?: number;
  status: ClaimStatus;
  is_priority: boolean;
  submitted_date: string;
  filed_at?: string;
  days_since_filed?: number;
  notes?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CLAIMS: AdminClaim[] = [
  { id: "c1", user_name: "Sarah M.", user_email: "sarah@example.com", ssn_last4: "4521", claim_type: "Earned Income Tax Credit", source: "IRS", estimated_amount: 2800, status: "queued", is_priority: true, submitted_date: "Apr 10, 2026" },
  { id: "c2", user_name: "James K.", user_email: "james@example.com", ssn_last4: "8834", claim_type: "State Unclaimed Property", source: "CA Treasury", estimated_amount: 1200, status: "filing", is_priority: false, submitted_date: "Apr 9, 2026" },
  { id: "c3", user_name: "Lena P.", user_email: "lena@example.com", ssn_last4: "2290", claim_type: "Child Tax Credit", source: "IRS", estimated_amount: 2000, status: "submitted", is_priority: false, submitted_date: "Mar 28, 2026", filed_at: "Apr 1, 2026", days_since_filed: 10 },
  { id: "c4", user_name: "David R.", user_email: "david@example.com", ssn_last4: "6612", claim_type: "State Renter Credit", source: "CA FTB", estimated_amount: 400, status: "approved", is_priority: false, submitted_date: "Mar 15, 2026", filed_at: "Mar 20, 2026", days_since_filed: 22 },
  { id: "c5", user_name: "Maria C.", user_email: "maria@example.com", ssn_last4: "1177", claim_type: "AOTC Credit", source: "IRS", estimated_amount: 2500, actual_amount: 2480, status: "paid", is_priority: false, submitted_date: "Feb 20, 2026", filed_at: "Feb 24, 2026", days_since_filed: 45 },
  { id: "c6", user_name: "Tom B.", user_email: "tom@example.com", ssn_last4: "9901", claim_type: "EITC", source: "IRS", estimated_amount: 1800, status: "rejected", is_priority: false, submitted_date: "Mar 1, 2026", notes: "Income documentation mismatch — W-2 not found in IRS records." },
];

type TabId = "needs_filing" | "submitted" | "approved" | "paid_pending" | "completed" | "rejected";

const TABS: { id: TabId; label: string; statuses: ClaimStatus[] }[] = [
  { id: "needs_filing",  label: "Needs Filing",        statuses: ["queued", "filing"] },
  { id: "submitted",     label: "Submitted — Waiting", statuses: ["submitted", "processing"] },
  { id: "approved",      label: "Approved",            statuses: ["approved"] },
  { id: "paid_pending",  label: "Paid — Pending Fee",  statuses: ["paid"] },
  { id: "completed",     label: "Completed",           statuses: [] },
  { id: "rejected",      label: "Rejected",            statuses: ["rejected"] },
];

const STATUS_COLOR: Record<ClaimStatus, string> = {
  queued: "#64748b", filing: "#2563eb", submitted: "#d97706", processing: "#ea580c",
  approved: "#16a34a", paid: "#10B981", rejected: "#dc2626", needs_info: "#7c3aed",
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  const labels: Record<ClaimStatus, string> = {
    queued: "Queued", filing: "Filing", submitted: "Submitted", processing: "Processing",
    approved: "Approved", paid: "Paid", rejected: "Rejected", needs_info: "Needs Info",
  };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: STATUS_COLOR[status], background: STATUS_COLOR[status] + "18" }}>
      {labels[status]}
    </span>
  );
}

function ClaimDetail({ claim, onClose, onUpdateStatus }: { claim: AdminClaim; onClose: () => void; onUpdateStatus: (id: string, s: ClaimStatus) => void }) {
  const [note, setNote] = useState(claim.notes ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-navy text-base" style={{ fontFamily: "var(--font-fraunces)" }}>{claim.claim_type}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{claim.user_name} · SSN ···{claim.ssn_last4}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-navy transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Source</p><p className="font-medium text-navy">{claim.source}</p></div>
            <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Estimated</p><p className="font-medium text-navy">${claim.estimated_amount.toLocaleString()}</p></div>
            <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Status</p><StatusBadge status={claim.status} /></div>
            <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Priority</p><p className="font-medium text-navy">{claim.is_priority ? "Yes" : "No"}</p></div>
          </div>

          {/* Status actions */}
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Actions</p>
            <div className="flex flex-wrap gap-2">
              {claim.status === "queued" || claim.status === "filing" ? (
                <button onClick={() => onUpdateStatus(claim.id, "submitted")} className="px-3 py-2 rounded text-xs font-semibold text-white transition-colors" style={{ background: "#10B981" }}>Mark as Filed</button>
              ) : null}
              {claim.status === "submitted" || claim.status === "processing" ? (
                <>
                  <button onClick={() => onUpdateStatus(claim.id, "approved")} className="px-3 py-2 rounded text-xs font-semibold text-white" style={{ background: "#16a34a" }}>Mark Approved</button>
                  <button onClick={() => onUpdateStatus(claim.id, "rejected")} className="px-3 py-2 rounded text-xs font-semibold text-white bg-red-500">Reject</button>
                </>
              ) : null}
              {claim.status === "approved" ? (
                <button onClick={() => onUpdateStatus(claim.id, "paid")} className="px-3 py-2 rounded text-xs font-semibold text-white" style={{ background: "#10B981" }}>Mark as Paid</button>
              ) : null}
              <button onClick={() => onUpdateStatus(claim.id, "needs_info")} className="px-3 py-2 rounded text-xs font-semibold text-white bg-purple-600">Request Info</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Internal notes</p>
            <textarea
              rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about this claim..."
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
            <button className="mt-1 text-xs text-slate-500 hover:text-navy transition-colors">Save note</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminClaimsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("needs_filing");
  const [claims, setClaims] = useState<AdminClaim[]>(MOCK_CLAIMS);
  const [selected, setSelected] = useState<AdminClaim | null>(null);

  const tab = TABS.find((t) => t.id === activeTab)!;
  const filtered = claims.filter((c) => {
    if (activeTab === "completed") return c.status === "paid" && c.actual_amount;
    return tab.statuses.includes(c.status);
  }).sort((a, b) => {
    if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
    return b.estimated_amount - a.estimated_amount;
  });

  const updateStatus = (id: string, status: ClaimStatus) => {
    setClaims((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    setSelected(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-navy mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>Claims queue</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => {
          const count = claims.filter((c) => {
            if (t.id === "completed") return c.status === "paid" && c.actual_amount;
            return t.statuses.includes(c.status);
          }).length;
          return (
            <button
              key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === t.id ? "bg-navy text-white" : "text-slate-500 hover:text-navy"}`}
              style={activeTab === t.id ? { background: "#0A2540" } : {}}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? "bg-white/20" : "bg-slate-100"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Claims table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
          <p className="text-sm text-slate-400">No claims in this category yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Claim</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{c.user_name}</p>
                    <p className="text-xs text-slate-400">{c.user_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-navy">{c.claim_type}</p>
                      {c.is_priority && <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ background: "#d97706" }}>PRIORITY</span>}
                    </div>
                    <p className="text-xs text-slate-400">{c.source}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "#10B981" }}>${c.estimated_amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.submitted_date}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(c)} className="text-xs text-navy underline hover:text-emerald-600 transition-colors">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <ClaimDetail claim={selected} onClose={() => setSelected(null)} onUpdateStatus={updateStatus} />}
    </div>
  );
}
