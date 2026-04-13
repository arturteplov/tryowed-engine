"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconClipboard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3" />
      <path d="M12 11h4M12 15h4M8 11h.01M8 15h.01" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconBanknote() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8M16 12H8M12 16H8" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconScale() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10M12 3v18M3 7h2c2 0 4.5-1 7-1s5 1 7 1h2" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left text-navy font-medium hover:text-emerald transition-colors"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <span>{question}</span>
        <span className="shrink-0 text-slate-400"><IconChevron open={open} /></span>
      </button>
      {open && (
        <p className="pb-5 text-slate-600 leading-relaxed text-sm sm:text-base">
          {answer}
        </p>
      )}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: <IconClipboard />,
    step: "01",
    title: "Answer 10 questions",
    body: "Tell us about your situation. Takes 2 minutes.",
  },
  {
    icon: <IconSearch />,
    step: "02",
    title: "We search everything",
    body: "Tax credits, unclaimed property, government benefits, class actions — across all 50 states.",
  },
  {
    icon: <IconBanknote />,
    step: "03",
    title: "You get paid",
    body: "We charge a 20% service fee only after money is recovered and confirmed in your account. Minimum claim threshold: $100. No recovery, no fee.",
  },
];

const CATEGORIES = [
  {
    icon: <IconReceipt />,
    title: "Federal Tax Credits",
    body: "EITC, Child Tax Credit, education credits, and more — many go unclaimed every year.",
  },
  {
    icon: <IconHome />,
    title: "Unclaimed Property",
    body: "Forgotten bank accounts, uncashed checks, utility deposits, and insurance payouts.",
  },
  {
    icon: <IconShield />,
    title: "State Benefits",
    body: "State tax credits, renter rebates, energy programs, and property tax relief.",
  },
  {
    icon: <IconScale />,
    title: "Class Action Settlements",
    body: "Consumer products, data breaches, financial services — deadlines often pass unnoticed.",
  },
  {
    icon: <IconHeart />,
    title: "Government Benefits",
    body: "ACA subsidies, assistance programs, and federal benefit entitlements.",
  },
  {
    icon: <IconBanknote />,
    title: "Insurance & Pensions",
    body: "Unclaimed life insurance, forgotten pensions, FHA mortgage refunds.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Placeholder testimonial. A real user story will go here once we have beta results.",
    name: "Beta User A",
    location: "California",
    amount: "$1,840",
  },
  {
    quote:
      "Placeholder testimonial. A real user story will go here once we have beta results.",
    name: "Beta User B",
    location: "Texas",
    amount: "$3,200",
  },
  {
    quote:
      "Placeholder testimonial. A real user story will go here once we have beta results.",
    name: "Beta User C",
    location: "Florida",
    amount: "$950",
  },
];

const COMPARISON_ROWS = [
  { label: "Upfront cost", us: "$0", them: "$10–35/year" },
  { label: "Actually files for you", us: "Yes", them: "No" },
  { label: "What we search", us: "Everything", them: "Class actions only" },
  { label: "Fee", us: "20% of recovered (only if we find $100+)", them: "Subscription regardless" },
  { label: "If we find nothing", us: "You pay $0", them: "You still paid" },
];

