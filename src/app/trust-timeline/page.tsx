"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"
import { toast } from "sonner"
import { 
  Clock, 
  TrendingUp, 
  Droplets, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  FileCode, 
  Search, 
  Zap, 
  Info, 
  ChevronRight, 
  ChevronDown,
  Fingerprint, 
  Globe, 
  Bot, 
  MapPin,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Box,
  Layers,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  XCircle,
  Network
} from "lucide-react"

export interface WalletIntelligenceContext {
  cluster_detected: boolean
  cluster_size?: number
  wallet_role?: string
  timezone_pattern?: string
  behavior_type?: string
  geo_region?: string
  geo_confidence?: string
}

export interface TimelineEvent {
  id: string
  timestamp: Date
  blockNumber: number
  txHash: string
  type: "liquidity" | "ownership" | "social" | "contract" | "whale" | "anomaly"
  title: string
  description: string
  riskDelta: number
  severity: "low" | "medium" | "high" | "critical"
  aiExplanation: string
  evidence?: string[]
  walletIntelligence?: WalletIntelligenceContext
}

export interface RiskDataPoint {
  timestamp: Date
  score: number
  liquidity: number
  ownership: number
  social: number
  confidence: number
  event?: TimelineEvent
}

// Format relative time with precision (e.g. "18m ago", "2.4h ago", "1d 4h ago")
function formatRelativeTime(date: Date, nowTime: number = Date.now()): string {
  const diffMs = Math.max(0, nowTime - date.getTime())
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 45) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) {
    const remMins = diffMin % 60
    return remMins > 0 ? `${diffHour}h ${remMins}m ago` : `${diffHour}h ago`
  }
  const remHours = diffHour % 24
  return remHours > 0 ? `${diffDay}d ${remHours}h ago` : `${diffDay}d ago`
}

// Format absolute date and time with UTC & local timezone indicators
function formatAbsoluteTime(date: Date): { local: string; utc: string } {
  const local = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date)

  const utc = date.toISOString().replace("T", " • ").replace(/\.\d+Z$/, " UTC")
  return { local, utc }
}

