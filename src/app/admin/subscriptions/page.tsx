"use client";

import { useState } from "react";

interface Subscription {
  id: string;
  user_name: string;
  user_email: string;
  start_date: string;
  months_subscribed: number;
  status: "active" | "cancelled" | "past_due";
  last_scan: string;
  cancelled_at?: string;
}

const MOCK_SUBS: Subscription[] = [
  { id: "s1", user_name: "James K.", user_email: "james@example.com", start_date: "Mar 1, 2026", months_subscribed: 1, status: "active", last_scan: "Apr 11, 2026" },
  { id: "s2", user_name: "David R.", user_email: "david@example.com", start_date: "Feb 15, 2026", months_subscribed: 2, status: "active", last_scan: "Apr 11, 2026" },
  { id: "s3", user_name: "Nina T.", user_email: "nina@example.com", start_date: "Jan 10, 2026", months_subscribed: 3, status: "cancelled", last_scan: "Mar 15, 2026", cancelled_at: "Apr 5, 2026" },
];

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<"active" | "cancelled">("active");
  const [subs] = useState<Subscription[]>(MOCK_SUBS);
  const [scanSent, setScanSent] = useState(false);

  const active = subs.filter((s) => s.status === "active");
  const cancelled = subs.filter((s) => s.status === "cancelled");
  const mrr = active.length * 7.99;
  const churnRate = subs.length > 0 ? Math.round((cancelled.length / subs.length) * 100) : 0;

  const displayed = tab === "active" ? active : cancelled;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>ClaimWatch</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitoring subscription management</p>
        </div>
        <button
          onClick={() => { setScanSent(true); setTimeout(() => setScanSent(false), 3000); }}
          className="px-4 py-2 rounded text-sm font-semibold text-white transition-colors" style={{ background: "#10B981" }}
        >
          {scanSent ? "Scan sent!" : "Send monthly scan to all"}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Active subscribers</p>
          <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: "#10B981" }}>{active.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">MRR</p>
          <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: "#0A2540" }}>${mrr.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Churn rate</p>
          <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: "#0A2540" }}>{churnRate}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-4 w-fit">
        {(["active", "cancelled"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-xs font-semibold capitalize transition-colors ${tab === t ? "bg-navy text-white" : "text-slate-500 hover:text-navy"}`}
            style={tab === t ? { background: "#0A2540" } : {}}
          >
            {t === "active" ? `Active (${active.length})` : `Cancelled (${cancelled.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Started</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Months</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last scan</th>
              {tab === "cancelled" && <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelled</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {displayed.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{s.user_name}</p>
                  <p className="text-xs text-slate-400">{s.user_email}</p>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.start_date}</td>
                <td className="px-4 py-3 text-navy font-semibold">{s.months_subscribed}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "#10B981" }}>${(s.months_subscribed * 7.99).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.last_scan}</td>
                {tab === "cancelled" && <td className="px-4 py-3 text-slate-500 text-xs">{s.cancelled_at ?? "—"}</td>}
                <td className="px-4 py-3">
                  {tab === "active" && (
                    <button className="text-xs px-2 py-1 rounded border border-slate-200 text-navy hover:bg-slate-50 transition-colors">Send scan</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No {tab} subscriptions.</div>
        )}
      </div>
    </div>
  );
}
