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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Terms of Service</h1>
        <p className="text-sm text-slate-400 mt-2 mb-8">Last updated: April 12, 2026</p>

        {/* 1 */}
        <H2>1. What Owed does</H2>
        <P>
          Owed searches public databases, government records, and other sources to identify money that may be owed to you.
          If you choose, we file claims on your behalf to recover that money. We are <strong>not</strong> a law firm, CPA firm,
          or licensed financial advisor. We are a claims filing service.
        </P>

        {/* 2 */}
        <H2>2. Our fees</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li><strong>Searching and viewing results:</strong> Free. Always.</Li>
          <Li><strong>Filing service:</strong> 20% of money successfully recovered, charged only after you confirm receipt of funds.</Li>
          <Li><strong>Minimum claim threshold:</strong> We only file claims for amounts of $100 or more. For smaller amounts, we provide information and direct links for you to claim yourself.</Li>
          <Li><strong>Priority filing:</strong> Optional $29 one-time fee for expedited processing (within 48 hours).</Li>
          <Li><strong>ClaimWatch monitoring:</strong> Optional $7.99/month subscription for ongoing monitoring of new matches.</Li>
          <Li><strong>Financial Audit Report:</strong> Optional $24 one-time downloadable report.</Li>
        </ul>

        {/* 3 */}
        <H2>3. How fees are charged</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>Your payment method is stored securely via Stripe.</Li>
          <Li>
            The 20% service fee is charged <strong>only</strong> after:
            <ol className="list-[lower-alpha] pl-5 mt-1 space-y-0.5">
              <Li>Money has been deposited to your account</Li>
              <Li>You confirm receipt through your dashboard</Li>
            </ol>
          </Li>
          <Li>If you do not confirm receipt within 30 days of our notification, and we have evidence the payment was made to you, we may charge the fee automatically.</Li>
          <Li>Priority filing fee ($29) is charged at time of selection.</Li>
          <Li>Subscriptions are charged monthly and can be cancelled anytime.</Li>
        </ul>

        {/* 4 */}
        <H2>4. Your responsibilities</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>Provide accurate information. False information may result in claim rejection or legal consequences.</Li>
          <Li>You authorize us to file claims on your behalf by submitting the claim initiation form.</Li>
          <Li>Respond to requests for additional information within 14 days. Delays may result in missed deadlines.</Li>
          <Li>Confirm receipt of funds promptly when notified.</Li>
          <Li>You are responsible for any tax obligations related to recovered money.</Li>
        </ul>

        {/* 5 */}
        <H2>5. What we don&apos;t guarantee</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>We do not guarantee that you are owed any money.</Li>
          <Li>We do not guarantee any specific dollar amount.</Li>
          <Li>We do not guarantee claim approval — government agencies make final decisions.</Li>
          <Li>Estimated amounts shown in results are approximations and may differ from actual recovery.</Li>
          <Li>Processing times are estimates and vary by agency.</Li>
        </ul>

        {/* 6 */}
        <H2>6. Limitation of liability</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>Our total liability is limited to the fees you&apos;ve paid us in the 12 months preceding any claim.</Li>
          <Li>We are not liable for claim rejections, processing delays, or government agency decisions.</Li>
          <Li>We are not liable for tax consequences of recovered money.</Li>
          <Li>We are not responsible for errors in government databases or public records.</Li>
        </ul>

        {/* 7 */}
        <H2>7. Cancellation and refunds</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>You can cancel the filing process at any time before claims are submitted by contacting <a href="mailto:support@owed.com" className="text-navy underline">support@owed.com</a>.</Li>
          <Li>Priority filing fee ($29) is refundable within 7 days if claims have not yet been filed.</Li>
          <Li>ClaimWatch subscriptions can be cancelled anytime. No refunds for partial months.</Li>
          <Li>The 20% service fee is non-refundable once charged, as it represents work already completed.</Li>
        </ul>

        {/* 8 */}
        <H2>8. Account termination</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>You can delete your account and all data at any time.</Li>
          <Li>We may terminate accounts that provide false information, attempt fraud, or violate these terms.</Li>
        </ul>

        {/* 9 */}
        <H2>9. Intellectual property</H2>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <Li>All content, design, and technology is owned by Owed, Inc.</Li>
          <Li>You may not copy, reproduce, or redistribute our service or content.</Li>
        </ul>

        {/* 10 */}
        <H2>10. Dispute resolution</H2>
        <P>
          Disputes will be resolved through binding arbitration in the State of Delaware.
          You agree to attempt informal resolution by emailing{" "}
          <a href="mailto:support@owed.com" className="text-navy underline">support@owed.com</a>{" "}
          before initiating arbitration.
        </P>

        {/* 11 */}
        <H2>11. Governing law</H2>
        <P>These terms are governed by the laws of the State of Delaware, United States.</P>

        {/* 12 */}
        <H2>12. Changes</H2>
        <P>
          We may update these terms. Material changes will be communicated by email. Continued use constitutes acceptance.
        </P>

        {/* 13 */}
        <H2>13. Contact</H2>
        <P>Email: <a href="mailto:support@owed.com" className="text-navy underline hover:text-emerald-600 transition-colors">support@owed.com</a></P>
        <P>Owed, Inc. — Delaware, United States</P>
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
