import { supabaseAdmin } from "./supabase-server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  state: string;
  income_range: string;
  filing_status: string;
  has_children: boolean;
  num_children: number;
  children_ages: string[];
  living_situation: string;
  has_disability: boolean;
  is_caregiver: boolean;
  employment_type: string;
  has_post_secondary: boolean;
  worked_from_home: boolean;
  filed_taxes_all_years: boolean;
  missed_tax_years: string[];
  life_events: string[];
  date_of_birth?: string;
}

// All possible eligibility rule fields from the real benefits table
export interface EligibilityRules {
  // Simple income bounds
  max_income?: number;
  min_income?: number;
  // EITC-style thresholds (vary by filing status × number of children)
  max_income_single_no_kids?: number;
  max_income_single_1_kid?: number;
  max_income_single_2_kids?: number;
  max_income_single_3plus_kids?: number;
  max_income_married_no_kids?: number;
  max_income_married_1_kid?: number;
  max_income_married_2_kids?: number;
  max_income_married_3plus_kids?: number;
  // Geography
  states?: string[];
  // Filing status
  filing_statuses?: string[];
  // Employment
  employment_types?: string[];
  // Children
  requires_children?: boolean;
  min_children?: number;
  max_child_age?: number;
  // Education / housing / work style
  requires_post_secondary?: boolean;
  worked_from_home?: boolean;
  living_situation?: string[];
  // Tax history
  requires_filed_taxes?: boolean;
  missed_tax_years_required?: boolean;
  // Personal situation
  requires_disability?: boolean;
  is_caregiver?: boolean;
  life_events?: string[];
  min_age?: number;
  max_age?: number;
}

export interface Benefit {
  id: string;
  name: string;
  slug: string;
  category: string;
  jurisdiction: string;
  description: string;
  short_description: string;
  avg_claim_amount: number | null;
  min_claim_amount: number | null;
  max_claim_amount: number | null;
  eligibility_rules: EligibilityRules;
  filing_method: string;
  filing_url: string;
  required_documents: string[];
  processing_time: string;
  source_url: string;
  is_active: boolean;
  last_verified: string;
}

export type Confidence = "high" | "medium" | "low";

export interface MatchResult {
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

export const FILING_THRESHOLD = 100;

// ─── Income conversion ────────────────────────────────────────────────────────
// We store the lower bound and midpoint separately so we can:
//   - Use midpoint for matching (the "most likely" income)
//   - Use lower bound to detect hard failures (even optimistically they earn too much)

const INCOME_TABLE: Record<string, { lower: number; mid: number }> = {
  "Under $20K": { lower: 0,      mid: 15000  },
  "$20-40K":    { lower: 20000,  mid: 30000  },
  "$20–40K":    { lower: 20000,  mid: 30000  },
  "$40-60K":    { lower: 40000,  mid: 50000  },
  "$40–60K":    { lower: 40000,  mid: 50000  },
  "$60-80K":    { lower: 60000,  mid: 70000  },
  "$60–80K":    { lower: 60000,  mid: 70000  },
  "$80-100K":   { lower: 80000,  mid: 90000  },
  "$80–100K":   { lower: 80000,  mid: 90000  },
  "$100K+":     { lower: 100000, mid: 120000 },
};

function parseIncome(range: string) {
  return INCOME_TABLE[range] ?? { lower: 0, mid: 50000 };
}

// ─── State abbreviations ──────────────────────────────────────────────────────

const STATE_ABBREVS: Record<string, string> = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
  "Colorado":"CO","Connecticut":"CT","Delaware":"DE","District of Columbia":"DC",
  "Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL",
  "Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA",
  "Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN",
  "Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY",
  "North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR",
  "Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  "Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA",
  "Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
};

function stateAbbrev(state: string): string {
  return STATE_ABBREVS[state] ?? state;
}

// ─── Age helper ───────────────────────────────────────────────────────────────

