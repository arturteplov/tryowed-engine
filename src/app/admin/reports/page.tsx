"use client";

import { useState } from "react";

type Period = "daily" | "weekly" | "monthly" | "quarterly";

const REVENUE_BREAKDOWN = [
  { source: "Filing Fees (20%)",  amount: 0, color: "#10B981" },
  { source: "Priority Filings",   amount: 0, color: "#0A2540" },
  { source: "ClaimWatch MRR",     amount: 0, color: "#2563eb" },
  { source: "CPA Referrals",      amount: 0, color: "#d97706" },
  { source: "Audit Reports",      amount: 0, color: "#7c3aed" },
];

const KPI_ROWS = [
  { label: "Average revenue per user",   value: "$0" },
  { label: "Average claim size",          value: "$0" },
  { label: "Claim success rate",          value: "0%" },
  { label: "Avg. claim processing time",  value: "— weeks" },
  { label: "LTV (estimated)",             value: "$0" },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Financial Reports</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {(["daily", "weekly", "monthly", "quarterly"] as Period[]).map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${period === p ? "bg-navy text-white" : "text-slate-500 hover:text-navy"}`}
                style={period === p ? { background: "#0A2540" } : {}}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="px-3 py-2 rounded text-xs font-semibold border border-slate-200 text-navy hover:bg-slate-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Revenue over time</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-center" style={{ height: 220 }}>
          <div className="text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" className="mx-auto mb-3">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p className="text-sm text-slate-400">Connect Supabase to see {period} revenue chart.</p>
          </div>
        </div>
      </section>

      {/* Revenue breakdown */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Revenue by source</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">% of total</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_BREAKDOWN.map((r) => (
                <tr key={r.source} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    {r.source}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-navy">${r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-400">—%</td>
                </tr>
              ))}
              <tr className="bg-slate-50 border-t border-slate-200">
                <td className="px-4 py-3 font-semibold text-navy">Total</td>
                <td className="px-4 py-3 text-right font-semibold text-navy">$0</td>
                <td className="px-4 py-3 text-right font-semibold text-navy">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* KPIs */}
      <section>
        <h2 className="text-base font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Key metrics</h2>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {KPI_ROWS.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-navy">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
