"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// ─── Constants ────────────────────────────────────────────────────────────────

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

const LIFE_EVENTS = [
  "Had a baby",
  "Got married",
  "Got divorced",
  "Moved states",
  "Lost a job",
  "Retired",
  "Started a business",
  "None",
];

const TAX_YEARS = ["2019", "2020", "2021", "2022", "2023", "2024"];

const TOTAL_STEPS = 13;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Answers {
  state: string;
  other_states: string[];
  income_range: string;
  employment_type: string;
  filing_status: string;
  has_children: boolean | null;
  num_children: number;
  children_ages: string;
  filed_taxes: string;           // "Filed every year" | "Missed some" | "Haven't filed in years" | "Not sure"
  missed_specific_years: string[];
  has_disability: string;
  education: string;
  living_situation: string;
  life_events: string[];
  dob: string;
  first_name: string;
  last_name: string;
  email: string;
}

const INITIAL: Answers = {
  state: "",
  other_states: [],
  income_range: "",
  employment_type: "",
  filing_status: "",
  has_children: null,
  num_children: 1,
  children_ages: "",
  filed_taxes: "",
  missed_specific_years: [],
  has_disability: "",
  education: "",
  living_situation: "",
  life_events: [],
  dob: "",
  first_name: "",
  last_name: "",
  email: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function WhyTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        Why we ask this
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p className="mt-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2 leading-relaxed max-w-sm">
          {text}
        </p>
      )}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded border text-sm sm:text-base transition-all duration-150 font-medium flex items-center gap-3 ${
        selected
          ? "border-emerald-500 bg-emerald-50 text-navy"
          : "border-slate-200 bg-white text-navy hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span
        className={`shrink-0 w-5 h-5 rounded${multi ? "" : "-full"} border-2 flex items-center justify-center transition-colors ${
          selected ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
        }`}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function ContinueBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded font-semibold text-white text-sm transition-colors disabled:opacity-40"
      style={{ background: "#10B981" }}
    >
      Continue
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  // ── Slide transition
  const goTo = useCallback((nextStep: number, dir: "forward" | "back") => {
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
      window.scrollTo({ top: 0 });
    }, 220);
  }, []);

  const advance = useCallback(() => {
    if (step < TOTAL_STEPS - 1) goTo(step + 1, "forward");
  }, [step, goTo]);

  const back = useCallback(() => {
    if (step > 0) goTo(step - 1, "back");
  }, [step, goTo]);

  // Single-select + auto-advance
  const pickSingle = useCallback(
    (field: keyof Answers, value: string | boolean) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));
      setTimeout(() => advance(), 280);
    },
    [advance]
  );

  // Multi-select toggle (handles "None" / "No, just this one" exclusive logic)
  const toggleMulti = useCallback((field: keyof Answers, value: string) => {
    setAnswers((prev) => {
      const arr = prev[field] as string[];
      if (value === "No, just this one" || value === "None") {
        return { ...prev, [field]: [value] };
      }
      const filtered = arr.filter((v) => v !== "No, just this one" && v !== "None");
      return {
        ...prev,
        [field]: filtered.includes(value)
          ? filtered.filter((v) => v !== value)
          : [...filtered, value],
      };
    });
  }, []);

  // ── Submit
  const handleSubmit = async () => {
    if (!answers.first_name.trim() || !answers.last_name.trim()) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!answers.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);

    // Build missed_tax_years array
    let missed_tax_years: string[] = [];
    if (answers.filed_taxes === "Missed some years") {
      missed_tax_years = answers.missed_specific_years;
    } else if (answers.filed_taxes === "Haven't filed in years") {
      missed_tax_years = TAX_YEARS;
    }

    const payload = {
      email: answers.email.trim().toLowerCase(),
      first_name: answers.first_name.trim(),
      last_name: answers.last_name.trim(),
      date_of_birth: answers.dob || null,
      state: answers.state,
      income_range: answers.income_range,
      filing_status: answers.filing_status,
      has_children: answers.has_children === true,
      num_children: answers.has_children ? answers.num_children : 0,
      children_ages: answers.has_children
        ? answers.children_ages.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      living_situation: answers.living_situation,
      has_disability: answers.has_disability === "Yes",
      employment_type: answers.employment_type,
      has_post_secondary:
        answers.education === "Yes, completed degree" ||
        answers.education === "Currently enrolled" ||
        answers.education === "Have loans but no degree",
      filed_taxes_all_years: answers.filed_taxes === "Filed every year",
      missed_tax_years,
      life_events: answers.life_events.filter((e) => e !== "None"),
    };

    console.log("[Questionnaire] Payload being sent to /api/profile:", JSON.stringify(payload, null, 2));

    // All states the user has lived in (for unclaimed property search)
    const allStates = [
      answers.state,
      ...answers.other_states.filter((s) => s !== "No, just this one"),
    ].filter(Boolean);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Profile save failed");

      const statesParam = encodeURIComponent(allStates.join(","));
      router.push(`/results/${json.id}?states=${statesParam}`);
    } catch (err) {
      console.error(err);
      const statesParam = encodeURIComponent(allStates.join(","));
      router.push(`/results/demo?states=${statesParam}`);
    }
  };

  // ── Slide animation styles
  const slideStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateX(0)"
      : direction === "forward"
      ? "translateX(32px)"
      : "translateX(-32px)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  };

  const LAST_STEP = TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-dm-sans)" }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-navy font-semibold text-base"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Owed
          </Link>
          <span className="text-xs text-slate-400">
            {step + 1} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: "#10B981" }}
          />
        </div>
      </header>

      {/* ── Question area ──────────────────────────────────────────────────── */}
      <main
        ref={containerRef}
        className="flex-1 flex flex-col items-center px-4 py-10 sm:py-16 overflow-y-auto"
      >
        <div className="w-full max-w-xl" style={slideStyle}>

          {/* Back button */}
          {step > 0 && (
            <button
              onClick={back}
              className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}

          {/* ── Q1: Current state (step 0) ─────────────────────────────── */}
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What state do you currently live in?
                </h1>
                <WhyTooltip text="Benefits vary by state. We need this to check state-specific programs." />
              </div>
              <select
                className="w-full border border-slate-200 rounded px-4 py-3.5 text-navy text-sm sm:text-base bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                value={answers.state}
                onChange={(e) => {
                  setAnswers((p) => ({ ...p, state: e.target.value }));
                  if (e.target.value) setTimeout(() => advance(), 200);
                }}
              >
                <option value="">Select your state...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* ── Q2: Other states (step 1) — ENHANCED ─────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-2">
                  Important for unclaimed property
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What other states have you lived in during the past 10 years?
                </h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Include any state where you&apos;ve lived, worked, or had a bank account.
                  Unclaimed money could be held in any of them.
                </p>
                <WhyTooltip text="Each state holds unclaimed property separately. A forgotten bank account, uncashed check, or utility deposit from a previous address could be sitting in that state's treasury right now." />
              </div>

              {/* "None" option first */}
              <OptionButton
                label="No — I've only ever lived in this state"
                selected={answers.other_states.includes("No, just this one")}
                onClick={() => toggleMulti("other_states", "No, just this one")}
                multi
              />

              {/* State grid */}
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-widest">
                  Or select all that apply
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {US_STATES.filter((s) => s !== answers.state).map((s) => (
                    <OptionButton
                      key={s}
                      label={s}
                      selected={answers.other_states.includes(s)}
                      onClick={() => toggleMulti("other_states", s)}
                      multi
                    />
                  ))}
                </div>
              </div>

              {/* Selected count badge */}
              {answers.other_states.filter((s) => s !== "No, just this one").length > 0 && (
                <p className="text-sm text-emerald-600 font-medium">
                  {answers.other_states.filter((s) => s !== "No, just this one").length} state
                  {answers.other_states.filter((s) => s !== "No, just this one").length > 1 ? "s" : ""} selected —
                  we&apos;ll search each one.
                </p>
              )}

              <ContinueBtn
                onClick={advance}
                disabled={answers.other_states.length === 0}
              />
            </div>
          )}

          {/* ── Q3: Income (step 2) ────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What&apos;s your approximate annual household income?
                </h1>
                <WhyTooltip text="Many benefits are income-based. We don't need exact numbers — just the range." />
              </div>
              <div className="flex flex-col gap-2">
                {["Under $20K", "$20–40K", "$40–60K", "$60–80K", "$80–100K", "$100K+"].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.income_range === v}
                    onClick={() => pickSingle("income_range", v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Q4: Employment (step 3) ────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What&apos;s your employment situation?
                </h1>
                <WhyTooltip text="Certain credits like the Earned Income Tax Credit depend on employment type and income from work." />
              </div>
              <div className="flex flex-col gap-2">
                {["Employed full-time", "Part-time", "Self-employed", "Unemployed", "Retired", "Student"].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.employment_type === v}
                    onClick={() => pickSingle("employment_type", v.toLowerCase().replace(/ /g, "_"))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Q5: Filing status (step 4) ─────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What&apos;s your filing status?
                </h1>
                <WhyTooltip text="Your filing status determines which credits you qualify for and the dollar amounts you're eligible to claim." />
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Single",
                  "Married filing jointly",
                  "Married filing separately",
                  "Head of household",
                ].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.filing_status === v}
                    onClick={() => pickSingle("filing_status", v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Q6: Children (step 5) ──────────────────────────────────── */}
          {step === 5 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Do you have children under 17?
                </h1>
                <WhyTooltip text="The Child Tax Credit and other family benefits could apply. Each qualifying child can add $2,000 or more to your recovery." />
              </div>
              <div className="flex flex-col gap-2">
                <OptionButton
                  label="No"
                  selected={answers.has_children === false}
                  onClick={() => pickSingle("has_children", false)}
                />
                <OptionButton
                  label="Yes"
                  selected={answers.has_children === true}
                  onClick={() => setAnswers((p) => ({ ...p, has_children: true }))}
                />
              </div>
              {answers.has_children === true && (
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">How many children?</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="border border-slate-200 rounded px-4 py-3 w-28 text-navy focus:outline-none focus:border-emerald-500"
                      value={answers.num_children}
                      onChange={(e) =>
                        setAnswers((p) => ({ ...p, num_children: parseInt(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">
                      Ages (comma-separated, e.g. 3, 7, 12)
                    </label>
                    <input
                      type="text"
                      placeholder="3, 7, 12"
                      className="border border-slate-200 rounded px-4 py-3 w-full text-navy focus:outline-none focus:border-emerald-500"
                      value={answers.children_ages}
                      onChange={(e) => setAnswers((p) => ({ ...p, children_ages: e.target.value }))}
                    />
                  </div>
                  <ContinueBtn onClick={advance} />
                </div>
              )}
            </div>
          )}

          {/* ── Q7: Tax filing — ENHANCED (step 6) ────────────────────── */}
          {step === 6 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Have you filed federal taxes every year?
                </h1>
                <WhyTooltip text="Unfiled tax years often contain unclaimed refunds and credits. Knowing the specific years lets us calculate exactly what may be owed — and connect you with a CPA if needed." />
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Filed every year",
                  "Missed some years",
                  "Haven't filed in years",
                  "Not sure",
                ].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.filed_taxes === v}
                    onClick={() => {
                      setAnswers((p) => ({ ...p, filed_taxes: v, missed_specific_years: [] }));
                      if (v !== "Missed some years") setTimeout(() => advance(), 280);
                    }}
                  />
                ))}
              </div>

              {/* Year checkboxes — only when "Missed some years" selected */}
              {answers.filed_taxes === "Missed some years" && (
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <p className="text-sm font-medium text-navy">Which years did you miss?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TAX_YEARS.map((yr) => {
                      const selected = answers.missed_specific_years.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() =>
                            setAnswers((p) => ({
                              ...p,
                              missed_specific_years: selected
                                ? p.missed_specific_years.filter((y) => y !== yr)
                                : [...p.missed_specific_years, yr],
                            }))
                          }
                          className={`py-3 rounded border text-sm font-semibold transition-all ${
                            selected
                              ? "border-emerald-500 bg-emerald-50 text-navy"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {yr}
                        </button>
                      );
                    })}
                  </div>
                  <ContinueBtn
                    onClick={advance}
                    disabled={answers.missed_specific_years.length === 0}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Q8: Disability (step 7) ────────────────────────────────── */}
          {step === 7 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Do you or a family member have a disability or chronic condition?
                </h1>
                <WhyTooltip text="Disability-related credits are worth $1,000+ and are heavily underclaimed. This includes physical, developmental, or mental health conditions." />
              </div>
              <div className="flex flex-col gap-2">
                {["Yes", "No", "Prefer not to say"].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.has_disability === v}
                    onClick={() => pickSingle("has_disability", v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Q9: Education (step 8) ─────────────────────────────────── */}
          {step === 8 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Do you have any post-secondary education or student loans?
                </h1>
                <WhyTooltip text="Education credits and loan-related deductions may apply. The American Opportunity Credit alone is worth up to $2,500 per year." />
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Yes, completed degree",
                  "Currently enrolled",
                  "Have loans but no degree",
                  "No",
                ].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.education === v}
                    onClick={() => pickSingle("education", v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Q10: Housing (step 9) ──────────────────────────────────── */}
          {step === 9 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Do you rent or own your home?
                </h1>
                <WhyTooltip text="Several states offer renter credits and property tax relief programs that renters frequently miss." />
              </div>
              <div className="flex flex-col gap-2">
                {["Rent", "Own", "Live with family", "Other"].map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.living_situation === v}
                    onClick={() => pickSingle("living_situation", v.toLowerCase().replace(/ /g, "_"))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Q11: Life events (step 10) ─────────────────────────────── */}
          {step === 10 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Did any of these happen in the past 3 years?
                </h1>
                <p className="text-sm text-slate-500 mt-1">Select all that apply.</p>
                <WhyTooltip text="Life changes often unlock benefits people don't know about — a new baby, a divorce, or a job loss each trigger different programs." />
              </div>
              <div className="flex flex-col gap-2">
                {LIFE_EVENTS.map((v) => (
                  <OptionButton
                    key={v}
                    label={v}
                    selected={answers.life_events.includes(v)}
                    onClick={() => toggleMulti("life_events", v)}
                    multi
                  />
                ))}
              </div>
              <ContinueBtn onClick={advance} disabled={answers.life_events.length === 0} />
            </div>
          )}

          {/* ── Q12 NEW: Date of birth (step 11) ──────────────────────── */}
          {step === 11 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What&apos;s your date of birth?
                </h1>
                <WhyTooltip text="Some benefits are age-dependent (senior property tax exemptions, retirement credits). Your DOB also helps narrow unclaimed property results — a common name can return hundreds of records, but name + birth year returns just a few." />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1.5 block">Date of birth</label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                  className="w-full border border-slate-200 rounded px-4 py-3.5 text-navy focus:outline-none focus:border-emerald-500 transition-colors text-sm sm:text-base"
                  value={answers.dob}
                  onChange={(e) => setAnswers((p) => ({ ...p, dob: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <ContinueBtn onClick={advance} disabled={!answers.dob} />
                <button
                  type="button"
                  onClick={advance}
                  className="text-sm text-slate-400 hover:text-navy text-center transition-colors py-1"
                >
                  Skip — I&apos;d prefer not to share
                </button>
              </div>
            </div>
          )}

          {/* ── Q13: Full legal name + email (step 12) ────────────────── */}
          {step === 12 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-navy leading-snug" style={{ fontFamily: "var(--font-fraunces)" }}>
                  What&apos;s your full legal name and email?
                </h1>
                <WhyTooltip text="We need your legal name to search unclaimed property databases across all 50 states. Unclaimed property is indexed by exact name — even a nickname can miss a match." />
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">First name</label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      placeholder="First"
                      className="w-full border border-slate-200 rounded px-4 py-3.5 text-navy focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                      value={answers.first_name}
                      onChange={(e) => setAnswers((p) => ({ ...p, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">Last name</label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last"
                      className="w-full border border-slate-200 rounded px-4 py-3.5 text-navy focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                      value={answers.last_name}
                      onChange={(e) => setAnswers((p) => ({ ...p, last_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">Email address</label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full border border-slate-200 rounded px-4 py-3.5 text-navy focus:outline-none focus:border-emerald-500 transition-colors text-sm sm:text-base"
                    value={answers.email}
                    onChange={(e) => setAnswers((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 rounded font-semibold text-white text-base mt-1 transition-colors disabled:opacity-60"
                  style={{ background: "#10B981" }}
                >
                  {submitting ? "Searching..." : "Show me what I'm owed"}
                </button>
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-navy">Terms</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline hover:text-navy">Privacy Policy</Link>.
                  We never sell your data.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Footer note ──────────────────────────────────────────────────────── */}
      <div className="text-center py-4 text-xs text-slate-300 border-t border-slate-100">
        Free to check — no credit card required
      </div>
    </div>
  );
}