// Dynamically generate realistic, contemporary events anchored to Date.now() for the selected timeRange
function generateEventsForRange(
  timeRange: "24h" | "7d" | "30d" | "all", 
  targetAddress: string = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
): TimelineEvent[] {
  const now = Date.now()
  const currentBlock = 21085420

  const addrPrefix = targetAddress && targetAddress.length >= 6 ? targetAddress.slice(0, 6) : "0x742d"
  const addrSuffix = targetAddress && targetAddress.length >= 4 ? targetAddress.slice(-4) : "3a91"
  const targetFormatted = `${addrPrefix}...${addrSuffix}`

  if (timeRange === "24h") {
    // 24-Hour Intraday Attack & Tactical Contagion
    return [
      {
        id: "ev-24h-1",
        timestamp: new Date(now - 1000 * 60 * 60 * 22),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 60 * 22) / 12000),
        txHash: "0x3e1a8b9c0d2e4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a",
        type: "anomaly",
        title: "Flash Loan Arbitrage Probe ($8.4M DAI)",
        description: "Uncollateralized flash loan borrowed from Aave V3 testing pool liquidity depth",
        riskDelta: 10,
        severity: "high",
        aiExplanation: "Probe transaction executed across 3 DEX routers. Model flags pre-attack capital simulation testing pool slippage tolerance.",
        evidence: ["Lender: Aave V3 Pool", "Borrowed: 8,400,000 DAI", "Gas Priority: 84 Gwei", "Reverted Re-entry: 1"]
      },
      {
        id: "ev-24h-2",
        timestamp: new Date(now - 1000 * 60 * 60 * 16.5),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 60 * 16.5) / 12000),
        txHash: "0x7e9a1c3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c",
        type: "anomaly",
        title: "Spot Oracle Deviation (+14.8%)",
        description: "Coordinated low-liquidity trade skewed TWAP price feeder against secondary pools",
        riskDelta: 12,
        severity: "high",
        aiExplanation: "Spot price forced 14.8% above fair valuation on Uniswap V3 pair, triggering artificial borrowing capacity in connected lending protocol.",
        evidence: ["TWAP Deviation: +14.8%", "Volume: 120 ETH", "Pool Impact: Severe", "Block Delay: 2 blocks"]
      },
      {
        id: "ev-24h-3",
        timestamp: new Date(now - 1000 * 60 * 60 * 10),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 60 * 10) / 12000),
        txHash: "0x1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d",
        type: "anomaly",
        title: "MEV Sandwich Bot Swarm Active",
        description: "14 bot accounts executing sandwich attacks on retail transactions across mempool",
        riskDelta: 8,
        severity: "medium",
        aiExplanation: "Predatory MEV bots extracting slippage value from incoming swap orders. High gas auction bidding indicates automated priority bundling.",
        evidence: ["Bot Cluster: 14 Nodes", "Extracted Value: 18.4 ETH", "Bribe Fees: 4.2 ETH", "Victim Swaps: 88"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 14,
          wallet_role: "MEV Swarm",
          timezone_pattern: "24/7 Continuous (Automated Bot)",
          behavior_type: "bot_like",
          geo_region: "Proxy / VPN Masked",
          geo_confidence: "low"
        }
      },
      {
        id: "ev-24h-4",
        timestamp: new Date(now - 1000 * 60 * 60 * 4.5),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 60 * 4.5) / 12000),
        txHash: "0x5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e",
        type: "ownership",
        title: "Timelock Bypass Function Invoked",
        description: "Admin keyholder invoked emergency fast-track function bypassing 24h timelock delay",
        riskDelta: 18,
        severity: "critical",
        aiExplanation: "Critical governance vulnerability: Emergency upgrade bypass triggered without multi-sig consensus. Implementation change immediate.",
        evidence: ["Caller: 0x4e2a...c912", "Timelock Delay: 24h -> 0s", "Function: emergencyExecute()", "Status: Confirmed"],
        walletIntelligence: {
          cluster_detected: false,
          timezone_pattern: "UTC+5 to UTC+8 (South Asia)",
          behavior_type: "human_like",
          geo_region: "South Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-24h-5",
        timestamp: new Date(now - 1000 * 60 * 105),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 105) / 12000),
        txHash: "0x2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f",
        type: "liquidity",
        title: "Emergency Flash Liquidity Extraction ($740K)",
        description: "68% of remaining pool liquidity drained in 2 consecutive flash transactions",
        riskDelta: 24,
        severity: "critical",
        aiExplanation: "Core exploit executed: dev privileged function drained 68% of pool liquidity into private intermediary wallet. Trading depth collapsed.",
        evidence: ["Drained: $740,000 ETH", "Pool Slippage: +340%", "Destination: 0x9b1c...4f2a", "Remaining TVL: $84,000"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 3,
          wallet_role: "Exploit Operators",
          timezone_pattern: "UTC+5 to UTC+8 (South Asia)",
          behavior_type: "human_like",
          geo_region: "South Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-24h-6",
        timestamp: new Date(now - 1000 * 60 * 22),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 22) / 12000),
        txHash: "0x9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c",
        type: "ownership",
        title: "Rapid Mixer Dispersion via Railgun / Tornado",
        description: "Stolen funds split into sub-10 ETH tranches routed to privacy pools",
        riskDelta: 14,
        severity: "critical",
        aiExplanation: "Layering phase active. Stolen funds fragmented into 18 fresh mule addresses and deposited into privacy mixers to break audit trails.",
        evidence: ["Mule Wallets: 18", "Volume Dispersed: 240 ETH", "Mixer: Railgun / Tornado Hop 1", "AML Risk Flag: Extreme"]
      }
    ]
  }

  if (timeRange === "7d") {
    // 7-Day Weekly Governance Hijacking & Capital Flight
    return [
      {
        id: "ev-7d-1",
        timestamp: new Date(now - 86400000 * 6.5),
        blockNumber: Math.floor(currentBlock - (86400000 * 6.5) / 12000),
        txHash: "0x4a9f1b2c8e3d5f7a0b2c4e6f8a1b3c5d7e9f0a2b4c6e8f1a3b5c7d9e0f2a4b6c",
        type: "contract",
        title: "Admin Multi-Sig Signer Migration",
        description: "2 keyholders quietly updated to unverified hardware addresses",
        riskDelta: 4,
        severity: "low",
        aiExplanation: "Governance multi-sig signer threshold modified. Key ownership migrated away from original audited deployer addresses.",
        evidence: ["Multi-Sig: 0x8f2a...b4c2", "Replaced Signers: 2 of 3", "Execution Tx: 0x4a9f...4b6c", "Timelock: None"]
      },
      {
        id: "ev-7d-2",
        timestamp: new Date(now - 86400000 * 5.2),
        blockNumber: Math.floor(currentBlock - (86400000 * 5.2) / 12000),
        txHash: "0x7e9a1c3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c",
        type: "whale",
        title: "Snapshot Governance Hijack (Single Whale 52% Quorum)",
        description: "Flash-voted governance proposal passed altering protocol fee redirection",
        riskDelta: 14,
        severity: "high",
        aiExplanation: "Single whale address mobilized 52% of voting tokens in a single block to force through proposal redirecting protocol fees to private EOA.",
        evidence: ["Whale Quorum: 52.4%", "Voting Wallets: 1", "Proposal: CIP-14 Fee Redirect", "Voting Duration: 24h Flash"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 4,
          wallet_role: "Governance Whale",
          timezone_pattern: "UTC+8 to UTC+12 (East Asia)",
          behavior_type: "human_like",
          geo_region: "East Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-7d-3",
        timestamp: new Date(now - 86400000 * 3.8),
        blockNumber: Math.floor(currentBlock - (86400000 * 3.8) / 12000),
        txHash: "0x5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e",
        type: "ownership",
        title: "Treasury Allocation Peeling ($1.2M to Binance Mule)",
        description: "Vested dev tokens transferred to unverified CEX deposit intermediary",
        riskDelta: 16,
        severity: "high",
        aiExplanation: "Substantial treasury liquidation signal: 30% of vested dev reserves transferred to new unverified deposit mule directly connected to Binance hot wallet.",
        evidence: ["Transferred Value: $1,200,000", "Vesting Schedule: Bypassed", "Recipient: 0x3d2a...e901", "CEX Proximity: 1 Hop"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 6,
          wallet_role: "Treasury Peeling Mule",
          timezone_pattern: "UTC+5 to UTC+8 (South Asia)",
          behavior_type: "human_like",
          geo_region: "South Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-7d-4",
        timestamp: new Date(now - 86400000 * 2.4),
        blockNumber: Math.floor(currentBlock - (86400000 * 2.4) / 12000),
        txHash: "0x8f3c5e7a9b1d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a",
        type: "liquidity",
        title: "Tier-1 LP Capital Flight (-38% TVL)",
        description: "Institutional liquidity provider unstaked and exited pool position",
        riskDelta: 16,
        severity: "high",
        aiExplanation: "Major liquidity collapse: Top institutional LP withdrew 38% of total pooled reserves after detecting anomalous treasury transfers.",
        evidence: ["Unstaked LP: $1,150,000", "Remaining TVL: $1,850,000", "Pool Slippage Jump: +9.2%", "Holder: 0x6e1b...f2a4"]
      },
      {
        id: "ev-7d-5",
        timestamp: new Date(now - 86400000 * 1.1),
        blockNumber: Math.floor(currentBlock - (86400000 * 1.1) / 12000),
        txHash: "0x1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d",
        type: "ownership",
        title: "Unannounced Proxy Implementation Switch",
        description: "Proxy pointed to unverified bytecode containing hidden balance reduction hook",
        riskDelta: 18,
        severity: "critical",
        aiExplanation: "Exploit preparation: Proxy implementation pointed to unverified bytecode containing backdoor functions allowing admin to burn user LP positions.",
        evidence: ["Proxy: TransparentUpgradeable", "New Logic: 0x2b4d...f0a2", "Audit Match: 0% Unverified", "Vulnerability: Extreme"]
      },
      {
        id: "ev-7d-6",
        timestamp: new Date(now - 1000 * 60 * 60 * 7.5),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 60 * 7.5) / 12000),
        txHash: "0x2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f",
        type: "liquidity",
        title: "Emergency Liquidity Removal ($890K ETH)",
        description: "72% of remaining DEX pool reserves drained in 2 flash blocks",
        riskDelta: 24,
        severity: "critical",
        aiExplanation: "Catastrophic liquidity removal executed using privileged proxy functions. Remaining retail token holders stranded with zero pool depth.",
        evidence: ["Drained Amount: $890,000", "Pool TVL Remaining: $110,000", "Slippage Spike: +420%", "Destination: 0x9b1c...4f2a"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 3,
          wallet_role: "Dump Executors",
          timezone_pattern: "UTC+5 to UTC+8 (South Asia)",
          behavior_type: "human_like",
          geo_region: "South Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-7d-7",
        timestamp: new Date(now - 1000 * 60 * 40),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 40) / 12000),
        txHash: "0x9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c",
        type: "anomaly",
        title: "Automated Sybil Wash Trading Loop",
        description: "8 sybil addresses executing self-swaps generating $1.8M synthetic volume",
        riskDelta: 8,
        severity: "high",
        aiExplanation: "Synthetic trading loop inflating DEX volume metrics to deceive automated tracking scanners and trap secondary dip buyers.",
        evidence: ["Sybil Nodes: 8 Wallets", "Synthetic Volume: $1,820,000", "Organic Net Volume: ~$140,000", "Cycle Speed: 5.2s/tx"]
      }
    ]
  }

  if (timeRange === "30d") {
    // 30-Day Complete Pump, Trap & Dump Lifecycle
    return [
      {
        id: "ev-30d-1",
        timestamp: new Date(now - 86400000 * 29),
        blockNumber: Math.floor(currentBlock - (86400000 * 29) / 12000),
        txHash: "0x4a9f1b2c8e3d5f7a0b2c4e6f8a1b3c5d7e9f0a2b4c6e8f1a3b5c7d9e0f2a4b6c",
        type: "contract",
        title: "ERC-20 Contract Deployed & Verified",
        description: `Token contract verified on Etherscan for ${targetFormatted}`,
        riskDelta: 0,
        severity: "low",
        aiExplanation: "Contract code matched open-source standard with 100% bytecode compiler match. Genesis security audit passed cleanly.",
        evidence: [`Contract: ${targetFormatted}`, "Compiler: Solc 0.8.24", "Optimization: 200 runs", "License: MIT"]
      },
      {
        id: "ev-30d-2",
        timestamp: new Date(now - 86400000 * 24.5),
        blockNumber: Math.floor(currentBlock - (86400000 * 24.5) / 12000),
        txHash: "0x8f3c5e7a9b1d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a",
        type: "liquidity",
        title: "Initial Uniswap V3 Seed Liquidity Injected ($2.6M)",
        description: "$2.6M added to ETH/TOKEN pool with initial timelock commitment",
        riskDelta: -8,
        severity: "low",
        aiExplanation: "Substantial capital commitment deposited into DEX liquidity pool with 30-day initial locker on Uncx.",
        evidence: ["Pool: ETH/TOKEN", "Initial TVL: $2,600,000", "LP Tokens: 920,000", "Lock Window: 30 Days (Uncx)"]
      },
      {
        id: "ev-30d-3",
        timestamp: new Date(now - 86400000 * 18.5),
        blockNumber: Math.floor(currentBlock - (86400000 * 18.5) / 12000),
        txHash: "0x1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d",
        type: "social",
        title: "Viral Influencer Marketing & Social Blitz (+520% Reach)",
        description: "Coordinated Telegram and X campaign driving massive retail FOMO",
        riskDelta: 6,
        severity: "medium",
        aiExplanation: "Explosive retail onboarding wave. Community metrics expanded from 400 to 32,000 members in 72 hours, typical of pre-pump staging.",
        evidence: ["Social Reach: 520,000+", "Telegram Growth: +32,000", "Influencer Callouts: 14", "Sentiment Index: 94/100"]
      },
      {
        id: "ev-30d-4",
        timestamp: new Date(now - 86400000 * 14),
        blockNumber: Math.floor(currentBlock - (86400000 * 14) / 12000),
        txHash: "0x3e1a8b9c0d2e4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a",
        type: "liquidity",
        title: "Peak Protocol TVL Reached ($6.2M Across Pools)",
        description: "Trading volume hit $18M/day with highest organic liquidity depth",
        riskDelta: -4,
        severity: "low",
        aiExplanation: "All-time high liquidity reached. Low immediate slippage, but market depth sets stage for asymmetric exit liquidity capture.",
        evidence: ["Peak TVL: $6,200,000", "24h Volume: $18,400,000", "Unique Swappers: 4,820", "DEX Depth: Deep"]
      },
      {
        id: "ev-30d-5",
        timestamp: new Date(now - 86400000 * 10.5),
        blockNumber: Math.floor(currentBlock - (86400000 * 10.5) / 12000),
        txHash: "0x7e9a1c3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c",
        type: "whale",
        title: "Syndicate Whale Supply Cornering (4 Wallets Hold 58%)",
        description: "Top 4 private non-custodial accounts corner 58.4% of total supply",
        riskDelta: 16,
        severity: "high",
        aiExplanation: "Rapid centralization of token holdings into unverified private vaults. Asymmetric selling pressure risk escalated dramatically.",
        evidence: ["Top 4 Concentration: 58.4%", "Largest Holder: 28.1%", "Retail Float: 41.6%", "Dump Impact: -78%"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 4,
          wallet_role: "Whale Cluster",
          timezone_pattern: "UTC+8 to UTC+12 (East Asia)",
          behavior_type: "bot_like",
          geo_region: "East Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-30d-6",
        timestamp: new Date(now - 86400000 * 6.2),
        blockNumber: Math.floor(currentBlock - (86400000 * 6.2) / 12000),
        txHash: "0x2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f",
        type: "liquidity",
        title: "30-Day Liquidity Locker Expiration (Uncx Lock End)",
        description: "Initial LP locker expired with no governance renewal, opening dump window",
        riskDelta: 15,
        severity: "high",
        aiExplanation: "Uncx timelock reached maturity. Dev deployer wallet did not execute renewal or extension, leaving full LP tokens unconstrained.",
        evidence: ["Lock Status: Expired", "Unlocked LP: 920,000 Tokens", "Extension Tx: None Detected", "Vulnerability: Critical"]
      },
      {
        id: "ev-30d-7",
        timestamp: new Date(now - 86400000 * 2.2),
        blockNumber: Math.floor(currentBlock - (86400000 * 2.2) / 12000),
        txHash: "0x5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e",
        type: "ownership",
        title: "Insider Dev Wallet Peeling Chain (14 Mule Wallets)",
        description: "Deployer distributed 18M tokens across 14 newly generated mule addresses",
        riskDelta: 18,
        severity: "critical",
        aiExplanation: "Multi-hop dispersion actively slicing dev allocations into smaller amounts to bypass automated CEX deposit limits.",
        evidence: ["Source Vault: 0x7a2f...c891", "Mule Wallets: 14", "Peel Depth: 3 Hops", "Tokens: 18,000,000"],
        walletIntelligence: {
          cluster_detected: true,
          cluster_size: 14,
          wallet_role: "Mule Syndicate",
          timezone_pattern: "UTC+5 to UTC+8 (South Asia)",
          behavior_type: "human_like",
          geo_region: "South Asia",
          geo_confidence: "high"
        }
      },
      {
        id: "ev-30d-8",
        timestamp: new Date(now - 1000 * 60 * 115),
        blockNumber: Math.floor(currentBlock - (1000 * 60 * 115) / 12000),
        txHash: "0x9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c",
        type: "liquidity",
        title: "Coordinated Liquidity Drainage ($620K ETH)",
        description: "26% of pool reserves withdrawn without governance announcement",
        riskDelta: 24,
        severity: "critical",
        aiExplanation: "Sudden liquidity extraction executed right before scheduled token unlock. Triggers severe retail panic selling.",
        evidence: ["Drained Amount: $620,000", "Pool Impact: -26.0%", "Slippage Jump: +14.2%", "Destination: 0x9b1c...4f2a"]
      }
    ]
  }

  // ALL: 90-Day Full Lifecycle Macro Forensic Profile
  return [
    {
      id: "ev-all-1",
      timestamp: new Date(now - 86400000 * 88),
      blockNumber: Math.floor(currentBlock - (86400000 * 88) / 12000),
      txHash: "0x3e1a8b9c0d2e4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a",
      type: "contract",
      title: "Multi-Sig Genesis Deployer Vault Creation",
      description: "2-of-3 Gnosis Safe deployed to fund protocol genesis",
      riskDelta: 0,
      severity: "low",
      aiExplanation: "Deployer created cold-storage multi-sig wallet. Standard governance setup with no initial risk indicators.",
      evidence: ["Deployer Multi-Sig: 0x8f2a...b4c2", "Signers: 3 Keyholders", "Initial Seed: 45.0 ETH"],
      walletIntelligence: {
        cluster_detected: false,
        timezone_pattern: "UTC+0 to UTC+2 (Western Europe)",
        behavior_type: "human_like",
        geo_region: "Western Europe",
        geo_confidence: "high"
      }
    },
    {
      id: "ev-all-2",
      timestamp: new Date(now - 86400000 * 76),
      blockNumber: Math.floor(currentBlock - (86400000 * 76) / 12000),
      txHash: "0x5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e",
      type: "contract",
      title: "Token Generation Event & Public Fair Launch",
      description: `Genesis mint of 100M tokens executed to ${targetFormatted}`,
      riskDelta: 0,
      severity: "low",
      aiExplanation: "ERC-20 token minted according to verified bytecode parameters. Initial ownership set to multi-sig timelock.",
      evidence: [`Contract: ${targetFormatted}`, "Total Supply: 100,000,000", "Decimals: 18", "Audit Status: CertiK Verified"]
    },
    {
      id: "ev-all-3",
      timestamp: new Date(now - 86400000 * 64),
      blockNumber: Math.floor(currentBlock - (86400000 * 64) / 12000),
      txHash: "0x8f3c5e7a9b1d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a",
      type: "liquidity",
      title: "Uniswap V3 Primary Liquidity Pairing ($3.8M)",
      description: "$3.8M initial liquidity injected and locked for 6 months on Uncx",
      riskDelta: -6,
      severity: "low",
      aiExplanation: "Large capital commitment locked via Uncx smart contract. Liquidity depth verified, establishing low initial volatility.",
      evidence: ["Pool: ETH/TOKEN V3", "Initial TVL: $3,800,000", "Locker: Uncx 180-Day Lock", "LP Tokens: 1,420,800"]
    },
    {
      id: "ev-all-4",
      timestamp: new Date(now - 86400000 * 50),
      blockNumber: Math.floor(currentBlock - (86400000 * 50) / 12000),
      txHash: "0x1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d",
      type: "social",
      title: "Tier-2 CEX Listing & Volume Expansion",
      description: "Organic expansion accompanied by tier-1 crypto media coverage",
      riskDelta: -3,
      severity: "low",
      aiExplanation: "Listing on MEXC and Gate.io increases market liquidity dispersion and secondary trading depth.",
      evidence: ["CEX Listings: 2", "Secondary Volume: $8,400,000", "Holder Growth: +6,200", "Status: Healthy"]
    },
    {
      id: "ev-all-5",
      timestamp: new Date(now - 86400000 * 39),
      blockNumber: Math.floor(currentBlock - (86400000 * 39) / 12000),
      txHash: "0x4a9f1b2c8e3d5f7a0b2c4e6f8a1b3c5d7e9f0a2b4c6e8f1a3b5c7d9e0f2a4b6c",
      type: "contract",
      title: "Admin Multi-Sig Signer Handover",
      description: "Original founder signers replaced by new anonymous hardware wallets",
      riskDelta: 6,
      severity: "medium",
      aiExplanation: "First structural governance change: Multi-sig threshold transferred to unverified offshore hardware keys.",
      evidence: ["Signers Changed: 2 of 3", "New Key: 0x9a4f...c120", "Timelock: Bypassed via fast-track"]
    },
    {
      id: "ev-all-6",
      timestamp: new Date(now - 86400000 * 28),
      blockNumber: Math.floor(currentBlock - (86400000 * 28) / 12000),
      txHash: "0x9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c",
      type: "ownership",
      title: "Transparent Proxy Implementation Upgrade",
      description: "Contract logic implementation silently switched to unverified proxy bytecode",
      riskDelta: 14,
      severity: "high",
      aiExplanation: "Critical governance alert: Upgradeable proxy pointed to unverified logic address containing unannounced balance alteration functions.",
      evidence: ["Proxy: TransparentUpgradeable", "New Implementation: 0x4e2a...c912", "Timelock: Bypassed", "Vulnerability: High"],
      walletIntelligence: {
        cluster_detected: true,
        cluster_size: 4,
        wallet_role: "Proxy Controllers",
        timezone_pattern: "UTC+8 to UTC+12 (East Asia)",
        behavior_type: "mixed",
        geo_region: "East Asia",
        geo_confidence: "high"
      }
    },
    {
      id: "ev-all-7",
      timestamp: new Date(now - 86400000 * 17),
      blockNumber: Math.floor(currentBlock - (86400000 * 17) / 12000),
      txHash: "0x7e9a1c3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c",
      type: "whale",
      title: "Syndicate Supply Consolidation (64.2% Float)",
      description: "5 coordinated wallets accumulated 64.2% of circulating token float",
      riskDelta: 16,
      severity: "high",
      aiExplanation: "Supply concentration reached critical threshold. Mathematical model identifies asymmetric dump vulnerability.",
      evidence: ["Syndicate Wallets: 5", "Combined Float: 64.2%", "DEX Liquidity Depth: $2.4M", "Simulated Dump Impact: -82%"],
      walletIntelligence: {
        cluster_detected: true,
        cluster_size: 5,
        wallet_role: "Whale Syndicate",
        timezone_pattern: "UTC+8 to UTC+12 (East Asia)",
        behavior_type: "bot_like",
        geo_region: "East Asia",
        geo_confidence: "high"
      }
    },
    {
      id: "ev-all-8",
      timestamp: new Date(now - 86400000 * 5),
      blockNumber: Math.floor(currentBlock - (86400000 * 5) / 12000),
      txHash: "0x2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f",
      type: "liquidity",
      title: "Catastrophic Liquidity Drainage ($1.92M ETH)",
      description: "74% of pooled liquidity pulled across 3 rapid flash transactions",
      riskDelta: 25,
      severity: "critical",
      aiExplanation: "Unilateral emergency withdrawal executed using privileged proxy functions. Pool depth collapsed, leaving retail holders stranded.",
      evidence: ["Drained Amount: $1,920,000", "Remaining Pool TVL: $240,000", "Slippage: +410%", "Destination: 0x9b1c...4f2a"],
      walletIntelligence: {
        cluster_detected: true,
        cluster_size: 3,
        wallet_role: "Exploit Operators",
        timezone_pattern: "UTC+5 to UTC+8 (South Asia)",
        behavior_type: "human_like",
        geo_region: "South Asia",
        geo_confidence: "high"
      }
    },
    {
      id: "ev-all-9",
      timestamp: new Date(now - 86400000 * 1.4),
      blockNumber: Math.floor(currentBlock - (86400000 * 1.4) / 12000),
      txHash: "0x4b2c8e3d5f7a0b2c4e6f8a1b3c5d7e9f0a2b4c6e8f1a3b5c7d9e0f2a4b6c8e3d",
      type: "ownership",
      title: "Layering Phase: Dispersion to 24 Mule Wallets",
      description: "Drained ETH dispersed across 24 mule wallets and routed towards privacy protocols",
      riskDelta: 16,
      severity: "critical",
      aiExplanation: "Layering phase in progress: stolen funds split into sub-10 ETH tranches across multiple hops to evade AML thresholds.",
      evidence: ["Peel Nodes: 24 Mules", "Routed Value: 580 ETH", "Tornado Proximity: 1 Hop", "AML Risk Flag: Extreme"]
    },
    {
      id: "ev-all-10",
      timestamp: new Date(now - 1000 * 60 * 85),
      blockNumber: Math.floor(currentBlock - (1000 * 60 * 85) / 12000),
      txHash: "0x9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c",
      type: "anomaly",
      title: "Algorithmic Wash Trading & Spoofing Swarm",
      description: "High-frequency bot loop generating $1.8M fake volume to trap exit buyers",
      riskDelta: 8,
      severity: "high",
      aiExplanation: "Circular liquidity cycling active. Bot contracts generating false volume signals to create illusion of active trading recovery.",
      evidence: ["Volume Inflation: 420%", "Unique Traders: 6", "Circular Ratio: 94%", "Gas Burn: 8.2 ETH"]
    }
  ]
}