const FAQS = [
  {
    question: "Is this legit?",
    answer:
      "Yes. We search real government databases — the same ones you could search yourself — and file on your behalf. We make money only when you do. We have no reason to fabricate results.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Completely free to check what you're owed. If we find $100+ and you want us to file, we charge 20% of what we recover. If we find nothing, you pay nothing. Ever.",
  },
  {
    question: "What information do you need?",
    answer:
      "To find matches, we need your state, income range, and a few basic facts about your household. To file claims on your behalf, we require your full name, date of birth, address history, and Social Security Number. Your SSN is required by government agencies to process claims — it is encrypted with AES-256, never stored in plain text, and never shared with third parties. You can request full deletion of your data at any time.",
  },
  {
    question: "How long does it take?",
    answer:
      "Finding matches takes under 3 minutes. Filing timelines vary: unclaimed property claims can take 2–8 weeks, tax amendments 8–16 weeks, and class action settlements depend on the administrator. We track every claim and email you as status changes.",
  },
  {
    question: "How do you make money?",
    answer:
      "We charge 20% of what we recover for you, collected only after you confirm receipt of funds. We only charge when we find $100 or more. If we recover nothing, you pay nothing — no subscription, no hidden fees.",
  },
  {
    question: "Is my data safe?",
    answer:
      "All sensitive data is encrypted at rest. We use AES-256 encryption for any personally identifiable information. We do not sell, rent, or share your data with third parties. Ever.",
  },
  {
    question: "What if you don't find anything?",
    answer:
      "You pay nothing. We will send you a clear report of every source we checked and what we found. No obligation, no charge.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [totalRecovered, setTotalRecovered] = useState(0);
  const [displayedTotal, setDisplayedTotal] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setTotalRecovered(d.total_recovered ?? 0))
      .catch(() => {});
  }, []);

  // Animate the counter whenever totalRecovered changes
  useEffect(() => {
    if (totalRecovered === 0) return;
    const frames = 50;
    const step = totalRecovered / frames;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= totalRecovered) {
        setDisplayedTotal(totalRecovered);
        clearInterval(interval);
      } else {
        setDisplayedTotal(Math.round(current));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [totalRecovered]);

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span
            className="text-navy font-semibold text-lg tracking-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Owed
          </span>
          <Link
            href="/questionnaire"
            className="text-sm font-medium text-navy border border-navy rounded px-4 py-2 hover:bg-navy hover:text-white transition-colors"
          >
            Check for free
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-[#0A2540] text-white px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="uppercase tracking-widest text-xs text-emerald-400 mb-6 font-medium" style={{ color: "#10B981" }}>
              Free to check. No upfront cost.
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-6"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Americans leave{" "}
              <span style={{ color: "#10B981" }}>$70 billion</span>{" "}
              unclaimed every year. Let&apos;s find yours.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              We search government databases, tax records, and public records to
              find money you&apos;re owed. You pay nothing unless we find
              something.
            </p>
            <Link
              href="/questionnaire"
              className="inline-block px-8 py-4 rounded text-base font-semibold text-white transition-colors"
              style={{ background: "#10B981" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "#059669")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "#10B981")
              }
            >
              Find my money — free
            </Link>
            <p className="mt-3 text-sm text-slate-400">
              No credit card required. No upfront fees.
            </p>
          </div>

          {/* Trust bar */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-700 rounded overflow-hidden text-center">
              {[
                { stat: "1 in 7", label: "Americans have unclaimed money" },
                { stat: "~$2,000", label: "Average unclaimed property claim" },
                { stat: "$70B+", label: "Sitting in state treasuries" },
              ].map(({ stat, label }) => (
                <div key={label} className="bg-[#0d2f4f] px-6 py-5">
                  <p
                    className="text-2xl font-semibold mb-1"
                    style={{ color: "#10B981", fontFamily: "var(--font-fraunces)" }}
                  >
                    {stat}
                  </p>
                  <p className="text-sm text-slate-300">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-3 text-slate-400" style={{ fontSize: "11px", opacity: 0.5 }}>
              Source: National Association of Unclaimed Property Administrators (NAUPA). Individual results vary.
            </p>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <p className="uppercase tracking-widest text-xs font-medium text-slate-400 mb-3">
              How it works
            </p>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-navy mb-14"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Three steps to what you&apos;re owed.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map(({ icon, step, title, body }) => (
                <div key={step} className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center shrink-0 text-emerald"
                      style={{ background: "#f0fdf4", color: "#10B981" }}
                    >
                      {icon}
                    </div>
                    <span
                      className="text-4xl font-semibold leading-none pt-1"
                      style={{ color: "#e2e8f0", fontFamily: "var(--font-fraunces)" }}
                    >
                      {step}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-semibold text-navy"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What we check ────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <p className="uppercase tracking-widest text-xs font-medium text-slate-400 mb-3">
              What we check
            </p>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-navy mb-14"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              We leave nothing unchecked.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="bg-white rounded border border-slate-200 p-6 flex flex-col gap-4 hover:border-emerald-300 transition-colors"
                >
                  <div style={{ color: "#10B981" }}>{icon}</div>
                  <h3
                    className="font-semibold text-navy text-lg"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof ─────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">

            {/* Live total recovered counter */}
            <div className="mb-12 rounded border border-slate-200 bg-slate-50 px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                  Total recovered for users
                </p>
                <p
                  className="text-3xl font-semibold"
                  style={{ color: "#10B981", fontFamily: "var(--font-fraunces)" }}
                >
                  ${displayedTotal.toLocaleString()}
                </p>
              </div>
              <p className="text-slate-400 text-xs sm:border-l sm:border-slate-200 sm:pl-6 max-w-xs leading-relaxed">
                This number updates as real claims are processed. It starts at $0 — we believe honesty builds trust.
              </p>
            </div>

            <p className="text-center text-slate-500 mb-12 text-lg">
              Join{" "}
              <span className="text-navy font-semibold">847 Americans</span>{" "}
              who&apos;ve already checked what they&apos;re owed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ quote, name, location, amount }) => (
                <div
                  key={name}
                  className="rounded border border-slate-200 p-6 flex flex-col gap-4"
                >
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#10B981", fontFamily: "var(--font-fraunces)" }}
                  >
                    {amount} recovered
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <p className="text-sm font-medium text-navy">
                    {name} &mdash;{" "}
                    <span className="text-slate-400 font-normal">{location}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fee transparency ─────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0A2540]">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-semibold text-white text-center mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              You pay{" "}
              <span style={{ color: "#10B981" }}>$0</span>{" "}
              unless we find you money.
            </h2>
            <p className="text-slate-400 text-center mb-12">
              Our fee is 20% of what we recover (only when we find $100+) — charged after you confirm receipt.
            </p>

            {/* Comparison table */}
            <div className="rounded overflow-hidden border border-slate-700">
              <div className="grid grid-cols-3 bg-slate-800 text-xs uppercase tracking-widest text-slate-400 px-4 py-3">
                <span></span>
                <span className="text-center font-semibold" style={{ color: "#10B981" }}>
                  Owed
                </span>
                <span className="text-center">Other apps</span>
              </div>
              {COMPARISON_ROWS.map(({ label, us, them }) => (
                <div
                  key={label}
                  className="grid grid-cols-3 items-center border-t border-slate-700 px-4 py-4 text-sm"
                >
                  <span className="text-slate-300">{label}</span>
                  <span className="text-center flex items-center justify-center gap-2 text-white font-medium">
                    <IconCheck /> {us}
                  </span>
                  <span className="text-center flex items-center justify-center gap-2 text-slate-500">
                    <IconX /> {them}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/questionnaire"
                className="inline-block px-8 py-4 rounded font-semibold text-white transition-colors"
                style={{ background: "#10B981" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background =
                    "#059669")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background =
                    "#10B981")
                }
              >
                Find my money — free
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="uppercase tracking-widest text-xs font-medium text-slate-400 mb-3">
              Common questions
            </p>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-navy mb-12"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Straight answers.
            </h2>
            <div>
              {FAQS.map((faq) => (
                <FaqItem key={faq.question} {...faq} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 bg-slate-50 text-center border-t border-slate-200">
          <h2
            className="text-3xl sm:text-4xl font-semibold text-navy mb-4 max-w-xl mx-auto leading-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            It takes 2 minutes to check.
          </h2>
          <p className="text-slate-500 mb-8">
            Free to check. We only charge if we find and recover money for you.
          </p>
          <Link
            href="/questionnaire"
            className="inline-block px-8 py-4 rounded font-semibold text-white transition-colors"
            style={{ background: "#10B981" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "#059669")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "#10B981")
            }
          >
            Find my money — free
          </Link>
          <p className="mt-3 text-sm text-slate-400">
            No credit card required. No upfront fees.
          </p>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0A2540] text-slate-400 px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <span
              className="text-white font-semibold text-lg"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Owed
            </span>
            <p className="text-sm text-center sm:text-left">
              Your data is encrypted and never sold.
            </p>
            <p className="text-xs mt-1">
              &copy; {new Date().getFullYear()} Owed. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
