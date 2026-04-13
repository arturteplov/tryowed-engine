"use client";

import { useState } from "react";
import Link from "next/link";

const SUBJECTS = [
  "General question",
  "My claims",
  "Technical issue",
  "Data and privacy",
  "Partnership inquiry",
  "Other",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const canSend = name.trim() && email.trim() && message.trim() && status !== "sending";

  const handleSubmit = async () => {
    if (!canSend) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject, message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Get in touch</h1>
        <p className="text-sm text-slate-500 mt-2 mb-10">Have a question? We respond within 24 hours.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16">

          {/* Left: form */}
          <div className="md:col-span-3">
            {status === "sent" ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="mx-auto mb-3"><polyline points="20 6 9 17 4 12" /></svg>
                <p className="font-semibold text-navy text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Message sent</p>
                <p className="text-sm text-slate-600 mt-1">We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setStatus("idle")} className="mt-4 text-sm text-navy underline hover:text-emerald-600 transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Name<span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Email<span className="text-red-400 ml-0.5">*</span></label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Subject</label>
                  <select
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select a topic...</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Message<span className="text-red-400 ml-0.5">*</span></label>
                  <textarea
                    rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500">Something went wrong. Please try again or email us directly.</p>
                )}

                <button
                  onClick={handleSubmit} disabled={!canSend}
                  className="w-full py-3.5 rounded font-semibold text-white text-sm transition-colors disabled:opacity-40"
                  style={{ background: "#10B981" }}
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </div>
            )}
          </div>

          {/* Right: direct info */}
          <div className="md:col-span-2">
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">General support</p>
                <a href="mailto:support@owed.com" className="text-navy font-medium hover:text-emerald-600 transition-colors">support@owed.com</a>
                <p className="text-sm text-slate-500 mt-1">Within 24 hours, usually much faster.</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Urgent claim issues</p>
                <a href="mailto:urgent@owed.com" className="text-navy font-medium hover:text-emerald-600 transition-colors">urgent@owed.com</a>
                <p className="text-sm text-slate-500 mt-1">If you have an active claim and need immediate help.</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Business inquiries</p>
                <a href="mailto:hello@owed.com" className="text-navy font-medium hover:text-emerald-600 transition-colors">hello@owed.com</a>
                <p className="text-sm text-slate-500 mt-1">Partnerships, press, or investment inquiries.</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Mailing address</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Owed, Inc.<br />
                  Delaware, United States
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 text-xs text-slate-400">
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
