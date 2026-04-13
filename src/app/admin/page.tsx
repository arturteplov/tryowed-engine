"use client";

// ─── Admin dashboard — revenue metrics, user funnel, recent activity ──────────

const REVENUE_CARDS = [
  { label: "Total Revenue",        value: "$0",     sub: "all time",          accent: true },
  { label: "Filing Fee Revenue",   value: "$0",     sub: "20% charges" },
  { label: "Priority Filings",     value: "$0",     sub: "$29 charges" },
  { label: "ClaimWatch MRR",       value: "$0",     sub: "monthly recurring" },
  { label: "CPA Referrals",        value: "$0",     sub: "$30–80 per lead" },
  { label: "Audit Reports",        value: "$0",     sub: "$24 each" },
  { label: "Pending Filing Fees",  value: "$0",     sub: "earned, uncollected" },
];

const USER_CARDS = [
  { label: "Total Signups",              value: "0" },
  { label: "Questionnaires Completed",   value: "0" },
  { label: "Results Viewed",             value: "0" },
  { label: "Claims Initiated",           value: "0" },
  { label: "Claims Filed",               value: "0" },
  { label: "Claims Paid Out",            value: "0" },
  { label: "ClaimWatch Subscribers",     value: "0" },
];

const FUNNEL_STEPS = [
  { label: "Signed up",             count: 0, pct: 100 },
  { label: "Completed questionnaire", count: 0, pct: 0 },
  { label: "Saw results",           count: 0, pct: 0 },
  { label: "Had $100+ match",       count: 0, pct: 0 },
  { label: "Initiated claim",       count: 0, pct: 0 },
  { label: "Filed",                 count: 0, pct: 0 },
  { label: "Approved",              count: 0, pct: 0 },
  { label: "Paid out",              count: 0, pct: 0 },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>{children}</h2>;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-4">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: accent ? "#10B981" : "#0A2540" }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">All metrics · connect Supabase to see live data</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Admin</span>
      </div>

      {/* Revenue */}
      <section className="mb-10">
        <SectionTitle>Revenue</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {REVENUE_CARDS.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* User metrics */}
      <section className="mb-10">
        <SectionTitle>Users</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {USER_CARDS.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Conversion funnel */}
      <section className="mb-10">
        <SectionTitle>Conversion funnel</SectionTitle>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex flex-col gap-3">
            {FUNNEL_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="text-xs text-slate-400 w-5 text-right">{i + 1}</span>
                <span className="text-sm text-navy w-48 shrink-0">{s.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: "#10B981" }} />
                </div>
                <span className="text-xs text-slate-500 w-12 text-right">{s.count.toLocaleString()}</span>
                <span className="text-xs font-semibold w-10 text-right" style={{ color: "#10B981" }}>{s.pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Connect Supabase to see live funnel data.</p>
        </div>
      </section>

      {/* Recent activity placeholder */}
      <section>
        <SectionTitle>Recent activity</SectionTitle>
        <div className="bg-white border border-slate-200 rounded-lg p-5 text-center py-16">
          <p className="text-sm text-slate-400">No activity yet. Connect Supabase to see real-time events.</p>
        </div>
      </section>
    </div>
  );
}
