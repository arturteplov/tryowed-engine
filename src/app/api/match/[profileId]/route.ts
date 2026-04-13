import { NextRequest, NextResponse } from "next/server";
import { runMatching } from "@/lib/matching";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  if (!profileId || profileId === "demo") {
    return NextResponse.json(
      { error: "Invalid profile ID" },
      { status: 400 }
    );
  }

  try {
    const result = await runMatching(profileId);

    return NextResponse.json({
      above_threshold:  result.aboveThreshold,
      below_threshold:  result.belowThreshold,
      not_eligible:     result.notEligible,
      total_above:      result.totalAbove,
      total_below:      result.totalBelow,
      total_estimated:  result.totalEstimated,
      missed_tax_years: result.missedTaxYears,
      states_searched:  result.statesSearched,
      benefits_checked: result.benefitsChecked,
      // Debug fields — raw profile snapshot for client-side logging
      debug_profile:    result.debugProfile ?? null,
    });
  } catch (err) {
    console.error("Matching error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Matching failed" },
      { status: 500 }
    );
  }
}
