import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { walletClusterMembers, walletClusters } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address

  try {
    // Attempt to find existing cluster data
    const member = await db.query.walletClusterMembers.findFirst({
      where: eq(walletClusterMembers.walletAddress, address),
    })

    if (member && member.clusterId) {
      const cluster = await db.query.walletClusters.findFirst({
        where: eq(walletClusters.clusterId, member.clusterId),
      })

      if (cluster) {
        // Find cluster size
        const members = await db.query.walletClusterMembers.findMany({
          where: eq(walletClusterMembers.clusterId, cluster.clusterId),
        })

        return NextResponse.json({
          cluster_id: cluster.clusterId,
          cluster_size: members.length,
          wallet_role: member.role,
          confidence: cluster.confidence,
        })
      }
    }

    // Fallback: Generate mock deterministic data for the MVP if not found
    // In a real app, this would trigger an async analysis job
    const isOdd = address.length % 2 === 1
    return NextResponse.json({
      cluster_id: `cluster_${address.slice(2, 8)}`,
      cluster_size: isOdd ? 5 : 2,
      wallet_role: isOdd ? "Liquidity Controller" : "Small Holder",
      confidence: isOdd ? "high" : "low",
    })
  } catch (error) {
    console.error("Error fetching cluster data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
