"use client";

import { useState } from "react";

interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  state: string;
  signup_date: string;
  total_estimated: number;
  total_recovered: number;
  total_fees_paid: number;
  claimwatch: boolean;
  claims_count: number;
  cpa_referred: boolean;
}

const MOCK_USERS: AdminUser[] = [
  { id: "u1", first_name: "Sarah", last_name: "M.", email: "sarah@example.com", state: "CA", signup_date: "Apr 10, 2026", total_estimated: 8900, total_recovered: 1980, total_fees_paid: 396, claimwatch: false, claims_count: 4, cpa_referred: true },
  { id: "u2", first_name: "James", last_name: "K.", email: "james@example.com", state: "TX", signup_date: "Apr 9, 2026", total_estimated: 3200, total_recovered: 0, total_fees_paid: 0, claimwatch: true, claims_count: 2, cpa_referred: false },
  { id: "u3", first_name: "Lena",  last_name: "P.", email: "lena@example.com",  state: "NY", signup_date: "Mar 28, 2026", total_estimated: 1500, total_recovered: 0, total_fees_paid: 0, claimwatch: false, claims_count: 1, cpa_referred: false },
  { id: "u4", first_name: "David", last_name: "R.", email: "david@example.com", state: "FL", signup_date: "Mar 15, 2026", total_estimated: 4100, total_recovered: 400, total_fees_paid: 80, claimwatch: true, claims_count: 3, cpa_referred: false },
];

type SortKey = keyof Pick<AdminUser, "signup_date" | "total_estimated" | "total_recovered" | "total_fees_paid" | "claims_count">;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("signup_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [note, setNote] = useState("");

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("desc"); }
  };

  const filtered = MOCK_USERS
    .filter((u) => {
      const q = search.toLowerCase();
      return !q || u.first_name.toLowerCase().includes(q) || u.last_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.state.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortBy]; const bv = b[sortBy];
      const cmp = typeof av === "number" ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const Th = ({ label, sortKey }: { label: string; sortKey?: SortKey }) => (
    <th
      className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${sortKey ? "cursor-pointer hover:text-navy select-none" : ""}`}
      onClick={() => sortKey && toggleSort(sortKey)}
    >
      {label} {sortKey && sortBy === sortKey && (sortDir === "asc" ? "↑" : "↓")}
    </th>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Users</h1>
        <span className="text-sm text-slate-500">{filtered.length} of {MOCK_USERS.length}</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search" placeholder="Search by name, email, or state..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-slate-200 rounded px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th label="Name" />
              <Th label="Email" />
              <Th label="State" />
              <Th label="Signed up" sortKey="signup_date" />
              <Th label="Estimated" sortKey="total_estimated" />
              <Th label="Recovered" sortKey="total_recovered" />
              <Th label="Fees paid" sortKey="total_fees_paid" />
              <Th label="ClaimWatch" />
              <Th label="Claims" sortKey="claims_count" />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-navy">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-500">{u.state}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{u.signup_date}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "#10B981" }}>${u.total_estimated.toLocaleString()}</td>
                <td className="px-4 py-3 text-navy font-semibold">${u.total_recovered.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">${u.total_fees_paid.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {u.claimwatch ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200">Active</span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{u.claims_count}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setSelected(u); setNote(""); }} className="text-xs text-navy underline hover:text-emerald-600 transition-colors">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b border-slate-200">
              <div>
                <h2 className="font-semibold text-navy text-base" style={{ fontFamily: "var(--font-fraunces)" }}>{selected.first_name} {selected.last_name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selected.email} · {selected.state}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-navy transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Total estimated</p><p className="font-semibold text-navy">${selected.total_estimated.toLocaleString()}</p></div>
                <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Recovered</p><p className="font-semibold" style={{ color: "#10B981" }}>${selected.total_recovered.toLocaleString()}</p></div>
                <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">Fees paid</p><p className="font-semibold text-navy">${selected.total_fees_paid.toLocaleString()}</p></div>
                <div className="bg-slate-50 rounded p-3"><p className="text-xs text-slate-400 mb-1">CPA referred</p><p className="font-semibold text-navy">{selected.cpa_referred ? "Yes" : "No"}</p></div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Actions</p>
                <div className="flex gap-2 flex-wrap">
                  <a href={`mailto:${selected.email}`} className="px-3 py-2 rounded text-xs font-semibold border border-slate-200 text-navy hover:bg-slate-50 transition-colors">Email user</a>
                  <button className="px-3 py-2 rounded text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors">Refund payment</button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Internal notes</p>
                <textarea
                  rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes about this user..."
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-navy focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
                <button className="mt-1 text-xs text-slate-500 hover:text-navy transition-colors">Save note</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
