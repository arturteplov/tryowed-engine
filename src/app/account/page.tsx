"use client";

import { useState } from "react";
import Link from "next/link";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
        <h2 className="text-base font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 text-sm gap-4">
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-navy mt-0.5">{value}</p>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-slate-400 hover:text-navy transition-colors shrink-0">Edit</button>
      )}
    </div>
  );
}

export default function AccountPage() {
  // Mock profile data — in production, fetch from Supabase using profile_id
  const [profile] = useState({
    name: "Sarah M.",
    email: "sarah@example.com",
    state: "California",
    address: "123 Main St, Los Angeles, CA 90001",
    cardLast4: "4242",
    cardExpiry: "12/28",
    hasClaimWatch: false,
    activeClaims: 2,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "pending" | "done">("idle");
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "sent">("idle");

  const canDelete = deleteInput === "DELETE";

  const handleDelete = () => {
    setDeleteStatus("pending");
    // In production: POST to /api/delete-account → queue deletion, cancel subs
    setTimeout(() => setDeleteStatus("done"), 1500);
  };

  const handleDownload = () => {
    setDownloadStatus("downloading");
    // In production: POST to /api/export-data → generate + email JSON/CSV
    setTimeout(() => setDownloadStatus("sent"), 2000);
  };

  if (deleteStatus === "done") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
        <div className="max-w-md text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="mx-auto mb-4"><polyline points="20 6 9 17 4 12" /></svg>
          <h1 className="text-2xl font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Deletion request received</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Your data has been queued for deletion. You&apos;ll receive email confirmation within 72 hours.
          </p>
          <Link href="/" className="text-sm text-navy underline hover:text-emerald-600 transition-colors">Return to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
          <span className="text-xs text-slate-400">Account settings</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>Account settings</h1>

        {/* 1. Your information */}
        <SectionCard title="Your information">
          <InfoRow label="Name" value={profile.name} onEdit={() => {}} />
          <InfoRow label="Email" value={profile.email} onEdit={() => {}} />
          <InfoRow label="State" value={profile.state} onEdit={() => {}} />
          <InfoRow label="Address" value={profile.address} onEdit={() => {}} />
        </SectionCard>

        {/* 2. Payment methods */}
        <SectionCard title="Payment methods">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                <svg width="20" height="14" viewBox="0 0 24 16" fill="none" stroke="#64748b" strokeWidth="1.5"><rect x="1" y="1" width="22" height="14" rx="2" /><line x1="1" y1="6" x2="23" y2="6" /></svg>
              </div>
              <div>
                <p className="text-navy">Visa ending in {profile.cardLast4}</p>
                <p className="text-xs text-slate-400">Expires {profile.cardExpiry}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="text-xs text-navy hover:text-emerald-600 transition-colors">Update</button>
              <button className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
            </div>
          </div>
        </SectionCard>

        {/* 3. Subscriptions */}
        <SectionCard title="Subscriptions">
          {profile.hasClaimWatch ? (
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-navy font-medium">ClaimWatch</p>
                <p className="text-xs text-slate-400">$7.99/month · Next billing: May 11, 2026</p>
              </div>
              <button className="text-xs text-red-400 hover:text-red-600 transition-colors">Cancel subscription</button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active subscriptions.</p>
          )}
        </SectionCard>

        {/* 4. Your data */}
        <SectionCard title="Your data">
          <p className="text-sm text-slate-600 mb-4">We store the following data about you:</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {["Name", "Email", "Date of birth", "SSN (encrypted)", "Addresses", "Questionnaire answers", "Documents uploaded", "Claim history", "Payment history"].map((item) => (
              <span key={item} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">{item}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={downloadStatus === "downloading"}
              className="px-4 py-2.5 rounded text-sm font-semibold text-navy border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {downloadStatus === "downloading" ? "Preparing..." : downloadStatus === "sent" ? "Data sent to your email" : "Download my data"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 rounded text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Delete all my data
            </button>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-6 border border-red-200 rounded-lg p-5 bg-red-50">
              <p className="text-sm font-semibold text-red-700 mb-3">Are you sure? This will permanently delete:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-600 mb-4">
                <li>Your account and profile</li>
                <li>All saved information including SSN</li>
                <li>All uploaded documents</li>
                <li>Your claim history</li>
                <li>Your payment method</li>
              </ul>

              {profile.activeClaims > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700 mb-4">
                  You have {profile.activeClaims} active claim{profile.activeClaims > 1 ? "s" : ""}. These will be completed before deletion.
                  Your data will be deleted within 72 hours after all claims are resolved.
                </div>
              ) : (
                <p className="text-sm text-red-600 mb-4">Your data will be deleted within 72 hours.</p>
              )}

              <div className="mb-4">
                <label className="text-sm text-red-700 font-medium mb-1.5 block">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full max-w-xs border border-red-300 rounded px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || deleteStatus === "pending"}
                  className="px-4 py-2.5 rounded text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40"
                >
                  {deleteStatus === "pending" ? "Deleting..." : "Permanently delete everything"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  className="text-sm text-slate-500 hover:text-navy transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* 5. Need help? */}
        <SectionCard title="Need help?">
          <p className="text-sm text-slate-600">
            Contact us: <a href="mailto:support@tryowed.com" className="text-navy underline hover:text-emerald-600 transition-colors">support@tryowed.com</a>
          </p>
        </SectionCard>
      </main>
    </div>
  );
}
