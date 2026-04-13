"use client";

import { useState } from "react";

type ReferralStatus = "referred" | "contacted" | "filed" | "fee_received";

interface Referral {
  id: string;
  user_name: string;
  user_email: string;
  unfiled_years: string[];
  date_referred: string;
  status: ReferralStatus;
  referral_fee?: number;
}

const MOCK_REFERRALS: Referral[] = [
  { id: "r1", user_name: "Sarah M.", user_email: "sarah@example.com", unfiled_years: ["2021", "2022"], date_referred: "Apr 10, 2026", status: "referred" },
  { id: "r2", user_name: "James K.", user_email: "james@example.com", unfiled_years: ["2020", "2021", "2022"], date_referred: "Apr 9, 2026", status: "contacted" },
  { id: "r3", user_name: "Maria C.", user_email: "maria@example.com", unfiled_years: ["2022"], date_referred: "Mar 28, 2026", status: "filed" },
  { id: "r4", user_name: "Tom B.", user_email: "tom@example.com", unfiled_years: ["2019", "2020"], date_referred: "Feb 20, 2026", status: "fee_received", referral_fee: 65 },
];

const STATUS_CFG: Record<ReferralStatus, { label: string; color: string }> = {
  referred:     { label: "Referred",     color: "#64748b" },
  contacted:    { label: "CPA Contacted", color: "#2563eb" },
  filed:        { label: "User Filed",   color: "#16a34a" },
  fee_received: { label: "Fee Received", color: "#10B981" },
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);

  const totalRevenue = referrals.filter((r) => r.status === "fee_received").reduce((s, r) => s + (r.referral_fee ?? 0), 0);

  const updateStatus = (id: string, status: ReferralStatus, fee?: number) => {
    setReferrals((prev) => prev.map((r) => r.id === id ? { ...r, status, referral_fee: fee ?? r.referral_fee } : r));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>CPA Referrals</h1>
          <p className="text-sm text-slate-400 mt-0.5">Users with unfiled tax returns referred to partner CPAs</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-right">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: "#10B981" }}>${totalRevenue}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unfiled Years</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Referred</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => {
              const cfg = STATUS_CFG[r.status];
              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{r.user_name}</p>
                    <p className="text-xs text-slate-400">{r.user_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.unfiled_years.map((y) => (
                        <span key={y} className="text-xs px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-semibold">{y}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{r.date_referred}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: cfg.color, background: cfg.color + "18" }}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.referral_fee ? (
                      <span className="font-semibold text-sm" style={{ color: "#10B981" }}>${r.referral_fee}</span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.status !== "fee_received" && (
                      <div className="flex gap-2">
                        {r.status === "referred" && (
                          <button onClick={() => updateStatus(r.id, "contacted")} className="text-xs px-2 py-1 rounded border border-slate-200 text-navy hover:bg-slate-50 transition-colors">Mark Contacted</button>
                        )}
                        {r.status === "contacted" && (
                          <button onClick={() => updateStatus(r.id, "filed")} className="text-xs px-2 py-1 rounded border border-slate-200 text-navy hover:bg-slate-50 transition-colors">Mark Filed</button>
                        )}
                        {r.status === "filed" && (
                          <button onClick={() => updateStatus(r.id, "fee_received", 65)} className="text-xs px-2 py-1 rounded text-white transition-colors" style={{ background: "#10B981" }}>Mark Fee Received ($65)</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
