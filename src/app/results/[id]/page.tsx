"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Confidence = "high" | "medium" | "low";

interface MatchItem {
  benefit_id: string;
  benefit_name: string;
  category: string;
  description: string;
  short_description: string;
  estimated_amount: number;
  confidence: Confidence;
  eligible: boolean;
  rejection_reason?: string;
  filing_url?: string;
}

interface DebugProfile {
  email:                 string;
  first_name:            string;
  last_name:             string;
  employment_type:       string;
  living_situation:      string;
  income_range:          string;
  filing_status:         string;
  state:                 string;
  has_children:          boolean;
  num_children:          number;
  filed_taxes_all_years: boolean;
  missed_tax_years:      string[];
}

interface MatchResponse {
  above_threshold:  MatchItem[];
  below_threshold:  MatchItem[];
  not_eligible:     MatchItem[];
  total_above:      number;
  total_below:      number;
  total_estimated:  number;
  missed_tax_years: string[];
  states_searched:  number;
  benefits_checked: number;
  debug_profile:    DebugProfile | null;
}

// ─── Category helpers ─────────────────────────────────────────────────────────
// "Money potentially waiting for you": already exists somewhere, may be claimed
// "Tax credits you may be eligible for": require filing a tax return

const MONEY_WAITING_CATS = new Set([
  "unclaimed_property",
  "government_benefit",
  "insurance",
  "class_action",
]);

function splitByType(matches: MatchItem[]) {
  return {
    moneyWaiting: matches.filter((m) => MONEY_WAITING_CATS.has(m.category)),
    taxCredits:   matches.filter((m) => !MONEY_WAITING_CATS.has(m.category)),
  };
}

// ─── Scanning animation ───────────────────────────────────────────────────────

const SCAN_TOTAL_MS = 5 * 1500 + 600;

// Each step is a completely self-contained component with its own state and timers.
// Zero shared state — one step cannot interfere with another.
function ScanStep({ label, activeAt, doneAt }: { label: string; activeAt: number; doneAt: number }) {
  const [phase, setPhase] = useState<"pending" | "active" | "done">("pending");
  useEffect(() => {
    const ta = setTimeout(() => setPhase("active"), activeAt);
    const td = setTimeout(() => setPhase("done"),   doneAt);
    return () => { clearTimeout(ta); clearTimeout(td); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={`flex items-center gap-3 text-sm transition-opacity duration-500 ${phase === "pending" ? "opacity-30" : "opacity-100"}`}>
      {phase === "done" ? (
        <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center" style={{ background: "#10B981" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
      ) : phase === "active" ? (
        <span className="w-5 h-5 rounded-full border-2 border-slate-400 shrink-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10B981" }} />
        </span>
      ) : (
        <span className="w-5 h-5 rounded-full border-2 border-slate-700 shrink-0" />
      )}
      {label}
    </div>
  );
}

const SCAN_STEPS = [
  "Searching federal tax credit databases",
  "Checking unclaimed property databases",
  "Scanning active class action settlements",
  "Reviewing pension and savings bond databases",
  "Analyzing your eligibility",
];

function ScanningScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0A2540] text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <p className="text-slate-400 text-xs uppercase tracking-widest mb-8">Searching for your money</p>
      <style>{`@keyframes scanbar{from{width:0}to{width:100%}}`}</style>
      <div className="w-full max-w-sm mb-8">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ background: "#10B981", animation: "scanbar 7.5s linear forwards" }} />
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {SCAN_STEPS.map((label, i) => (
          <ScanStep key={label} label={label} activeAt={i * 1500} doneAt={(i + 1) * 1500} />
        ))}
      </div>
    </div>
  );
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

const MOCK_ABOVE: MatchItem[] = [
  { benefit_id: "mock-1", benefit_name: "Earned Income Tax Credit", category: "federal_tax_credit", description: "You may be eligible for the EITC based on your income and filing status.", short_description: "Federal credit for low-to-moderate income earners", estimated_amount: 2800, confidence: "high", eligible: true },
  { benefit_id: "mock-2", benefit_name: "Child Tax Credit", category: "federal_tax_credit", description: "Based on your children's ages, you may be eligible for the Child Tax Credit.", short_description: "Up to $2,000 per qualifying child", estimated_amount: 2000, confidence: "high", eligible: true },
  { benefit_id: "mock-3", benefit_name: "State Unclaimed Property", category: "unclaimed_property", description: "Potential unclaimed property held by your state — forgotten accounts, deposits, or uncashed checks.", short_description: "Forgotten funds held by your state", estimated_amount: 1200, confidence: "medium", eligible: true },
];

