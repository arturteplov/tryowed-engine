"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const TOTAL_STEPS = 7;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClaimItem {
  id: string;
  name: string;
  estimated_amount: number;
  category: string;
  selected: boolean;
}

interface PrevAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  years: string;
}

// ─── Mock profile + claims (replaced by Supabase data when connected) ─────────

const MOCK_CLAIMS: ClaimItem[] = [
  { id: "c1", name: "Earned Income Tax Credit", estimated_amount: 2800, category: "Federal Tax Credit", selected: true },
  { id: "c2", name: "Child Tax Credit (Amended Return)", estimated_amount: 2000, category: "Federal Tax Credit", selected: true },
  { id: "c3", name: "State Unclaimed Property", estimated_amount: 1200, category: "Unclaimed Property", selected: true },
  { id: "c4", name: "American Opportunity Tax Credit", estimated_amount: 2500, category: "Federal Tax Credit", selected: true },
  { id: "c5", name: "State Renter Credit", estimated_amount: 400, category: "State Tax Credit", selected: true },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  const progress = (step / TOTAL_STEPS) * 100;
  return (
    <>
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-navy font-semibold text-base" style={{ fontFamily: "var(--font-fraunces)" }}>Owed</Link>
          <span className="text-xs text-slate-400">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-0.5 bg-slate-100">
          <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: "#10B981" }} />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>{title}</h1>
        {subtitle && <p className="text-slate-500 mt-2 text-sm leading-relaxed">{subtitle}</p>}
      </div>
    </>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continue", nextDisabled, loading }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mt-8">
      {onBack && (
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-navy transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
      )}
      <button
        type="button" onClick={onNext} disabled={nextDisabled || loading}
        className="flex-1 py-3.5 rounded font-semibold text-white text-sm transition-colors disabled:opacity-40"
        style={{ background: "#10B981" }}
      >
        {loading ? "Processing..." : nextLabel}
      </button>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, autoComplete, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm focus:outline-none focus:border-emerald-500 transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded px-4 py-3 text-navy text-sm bg-white focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Step 1: Review Claims ────────────────────────────────────────────────────

function Step1ReviewClaims({ claims, setClaims, onNext }: {
  claims: ClaimItem[]; setClaims: (c: ClaimItem[]) => void; onNext: () => void;
}) {
  const selected = claims.filter((c) => c.selected);
  const total = selected.reduce((s, c) => s + c.estimated_amount, 0);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader step={1} title="Review your claims" subtitle="All eligible claims are selected by default. Uncheck any you'd prefer to skip." />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-slate-600">{selected.length} claim{selected.length !== 1 ? "s" : ""} selected</span>
          <span className="font-semibold text-navy" style={{ fontFamily: "var(--font-fraunces)" }}>
            ~${total.toLocaleString()} estimated
          </span>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {claims.map((claim) => (
            <label key={claim.id} className={`flex items-start gap-4 p-4 rounded border cursor-pointer transition-all ${claim.selected ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"}`}>
              <input
                type="checkbox" checked={claim.selected}
                onChange={() => setClaims(claims.map((c) => c.id === claim.id ? { ...c, selected: !c.selected } : c))}
                className="mt-0.5 w-4 h-4 accent-emerald-500"
              />
              <div className="flex-1">
                <p className="font-semibold text-navy text-sm" style={{ fontFamily: "var(--font-fraunces)" }}>{claim.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{claim.category}</p>
              </div>
              <p className="font-semibold text-sm shrink-0" style={{ color: "#10B981" }}>~${claim.estimated_amount.toLocaleString()}</p>
            </label>
          ))}
        </div>
        <NavButtons onNext={onNext} nextLabel="Confirm selection" nextDisabled={selected.length === 0} />
      </div>
    </div>
  );
}

// ─── Step 2: Priority Filing Upsell ──────────────────────────────────────────

