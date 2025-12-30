import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { walletScans, transactionScans } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get("address")
    const depth = parseInt(searchParams.get("depth") || "1")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Try to find existing scan data for this address
    const scans = await db.query.walletScans.findMany({
      where: eq(walletScans.walletAddress, address),
      limit: 1,
    })

    // Generate nodes and links
    // In a production system, this would crawl the blockchain or query a big data lake
    // For this demo, we'll generate a rich graph centered on the address
    const nodes: any[] = []
    const links: any[] = []
    const nodeMap = new Set<string>()

    const riskLevels = ["low", "medium", "high", "critical"]
    
    // Add center node
    const centerRisk = scans[0]?.riskScore || Math.floor(Math.random() * 100)
    const centerNode = {
      id: address,
      address,
      riskScore: centerRisk,
      riskLevel: getRiskLevel(centerRisk),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      transactionCount: Math.floor(Math.random() * 100) + 20,
      label: "Target"
    }
    nodes.push(centerNode)
    nodeMap.add(address)

    // Generate connections
    let currentLevel = [address]
    const prefixes = ["0x742d", "0xbc1q", "0x3c8e", "0x1f5a", "0x8b3c", "0x2a9f"]
    
    for (let d = 0; d < depth; d++) {
      const nextLevel: string[] = []
      const connectionsPerNode = Math.max(2, 5 - d)
      
      for (const parentId of currentLevel) {
        const numConnections = Math.floor(Math.random() * connectionsPerNode) + 2
        
        for (let i = 0; i < numConnections; i++) {
          const suffix = Math.random().toString(16).slice(2, 10)
          const newAddress = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffix}...${Math.random().toString(16).slice(2, 6)}`
          
          if (!nodeMap.has(newAddress)) {
            const riskScore = Math.floor(Math.random() * 100)
            const newNode = {
              id: newAddress,
              address: newAddress,
              riskScore,
              riskLevel: getRiskLevel(riskScore),
              volume: Math.floor(Math.random() * 500000) + 1000,
              transactionCount: Math.floor(Math.random() * 50) + 1,
              label: riskScore > 80 ? "🚨 High Risk" : riskScore < 20 ? "✅ Safe" : undefined
            }
            
            nodes.push(newNode)
            nodeMap.add(newAddress)
            nextLevel.push(newAddress)
          }
          
          links.push({
            source: parentId,
            target: newAddress,
            value: Math.floor(Math.random() * 100000) + 1000,
            transactionCount: Math.floor(Math.random() * 20) + 1,
            hashes: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
              `0x${Math.random().toString(16).slice(2, 10)}`
            )
          })
        }
      }
      currentLevel = nextLevel
    }

    return NextResponse.json({ nodes, links })
  } catch (error) {
    console.error("Graph API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getRiskLevel(score: number): string {
  if (score >= 75) return "critical"
  if (score >= 50) return "high"
  if (score >= 25) return "medium"
  return "low"
}