const MOCK_BELOW: MatchItem[] = [
  { benefit_id: "mock-6", benefit_name: "Data Breach Settlement", category: "class_action", description: "You may qualify for an open class action settlement.", short_description: "Open settlement", estimated_amount: 45, confidence: "medium", eligible: true, filing_url: "https://example.com" },
];

const MOCK_NOT_ELIGIBLE: MatchItem[] = [
  { benefit_id: "mock-ne-1", benefit_name: "PBGC Unclaimed Pension", category: "government_benefit", description: "", short_description: "", estimated_amount: 0, confidence: "low", eligible: false, rejection_reason: "No pension history on file" },
  { benefit_id: "mock-ne-2", benefit_name: "FHA Mortgage Refund", category: "government_benefit", description: "", short_description: "", estimated_amount: 0, confidence: "low", eligible: false, rejection_reason: "No FHA loan history" },
  { benefit_id: "mock-ne-3", benefit_name: "Saver's Credit", category: "federal_tax_credit", description: "", short_description: "", estimated_amount: 0, confidence: "low", eligible: false, rejection_reason: "Income threshold not met" },
];

// ─── Category / confidence helpers ───────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  federal_tax_credit: "Federal Tax Credit",
  state_tax_credit:   "State Tax Credit",
  unclaimed_property: "Unclaimed Property",
  government_benefit: "Government Benefit",
  class_action:       "Class Action Settlement",
  insurance:          "Insurance & Pensions",
  other:              "Other",
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const CONFIDENCE_CONFIG: Record<Confidence, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  high: {
    label: "Likely eligible", color: "#10B981", bg: "#f0fdf4",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  },
  medium: {
    label: "Needs review", color: "#d97706", bg: "#fffbeb",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>,
  },
  low: {
    label: "Possible", color: "#64748b", bg: "#f8fafc",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>,
  },
};

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ match, compact }: { match: MatchItem; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CONFIDENCE_CONFIG[match.confidence];

  if (compact) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded border border-slate-200 bg-white gap-4 text-sm">
        <span className="text-navy font-medium">{match.benefit_name}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-semibold" style={{ color: "#10B981" }}>${match.estimated_amount.toLocaleString()}</span>
          {match.filing_url && (
            <a href={match.filing_url} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1 rounded border border-slate-300 text-slate-600 hover:border-navy hover:text-navy transition-colors">
              Claim →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="w-full text-left px-5 py-4 flex items-start gap-4"
      >
        <span className="shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-navy text-sm sm:text-base leading-snug">{match.benefit_name}</p>
            <p className="font-bold text-lg shrink-0" style={{ color: "#10B981" }}>
              ${match.estimated_amount.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{match.short_description || categoryLabel(match.category)}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" className={`shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-3 mb-3"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
          <p className="text-sm text-slate-600 leading-relaxed">{match.description || match.short_description}</p>
          <p className="text-xs text-slate-400 mt-2">{categoryLabel(match.category)}</p>
        </div>
      )}
    </div>
  );
}

// ─── CPA Referral Card ────────────────────────────────────────────────────────