function Step2Priority({ isPriority, setIsPriority, onBack, onNext, loading }: {
  isPriority: boolean; setIsPriority: (v: boolean) => void;
  onBack: () => void; onNext: () => void; loading: boolean;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader step={2} title="How quickly do you want us to file?" />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Standard */}
          <button
            type="button" onClick={() => setIsPriority(false)}
            className={`text-left p-5 rounded-lg border-2 transition-all ${!isPriority ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <p className="font-semibold text-navy text-base mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>Standard</p>
            <p className="text-2xl font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Free</p>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>We begin filing within 2–3 weeks</li>
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>Email updates at each stage</li>
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>Full tracking dashboard</li>
            </ul>
            <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200 leading-relaxed">
              20% service fee applies only if we find you&apos;re owed money, charged after you receive funds.
            </p>
          </button>

          {/* Priority */}
          <button
            type="button" onClick={() => setIsPriority(true)}
            className={`text-left p-5 rounded-lg border-2 transition-all relative ${isPriority ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"}`}
          >
            <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#10B981", color: "white" }}>RECOMMENDED</span>
            <p className="font-semibold text-navy text-base mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>Priority</p>
            <p className="text-2xl font-semibold text-navy mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>$29</p>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg><span><strong>We start within 48 hours</strong></span></li>
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>Dedicated case attention</li>
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>Priority case tracking dashboard</li>
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>Faster payout — claims resolved sooner</li>
              <li className="flex items-start gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>Direct email line to your case handler</li>
            </ul>
            <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-emerald-200 leading-relaxed">
              20% service fee applies only if we find you&apos;re owed money, charged after you receive funds.
            </p>
          </button>
        </div>
        <NavButtons onBack={onBack} onNext={onNext} loading={loading} nextLabel={isPriority ? "Continue (priority selected)" : "Continue (standard)"} />
      </div>
    </div>
  );
}

// ─── SSN validation helpers ───────────────────────────────────────────────────

function validateSSN(s1: string, s2: string, s3: string): string | null {
  if (s1.length < 3 || s2.length < 2 || s3.length < 4) return null; // incomplete — no error yet
  if (s1 === "000" || s2 === "00" || s3 === "0000") return "Invalid SSN — all-zero segments are not issued.";
  if (s1 === "666") return "Invalid SSN — numbers beginning with 666 are not issued.";
  if (s1.startsWith("9")) return "Invalid SSN — numbers starting with 9 are not issued (ITINs are not accepted here).";
  return null;
}

// ZIP: accepts 5-digit or ZIP+4 (e.g. 10001-1234). Rejects anything else.
function validateZip(zip: string): string | null {
  if (!zip) return null;
  if (/^\d{5}(-\d{4})?$/.test(zip)) return null;
  // Detect likely Canadian postal code (letter-digit pattern)
  if (/^[A-Za-z]\d[A-Za-z]/.test(zip)) {
    return "Please enter a valid US ZIP code. This service is currently available for US residents only.";
  }
  return "Please enter a valid US ZIP code (e.g. 10001 or 10001-1234).";
}

// ─── Masked SSN segment input ─────────────────────────────────────────────────
// Focused → type="text" so digits flow in normally.
// Blurred  → type="password" so the browser masks digits with bullets automatically.
// Value is always the raw digit string — no display/mask juggling.

function SSNSegment({ value, onChange, maxLength, placeholder, segmentRef, onComplete, hasError }: {
  value: string; onChange: (v: string) => void; maxLength: number;
  placeholder: string; segmentRef?: React.RefObject<HTMLInputElement | null>;
  onComplete?: () => void; hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  const fieldClass = `border rounded px-3 py-3 text-navy text-sm text-center focus:outline-none tracking-widest transition-colors ${
    hasError ? "border-red-400 bg-red-50 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
  }`;

  return (
    <input
      ref={segmentRef as React.RefObject<HTMLInputElement>}
      type={focused ? "text" : "password"}
      inputMode="numeric"
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, maxLength);
        onChange(digits);
        if (digits.length >= maxLength) onComplete?.();
      }}
      className={fieldClass}
      style={{ width: maxLength === 3 ? "5rem" : maxLength === 2 ? "4rem" : "6rem" }}
      autoComplete="off"
    />
  );
}

// ─── Step 3: Identity Verification ───────────────────────────────────────────