function calculateAge(dob: string | undefined | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── EITC-style income threshold selector ─────────────────────────────────────
// Picks the correct income ceiling from the rules based on filing status + children.

function eitcThreshold(rules: EligibilityRules, profile: Profile): number | null {
  const married = profile.filing_status?.toLowerCase().includes("married");
  const kids = profile.num_children ?? 0;

  if (married) {
    if (kids === 0) return rules.max_income_married_no_kids   ?? null;
    if (kids === 1) return rules.max_income_married_1_kid     ?? null;
    if (kids === 2) return rules.max_income_married_2_kids    ?? null;
    return             rules.max_income_married_3plus_kids    ??
                       rules.max_income_married_2_kids        ?? null;
  } else {
    if (kids === 0) return rules.max_income_single_no_kids    ?? null;
    if (kids === 1) return rules.max_income_single_1_kid      ?? null;
    if (kids === 2) return rules.max_income_single_2_kids     ?? null;
    return             rules.max_income_single_3plus_kids     ??
                       rules.max_income_single_2_kids         ?? null;
  }
}

// Returns true if any EITC-style field is present in the rules
function hasEitcRules(rules: EligibilityRules): boolean {
  return !!(
    rules.max_income_single_no_kids  || rules.max_income_single_1_kid  ||
    rules.max_income_single_2_kids   || rules.max_income_single_3plus_kids ||
    rules.max_income_married_no_kids || rules.max_income_married_1_kid  ||
    rules.max_income_married_2_kids  || rules.max_income_married_3plus_kids
  );
}

// ─── Core eligibility evaluator ───────────────────────────────────────────────
// Returns { eligible, confidence, reason }.
// confidence starts at "high" and degrades based on how many assumptions are made.

function evaluateBenefit(
  profile: Profile,
  benefit: Benefit
): { eligible: boolean; confidence: Confidence; reason?: string } {

  const rules = benefit.eligibility_rules;
  console.log(`[Matching] Evaluating "${benefit.name}" — rules:`, JSON.stringify(rules));

  // Empty rules → matches everyone (unclaimed property, etc.)
  if (!rules || Object.keys(rules).length === 0) {
    return { eligible: true, confidence: "medium" };
  }

  const { lower, mid } = parseIncome(profile.income_range);
  const abbrev = stateAbbrev(profile.state);
  const age = calculateAge(profile.date_of_birth);

  // Track how many soft assumptions lower our confidence.
  // 0 = high | 1-2 = medium | 3+ = low (but still eligible)
  let softPenalty = 0;

  // ── 1. State restriction ───────────────────────────────────────────────────
  if (rules.states && rules.states.length > 0) {
    if (!rules.states.includes(abbrev) && !rules.states.includes(profile.state)) {
      return { eligible: false, confidence: "low", reason: `Not available in ${profile.state}` };
    }
  }

  // ── 2. EITC-style income threshold ────────────────────────────────────────
  if (hasEitcRules(rules)) {
    const ceiling = eitcThreshold(rules, profile);
    if (ceiling !== null) {
      if (lower > ceiling) {
        // Even the bottom of their income bracket is over the limit
        return { eligible: false, confidence: "low", reason: "Income exceeds maximum threshold for this benefit" };
      }
      if (mid > ceiling) {
        // Midpoint is over — borderline, may still qualify
        softPenalty += 2;
      }
    }
  }

  // ── 3. Simple income bounds ───────────────────────────────────────────────
  if (rules.max_income !== undefined) {
    if (lower > rules.max_income) {
      return { eligible: false, confidence: "low", reason: "Income exceeds maximum threshold" };
    }
    if (mid > rules.max_income) {
      softPenalty += 2; // borderline
    }
  }

  if (rules.min_income !== undefined && mid < rules.min_income) {
    return { eligible: false, confidence: "low", reason: "Income below minimum threshold" };
  }

  // ── 4. Filing status ──────────────────────────────────────────────────────
  if (rules.filing_statuses && rules.filing_statuses.length > 0) {
    const norm = profile.filing_status?.toLowerCase().replace(/\s+/g, "_");
    const match = rules.filing_statuses.some(
      (fs) => fs.toLowerCase().replace(/\s+/g, "_") === norm
    );
    if (!match) {
      return { eligible: false, confidence: "low", reason: `Filing status "${profile.filing_status}" is not eligible` };
    }
  }

  // ── 5. Employment type ────────────────────────────────────────────────────
  if (rules.employment_types && rules.employment_types.length > 0) {
    // Map questionnaire display labels → normalized slugs used in eligibility_rules.
    // The questionnaire saves labels via .toLowerCase().replace(/ /g, "_"),
    // so "Employed full-time" arrives as "employed_full-time".
    const EMPLOYMENT_MAP: Record<string, string> = {
      "employed_full-time": "employed",   // ← what Supabase actually stores
      "employed full-time": "employed",   // safety: space variant
      "employed":           "employed",
      "part-time":          "part_time",
      "part_time":          "part_time",
      "self-employed":      "self_employed",
      "self_employed":      "self_employed",
      "unemployed":         "unemployed",
      "retired":            "retired",
      "student":            "student",
    };
    const raw = (profile.employment_type ?? "").toLowerCase().trim();
    const normalized = EMPLOYMENT_MAP[raw] ?? raw.replace(/\s+/g, "_");
    const rulesNorm = rules.employment_types.map((et) => et.toLowerCase().replace(/\s+/g, "_"));

    console.log(`[Matching] Employment check — profile: "${raw}" → "${normalized}", rules: [${rulesNorm.join(", ")}]`);

    if (!rulesNorm.includes(normalized)) {
      return { eligible: false, confidence: "low", reason: "Employment type not eligible for this benefit" };
    }
  }

  // ── 6. Children ───────────────────────────────────────────────────────────
  if (rules.requires_children === true && !profile.has_children) {
    return { eligible: false, confidence: "low", reason: "Requires dependent children" };
  }
  if (rules.requires_children === false && profile.has_children) {
    return { eligible: false, confidence: "low", reason: "Only available to filers without qualifying children" };
  }
  if (rules.min_children !== undefined && (profile.num_children ?? 0) < rules.min_children) {
    return { eligible: false, confidence: "low", reason: `Requires at least ${rules.min_children} qualifying children` };
  }

  // ── 7. Child age ──────────────────────────────────────────────────────────
  if (rules.max_child_age !== undefined && profile.has_children) {
    const ages = (profile.children_ages ?? [])
      .map((a) => parseInt(String(a), 10))
      .filter((a) => !isNaN(a));

    if (ages.length > 0) {
      const hasQualifying = ages.some((a) => a < rules.max_child_age!);
      if (!hasQualifying) {
        return { eligible: false, confidence: "low", reason: `Requires a child under age ${rules.max_child_age}` };
      }
    } else {
      softPenalty += 1; // ages unknown — assume qualifying
    }
  }

  // ── 8. Post-secondary education ───────────────────────────────────────────
  if (rules.requires_post_secondary === true && !profile.has_post_secondary) {
    return { eligible: false, confidence: "low", reason: "Requires post-secondary education or student loans" };
  }

  // ── 9. Worked from home ───────────────────────────────────────────────────
  if (rules.worked_from_home === true && !profile.worked_from_home) {
    return { eligible: false, confidence: "low", reason: "Requires working from home" };
  }

  // ── 10. Living situation ──────────────────────────────────────────────────
  if (rules.living_situation && rules.living_situation.length > 0) {
    const norm = profile.living_situation?.toLowerCase();
    const match = rules.living_situation.some((ls) => ls.toLowerCase() === norm);
    if (!match) {
      return {
        eligible: false,
        confidence: "low",
        reason: `Requires living situation: ${rules.living_situation.join(" or ")}`,
      };
    }
  }

  // ── 11. Tax filing history ────────────────────────────────────────────────
  // requires_filed_taxes = true means "user must file a return to claim this credit"
  // (e.g. EITC). It does NOT mean the user must have already filed every past year.
  // Missing years don't disqualify — they can still file and claim.
  // No rejection here; we leave it eligible. A confidence note is sufficient.
  if (rules.requires_filed_taxes === true && !profile.filed_taxes_all_years) {
    softPenalty += 1; // slight uncertainty — they'll need to file, but still eligible
  }

  // missed_tax_years_required = true is specifically for "Unclaimed Federal Tax Refunds"
  // — it ONLY applies to non-filers. Filed-every-year users are NOT the target.
  if (rules.missed_tax_years_required === true) {
    const missed = profile.missed_tax_years ?? [];
    if (profile.filed_taxes_all_years && missed.length === 0) {
      return { eligible: false, confidence: "low", reason: "Only applies to unfiled tax years" };
    }
    if (!profile.filed_taxes_all_years && missed.length === 0) {
      softPenalty += 1; // didn't specify which years — keep eligible, lower confidence
    }
  }

  // ── 12. Disability ────────────────────────────────────────────────────────
  if (rules.requires_disability === true && !profile.has_disability) {
    return { eligible: false, confidence: "low", reason: "Requires disability or chronic condition" };
  }

  // ── 13. Caregiver ─────────────────────────────────────────────────────────
  if (rules.is_caregiver === true && !profile.is_caregiver) {
    return { eligible: false, confidence: "low", reason: "Requires caregiver status" };
  }

  // ── 14. Life events ───────────────────────────────────────────────────────
  if (rules.life_events && rules.life_events.length > 0) {
    const profileEvents = (profile.life_events ?? []).map((e) => e.toLowerCase());
    const hasOverlap = rules.life_events.some((ev) => profileEvents.includes(ev.toLowerCase()));
    if (!hasOverlap) {
      return { eligible: false, confidence: "low", reason: "Requires a qualifying life event" };
    }
  }

  // ── 15. Age bounds ────────────────────────────────────────────────────────
  if (rules.min_age !== undefined) {
    if (age === null) {
      softPenalty += 1; // age unknown — assume eligible
    } else if (age < rules.min_age) {
      return { eligible: false, confidence: "low", reason: `Minimum age requirement is ${rules.min_age}` };
    }
  }
  if (rules.max_age !== undefined && age !== null && age > rules.max_age) {
    return { eligible: false, confidence: "low", reason: `Maximum age for this benefit is ${rules.max_age}` };
  }

  // ── Confidence resolution ─────────────────────────────────────────────────
  let confidence: Confidence =
    softPenalty >= 3 ? "low" :
    softPenalty >= 1 ? "medium" :
    "high";

  // Category overrides — we can never be "high" confidence on these
  if (["unclaimed_property", "class_action"].includes(benefit.category)) {
    confidence = confidence === "high" ? "medium" : confidence;
  }

  console.log(`[Matching] "${benefit.name}" → ELIGIBLE (confidence: ${confidence}, softPenalty: ${softPenalty})`);
  return { eligible: true, confidence };
}

// ─── Amount estimator ─────────────────────────────────────────────────────────
// Uses benefit slug / name to apply the right per-situation formula.
// Falls back to avg_claim_amount → (min+max)/2 → 0.

// 2024 federal EITC maximum credit amounts by number of qualifying children
const EITC_MAX: Record<number, number> = { 0: 632, 1: 4213, 2: 6960, 3: 7830 };

function eitcEstimate(profile: Profile): number {
  const kids = Math.min(profile.num_children ?? 0, 3);
  const max = EITC_MAX[kids] ?? 632;
  const { mid } = parseIncome(profile.income_range);
  // Use $57,310 (2024 single 3-kid threshold) as a rough universal ceiling for scaling
  const ceiling = 57310;
  const ratio = Math.max(0, 1 - mid / ceiling);
  // Floor at 50% of max so low-income users always see a meaningful estimate
  return Math.round(max * (0.5 + ratio * 0.5));
}

// 2024 CalEITC maximum amounts by number of children
const CAL_EITC_MAX: Record<number, number> = { 0: 285, 1: 1916, 2: 3166, 3: 3529 };

function calEitcEstimate(profile: Profile): number {
  const kids = Math.min(profile.num_children ?? 0, 3);
  return CAL_EITC_MAX[kids] ?? 285;
}

function estimateAmount(benefit: Benefit, confidence: Confidence, profile: Profile): number {
  const slug = (benefit.slug ?? "").toLowerCase();
  const name = (benefit.name ?? "").toLowerCase();
  const kids = profile.num_children ?? 0;

  // ── Benefit-specific formulas ────────────────────────────────────────────
  if (slug.includes("eitc") || slug.includes("earned_income") || name.includes("earned income")) {
    // CalEITC vs federal EITC
    if (slug.includes("cal") || name.includes("california") || name.includes("caleitc")) {
      return calEitcEstimate(profile);
    }
    return eitcEstimate(profile);
  }

  if (slug.includes("child_tax") || name.includes("child tax credit")) {
    // $2,000 per qualifying child (2024 CTC), capped at 3 for estimate
    return Math.min(kids, 3) * 2000;
  }

  if (slug.includes("child_and_dependent") || name.includes("child and dependent")) {
    // Up to $1,050 for 1 child, $2,100 for 2+
    return kids >= 2 ? 2100 : 1050;
  }

  if (slug.includes("american_opportunity") || name.includes("american opportunity")) {
    return 2500; // max per year
  }

  if (slug.includes("lifetime_learning") || name.includes("lifetime learning")) {
    return 2000;
  }

  if (slug.includes("fha") || name.includes("fha mortgage")) {
    return benefit.avg_claim_amount ?? 2500;
  }

  if (slug.includes("unclaimed") || benefit.category === "unclaimed_property") {
    return benefit.avg_claim_amount ?? 2000; // can't know without a name search
  }

  if (benefit.category === "class_action") {
    return benefit.avg_claim_amount ?? 150; // low — most class action payouts are small
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  const base = benefit.avg_claim_amount;
  const min  = benefit.min_claim_amount ?? 0;
  const max  = benefit.max_claim_amount ?? 0;

  if (base) {
    // Slightly adjust by confidence so results aren't identical for everyone
    if (confidence === "high")   return base;
    if (confidence === "medium") return Math.round(base * 0.75);
    return Math.round(base * 0.5);
  }

  if (min && max) {
    if (confidence === "high")   return Math.round((min + max) / 2);
    if (confidence === "medium") return Math.round(min + (max - min) * 0.35);
    return min;
  }

  if (max) return Math.round(max * 0.5);
  if (min) return min;
  return 0;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MatchingResult {
  aboveThreshold:  MatchResult[];
  belowThreshold:  MatchResult[];
  notEligible:     MatchResult[];
  totalAbove:      number;
  totalBelow:      number;
  totalEstimated:  number;
  missedTaxYears:  string[];
  statesSearched:  number;
  benefitsChecked: number;
  // Returned to the client for pre-filling forms and browser DevTools debugging
  debugProfile: {
    email:                string;
    first_name:           string;
    last_name:            string;
    employment_type:      string;
    living_situation:     string;
    income_range:         string;
    filing_status:        string;
    state:                string;
    has_children:         boolean;
    num_children:         number;
    filed_taxes_all_years: boolean;
    missed_tax_years:     string[];
  };
}

export async function runMatching(profileId: string): Promise<MatchingResult> {
  // ── 1. Fetch profile ───────────────────────────────────────────────────────
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileErr || !profile) {
    throw new Error(`Profile not found: ${profileErr?.message ?? "unknown"}`);
  }

  console.log("[Matching] ── Profile loaded ──────────────────────────────────────");
  console.log("[Matching] Profile fields:", JSON.stringify({
    id:                  profile.id,
    state:               profile.state,
    income_range:        profile.income_range,
    filing_status:       profile.filing_status,
    has_children:        profile.has_children,
    num_children:        profile.num_children,
    children_ages:       profile.children_ages,
    employment_type:     profile.employment_type,
    living_situation:    profile.living_situation,
    has_disability:      profile.has_disability,
    has_post_secondary:  profile.has_post_secondary,
    worked_from_home:    profile.worked_from_home,
    filed_taxes_all_years: profile.filed_taxes_all_years,
    missed_tax_years:    profile.missed_tax_years,
    life_events:         profile.life_events,
    date_of_birth:       profile.date_of_birth,
  }, null, 2));

  // ── 2. Fetch all active benefits ──────────────────────────────────────────
  const { data: benefits, error: benefitsErr } = await supabaseAdmin
    .from("benefits")
    .select("*")
    .eq("is_active", true);

  if (benefitsErr) {
    throw new Error(`Benefits query failed: ${benefitsErr.message}`);
  }

  const allResults: MatchResult[] = [];

  // ── 3. Evaluate each benefit ──────────────────────────────────────────────
  for (const benefit of (benefits ?? []) as Benefit[]) {
    const { eligible, confidence, reason } = evaluateBenefit(profile as Profile, benefit);
    const amount = eligible ? estimateAmount(benefit, confidence, profile as Profile) : 0;

    if (!eligible) {
      console.log(`[Matching] "${benefit.name}" → NOT ELIGIBLE — ${reason}`);
    }

    allResults.push({
      benefit_id:       benefit.id,
      benefit_name:     benefit.name,
      category:         benefit.category,
      description:      benefit.description      ?? "",
      short_description: benefit.short_description ?? "",
      estimated_amount: amount,
      confidence,
      eligible,
      rejection_reason: reason,
      filing_url:       benefit.filing_url ?? undefined,
    });
  }

  // ── 4. Split by threshold ─────────────────────────────────────────────────
  const eligible = allResults
    .filter((r) => r.eligible)
    .sort((a, b) => b.estimated_amount - a.estimated_amount);

  const aboveThreshold = eligible.filter((m) => m.estimated_amount >= FILING_THRESHOLD);
  const belowThreshold = eligible.filter((m) => m.estimated_amount < FILING_THRESHOLD);

  const notEligible = allResults
    .filter((r) => !r.eligible)
    .sort((a, b) => a.benefit_name.localeCompare(b.benefit_name));

  // ── 4b. AOTC and Lifetime Learning Credit are mutually exclusive ──────────
  // A taxpayer cannot claim both in the same year; keep the higher-value one.
  const isAotc = (m: MatchResult) =>
    m.benefit_name.toLowerCase().includes("american opportunity");
  const isLlc  = (m: MatchResult) =>
    m.benefit_name.toLowerCase().includes("lifetime learning");

  const allEligibleLists = [aboveThreshold, belowThreshold];
  for (const list of allEligibleLists) {
    const aotcIdx = list.findIndex(isAotc);
    const llcIdx  = list.findIndex(isLlc);
    if (aotcIdx !== -1 && llcIdx !== -1) {
      const keepIdx   = list[aotcIdx].estimated_amount >= list[llcIdx].estimated_amount ? aotcIdx : llcIdx;
      const removeIdx = keepIdx === aotcIdx ? llcIdx : aotcIdx;
      const keepName  = list[keepIdx].benefit_name;
      const removed   = {
        ...list[removeIdx],
        eligible:         false,
        estimated_amount: 0,
        rejection_reason: `Cannot be combined with ${keepName}`,
      };
      list.splice(removeIdx, 1);
      notEligible.push(removed);
    }
  }

  const totalAbove     = aboveThreshold.reduce((s, m) => s + m.estimated_amount, 0);
  const totalBelow     = belowThreshold.reduce((s, m) => s + m.estimated_amount, 0);
  const totalEstimated = totalAbove + totalBelow;

  // ── 5. Persist matches to Supabase ────────────────────────────────────────
  const matchRows = allResults.map((r) => ({
    profile_id:       profileId,
    benefit_id:       r.benefit_id,
    estimated_amount: r.eligible ? r.estimated_amount : null,
    confidence:       r.confidence,
    status:           r.eligible ? "identified" : "not_eligible",
    notes:            r.rejection_reason ?? null,
  }));

  if (matchRows.length > 0) {
    await supabaseAdmin.from("matches").upsert(matchRows, {
      onConflict:      "profile_id,benefit_id",
      ignoreDuplicates: false,
    });
  }

  const missedTaxYears = (profile as Profile).missed_tax_years ?? [];

  console.log("[Matching] ── Final results ────────────────────────────────────────");
  console.log("[Matching] Above threshold ($100+):", aboveThreshold.map(
    (m) => `${m.benefit_name}: $${m.estimated_amount} (${m.confidence})`
  ));
  console.log("[Matching] Below threshold (<$100):", belowThreshold.map(
    (m) => `${m.benefit_name}: $${m.estimated_amount} (${m.confidence})`
  ));
  console.log("[Matching] Not eligible:", notEligible.map(
    (m) => `${m.benefit_name} — ${m.rejection_reason}`
  ));
  console.log(`[Matching] totalAbove=$${totalAbove} totalBelow=$${totalBelow} totalEstimated=$${totalEstimated}`);

  return {
    aboveThreshold,
    belowThreshold,
    notEligible,
    totalAbove,
    totalBelow,
    totalEstimated,
    missedTaxYears,
    statesSearched:  1,
    benefitsChecked: (benefits ?? []).length,
    debugProfile: {
      email:                 (profile as unknown as Record<string, string>).email      ?? "",
      first_name:            (profile as unknown as Record<string, string>).first_name ?? "",
      last_name:             (profile as unknown as Record<string, string>).last_name  ?? "",
      employment_type:       (profile as Profile).employment_type       ?? "",
      living_situation:      (profile as Profile).living_situation      ?? "",
      income_range:          (profile as Profile).income_range          ?? "",
      filing_status:         (profile as Profile).filing_status         ?? "",
      state:                 (profile as Profile).state                 ?? "",
      has_children:          (profile as Profile).has_children          ?? false,
      num_children:          (profile as Profile).num_children          ?? 0,
      filed_taxes_all_years: (profile as Profile).filed_taxes_all_years ?? false,
      missed_tax_years:      (profile as Profile).missed_tax_years      ?? [],
    },
  };
}