function CpaReferralCard({ missedYears }: { missedYears: string[] }) {
  if (missedYears.length === 0) return null;
  const yearList = missedYears.join(", ");
  return (
    <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-5 sm:p-6 mb-8">
      <div className="flex items-start gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div>
          <p className="font-semibold text-navy text-sm sm:text-base" style={{ fontFamily: "var(--font-fraunces)" }}>
            You have unfiled tax returns for {yearList}.
          </p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Refunds <span className="font-semibold">expire after 3 years</span>. Our partner CPA can file amended returns on your behalf.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-white text-sm transition-colors hover:opacity-90"
            style={{ background: "#d97706" }}
            onClick={() => alert("Connecting you with a tax professional. We'll be in touch within 24 hours.")}
          >
            Connect me with a tax pro — free
          </button>
          <p className="text-xs text-slate-400 mt-2">Free referral to a licensed CPA. No obligation.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Waitlist card ────────────────────────────────────────────────────────────

function WaitlistCard({
  profileId, email, name, totalEstimated, numMatches,
}: {
  profileId: string;
  email: string;
  name: string;
  totalEstimated: number;
  numMatches: number;
}) {
  const [emailVal, setEmailVal] = useState(email);
  const [nameVal, setNameVal]   = useState(name);
  const [status, setStatus]     = useState<"idle" | "loading" | "done">("idle");
  const [error, setError]       = useState("");

  const landingUrl = typeof window !== "undefined" ? `${window.location.origin}` : "https://owed.app";
  const shareText  = `I just found out I may be owed $${totalEstimated.toLocaleString()} in unclaimed money and tax credits. Check yours free at ${landingUrl}`;

  const handleSubmit = async () => {
    if (!emailVal.trim() || !nameVal.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id:      profileId || null,
          email:           emailVal.trim(),
          full_name:       nameVal.trim(),
          total_estimated: totalEstimated,
          num_matches:     numMatches,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Signup failed");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareText).then(() => alert("Copied to clipboard!"));
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (status === "done") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="font-semibold text-navy text-lg mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
          You&apos;re on the list!
        </p>
        <p className="text-slate-600 text-sm mb-6">We&apos;ll reach out within 48 hours to start your claims.</p>
        <p className="text-sm text-slate-500 mb-3">In the meantime, share with someone who might have unclaimed money:</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded border border-slate-300 text-slate-700 text-sm font-medium hover:border-slate-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            Copy link
          </button>
          <button
            type="button"
            onClick={shareTwitter}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: "#000" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            Share on X
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 sm:p-8">
      <h2 className="font-semibold text-navy text-xl mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
        Want us to claim this for you?
      </h2>
      <p className="text-slate-600 text-sm mb-5 leading-relaxed">
        We&apos;re onboarding our first users now. Join the priority list and we&apos;ll handle your claims first.
      </p>

      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">How it works</p>
        <ul className="flex flex-col gap-2">
          {[
            "We file all eligible claims on your behalf",
            "You pay nothing upfront",
            "20% service fee only after money is recovered and confirmed in your account",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Full name</label>
          <input
            type="text"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            placeholder="Your full name"
            className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm focus:outline-none focus:border-emerald-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Email address</label>
          <input
            type="email"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm focus:outline-none focus:border-emerald-500 transition-colors bg-white"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === "loading"}
        className="w-full py-3.5 rounded font-semibold text-white text-sm transition-colors hover:opacity-90 disabled:opacity-60"
        style={{ background: "#10B981" }}
      >
        {status === "loading" ? "Joining..." : "Join priority list"}
      </button>
      <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
        No credit card required. We&apos;ll email you within 48 hours to start your claims.
      </p>
    </div>
  );
}

// ─── Not eligible list ────────────────────────────────────────────────────────

function NotEligibleList({ items, title = "Checked but not eligible" }: { items: MatchItem[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-10">
      <h3 className="text-slate-400 mb-3 uppercase tracking-widest text-xs font-medium">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((m) => (
          <div key={m.benefit_id} className="flex items-center gap-3 px-4 py-3 rounded bg-slate-50 border border-slate-100 text-slate-400 text-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            <span>{m.benefit_name}</span>
            {m.rejection_reason && <span className="text-xs text-slate-300 ml-auto hidden sm:block">{m.rejection_reason}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <header className="border-b border-slate-100 px-4 h-14 flex items-center justify-between max-w-3xl mx-auto w-full">
        <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
        <span className="text-xs text-slate-400">Your results</span>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>Results are estimated based on publicly available eligibility criteria. Individual results vary.</p>
        <p className="mt-1">
          <Link href="/privacy" className="hover:text-navy underline">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-navy underline">Terms</Link>
        </p>
      </footer>
    </div>
  );
}

// ─── SCENARIO A: $100+ above threshold ───────────────────────────────────────

function ResultsAboveThreshold({
  id, aboveThreshold, belowThreshold, notEligible,
  totalAbove, totalBelow, missedYears, userEmail, userName,
}: {
  id: string;
  aboveThreshold: MatchItem[];
  belowThreshold: MatchItem[];
  notEligible:    MatchItem[];
  totalAbove:     number;
  totalBelow:     number;
  missedYears:    string[];
  userEmail:      string;
  userName:       string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (totalAbove === 0) return;
    const frames = 60;
    const step = totalAbove / frames;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= totalAbove) { setCount(totalAbove); clearInterval(interval); }
      else setCount(Math.round(current));
    }, 30);
    return () => clearInterval(interval);
  }, [totalAbove]);

  const { moneyWaiting, taxCredits } = splitByType(aboveThreshold);
  const { moneyWaiting: mwBelow, taxCredits: tcBelow } = splitByType(belowThreshold);

  return (
    <PageShell>
      {/* Total */}
      <div className="text-center mb-12">
        <p className="text-slate-500 mb-2 uppercase tracking-widest text-xs">Based on your answers, you may be owed approximately</p>
        <p className="text-6xl sm:text-7xl font-semibold mb-2" style={{ color: "#10B981", fontFamily: "var(--font-fraunces)" }}>
          ${count.toLocaleString()}
        </p>
        <p className="text-slate-500 text-sm">
          across {aboveThreshold.length} source{aboveThreshold.length !== 1 ? "s" : ""} — estimated, not guaranteed
        </p>
      </div>

      {/* CPA referral if missed years */}
      <CpaReferralCard missedYears={missedYears} />

      {/* Money potentially waiting for you */}
      {moneyWaiting.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
            Money potentially waiting for you
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            These are funds that may already exist in your name — unclaimed property, government refunds, and settlements.
          </p>
          <div className="flex flex-col gap-3">
            {moneyWaiting.map((m) => <MatchCard key={m.benefit_id} match={m} />)}
          </div>
        </div>
      )}

      {/* Tax credits you may be eligible for */}
      {taxCredits.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
            Tax credits you may be eligible for
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            These credits are claimed when you file a tax return. We handle the filing for you.
          </p>
          <div className="flex flex-col gap-3">
            {taxCredits.map((m) => <MatchCard key={m.benefit_id} match={m} />)}
          </div>
        </div>
      )}

      {/* Waitlist CTA */}
      <div className="mb-10">
        <WaitlistCard
          profileId={id}
          email={userEmail}
          name={userName}
          totalEstimated={totalAbove}
          numMatches={aboveThreshold.length}
        />
      </div>

      {/* Below-threshold (DIY) */}
      {belowThreshold.length > 0 && (
        <div className="mb-10">
          <h3 className="text-slate-500 mb-1 text-sm font-semibold">
            We also found smaller amounts you can claim yourself
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Under our $100 filing threshold (~${totalBelow.toLocaleString()} total), but still yours to claim.
          </p>
          {mwBelow.length > 0 && <div className="flex flex-col gap-2 mb-3">{mwBelow.map((m) => <MatchCard key={m.benefit_id} match={m} compact />)}</div>}
          {tcBelow.length > 0 && <div className="flex flex-col gap-2">{tcBelow.map((m) => <MatchCard key={m.benefit_id} match={m} compact />)}</div>}
        </div>
      )}

      <NotEligibleList items={notEligible} />
    </PageShell>
  );
}

// ─── SCENARIO B: Only below-threshold matches ─────────────────────────────────

function ResultsBelowOnly({
  id, belowThreshold, notEligible, totalBelow, missedYears, userEmail, userName,
}: {
  id: string; belowThreshold: MatchItem[]; notEligible: MatchItem[];
  totalBelow: number; missedYears: string[]; userEmail: string; userName: string;
}) {
  const { moneyWaiting, taxCredits } = splitByType(belowThreshold);

  return (
    <PageShell>
      <div className="text-center mb-10">
        <p className="text-slate-500 mb-2 uppercase tracking-widest text-xs">We found</p>
        <p className="text-4xl sm:text-5xl font-semibold mb-2 text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>
          {belowThreshold.length} claim{belowThreshold.length !== 1 ? "s" : ""}
        </p>
        <p className="text-slate-500 text-sm">
          totaling approximately <span className="font-semibold" style={{ color: "#10B981" }}>${totalBelow.toLocaleString()}</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">These are under our $100 filing threshold — here&apos;s where to claim them yourself.</p>
      </div>

      <CpaReferralCard missedYears={missedYears} />

      {moneyWaiting.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Money potentially waiting for you</h2>
          <div className="flex flex-col gap-2">{moneyWaiting.map((m) => <MatchCard key={m.benefit_id} match={m} compact />)}</div>
        </div>
      )}

      {taxCredits.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Tax credits you may be eligible for</h2>
          <div className="flex flex-col gap-2">{taxCredits.map((m) => <MatchCard key={m.benefit_id} match={m} compact />)}</div>
        </div>
      )}

      <div className="mb-10">
        <WaitlistCard
          profileId={id}
          email={userEmail}
          name={userName}
          totalEstimated={totalBelow}
          numMatches={belowThreshold.length}
        />
      </div>

      <NotEligibleList items={notEligible} />
    </PageShell>
  );
}

// ─── SCENARIO C: Nothing found ────────────────────────────────────────────────

function ResultsZero({
  id, notEligible, missedYears, statesSearched, benefitsChecked, userEmail, userName,
}: {
  id: string; notEligible: MatchItem[]; missedYears: string[];
  statesSearched: number; benefitsChecked: number; userEmail: string; userName: string;
}) {
  return (
    <PageShell>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.75"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
          No unclaimed money found right now.
        </h1>
        <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
          We checked {benefitsChecked} categories across {statesSearched} state{statesSearched !== 1 ? "s" : ""}. This is actually good news — you&apos;re not leaving money on the table.
        </p>
      </div>

      <CpaReferralCard missedYears={missedYears} />

      <div className="mb-10">
        <WaitlistCard
          profileId={id}
          email={userEmail}
          name={userName}
          totalEstimated={0}
          numMatches={0}
        />
      </div>

      <NotEligibleList items={notEligible} title="Everything we checked" />
    </PageShell>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();
  const [id, setId]         = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [phase, setPhase]   = useState<"scanning" | "results">("scanning");

  // Match data (starts with mock fallback)
  const [aboveThreshold, setAboveThreshold] = useState<MatchItem[]>(MOCK_ABOVE);
  const [belowThreshold, setBelowThreshold] = useState<MatchItem[]>(MOCK_BELOW);
  const [notEligible, setNotEligible]       = useState<MatchItem[]>(MOCK_NOT_ELIGIBLE);
  const [totalAbove, setTotalAbove]         = useState(MOCK_ABOVE.reduce((s, m) => s + m.estimated_amount, 0));
  const [totalBelow, setTotalBelow]         = useState(MOCK_BELOW.reduce((s, m) => s + m.estimated_amount, 0));
  const [missedTaxYears, setMissedTaxYears] = useState<string[]>([]);
  const [statesSearched, setStatesSearched] = useState(1);
  const [benefitsChecked, setBenefitsChecked] = useState(12);

  // User identity for pre-filling waitlist form
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName]   = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
    const rawStates = searchParams.get("states");
    if (rawStates) {
      const parsed = rawStates.split(",").map((s) => s.trim()).filter(Boolean);
      setStates(parsed);
      setStatesSearched(parsed.length);
    }
  }, [params, searchParams]);

  const fetchMatches = useCallback(async (profileId: string) => {
    if (profileId === "demo") {
      console.warn("[Results] profileId is 'demo' — showing mock data.");
      return;
    }
    try {
      const res = await fetch(`/api/match/${profileId}`, { method: "POST" });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("[Results] Match API error:", res.status, errBody);
        return;
      }

      const data: MatchResponse = await res.json();

      // Debug logs
      if (data.debug_profile) {
        console.log("RAW USER PROFILE:", JSON.stringify(data.debug_profile, null, 2));
        console.log("USER EMPLOYMENT TYPE RAW VALUE:", data.debug_profile.employment_type);
      }
      console.log("[Results] above_threshold:", data.above_threshold.map((m) => `${m.benefit_name} $${m.estimated_amount}`));
      console.log("[Results] not_eligible:", data.not_eligible.map((m) => `${m.benefit_name} — ${m.rejection_reason}`));
      console.log(`[Results] total_above=$${data.total_above}  total_below=$${data.total_below}`);

      setAboveThreshold(data.above_threshold);
      setBelowThreshold(data.below_threshold);
      setNotEligible(data.not_eligible);
      setTotalAbove(data.total_above);
      setTotalBelow(data.total_below);
      setMissedTaxYears(data.missed_tax_years);
      setStatesSearched(data.states_searched);
      setBenefitsChecked(data.benefits_checked);

      if (data.debug_profile) {
        setUserEmail(data.debug_profile.email);
        setUserName(`${data.debug_profile.first_name} ${data.debug_profile.last_name}`.trim());
      }
    } catch (err) {
      console.error("[Results] fetchMatches error — showing mock data:", err);
    }
  }, []);

  useEffect(() => {
    if (id) fetchMatches(id);
  }, [id, fetchMatches]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("results"), SCAN_TOTAL_MS);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "scanning") return <ScanningScreen />;

  if (totalAbove >= 100) {
    return (
      <ResultsAboveThreshold
        id={id}
        aboveThreshold={aboveThreshold}
        belowThreshold={belowThreshold}
        notEligible={notEligible}
        totalAbove={totalAbove}
        totalBelow={totalBelow}
        missedYears={missedTaxYears}
        userEmail={userEmail}
        userName={userName}
      />
    );
  }

  if (belowThreshold.length > 0) {
    return (
      <ResultsBelowOnly
        id={id}
        belowThreshold={belowThreshold}
        notEligible={notEligible}
        totalBelow={totalBelow}
        missedYears={missedTaxYears}
        userEmail={userEmail}
        userName={userName}
      />
    );
  }

  return (
    <ResultsZero
      id={id}
      notEligible={notEligible}
      missedYears={missedTaxYears}
      statesSearched={statesSearched}
      benefitsChecked={benefitsChecked}
      userEmail={userEmail}
      userName={userName}
    />
  );
}
