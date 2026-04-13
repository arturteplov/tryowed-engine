import Link from "next/link";

const DIFFERENTIATORS = [
  {
    title: "We actually file",
    body: "Other apps show you what you might be owed and link to external websites. We do the actual work — filing claims, tracking progress, and following up until your money arrives.",
  },
  {
    title: "We earn trust, then revenue",
    body: "You see your full results for free. We only charge 20% after money is recovered and confirmed in your account. If we find nothing, you pay nothing.",
  },
  {
    title: "Your data, your control",
    body: "We encrypt everything. We never sell your data. And you can delete your entire account with one click, anytime. No questions asked.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0A2540] px-4 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold text-white leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
            We believe your money should find you.
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mt-6 max-w-xl mx-auto leading-relaxed">
            Owed was built on a simple idea: billions of dollars sit unclaimed because the systems
            that hold them are too fragmented and confusing. We fix that.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>
            Why we built Owed
          </h2>
          <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Every year, $70 billion sits in state treasuries, government agencies, and settlement
              funds — money that belongs to real people. The problem isn&apos;t that the money is hidden.
              It&apos;s that finding it requires searching dozens of databases, understanding eligibility
              rules across 50 states, and filing paperwork that most people never complete.
            </p>
            <p>
              Owed searches everything for you in one place and handles the filing so you don&apos;t have
              to. No subscriptions. No upfront fees. We only get paid when you do.
            </p>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="px-4 py-20 sm:py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-navy text-center mb-14" style={{ fontFamily: "var(--font-fraunces)" }}>
            How we&apos;re different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map(({ title, body }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-navy mb-10" style={{ fontFamily: "var(--font-fraunces)" }}>
            Who&apos;s behind Owed
          </h2>
          <div className="flex flex-col items-center gap-4">
            {/* Photo placeholder */}
            <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-navy text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Founder</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Short bio placeholder — will be customized.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-10">
We&apos;re a small team focused on doing one thing well.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-20 sm:py-24 bg-[#0A2540]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>
            Ready to check what you&apos;re owed?
          </h2>
          <Link
            href="/questionnaire"
            className="inline-block px-8 py-4 rounded font-semibold text-white text-base transition-colors hover:opacity-90"
            style={{ background: "#10B981" }}
          >
            Find my money — free
          </Link>
          <p className="text-slate-500 text-sm mt-4">No credit card required.</p>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 px-4 bg-white">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-navy transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-navy transition-colors">Terms of Service</Link>
          <Link href="/about" className="hover:text-navy transition-colors">About</Link>
          <Link href="/contact" className="hover:text-navy transition-colors">Contact</Link>
          <span className="ml-auto">&copy; {new Date().getFullYear()} Owed. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
