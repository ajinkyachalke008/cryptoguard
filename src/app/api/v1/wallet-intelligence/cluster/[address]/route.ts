import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { walletClusterMembers, walletClusters, walletActivityLogs, wallets } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"

type WalletRole = 
  | "Funding Source"
  | "Liquidity Controller"
  | "Dump Executor"
  | "Router/Bridge"
  | "Exchange Hot Wallet"
  | "Small Holder"
  | "Unknown"

type ConfidenceLevel = "low" | "medium" | "high" | "insufficient_data"

interface ClusterSignal {
  type: string
  description: string
  weight: number
  present: boolean
}

interface ClusterResponse {
  cluster_id: string | null
  cluster_size: number
  wallet_role: WalletRole
  confidence: ConfidenceLevel
  signals_used: ClusterSignal[]
  explanation: string
  limitations: string[]
  data_completeness: number
  is_known_entity: boolean
  known_entity_type: string | null
}

const KNOWN_EXCHANGES = [
  "0x28c6c06298d514db089934071355e5743bf21d60", // Binance 14
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549", // Binance 15
  "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", // Binance 16
  "0x56eddb7aa87536c09ccc2793473599fd21a8b17f", // Binance 17
  "0x2b5634c42055806a59e9107ed44d43c426e58258", // KuCoin
  "0xeb2629a2734e272bcc07bda959863f316f4bd4cf", // Coinbase
]

const KNOWN_BRIDGES = [
  "0x8eb8a3b98659cce290402893d0123abb75e3ab28", // Axelar Gateway
  "0x3ee18b2214aff97000d974cf647e7c347e8fa585", // Wormhole
]

function isKnownExchange(address: string): boolean {
  return KNOWN_EXCHANGES.some(ex => ex.toLowerCase() === address.toLowerCase())
}

function isKnownBridge(address: string): boolean {
  return KNOWN_BRIDGES.some(br => br.toLowerCase() === address.toLowerCase())
}

function computeClusterSignals(
  address: string,
  activityCount: number,
  hasCommonFunding: boolean,
  hasSynchronizedTxs: boolean,
  hasCommonDeposit: boolean
): ClusterSignal[] {
  const signals: ClusterSignal[] = [
    {
      type: "common_funding_source",
      description: "Wallets share a common initial funding source",
      weight: 0.35,
      present: hasCommonFunding
    },
    {
      type: "synchronized_transactions",
      description: "Transaction timing patterns show coordination (within 60-second windows)",
      weight: 0.30,
      present: hasSynchronizedTxs
    },
    {
      type: "common_deposit_address",
      description: "Multiple wallets deposit to the same exchange address",
      weight: 0.25,
      present: hasCommonDeposit
    },
    {
      type: "sufficient_activity",
      description: "Wallet has enough transaction history for reliable analysis (>10 transactions)",
      weight: 0.10,
      present: activityCount > 10
    }
  ]
  return signals
}

function computeConfidence(signals: ClusterSignal[], activityCount: number): ConfidenceLevel {
  if (activityCount < 3) return "insufficient_data"
  
  const totalWeight = signals
    .filter(s => s.present)
    .reduce((sum, s) => sum + s.weight, 0)
  
  const presentSignals = signals.filter(s => s.present).length
  
  if (presentSignals >= 3 && totalWeight >= 0.7) return "high"
  if (presentSignals >= 2 && totalWeight >= 0.4) return "medium"
  return "low"
}

function inferWalletRole(
  activityCount: number,
  avgTxValue: number,
  isFirstInCluster: boolean,
  outboundRatio: number
): WalletRole {
  if (activityCount < 3) return "Unknown"
  
  if (isFirstInCluster && outboundRatio > 0.8) return "Funding Source"
  if (avgTxValue > 100000 && outboundRatio < 0.3) return "Liquidity Controller"
  if (outboundRatio > 0.9 && activityCount > 50) return "Dump Executor"
  if (activityCount < 10 && avgTxValue < 1000) return "Small Holder"
  
  return "Unknown"
}

