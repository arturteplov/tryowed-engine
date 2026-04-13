"use client";

import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
      <h2 className="text-base font-semibold text-navy mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({ label, value, type = "text", mono }: { label: string; value: string; type?: string; mono?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 text-sm gap-4">
      <div className="flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        {editing ? (
          <input
            type={type} value={val} onChange={(e) => setVal(e.target.value)} autoFocus
            className={`border border-emerald-400 rounded px-2 py-1 text-sm text-navy focus:outline-none w-full ${mono ? "font-mono text-xs" : ""}`}
          />
        ) : (
          <p className={`text-navy ${mono ? "font-mono text-xs" : ""}`}>{type === "password" ? "••••••••••••••" : val}</p>
        )}
      </div>
      <button
        type="button" onClick={() => setEditing((o) => !o)}
        className="text-xs text-slate-400 hover:text-navy transition-colors shrink-0"
      >
        {editing ? "Save" : "Edit"}
      </button>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-2 h-2 rounded-full" style={{ background: ok ? "#10B981" : "#ef4444" }} />
      <span className={ok ? "text-emerald-700" : "text-red-600"}>{ok ? "Connected" : "Not configured"}</span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_url");
  const stripeConfigured = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== "your_stripe_pub_key");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-navy mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>Settings</h1>

      <Section title="Admin access">
        <FieldRow label="Admin email address" value="admin@example.com" />
        <p className="text-xs text-slate-400 mt-3">Set <code className="bg-slate-100 px-1 rounded">ADMIN_EMAIL</code> in <code className="bg-slate-100 px-1 rounded">.env.local</code> to change this.</p>
      </Section>

      <Section title="CPA partner">
        <FieldRow label="Partner name" value="TaxPro Partners LLC" />
        <FieldRow label="Partner email" value="partner@taxpro.com" />
        <FieldRow label="Default referral fee" value="$65" />
      </Section>

      <Section title="System health">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Supabase</span>
            <StatusDot ok={supabaseConfigured} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Stripe</span>
            <StatusDot ok={stripeConfigured} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Stripe webhooks</span>
            <span className="text-xs text-slate-400">Configure in Stripe dashboard → Webhooks</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Email service</span>
            <span className="text-xs text-slate-400">Add SMTP or Resend API key to enable</span>
          </div>
        </div>
      </Section>

      <Section title="Environment variables">
        <p className="text-xs text-slate-500 mb-3">These live in <code className="bg-slate-100 px-1 rounded">.env.local</code>. Never commit them to git.</p>
        <div className="bg-slate-900 rounded p-4 text-xs font-mono text-slate-300 space-y-1">
          <p><span className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL</span>=your_url</p>
          <p><span className="text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=your_key</p>
          <p><span className="text-emerald-400">SUPABASE_SERVICE_ROLE_KEY</span>=your_service_key</p>
          <p><span className="text-emerald-400">STRIPE_SECRET_KEY</span>=sk_live_...</p>
          <p><span className="text-emerald-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>=pk_live_...</p>
          <p><span className="text-emerald-400">ADMIN_EMAIL</span>=you@yourdomain.com</p>
        </div>
      </Section>

      <Section title="Benefit database">
        <p className="text-sm text-slate-600 mb-3">Manage benefits in Supabase Table Editor → <code className="bg-slate-100 px-1 rounded text-xs">benefits</code> table.</p>
        <a
          href={process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/default/editor` : "#"}
          target="_blank" rel="noopener noreferrer"
          className="text-sm text-navy underline hover:text-emerald-600 transition-colors"
        >
          Open Supabase Table Editor →
        </a>
      </Section>
    </div>
  );
}