const generateRiskData = (events: TimelineEvent[], days: number = 7): RiskDataPoint[] => {
  const data: RiskDataPoint[] = []
  const now = Date.now()
  const totalMs = days * 86400000
  const startTime = new Date(now - totalMs)

  if (days === 1) {
    // 24H: Intraday Tactical Attack
    // Jittery micro-volatility, already elevated baseline, steep jumps at attack triggers
    const points = 36
    const baseRisk = 56
    for (let i = 0; i <= points; i++) {
      const progress = i / points
      const timestamp = new Date(startTime.getTime() + progress * totalMs)
      const windowMs = totalMs / points / 1.5
      const matchingEvent = events.find(e => Math.abs(e.timestamp.getTime() - timestamp.getTime()) < windowMs)

      // Intraday jagged micro-volatility
      const microJitter = Math.sin(i * 1.6) * 3.8 + Math.cos(i * 3.1) * 2.2

      let riskVal = baseRisk
      if (progress < 0.33) {
        riskVal = baseRisk + progress * 14 + microJitter
      } else if (progress < 0.66) {
        riskVal = 65 + ((progress - 0.33) / 0.33) * 11 + microJitter
      } else if (progress < 0.88) {
        riskVal = 76 + Math.pow((progress - 0.66) / 0.22, 1.4) * 18 + microJitter * 0.5
      } else {
        riskVal = 94 + Math.sin(i * 2) * 1.5
      }

      let liqVal = progress < 0.66 
        ? 68 - progress * 15 + Math.cos(i * 0.8) * 3 
        : progress < 0.88 
        ? Math.max(16, 58 - Math.pow((progress - 0.66) / 0.22, 1.5) * 42) 
        : 16 + Math.sin(i) * 1.5

      let ownVal = 64 + progress * 24 + Math.sin(i * 0.5) * 2
      let socVal = 35 + Math.sin(i * 0.9) * 15

      if (matchingEvent?.severity === "critical") {
        riskVal = Math.min(98, riskVal + 6)
        liqVal = Math.max(12, liqVal - 8)
      }

      data.push({
        timestamp,
        score: Math.min(98, Math.max(10, Math.round(riskVal * 10) / 10)),
        liquidity: Math.min(98, Math.max(12, Math.round(liqVal * 10) / 10)),
        ownership: Math.min(96, Math.max(20, Math.round(ownVal * 10) / 10)),
        social: Math.min(90, Math.max(15, Math.round(socVal * 10) / 10)),
        confidence: Math.round((93 + Math.sin(i * 0.5) * 3) * 10) / 10,
        event: matchingEvent
      })
    }
    return data
  }

  if (days === 7) {
    // 7D: Weekly Governance & Capital Flight
    // Staircase jumps: Day 1-2 steady (32), Day 3 governance jump (52), Day 5 treasury jump (68), Day 6-7 drain (92)
    const points = 42
    for (let i = 0; i <= points; i++) {
      const progress = i / points
      const timestamp = new Date(startTime.getTime() + progress * totalMs)
      const windowMs = totalMs / points / 1.5
      const matchingEvent = events.find(e => Math.abs(e.timestamp.getTime() - timestamp.getTime()) < windowMs)

      const noise = Math.sin(i * 0.9) * 2.2 + Math.cos(i * 1.7) * 1.2

      let riskVal = 32
      if (progress < 0.28) {
        riskVal = 32 + progress * 10 + noise
      } else if (progress < 0.52) {
        riskVal = 48 + ((progress - 0.28) / 0.24) * 8 + noise
      } else if (progress < 0.76) {
        riskVal = 64 + ((progress - 0.52) / 0.24) * 8 + noise
      } else {
        riskVal = 74 + Math.pow((progress - 0.76) / 0.24, 1.4) * 18 + noise * 0.5
      }

      let liqVal = progress < 0.28 
        ? 78 + Math.cos(i * 0.5) * 2 
        : Math.max(18, 78 - Math.pow((progress - 0.28) / 0.72, 1.2) * 60 + Math.cos(i * 0.6) * 2)

      let ownVal = progress < 0.28 
        ? 38 + noise 
        : progress < 0.52 
        ? 62 + noise 
        : 84 + noise * 0.8

      let socVal = 28 + Math.sin(i * 0.7) * 8

      if (matchingEvent?.severity === "critical") {
        riskVal = Math.min(98, riskVal + 8)
        liqVal = Math.max(12, liqVal - 10)
      }

      data.push({
        timestamp,
        score: Math.min(98, Math.max(10, Math.round(riskVal * 10) / 10)),
        liquidity: Math.min(98, Math.max(14, Math.round(liqVal * 10) / 10)),
        ownership: Math.min(96, Math.max(20, Math.round(ownVal * 10) / 10)),
        social: Math.min(90, Math.max(15, Math.round(socVal * 10) / 10)),
        confidence: Math.round((92 + Math.cos(i * 0.4) * 3) * 10) / 10,
        event: matchingEvent
      })
    }
    return data
  }

  if (days === 30) {
    // 30D: Classic Pump, Trap & Dump Cycle
    // Social has a prominent euphoria dome peaking in week 2 (92%)
    // Liquidity curves UP during early launch (from 48% to 88%), then plunges
    // Risk starts low (18%), steady rise, then escalates after locks expire
    const points = 52
    for (let i = 0; i <= points; i++) {
      const progress = i / points
      const timestamp = new Date(startTime.getTime() + progress * totalMs)
      const windowMs = totalMs / points / 1.5
      const matchingEvent = events.find(e => Math.abs(e.timestamp.getTime() - timestamp.getTime()) < windowMs)

      const noise = Math.sin(i * 0.8) * 1.8 + Math.cos(i * 1.4) * 1.1

      let riskVal = 18
      if (progress < 0.25) {
        riskVal = 17 + progress * 16 + noise
      } else if (progress < 0.58) {
        riskVal = 26 + ((progress - 0.25) / 0.33) * 14 + noise
      } else if (progress < 0.80) {
        riskVal = 44 + ((progress - 0.58) / 0.22) * 22 + noise
      } else {
        riskVal = 68 + Math.pow((progress - 0.80) / 0.20, 1.3) * 24 + noise * 0.5
      }

      // Liquidity curves UP first to 88% then collapses
      let liqVal = 50
      if (progress < 0.45) {
        liqVal = 48 + Math.sin(progress / 0.45 * (Math.PI / 2)) * 40 + noise
      } else if (progress < 0.75) {
        liqVal = 88 - Math.pow((progress - 0.45) / 0.30, 1.4) * 38 + noise
      } else {
        liqVal = Math.max(16, 50 - Math.pow((progress - 0.75) / 0.25, 1.3) * 34 + noise * 0.5)
      }

      // Social Hype Dome peaking at progress 0.45 at ~92%!
      let socVal = 18
      if (progress >= 0.15 && progress <= 0.75) {
        const bellProg = (progress - 0.15) / 0.60
        socVal = 20 + Math.sin(bellProg * Math.PI) * 72 + noise
      } else if (progress > 0.75) {
        socVal = Math.max(12, 22 - (progress - 0.75) * 30 + noise)
      }

      let ownVal = 24 + Math.pow(progress, 1.2) * 62 + noise

      if (matchingEvent?.severity === "critical") {
        riskVal = Math.min(98, riskVal + 8)
        liqVal = Math.max(12, liqVal - 10)
      }

      data.push({
        timestamp,
        score: Math.min(98, Math.max(10, Math.round(riskVal * 10) / 10)),
        liquidity: Math.min(98, Math.max(14, Math.round(liqVal * 10) / 10)),
        ownership: Math.min(96, Math.max(18, Math.round(ownVal * 10) / 10)),
        social: Math.min(96, Math.max(12, Math.round(socVal * 10) / 10)),
        confidence: Math.round((91 + Math.sin(i * 0.4) * 4) * 10) / 10,
        event: matchingEvent
      })
    }
    return data
  }

  // ALL: 90 Days Macro Protocol Lifecycle
  // Pristine flat green baseline for first 38% (Days 1 to 35: Risk 11-14%)
  // Gentle growth phase (Days 35 to 60: Risk 15-32%)
  // Syndicate accumulation (Days 60 to 78: Risk 32-58%)
  // Exploitation & dispersion (Last 12 days: Risk 58-92%)
  const points = 65
  for (let i = 0; i <= points; i++) {
    const progress = i / points
    const timestamp = new Date(startTime.getTime() + progress * totalMs)
    const windowMs = totalMs / points / 1.5
    const matchingEvent = events.find(e => Math.abs(e.timestamp.getTime() - timestamp.getTime()) < windowMs)

    const noise = Math.sin(i * 0.6) * 1.5 + Math.cos(i * 1.2) * 0.9

    let riskVal = 12
    if (progress < 0.38) {
      // First 35 days: pristine low-risk audited baseline!
      riskVal = 12 + progress * 5 + noise * 0.8
    } else if (progress < 0.65) {
      riskVal = 16 + ((progress - 0.38) / 0.27) * 14 + noise
    } else if (progress < 0.85) {
      riskVal = 32 + Math.pow((progress - 0.65) / 0.20, 1.2) * 26 + noise
    } else {
      riskVal = 60 + Math.pow((progress - 0.85) / 0.15, 1.3) * 32 + noise * 0.5
    }

    let liqVal = progress < 0.65 
      ? 88 + Math.cos(i * 0.4) * 2 
      : progress < 0.85 
      ? 84 - ((progress - 0.65) / 0.20) * 24 + noise 
      : Math.max(14, 60 - Math.pow((progress - 0.85) / 0.15, 1.4) * 46)

    let ownVal = progress < 0.45 
      ? 20 + noise 
      : progress < 0.80 
      ? 24 + ((progress - 0.45) / 0.35) * 44 + noise 
      : 72 + ((progress - 0.80) / 0.20) * 18 + noise * 0.6

    let socVal = progress < 0.35 
      ? 18 + Math.sin(i * 0.5) * 6 
      : progress < 0.70 
      ? 35 + Math.sin(i * 0.8) * 12 
      : Math.max(14, 25 - (progress - 0.70) * 25)

    if (matchingEvent?.severity === "critical") {
      riskVal = Math.min(98, riskVal + 8)
      liqVal = Math.max(12, liqVal - 12)
    }

    data.push({
      timestamp,
      score: Math.min(98, Math.max(10, Math.round(riskVal * 10) / 10)),
      liquidity: Math.min(98, Math.max(12, Math.round(liqVal * 10) / 10)),
      ownership: Math.min(96, Math.max(16, Math.round(ownVal * 10) / 10)),
      social: Math.min(92, Math.max(12, Math.round(socVal * 10) / 10)),
      confidence: Math.round((94 + Math.sin(i * 0.3) * 3) * 10) / 10,
      event: matchingEvent
    })
  }
  return data
}