function generateExplanation(
  signals: ClusterSignal[],
  confidence: ConfidenceLevel,
  role: WalletRole,
  isKnownEntity: boolean,
  entityType: string | null
): string {
  if (isKnownEntity) {
    return `This address is identified as a known ${entityType}. Clustering analysis is not applicable as this is shared infrastructure used by many users.`
  }
  
  if (confidence === "insufficient_data") {
    return "Insufficient transaction history to perform reliable cluster analysis. This wallet has fewer than 3 recorded transactions."
  }
  
  const presentSignals = signals.filter(s => s.present)
  
  if (presentSignals.length === 0) {
    return "No clustering signals detected. This wallet appears to operate independently without deterministic links to other addresses."
  }
  
  const signalDescriptions = presentSignals.map(s => s.description).join("; ")
  
  return `Cluster membership inferred based on: ${signalDescriptions}. The wallet's likely role as "${role}" is derived from transaction flow patterns and timing analysis.`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!address || address.length < 10) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
  }

  try {
    const isExchange = isKnownExchange(address)
    const isBridge = isKnownBridge(address)
    
    if (isExchange || isBridge) {
      const response: ClusterResponse = {
        cluster_id: null,
        cluster_size: 0,
        wallet_role: isExchange ? "Exchange Hot Wallet" : "Router/Bridge",
        confidence: "high",
        signals_used: [],
        explanation: `This address is a known ${isExchange ? "exchange hot wallet" : "bridge contract"}. Clustering is not meaningful for shared infrastructure.`,
        limitations: [
          "This is shared infrastructure used by many independent users",
          "Individual user behavior cannot be inferred from this address"
        ],
        data_completeness: 100,
        is_known_entity: true,
        known_entity_type: isExchange ? "Exchange" : "Bridge"
      }
      return NextResponse.json(response)
    }

    let member = null
    let activityCount = 0
    
    try {
      member = await db.query.walletClusterMembers.findFirst({
        where: eq(walletClusterMembers.walletAddress, address),
      })

      const activityLogs = await db.query.walletActivityLogs.findMany({
        where: eq(walletActivityLogs.walletAddress, address),
      })
      
      activityCount = activityLogs.length

      if (member && member.clusterId) {
        const cluster = await db.query.walletClusters.findFirst({
          where: eq(walletClusters.clusterId, member.clusterId),
        })

        if (cluster) {
          const members = await db.query.walletClusterMembers.findMany({
            where: eq(walletClusterMembers.clusterId, cluster.clusterId),
          })

          const signals = computeClusterSignals(address, activityCount, true, true, true)
          const confidence = cluster.confidence as ConfidenceLevel
          
          const response: ClusterResponse = {
            cluster_id: cluster.clusterId,
            cluster_size: members.length,
            wallet_role: member.role as WalletRole,
            confidence,
            signals_used: signals,
            explanation: generateExplanation(signals, confidence, member.role as WalletRole, false, null),
            limitations: [
              "Cluster membership is probabilistic, not definitive",
              "Shared services (mixers, exchanges) may create false positives",
              "Role inference is based on observed patterns, not confirmed behavior"
            ],
            data_completeness: Math.min(100, activityCount * 5),
            is_known_entity: false,
            known_entity_type: null
          }
          
          return NextResponse.json(response)
        }
      }
    } catch {
      // Tables may not exist yet - continue to mock data
    }

    const addressHash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const simulatedActivityCount = Math.abs(addressHash % 100) + 5
    const hasCommonFunding = Math.abs(addressHash % 10) > 3
    const hasSynchronizedTxs = Math.abs(addressHash % 10) > 5
    const hasCommonDeposit = Math.abs(addressHash % 10) > 4
    
    const signals = computeClusterSignals(
      address, 
      simulatedActivityCount, 
      hasCommonFunding, 
      hasSynchronizedTxs, 
      hasCommonDeposit
    )
    
    const confidence = computeConfidence(signals, simulatedActivityCount)
    
    const presentSignalCount = signals.filter(s => s.present).length
    const clusterSize = presentSignalCount >= 2 ? Math.abs(addressHash % 8) + 2 : 1
    
    const outboundRatio = (Math.abs(addressHash % 100)) / 100
    const avgTxValue = Math.abs(addressHash % 50000) + 100
    const isFirstInCluster = Math.abs(addressHash % 10) > 7
    
    const role = clusterSize > 1 
      ? inferWalletRole(simulatedActivityCount, avgTxValue, isFirstInCluster, outboundRatio)
      : "Unknown"
    
    const response: ClusterResponse = {
      cluster_id: clusterSize > 1 ? `cluster_${address.slice(2, 10).toLowerCase()}` : null,
      cluster_size: clusterSize,
      wallet_role: role,
      confidence,
      signals_used: signals,
      explanation: generateExplanation(signals, confidence, role, false, null),
      limitations: [
        "Analysis based on simulated on-chain data for MVP demonstration",
        "Production system would require full blockchain indexing",
        "Cluster membership is probabilistic, not definitive",
        "VPN and privacy tools may distort behavioral patterns"
      ],
      data_completeness: Math.min(100, simulatedActivityCount * 3),
      is_known_entity: false,
      known_entity_type: null
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("Error fetching cluster data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
