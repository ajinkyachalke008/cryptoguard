import { NextRequest, NextResponse } from "next/server";
import {
  generateSyntheticCase,
  projectCaseToGraph,
  CanonicalForensicCase,
  GraphNode,
  GraphLink,
  ForensicActionPlan
} from "@/lib/services/canonicalCaseEngine";
import { computeDeterministicSeed } from "@/lib/services/forensicEngine";

export type { GraphNode, GraphLink, ForensicActionPlan };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const depth = Math.min(5, Math.max(1, parseInt(searchParams.get("depth") || "3", 10)));
    const chainParam = searchParams.get("chain") || "ethereum";
    const scenario = searchParams.get("scenario") || "";
    const seedParam = searchParams.get("seed");

    if (!address) {
      return NextResponse.json({ error: "Address or transaction hash is required" }, { status: 400 });
    }

    const cleanInput = address.trim();
    // If seed was explicitly supplied (e.g. from Randomize), use it; otherwise compute deterministic seed
    const seed = seedParam && !isNaN(parseInt(seedParam, 10))
      ? parseInt(seedParam, 10)
      : computeDeterministicSeed(cleanInput);

    // 1. Generate or retrieve Canonical Synthetic Forensic Case
    const canonicalCase = generateSyntheticCase({
      scenarioId: scenario || undefined,
      targetAddress: cleanInput,
      seed,
      chain: chainParam
    });

    // 2. Project case to graph according to true BFS hop depth (1 to 5)
    const projected = projectCaseToGraph(canonicalCase, cleanInput, depth);

    return NextResponse.json({
      success: true,
      caseId: projected.caseId,
      seed: projected.seed,
      generationVersion: projected.generationVersion,
      provenance: projected.provenance,
      scenarioId: projected.scenarioId,
      nodes: projected.nodes,
      links: projected.links,
      stats: projected.stats,
      actionPlan: projected.actionPlan,
      target: projected.target,
      allTransactions: projected.allTransactions
    });
  } catch (error: any) {
    console.error("API /api/graph error:", error);
    return NextResponse.json(
      { error: "Internal forensic graph synthesis failure", details: error?.message },
      { status: 500 }
    );
  }
}