const getEventIcon = (type: TimelineEvent["type"]) => {
  switch (type) {
    case "liquidity": return <Droplets className="w-4 h-4" />
    case "ownership": return <Users className="w-4 h-4" />
    case "social": return <MessageSquare className="w-4 h-4" />
    case "contract": return <FileCode className="w-4 h-4" />
    case "whale": return <TrendingUp className="w-4 h-4" />
    case "anomaly": return <AlertTriangle className="w-4 h-4" />
  }
}

const getSeverityColor = (severity: TimelineEvent["severity"]) => {
  switch (severity) {
    case "low": return "#22c55e"
    case "medium": return "#eab308"
    case "high": return "#f97316"
    case "critical": return "#ef4444"
  }
}

const getSeverityBadgeClasses = (severity: TimelineEvent["severity"]) => {
  switch (severity) {
    case "low":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
    case "medium":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
    case "high":
      return "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
    case "critical":
      return "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse"
  }
}

const getRiskColor = (score: number) => {
  if (score < 30) return "#22c55e"
  if (score < 50) return "#84cc16"
  if (score < 70) return "#f59e0b"
  if (score < 85) return "#f97316"
  return "#ef4444"
}

const WalletIntelligenceEnrichment = ({ intel }: { intel: WalletIntelligenceContext, eventId: string }) => {
  const router = useRouter()
  
  return (
    <div className="mt-3 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">
            Wallet Attribution Context
          </span>
        </div>
        <Badge className="text-[9px] bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
          PROBABILISTIC PROFILING
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
        {intel.cluster_detected && (
          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">Cluster Size:</span>
            <span className="text-white font-bold">{intel.cluster_size} wallets</span>
          </div>
        )}
        
        {intel.wallet_role && (
          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">Role:</span>
            <span className="text-indigo-300 font-semibold">{intel.wallet_role}</span>
          </div>
        )}
        
        {intel.behavior_type && (
          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
            {intel.behavior_type === "bot_like" ? (
              <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-gray-400">Behavior:</span>
            <span className={intel.behavior_type === "bot_like" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
              {intel.behavior_type.replace("_", " ").toUpperCase()}
            </span>
          </div>
        )}
        
        {intel.timezone_pattern && (
          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">Temporal Rhythm:</span>
            <span className="text-gray-200 truncate">{intel.timezone_pattern}</span>
          </div>
        )}
        
        {intel.geo_region && (
          <div className="flex items-center gap-2 sm:col-span-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-gray-400">Region:</span>
            <span className="text-white font-medium">{intel.geo_region}</span>
            <Badge 
              className={`ml-auto text-[8px] uppercase ${
                intel.geo_confidence === "high" 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : intel.geo_confidence === "medium"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {intel.geo_confidence} conf
            </Badge>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-3 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 text-xs font-semibold border border-indigo-500/30"
        onClick={(e) => {
          e.stopPropagation()
          router.push("/wallet-intelligence")
        }}
      >
        <Globe className="w-3.5 h-3.5 mr-2 text-indigo-400" />
        Explore Full Attribution & Behavioral Fingerprint
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </Button>
    </div>
  )
}

export default function TrustTimelinePage() {
  const router = useRouter()
  const [address, setAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d")
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["risk", "liquidity", "ownership", "social"]))
  const [animationProgress, setAnimationProgress] = useState(0)
  
  // Real-time dynamic events anchored to current wall-clock time
  const [events, setEvents] = useState<TimelineEvent[]>(() => generateEventsForRange("7d", "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"))
  const [riskData, setRiskData] = useState<RiskDataPoint[]>([])
  const [nowTime, setNowTime] = useState<number>(Date.now())
  
  // Filtering & Search in Forensic Event Log
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest_risk">("newest")
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null)

  // Chart Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Periodically update nowTime so relative times ("18m ago") stay active and fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now())
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  // Regenerate events and risk points whenever timeRange or address changes
  useEffect(() => {
    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const freshEvents = generateEventsForRange(timeRange, address)
    setEvents(freshEvents)
    setRiskData(generateRiskData(freshEvents, days))
    setAnimationProgress(0)
  }, [timeRange, address])

  // Chart animation loop
  useEffect(() => {
    if (showResults && animationProgress < 100) {
      const timer = setTimeout(() => {
        setAnimationProgress(prev => Math.min(100, prev + 2.5))
      }, 16)
      return () => clearTimeout(timer)
    }
  }, [showResults, animationProgress])

  // Continuous animation loop for living pulse halos and social waves
  useEffect(() => {
    if (showResults) {
      const interval = setInterval(() => {
        const canvas = canvasRef.current
        if (canvas) {
          setRiskData(prev => [...prev])
        }
      }, 50)
      return () => clearInterval(interval)
    }
  }, [showResults])

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || riskData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const padding = { top: 40, right: 60, bottom: 60, left: 60 }
    const graphWidth = rect.width - padding.left - padding.right
    const graphHeight = rect.height - padding.top - padding.bottom

    ctx.strokeStyle = "rgba(255,215,0,0.05)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + graphWidth, y)
      ctx.stroke()
      
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.font = "10px monospace"
      ctx.textAlign = "right"
      ctx.fillText(`${100 - i * 25}`, padding.left - 15, y + 4)
    }

    const visiblePoints = Math.floor((riskData.length * animationProgress) / 100)
    if (visiblePoints <= 1) return

    const getX = (i: number) => padding.left + (i / (riskData.length - 1)) * graphWidth
    const getY = (val: number) => padding.top + ((100 - val) / 100) * graphHeight

    if (activeLayers.has("risk")) {
      ctx.beginPath()
      const bandOpacity = 0.1 * (animationProgress / 100)
      ctx.fillStyle = `rgba(255, 215, 0, ${bandOpacity})`
      
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(Math.min(100, riskData[i].score + (100 - riskData[i].confidence) / 2))
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      for (let i = visiblePoints - 1; i >= 0; i--) {
        const x = getX(i)
        const y = getY(Math.max(0, riskData[i].score - (100 - riskData[i].confidence) / 2))
        ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
    }

    if (activeLayers.has("liquidity")) {
      ctx.beginPath()
      ctx.fillStyle = "rgba(56, 189, 248, 0.15)"
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].liquidity)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.lineTo(getX(visiblePoints - 1), padding.top + graphHeight)
      ctx.lineTo(padding.left, padding.top + graphHeight)
      ctx.closePath()
      ctx.fill()
      
      ctx.beginPath()
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)"
      ctx.lineWidth = 1
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].liquidity)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    if (activeLayers.has("ownership")) {
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.strokeStyle = "rgba(168, 85, 247, 0.6)"
      ctx.lineWidth = 2
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].ownership)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (activeLayers.has("social")) {
      for (let i = 0; i < visiblePoints; i += 4) {
        const x = getX(i)
        const y = getY(riskData[i].social)
        const intensity = riskData[i].social / 100
        const pulse = Math.sin(Date.now() / 1000 + i) * 0.2 + 0.8
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 30 * intensity * pulse)
        grad.addColorStop(0, `rgba(244, 114, 182, ${0.2 * intensity})`)
        grad.addColorStop(1, "rgba(244, 114, 182, 0)")
        
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, 30 * intensity * pulse, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (activeLayers.has("risk")) {
      const gradient = ctx.createLinearGradient(padding.left, 0, padding.left + graphWidth, 0)
      riskData.slice(0, visiblePoints).forEach((point, i) => {
        const progress = i / (riskData.length - 1)
        gradient.addColorStop(progress, getRiskColor(point.score))
      })

      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].score)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()

      if (visiblePoints === riskData.length) {
        ctx.beginPath()
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        const lastPoint = riskData[riskData.length - 1]
        ctx.moveTo(getX(riskData.length - 1), getY(lastPoint.score))
        
        for (let j = 1; j <= 4; j++) {
          const fx = padding.left + graphWidth + (j / 4) * 60
          const fy = getY(lastPoint.score + (Math.random() - 0.3) * 15)
          ctx.lineTo(fx, fy)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    riskData.slice(0, visiblePoints).forEach((point, i) => {
      if (!point.event) return
      
      const x = getX(i)
      const y = getY(point.score)
      const color = getSeverityColor(point.event.severity)
      const isSelected = selectedEvent?.id === point.event.id

      const pulse = Math.sin(Date.now() / 500 + i) * 0.3 + 0.7
      ctx.beginPath()
      ctx.arc(x, y, (isSelected ? 16 : 14) * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `${color}22`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 7 : 6, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = isSelected ? "#fff" : "#000"
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 12 : 10, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? "#fff" : `${color}66`
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.stroke()
      ctx.setLineDash([])
    })

    const labelStep = Math.ceil(riskData.length / 6)
    riskData.forEach((point, i) => {
      if (i % labelStep === 0 || i === riskData.length - 1) {
        const x = getX(i)
        let date = ""
        if (timeRange === "24h") {
          date = point.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        } else if (timeRange === "7d") {
          date = i === riskData.length - 1 ? "Today" : point.timestamp.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
        } else {
          date = i === riskData.length - 1 ? "Today" : point.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }
        ctx.fillStyle = "rgba(255,255,255,0.45)"
        ctx.font = "9px monospace"
        ctx.textAlign = "center"
        ctx.fillText(date, x, rect.height - padding.bottom + 25)
      }
    })

  }, [riskData, animationProgress, activeLayers, selectedEvent, timeRange])

  // Trigger manual timeline re-analysis
  const handleScan = () => {
    setIsScanning(true)
    setAnimationProgress(0)
    setTimeout(() => {
      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const fresh = generateEventsForRange(timeRange, address)
      setEvents(fresh)
      setRiskData(generateRiskData(fresh, days))
      setNowTime(Date.now())
      setIsScanning(false)
      setShowResults(true)
      toast.success("Timeline telemetry synchronized", {
        description: `Verified ${fresh.length} anomalous risk events against Ethereum ledger`,
        duration: 2500
      })
    }, 1200)
  }

  // Filtered & sorted events for Forensic Event Log
  const filteredEvents = useMemo(() => {
    let result = [...events]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.aiExplanation.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q) ||
        e.evidence?.some(ev => ev.toLowerCase().includes(q))
      )
    }

    // Severity filter
    if (selectedSeverity !== "all") {
      result = result.filter(e => e.severity === selectedSeverity)
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter(e => e.type === selectedType)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") return b.timestamp.getTime() - a.timestamp.getTime()
      if (sortOrder === "oldest") return a.timestamp.getTime() - b.timestamp.getTime()
      if (sortOrder === "highest_risk") return Math.abs(b.riskDelta) - Math.abs(a.riskDelta)
      return 0
    })

    return result
  }, [events, searchQuery, selectedSeverity, selectedType, sortOrder])

  const copyToClipboard = (text: string, id: string, label: string = "Hash") => {
    navigator.clipboard.writeText(text)
    setCopiedTxId(id)
    toast.success(`Copied ${label}`, {
      description: text,
      duration: 1800
    })
    setTimeout(() => setCopiedTxId(null), 1800)
  }

  const currentRisk = riskData[riskData.length - 1]?.score || 0
  const criticalCount = events.filter(e => e.severity === "critical").length
  const maxDelta = Math.max(...events.map(e => e.riskDelta))
  const netShift = riskData.length > 1 ? Math.round(riskData[riskData.length - 1].score - riskData[0].score) : 0

  return (
    <div className="min-h-screen bg-[#05060a] text-white selection:bg-yellow-500/30 selection:text-yellow-200">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 via-cyan-500/10 to-blue-600/20 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.15)]">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white uppercase">Dynamic Trust Timeline</h1>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] font-black uppercase">
                  FORENSIC TELEMETRY
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">
                Chronological ledger analysis tracking how token and wallet risk evolves over time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400">LEDGER SYNC:</span>
            <span className="font-mono text-emerald-400 font-bold">ETH BLOCK #21,085,420</span>
          </div>
        </div>

        {/* Target Address Input Card */}
        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-md mb-6 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/60" />
                <Input
                  placeholder="Enter target contract, pool, or wallet address (0x...)..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 font-mono text-sm bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold uppercase tracking-wider text-xs px-6 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin mr-2" />
                      Auditing Ledger...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Timeline
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const fresh = generateEventsForRange(timeRange, address)
                    setEvents(fresh)
                    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
                    setRiskData(generateRiskData(fresh, days))
                    setNowTime(Date.now())
                    toast.success("Refreshed timestamps", { duration: 1500 })
                  }}
                  title="Refresh live timestamps"
                  className="border-white/10 hover:border-yellow-500/30 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Address Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">Quick Targets:</span>
              {[
                { label: "Rug Target (Uniswap Pool)", addr: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
                { label: "Deployer Vault", addr: "0x8f2a74c2e1b490d1f3a5c7e9b1d3f5a7c9e1b4c2" },
                { label: "Tornado Mixer Mule", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                { label: "Drainer Cluster", addr: "0x9b1c4f2a7e9d2f4a6c8e0b2d4f6a8c0e2b4d6f8a" }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setAddress(preset.addr)
                  }}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    address === preset.addr 
                      ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
                      : "border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interactive Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Risk Evolution Timeline */}
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Risk Evolution Timeline
                      </CardTitle>
                      <div className="flex bg-black/40 rounded-lg p-1 border border-yellow-500/20">
                        {(["24h", "7d", "30d", "all"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-3 py-1 text-xs rounded transition-all ${
                              timeRange === r 
                                ? "bg-yellow-500 text-black font-bold" 
                                : "text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            {r.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {[
                          { id: "risk", label: "Risk", color: "bg-yellow-500" },
                          { id: "liquidity", label: "Liquidity", color: "bg-sky-400" },
                          { id: "ownership", label: "Ownership", color: "bg-purple-500" },
                          { id: "social", label: "Social", color: "bg-pink-400" }
                        ].map(layer => (
                          <button
                            key={layer.id}
                            onClick={() => {
                              const next = new Set(activeLayers)
                              if (next.has(layer.id)) next.delete(layer.id); else next.add(layer.id)
                              setActiveLayers(next)
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${
                              activeLayers.has(layer.id)
                                ? "border-white/20 bg-white/5 opacity-100"
                                : "border-transparent opacity-30 grayscale"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${layer.color}`} />
                            <span className="text-[10px] font-medium uppercase">{layer.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 relative">
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                        {timeRange === "24h" ? "Intraday Attack Forensics" :
                         timeRange === "7d" ? "Weekly Governance & Contagion" :
                         timeRange === "30d" ? "Pump & Distribution Cycle" :
                         "90-Day Full Lifecycle Macro Ledger"}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          {timeRange === "24h" ? "TACTICAL MEMPOOL MONITORING" :
                           timeRange === "7d" ? "LEDGER CONTAGION ACTIVE" :
                           timeRange === "30d" ? "30D HEURISTIC AUDIT" :
                           "MACRO MULTI-REGIME TELEMETRY"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-[450px] w-full bg-[#08090d] cursor-crosshair">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full"
                      style={{ display: "block" }}
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#05060a] via-transparent to-transparent opacity-40" />
                  </div>
                </CardContent>
              </Card>

              {/* 2. ENHANCED FORENSIC EVENT LOG */}
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-yellow-500/20 py-4 bg-white/[0.01]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-lg text-yellow-300 font-bold uppercase tracking-wider">
                          Forensic Event Log
                        </CardTitle>
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] font-mono font-bold">
                          {filteredEvents.length} OF {events.length} ANOMALIES
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Chronological causality log with verified block heights and relative time signatures
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>Max Risk Delta: +{maxDelta}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search query */}
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <Input
                        placeholder="Filter by keyword, hash, or evidence..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-xs bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50"
                      />
                    </div>

                    {/* Severity Filters */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                      {(["all", "critical", "high", "medium", "low"] as const).map(sev => (
                        <button
                          key={sev}
                          onClick={() => setSelectedSeverity(sev)}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
                            selectedSeverity === sev
                              ? "bg-yellow-500 text-black border-yellow-400 shadow"
                              : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : prev === "oldest" ? "highest_risk" : "newest")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded border border-white/10 bg-white/[0.02] text-[10px] font-mono text-gray-300 hover:border-yellow-500/30"
                      >
                        <ArrowUpDown className="w-3 h-3 text-yellow-400" />
                        <span>{sortOrder === "newest" ? "NEWEST FIRST" : sortOrder === "oldest" ? "OLDEST FIRST" : "HIGHEST RISK"}</span>
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="relative">
                    {/* Vertical Connecting Timeline Bar */}
                    <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-gradient-to-b from-yellow-500/40 via-red-500/40 to-emerald-500/40" />

                    <div className="space-y-4">
                      {filteredEvents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">
                          No anomalous events matched the filter criteria.
                        </div>
                      ) : (
                        filteredEvents.map((event, index) => {
                          const isSelected = selectedEvent?.id === event.id
                          const timeFormatted = formatAbsoluteTime(event.timestamp)
                          const relativeTime = formatRelativeTime(event.timestamp, nowTime)
                          const sevColor = getSeverityColor(event.severity)
                          const badgeClasses = getSeverityBadgeClasses(event.severity)

                          return (
                            <div 
                              key={event.id}
                              className={`relative pl-14 transition-all duration-300 cursor-pointer group ${
                                isSelected ? "scale-[1.01]" : ""
                              }`}
                              onClick={() => setSelectedEvent(isSelected ? null : event)}
                              style={{
                                opacity: animationProgress > (index / events.length) * 100 ? 1 : 0.4,
                                transform: `translateX(${animationProgress > (index / events.length) * 100 ? 0 : -15}px)`
                              }}
                            >
                              {/* Glowing Marker Dot on Left Line */}
                              <div 
                                className={`absolute left-3.5 top-5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-125 z-10 ${
                                  isSelected ? "scale-125 ring-4 ring-yellow-500/30" : ""
                                }`}
                                style={{ 
                                  backgroundColor: "#07080c",
                                  borderColor: sevColor,
                                  boxShadow: `0 0 14px ${sevColor}88`
                                }}
                              >
                                <span style={{ color: sevColor }}>
                                  {getEventIcon(event.type)}
                                </span>
                              </div>

                              {/* Main Event Card Box */}
                              <div className={`p-4 rounded-xl border transition-all backdrop-blur-md ${
                                isSelected 
                                  ? "bg-yellow-500/10 border-yellow-500/60 shadow-[0_0_25px_rgba(255,215,0,0.15)]" 
                                  : event.severity === "critical"
                                  ? "bg-red-950/15 border-red-500/30 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.08)]"
                                  : "bg-white/[0.02] border-white/10 hover:border-yellow-500/40 hover:bg-white/[0.04]"
                              }`}>
                                
                                {/* Card Header Row */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-bold text-white text-sm group-hover:text-yellow-300 transition-colors">
                                        {event.title}
                                      </h4>
                                      <Badge variant="outline" className="text-[9px] font-mono uppercase border-white/20 text-gray-400">
                                        #{event.type}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{event.description}</p>
                                  </div>

                                  {/* Badges: Severity + Risk Delta */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border ${badgeClasses}`}
                                    >
                                      {event.severity}
                                    </Badge>
                                    
                                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                                      event.riskDelta > 0 
                                        ? "text-red-400 bg-red-500/10 border-red-500/30" 
                                        : event.riskDelta < 0 
                                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" 
                                        : "text-gray-400 bg-white/5 border-white/10"
                                    }`}>
                                      {event.riskDelta > 0 ? "▲ +" : event.riskDelta < 0 ? "▼ " : "— "}{event.riskDelta}%
                                    </span>

                                    <div className="text-gray-500 group-hover:text-yellow-400 transition-colors ml-1">
                                      {isSelected ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Timestamps & Block Telemetry Metadata Bar */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 mt-2 border-t border-white/5 text-[11px] font-mono text-gray-400">
                                  {/* Relative Time Badge with Live Pulse */}
                                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                    <span>{relativeTime}</span>
                                  </div>

                                  {/* Absolute Timestamp */}
                                  <div className="flex items-center gap-1 text-gray-400" title={timeFormatted.utc}>
                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{timeFormatted.local}</span>
                                  </div>

                                  {/* Block Height */}
                                  <div className="flex items-center gap-1 text-cyan-400">
                                    <Box className="w-3.5 h-3.5 text-cyan-500/70" />
                                    <span>Block #{event.blockNumber.toLocaleString()}</span>
                                  </div>

                                  {/* Tx Hash Copy Button */}
                                  <div 
                                    className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors cursor-pointer group/tx"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyToClipboard(event.txHash, event.id, "Tx Hash")
                                    }}
                                  >
                                    <span>Tx: {event.txHash.slice(0, 8)}...{event.txHash.slice(-6)}</span>
                                    {copiedTxId === event.id ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-gray-600 group-hover/tx:text-yellow-400 transition-colors" />
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Forensic Details */}
                                {isSelected && (
                                  <div className="mt-4 pt-4 border-t border-yellow-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* AI Forensic Explanation */}
                                    <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                                      <div className="flex items-center gap-2 mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                        <Info className="w-3.5 h-3.5" />
                                        <span>AI Forensic Causality Engine</span>
                                      </div>
                                      <p className="text-xs text-cyan-200 leading-relaxed font-sans">{event.aiExplanation}</p>
                                    </div>
                                    
                                    {/* Forensic Evidence Items */}
                                    {event.evidence && (
                                      <div className="bg-black/50 rounded-xl p-3 border border-white/5 space-y-2">
                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center justify-between">
                                          <span>Verified Evidence Items</span>
                                          <span className="text-yellow-500/70">{event.evidence.length} Parameters</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {event.evidence.map((item, i) => {
                                            const parts = item.split(": ")
                                            const label = parts.length > 1 ? parts[0] : "Evidence"
                                            const val = parts.length > 1 ? parts[1] : item
                                            const isAddr = val.startsWith("0x")

                                            return (
                                              <div key={i} className="text-xs font-mono bg-white/[0.02] p-2 rounded border border-white/5 flex items-center justify-between gap-2">
                                                <div className="truncate">
                                                  <span className="text-gray-500 mr-1.5">{label}:</span>
                                                  {isAddr ? (
                                                    <span className="text-yellow-300 font-bold">{val}</span>
                                                  ) : (
                                                    <span className="text-white">{val}</span>
                                                  )}
                                                </div>
                                                {isAddr && (
                                                  <button 
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      copyToClipboard(val, `${event.id}-${i}`, label)
                                                    }}
                                                    className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white shrink-0"
                                                  >
                                                    <Copy className="w-3 h-3" />
                                                  </button>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Embedded Wallet Intelligence Context */}
                                    {event.walletIntelligence && (
                                      <WalletIntelligenceEnrichment 
                                        intel={event.walletIntelligence} 
                                        eventId={event.id}
                                      />
                                    )}

                                    {/* Quick Investigation Action Links */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 text-[10px] font-bold uppercase tracking-wider"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          router.push("/graph")
                                        }}
                                      >
                                        <Network className="w-3 h-3 mr-1.5 text-yellow-400" />
                                        Trace in Graph
                                      </Button>

                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 text-[10px] font-bold uppercase tracking-wider"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const addr = event.evidence?.[0]?.split(": ")?.[1] || address
                                          router.push(`/wallet-intelligence?address=${addr}`)
                                        }}
                                      >
                                        <Fingerprint className="w-3 h-3 mr-1.5 text-indigo-400" />
                                        Attribution Dossier
                                      </Button>

                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-[10px] font-bold uppercase tracking-wider"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          router.push("/protocol-risk")
                                        }}
                                      >
                                        <FileCode className="w-3 h-3 mr-1.5 text-cyan-400" />
                                        Protocol Risk Audit
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar: Summary Metrics, Critical Alerts & AI Forecast */}
            <div className="space-y-6">
              
              {/* Risk Summary Card */}
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-md shadow-2xl">
                <CardHeader className="border-b border-yellow-500/20 py-4">
                  <CardTitle className="text-base text-yellow-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-400" />
                    Forensic Risk Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                      <div className={`font-mono font-black text-xl ${netShift >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {netShift >= 0 ? "+" : ""}{netShift}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Net Shift ({timeRange})</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                      <div className="text-yellow-400 font-mono font-black text-xl">{events.length}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tracked Anomalies</div>
                    </div>
                  </div>

                  {/* Event Type Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                      Anomaly Distribution
                    </div>
                    {[
                      { type: "Liquidity Removal", count: events.filter(e => e.type === "liquidity").length, color: "#38bdf8" },
                      { type: "Whale Concentration", count: events.filter(e => e.type === "whale").length, color: "#fbbf24" },
                      { type: "Insider Splitting", count: events.filter(e => e.type === "ownership").length, color: "#a78bfa" },
                      { type: "Wash Trading Loops", count: events.filter(e => e.type === "anomaly").length, color: "#ef4444" },
                      { type: "Social Bot Volume", count: events.filter(e => e.type === "social").length, color: "#f472b6" },
                      { type: "Contract Deployment", count: events.filter(e => e.type === "contract").length, color: "#22c55e" }
                    ].map(item => (
                      <div key={item.type} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-400">{item.type}</span>
                        </div>
                        <span className="font-mono text-white font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Critical Alerts Card */}
              <Card className="border-red-500/40 bg-red-950/15 backdrop-blur-md shadow-2xl">
                <CardHeader className="border-b border-red-500/20 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-red-400 font-bold uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Critical Threats ({criticalCount})
                    </CardTitle>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {events.filter(e => e.severity === "critical").map(event => (
                    <div 
                      key={event.id}
                      className="p-3 bg-black/60 rounded-xl border border-red-500/30 cursor-pointer hover:border-red-400 hover:bg-red-500/10 transition-all"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate">{event.title}</span>
                        <span className="text-[10px] font-mono text-yellow-400 font-bold shrink-0 ml-2">
                          {formatRelativeTime(event.timestamp, nowTime)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Predictive Forecast Card */}
              <Card className="border-cyan-500/30 bg-cyan-950/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="border-b border-cyan-500/20 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      AI Predictive Forecast
                    </CardTitle>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px] font-mono uppercase">
                      {timeRange.toUpperCase()} HORIZON
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-xs">
                  {timeRange === "24h" && (
                    <p className="text-gray-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">Intraday Tactical Alert: </span>
                      Rapid flash-loan probing and frontrunning MEV bot clusters indicate active mempool predation. Liquidity pool depth faces a
                      <span className="text-red-400 font-black font-mono"> 91.4% PROBABILITY </span>
                      of catastrophic zero-liquidity failure within the next 2–6 hours.
                    </p>
                  )}
                  {timeRange === "7d" && (
                    <p className="text-gray-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">Weekly Contagion Outlook: </span>
                      Governance takeover and multi-sig key migrations over the past 5 days correlate with systematic treasury peeling. Models project an
                      <span className="text-red-400 font-black font-mono"> 84.2% PROBABILITY </span>
                      of total unannounced liquidity abandonment and secondary market collapse.
                    </p>
                  )}
                  {timeRange === "30d" && (
                    <p className="text-gray-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">Monthly Lifecycle Assessment: </span>
                      Telemetry demonstrates a classic 30-day pump-and-dump cycle. Euphoric social hype peaked at Day 14 (+520% reach), followed by syndicate supply cornering and peeling chain dispersion once timelocks expired.
                    </p>
                  )}
                  {timeRange === "all" && (
                    <p className="text-gray-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">Macro Ledger Forensics: </span>
                      Protocol exhibited 60+ days of audited stability during genesis incubation before silent proxy bytecode updates and syndicate accumulation in Month 3 triggered terminal liquidation.
                    </p>
                  )}
                  
                  <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 text-[11px] space-y-1">
                    <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                      Recommended Forensic Actions
                    </div>
                    <ul className="text-gray-400 space-y-1 list-disc pl-4">
                      <li>Track destination mule addresses in Graph Explorer</li>
                      <li>Screen funding sources against OFAC sanctions database</li>
                      <li>Issue automated watchlist webhook alerts</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
