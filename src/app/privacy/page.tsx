import Link from "next/link";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl sm:text-2xl font-semibold text-navy mt-14 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 text-sm leading-relaxed mb-3">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-slate-600 text-sm leading-relaxed">{children}</li>;
}

const DATA_TABLE = [
  { data: "Name", why: "Search unclaimed property databases, file claims", when: "Questionnaire" },
  { data: "Email", why: "Send results and claim updates", when: "Questionnaire" },
  { data: "State and address history", why: "Search state databases, file claims", when: "Questionnaire" },
  { data: "Date of birth", why: "Verify identity in database searches", when: "Questionnaire" },
  { data: "Income range", why: "Determine benefit eligibility", when: "Questionnaire" },
  { data: "Household info", why: "Determine tax credit eligibility", when: "Questionnaire" },
  { data: "Social Security Number", why: "Required by government agencies to file claims", when: "Claim initiation only" },
  { data: "Photo ID and tax documents", why: "Verify identity for claim filing", when: "Claim initiation (optional)" },
  { data: "Payment information", why: "Process service fees", when: "Claim initiation" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Privacy Policy</h1>
        <p className="text-sm text-slate-400 mt-2 mb-8">Last updated: April 12, 2026</p>

        {/* 1. Who we are */}
        <H2>1. Who we are</H2>
        <P>
          Owed, Inc. is a Delaware corporation. We help Americans find and claim unclaimed money including tax credits,
          unclaimed property, government benefits, and class action settlements.
        </P>
        <P>Contact: <a href="mailto:privacy@owed.com" className="text-navy underline hover:text-emerald-600 transition-colors">privacy@owed.com</a></P>

        {/* 2. What we collect */}
        <H2>2. What we collect</H2>
        <div className="border border-slate-200 rounded-lg overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Why we collect it</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody>
              {DATA_TABLE.map((row) => (
                <tr key={row.data} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-navy font-medium">{row.data}</td>
                  <td className="px-4 py-3 text-slate-600">{row.why}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. How we protect your data */}
        <H2>3. How we protect your data</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>All sensitive data (including SSN) is encrypted with AES-256 at rest</Li>
          <Li>All data transmitted over HTTPS/TLS</Li>
          <Li>SSN is never stored in plain text</Li>
          <Li>Data stored in secure US-based servers</Li>
          <Li>Access restricted to authorized personnel only</Li>
          <Li>We conduct regular security reviews</Li>
        </ul>

        {/* 4. How we use your data */}
        <H2>4. How we use your data</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>Search government and public databases for money owed to you</Li>
          <Li>File claims on your behalf with government agencies</Li>
          <Li>Send you results, claim updates, and service communications</Li>
          <Li>Improve our matching accuracy and service</Li>
        </ul>
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm text-slate-600 space-y-1">
          <p className="font-semibold text-navy">We will never:</p>
          <ul className="list-disc pl-5 space-y-1">
            <Li>Sell your data to third parties</Li>
            <Li>Share your data for marketing purposes</Li>
            <Li>Use your data for any purpose other than finding and claiming your money</Li>
          </ul>
        </div>

        {/* 5. Third parties */}
        <H2>5. Third parties</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li><strong>Stripe</strong> — processes payments. Their privacy policy applies to payment data.</Li>
          <Li><strong>Supabase</strong> — hosts our database. Data encrypted at rest.</Li>
          <Li><strong>Partner CPAs</strong> — if you have unfiled taxes and request a referral, we share your name and email only with your explicit consent.</Li>
          <Li><strong>Government agencies</strong> — we submit your information to file claims. This is the core purpose of our service.</Li>
        </ul>
        <P>We do not use advertising trackers or sell data to data brokers.</P>

        {/* 6. Your rights */}
        <H2>6. Your rights</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li><strong>Access</strong> — Request a copy of all data we hold about you</Li>
          <Li><strong>Correction</strong> — Request correction of inaccurate data</Li>
          <Li><strong>Deletion</strong> — Request complete deletion of all your data at any time by emailing <a href="mailto:privacy@owed.com" className="text-navy underline">privacy@owed.com</a> or using the &ldquo;Delete my data&rdquo; button in your account settings. We will delete everything within 72 hours.</Li>
          <Li><strong>Portability</strong> — Request your data in a machine-readable format</Li>
        </ul>
        <P>
          If you are a California resident, you have additional rights under the CCPA including the right to know what data we collect,
          request deletion, and opt out of data sales. We don&apos;t sell data, so the opt-out right does not apply.
        </P>

        {/* 7. Data retention */}
        <H2>7. Data retention</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li><strong>Active accounts</strong> — data retained while your account is active</Li>
          <Li><strong>After deletion request</strong> — all data deleted within 72 hours</Li>
          <Li><strong>After claim completion</strong> — data retained for 12 months for tax and legal purposes, then automatically deleted unless you have an active ClaimWatch subscription</Li>
          <Li><strong>Payment records</strong> — retained for 7 years as required by law</Li>
        </ul>

        {/* 8. Cookies */}
        <H2>8. Cookies</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>We use essential cookies for site functionality</Li>
          <Li>We use analytics cookies to understand site usage</Li>
          <Li>We do not use advertising or tracking cookies</Li>
          <Li>You can disable cookies in your browser settings</Li>
        </ul>

        {/* 9. Changes */}
        <H2>9. Changes to this policy</H2>
        <P>We&apos;ll notify you by email of any material changes. Continued use after changes constitutes acceptance.</P>

        {/* 10. Contact */}
        <H2>10. Contact</H2>
        <P>Email: <a href="mailto:privacy@owed.com" className="text-navy underline hover:text-emerald-600 transition-colors">privacy@owed.com</a></P>
        <P>Owed, Inc. — Delaware, United States</P>

        <div className="mt-16 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            This policy is meant to be readable by humans, not just lawyers. If anything is unclear,
            email us and we&apos;ll explain in plain English.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-navy transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-navy transition-colors">Terms of Service</Link>
          <Link href="/about" className="hover:text-navy transition-colors">About</Link>
          <Link href="/contact" className="hover:text-navy transition-colors">Contact</Link>
          <span className="ml-auto">&copy; {new Date().getFullYear()} Owed, Inc.</span>
        </div>
      </footer>
    </div>
  );
}