function Step3Identity({ data, setData, onBack, onNext }: {
  data: { firstName: string; lastName: string; dob: string; ssn1: string; ssn2: string; ssn3: string; street: string; city: string; state: string; zip: string };
  setData: (d: Parameters<typeof Step3Identity>[0]["data"]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const [ssnTooltip, setSsnTooltip] = useState(false);
  const [ssnTouched, setSsnTouched] = useState(false);
  const [zipTouched, setZipTouched] = useState(false);
  const ssn2Ref = useRef<HTMLInputElement>(null);
  const ssn3Ref = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof data) => (v: string) => setData({ ...data, [key]: v });

  const ssnError = ssnTouched ? validateSSN(data.ssn1, data.ssn2, data.ssn3) : null;
  const zipError = zipTouched ? validateZip(data.zip) : null;

  const ssnComplete = data.ssn1.length === 3 && data.ssn2.length === 2 && data.ssn3.length === 4;
  const zipValid = /^\d{5}(-\d{4})?$/.test(data.zip);

  const isValid =
    ssnComplete &&
    !validateSSN(data.ssn1, data.ssn2, data.ssn3) &&
    data.street && data.city && data.state &&
    zipValid;

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader
        step={3}
        title="Identity verification"
        subtitle="Required by government agencies to process your claims — without this we can't proceed on your behalf."
      />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">
        <div className="flex flex-col gap-4">

          {/* SSN */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-sm text-slate-600">Social Security Number<span className="text-red-400 ml-0.5">*</span></label>
              <button type="button" onClick={() => setSsnTooltip((o) => !o)} className="text-slate-400 hover:text-navy transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              </button>
            </div>
            {ssnTooltip && (
              <div className="mb-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-3 py-2 leading-relaxed">
                Government agencies and unclaimed property offices require your SSN to verify identity and release funds. Without it, claims cannot be processed on your behalf.
              </div>
            )}
            <div className="flex items-center gap-2">
              <SSNSegment
                value={data.ssn1}
                maxLength={3}
                placeholder="•••"
                hasError={!!ssnError}
                onChange={(v) => { set("ssn1")(v); if (v.length === 0) setSsnTouched(false); }}
                onComplete={() => ssn2Ref.current?.focus()}
              />
              <span className="text-slate-400 font-medium">–</span>
              <SSNSegment
                value={data.ssn2}
                maxLength={2}
                placeholder="••"
                hasError={!!ssnError}
                segmentRef={ssn2Ref}
                onChange={(v) => set("ssn2")(v)}
                onComplete={() => ssn3Ref.current?.focus()}
              />
              <span className="text-slate-400 font-medium">–</span>
              <SSNSegment
                value={data.ssn3}
                maxLength={4}
                placeholder="••••"
                hasError={!!ssnError}
                segmentRef={ssn3Ref}
                onChange={(v) => { set("ssn3")(v); if (v.length === 4) setSsnTouched(true); }}
              />
            </div>
            {ssnError ? (
              <p className="text-xs text-red-500 mt-2">{ssnError}</p>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <p className="text-xs text-slate-400">256-bit encrypted · Stored securely · Never shared with third parties</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm font-medium text-navy mb-3">Current address</p>
            <div className="flex flex-col gap-3">
              <InputField label="Street address" value={data.street} onChange={set("street")} autoComplete="street-address" required />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="City" value={data.city} onChange={set("city")} autoComplete="address-level2" required />
                <SelectField label="State" value={data.state} onChange={set("state")} options={US_STATES} required />
              </div>

              {/* ZIP with validation */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">
                  ZIP code<span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="10001 or 10001-1234"
                  value={data.zip}
                  onChange={(e) => { set("zip")(e.target.value); if (zipTouched) setZipTouched(true); }}
                  onBlur={() => setZipTouched(true)}
                  maxLength={10}
                  className={`w-full border rounded px-4 py-3 text-navy text-sm focus:outline-none transition-colors ${
                    zipError ? "border-red-400 bg-red-50 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
                  }`}
                />
                {zipError && <p className="text-xs text-red-500 mt-1.5 leading-relaxed">{zipError}</p>}
              </div>
            </div>
          </div>
        </div>
        <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      </div>
    </div>
  );
}

// ─── Step 4: Previous Addresses ───────────────────────────────────────────────

function Step4Addresses({ addresses, setAddresses, onBack, onNext }: {
  addresses: PrevAddress[]; setAddresses: (a: PrevAddress[]) => void; onBack: () => void; onNext: () => void;
}) {
  const blankAddr = (): PrevAddress => ({ street: "", city: "", state: "", zip: "", years: "" });

  const update = (i: number, key: keyof PrevAddress, v: string) => {
    setAddresses(addresses.map((a, idx) => idx === i ? { ...a, [key]: v } : a));
  };
  const remove = (i: number) => setAddresses(addresses.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader step={4} title="Previous addresses" subtitle="This helps us search unclaimed property databases more thoroughly. Companies and states may have your old address on file." />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">
        {addresses.length === 0 ? (
          <div className="border border-slate-200 rounded p-6 text-center text-slate-500 text-sm mb-6">
            No previous addresses added yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6 mb-6">
            {addresses.map((addr, i) => (
              <div key={i} className="border border-slate-200 rounded p-4 relative">
                <button type="button" onClick={() => remove(i)} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <p className="text-sm font-semibold text-navy mb-3">Address {i + 1}</p>
                <div className="flex flex-col gap-3">
                  <InputField label="Street address" value={addr.street} onChange={(v) => update(i, "street", v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="City" value={addr.city} onChange={(v) => update(i, "city", v)} />
                    <SelectField label="State" value={addr.state} onChange={(v) => update(i, "state", v)} options={US_STATES} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="ZIP code" value={addr.zip} onChange={(v) => update(i, "zip", v)} />
                    <InputField label="Approx. years lived there" value={addr.years} onChange={(v) => update(i, "years", v)} placeholder="e.g. 2018–2021" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button" onClick={() => setAddresses([...addresses, blankAddr()])}
          className="w-full border-2 border-dashed border-slate-200 rounded py-3 text-sm text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors mb-2"
        >
          + Add another address
        </button>
        <NavButtons onBack={onBack} onNext={onNext} nextLabel={addresses.length === 0 ? "Skip — only one address" : "Continue"} />
      </div>
    </div>
  );
}

// ─── Step 5: Documents ────────────────────────────────────────────────────────

function Step5Documents({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [taxFile, setTaxFile] = useState<File | null>(null);

  const FileUpload = ({ label, hint, file, setFile }: { label: string; hint: string; file: File | null; setFile: (f: File | null) => void }) => (
    <div className="border border-slate-200 rounded p-4">
      <p className="text-sm font-medium text-navy mb-1">{label}</p>
      <p className="text-xs text-slate-400 mb-3">{hint}</p>
      {file ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-sm text-navy flex-1 truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-400 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <div className="border-2 border-dashed border-slate-200 rounded py-4 text-center text-sm text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
            Click to upload · JPG, PNG, PDF · Max 10MB
          </div>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
        </label>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader step={5} title="Supporting documents" subtitle="Optional. Uploading documents speeds up processing. We'll ask if we need something specific." />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">
        <div className="flex flex-col gap-4 mb-6">
          <FileUpload label="Photo ID" hint="Driver's license or passport. Speeds up claim verification." file={idFile} setFile={setIdFile} />
          <FileUpload label="Most recent tax return or W-2" hint="Helps verify income for tax credit claims." file={taxFile} setFile={setTaxFile} />
        </div>
        <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue — we'll request if needed" />
      </div>
    </div>
  );
}

// ─── Step 6: Payment Authorization (real Stripe CardElement) ─────────────────

function Step6PaymentInner({ isPriority, profileId, onBack, onNext, agreed, setAgreed, confirmed, setConfirmed, onPaymentMethodSaved }: {
  isPriority: boolean; profileId: string; onBack: () => void; onNext: () => void;
  agreed: boolean; setAgreed: (v: boolean) => void; confirmed: boolean; setConfirmed: (v: boolean) => void;
  onPaymentMethodSaved: (pmId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const canSubmit = agreed && confirmed && cardComplete && !!stripe && !!elements;

  const handleAuthorize = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setProcessing(true);
    setCardError(null);

    // Create a reusable payment method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error || !paymentMethod) {
      setCardError(error?.message ?? "Card declined. Please try another card.");
      setProcessing(false);
      return;
    }

    // If priority: charge $29 server-side now
    if (isPriority && profileId && profileId !== "demo") {
      const res = await fetch("/api/charge-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method_id: paymentMethod.id, profile_id: profileId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCardError(data.error ?? "Priority payment failed. Please try another card.");
        setProcessing(false);
        return;
      }
    }

    // Save PM ID to parent and save to profile
    onPaymentMethodSaved(paymentMethod.id);
    if (profileId && profileId !== "demo") {
      await supabase.from("profiles").update({ stripe_payment_method_id: paymentMethod.id }).eq("id", profileId);
    }

    setProcessing(false);
    onNext();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader step={6} title="Payment authorization" />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">

        {/* Real Stripe CardElement */}
        <div className="border border-slate-200 rounded p-4 mb-5">
          <p className="text-sm font-medium text-navy mb-3">Card details</p>
          <div className={`border rounded px-4 py-3 transition-colors ${cardError ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#0A2540",
                    fontFamily: "system-ui, sans-serif",
                    "::placeholder": { color: "#94a3b8" },
                  },
                  invalid: { color: "#dc2626" },
                },
                hidePostalCode: false,
              }}
              onChange={(e) => {
                setCardComplete(e.complete);
                setCardError(e.error?.message ?? null);
              }}
            />
          </div>
          {cardError && <p className="text-xs text-red-500 mt-2">{cardError}</p>}
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Secured by Stripe. Your card number never touches our servers.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm text-slate-600 leading-relaxed mb-5">
          <p>
            You authorize a charge of <strong>20% of any money we successfully recover</strong> on your behalf.
            Your card will <strong>only be charged after you confirm receipt of funds</strong>.
            If we recover nothing, you are charged nothing.
            {isPriority && <span> The $29 priority fee will be charged now when you click authorize.</span>}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0" />
            <span className="text-sm text-slate-600">
              I agree to the{" "}
              <Link href="/terms" className="underline hover:text-navy">Terms of Service</Link>{" "}
              and authorize Owed to file claims on my behalf.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0" />
            <span className="text-sm text-slate-600">I confirm all information I have provided is accurate.</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-navy transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
          <button
            type="button" onClick={handleAuthorize} disabled={!canSubmit || processing}
            className="flex-1 py-3.5 rounded font-semibold text-white text-sm transition-colors disabled:opacity-40"
            style={{ background: "#10B981" }}
          >
            {processing
              ? isPriority ? "Charging $29..." : "Saving card..."
              : isPriority ? "Authorize & pay $29 priority fee" : "Authorize filing"}
          </button>
        </div>
        {!cardComplete && (agreed || confirmed) && (
          <p className="text-xs text-slate-400 mt-2 text-center">Enter your card details above to continue.</p>
        )}
      </div>
    </div>
  );
}

// Wrapper that provides the Elements context for Step 6
function Step6Payment(props: Parameters<typeof Step6PaymentInner>[0]) {
  return (
    <Elements stripe={getStripe()}>
      <Step6PaymentInner {...props} />
    </Elements>
  );
}

// ─── Step 7: Confirmation ─────────────────────────────────────────────────────

function Step7Confirmation({ claims, isPriority, profileId, onBack, onSubmit, loading }: {
  claims: ClaimItem[]; isPriority: boolean; profileId: string;
  onBack: () => void; onSubmit: () => void; loading: boolean;
}) {
  const selected = claims.filter((c) => c.selected);
  const total = selected.reduce((s, c) => s + c.estimated_amount, 0);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <StepHeader step={7} title="Ready to submit" subtitle="Review everything before we begin." />
      <div className="max-w-2xl mx-auto px-4 pb-16 flex-1">
        {/* Summary */}
        <div className="border border-slate-200 rounded overflow-hidden mb-6">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-navy">Claims summary</p>
          </div>
          {selected.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-navy">{c.name}</p>
                <p className="text-xs text-slate-400">{c.category}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#10B981" }}>~${c.estimated_amount.toLocaleString()}</p>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
            <p className="text-sm font-semibold text-navy">Total estimated</p>
            <p className="font-semibold" style={{ color: "#10B981", fontFamily: "var(--font-fraunces)" }}>~${total.toLocaleString()}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-slate-50 rounded p-3">
            <p className="text-slate-400 text-xs mb-1">Filing type</p>
            <p className="font-semibold text-navy">{isPriority ? "Priority ($29)" : "Standard (free)"}</p>
          </div>
          <div className="bg-slate-50 rounded p-3">
            <p className="text-slate-400 text-xs mb-1">Recovery fee</p>
            <p className="font-semibold text-navy">20% of recovered</p>
          </div>
          <div className="bg-slate-50 rounded p-3 col-span-2">
            <p className="text-slate-400 text-xs mb-1">Estimated timeline</p>
            <p className="font-semibold text-navy">{isPriority ? "48 hrs to file · 4–12 weeks for agencies to process" : "2–3 weeks to file · 4–12 weeks for agencies to process"}</p>
          </div>
        </div>

        {/* What happens next */}
        <div className="border border-slate-200 rounded p-4 mb-6">
          <p className="text-sm font-semibold text-navy mb-3">What happens next</p>
          <ol className="space-y-3">
            {[
              isPriority ? "We prepare and submit your claims within 48 hours." : "We prepare and submit your claims within 2–3 weeks.",
              "Government agencies and databases process your claims (typically 4–12 weeks).",
              "We notify you when money is deposited to your account.",
              "You confirm receipt and we collect our 20% fee.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0 font-semibold mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <NavButtons onBack={onBack} onNext={onSubmit} loading={loading} nextLabel="Submit and start my claims" />
      </div>
    </div>
  );
}

// ─── Main Claim Page ──────────────────────────────────────────────────────────

export default function ClaimPage({ params }: { params: Promise<{ profile_id: string }> }) {
  const router = useRouter();
  const [profileId, setProfileId] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<ClaimItem[]>(MOCK_CLAIMS);
  const [isPriority, setIsPriority] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [prevAddresses, setPrevAddresses] = useState<PrevAddress[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const [identity, setIdentity] = useState({
    firstName: "", lastName: "", dob: "", ssn1: "", ssn2: "", ssn3: "",
    street: "", city: "", state: "", zip: "",
  });

  useEffect(() => { params.then((p) => setProfileId(p.profile_id)); }, [params]);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selected = claims.filter((c) => c.selected);
      // Mark selected matches as "filing" in DB
      await supabase.from("matches").upsert(
        selected.map((c) => ({
          profile_id: profileId,
          benefit_id: c.id,
          status: "filing",
          estimated_amount: c.estimated_amount,
        })),
        { onConflict: "profile_id,benefit_id" }
      );
      // Save current + previous addresses to profile
      if (profileId && profileId !== "demo") {
        await supabase.from("profiles").update({
          current_address: {
            street: identity.street,
            city: identity.city,
            state: identity.state,
            zip: identity.zip,
          },
          previous_addresses: prevAddresses,
        }).eq("id", profileId);
      }
      router.push(`/dashboard/${profileId}`);
    } catch {
      router.push(`/dashboard/${profileId}`);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) return <Step1ReviewClaims claims={claims} setClaims={setClaims} onNext={next} />;
  if (step === 2) return <Step2Priority isPriority={isPriority} setIsPriority={setIsPriority} onBack={back} onNext={next} loading={false} />;
  if (step === 3) return <Step3Identity data={identity} setData={setIdentity} onBack={back} onNext={next} />;
  if (step === 4) return <Step4Addresses addresses={prevAddresses} setAddresses={setPrevAddresses} onBack={back} onNext={next} />;
  if (step === 5) return <Step5Documents onBack={back} onNext={next} />;
  if (step === 6) return (
    <Step6Payment
      isPriority={isPriority}
      profileId={profileId}
      onBack={back}
      onNext={next}
      agreed={agreed}
      setAgreed={setAgreed}
      confirmed={confirmed}
      setConfirmed={setConfirmed}
      onPaymentMethodSaved={(pmId) => setPaymentMethodId(pmId)}
    />
  );
  return <Step7Confirmation claims={claims} isPriority={isPriority} profileId={profileId} onBack={back} onSubmit={handleSubmit} loading={loading} />;
}
