import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tx_id } = await req.json();

    if (!tx_id) {
      return NextResponse.json({ error: "tx_id is required" }, { status: 400 });
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Deterministic pseudo-random logic based on tx_id hash
    const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const hashValue = Math.abs(hashCode(tx_id));
    
    const risk_score = hashValue % 101;
    let classification: "safe" | "risky" | "fraud" = "safe";
    
    if (risk_score >= 80) {
      classification = "fraud";
    } else if (risk_score >= 40) {
      classification = "risky";
    }

    const confidence = 0.75 + (hashValue % 25) / 100;

    const reasons_pool = [
      "High amount vs baseline",
      "Unusual cross-border route",
      "New wallet detected",
      "Rapid repeated transfers",
      "Suspicious corridor pattern",
      "High-risk destination cluster",
      "Known exposure risk signal"
    ];

    // Pick 1-3 random reasons
    const num_reasons = (hashValue % 3) + 1;
    const reasons = [];
    for (let i = 0; i < num_reasons; i++) {
      reasons.push(reasons_pool[(hashValue + i) % reasons_pool.length]);
    }

    const recommended_action = classification === "safe" 
      ? "No action required" 
      : classification === "risky" 
        ? "Monitor for further activity" 
        : "Immediately freeze and investigate";

    return NextResponse.json({
      tx_id,
      risk_score,
      classification,
      confidence,
      reasons,
      recommended_action
    });
  } catch (error) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
