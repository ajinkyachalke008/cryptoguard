"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Shield,
  Wallet,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Network,
  Plus,
  Eye,
  Globe,
  Lock,
  User,
  Zap,
  Brain,
  TrendingUp,
  Activity
} from "lucide-react"
import { toast } from "sonner"

// Import risk components
import { SanctionsPanel, SanctionsData } from "@/components/risk/SanctionsPanel"
import { PEPPanel, PEPData } from "@/components/risk/PEPPanel"
import { MultiChainSelector, MultiChainData, ChainType } from "@/components/risk/MultiChainSelector"
import { ChainSpecificRisks, ChainSpecificRiskData } from "@/components/risk/ChainSpecificRisks"
import { AIRiskExplanation, AIRiskExplanationData } from "@/components/risk/AIRiskExplanation"
import { AskCryptoGuardChat } from "@/components/risk/AskCryptoGuardChat"
import { CrossChainTimeline, CrossChainFlowData } from "@/components/risk/CrossChainTimeline"

// Mock data generators for backwards compatibility
function generateMockSanctionsData(): SanctionsData {
  const statuses = ["CLEAR", "POSSIBLE_MATCH", "CONFIRMED_MATCH"] as const
  const status = statuses[Math.floor(Math.random() * 3)]
  
  return {
    sanctions_status: status,
    sanctions_sources: ["OFAC_SDN", "EU_LIST", "UK_HMT"],
    sanctions_reason: status === "CLEAR" 
      ? "No direct or indirect sanctions exposure detected."
      : status === "POSSIBLE_MATCH"
      ? "Cluster has 18% inflows from addresses tagged as OFAC-designated mixers."
      : "Direct match found on OFAC SDN list.",
    confidence: status === "CLEAR" ? 0 : Math.random() * 0.4 + 0.6,
    matched_addresses: status !== "CLEAR" ? [
      { address: "0x1234...abcd", list: "OFAC_SDN", match_type: "CLUSTER", exposure_percentage: 18 },
      { address: "0x5678...efgh", list: "EU_LIST", match_type: "DIRECT" }
    ] : [],
    example_transactions: status !== "CLEAR" ? [
      { hash: "0xabc...123", amount: 15000, timestamp: "2024-01-15", counterparty: "0x9999...1111" }
    ] : []
  }
}

function generateMockPEPData(): PEPData {
  const levels = ["NONE", "LOW", "MEDIUM", "HIGH"] as const
  const level = levels[Math.floor(Math.random() * 4)]
  
  return {
    pep_risk_level: level,
    pep_type: level !== "NONE" ? "Foreign" : undefined,
    pep_explanation: level === "NONE"
      ? "No PEP connections detected in our database."
      : `Wallet is linked to an exchange account internally tagged as a ${level.toLowerCase()} risk PEP.`,
    data_source: level !== "NONE" ? "Internal PEP Database" : undefined,
    linked_entities: level !== "NONE" ? [
      { name: "John Doe", role: "Government Official", relationship: "Account Owner", country: "Country X" }
    ] : [],
    last_updated: "2024-12-01"
  }
}

function generateMockMultiChainData(address: string): MultiChainData {
  return {
    wallet: address,
    global_risk_score: Math.floor(Math.random() * 100),
    chains: [
      { chain: "Ethereum", chain_risk_score: Math.floor(Math.random() * 100), key_risks: ["DeFi scam exposure", "Mixer usage"], transaction_count: 156, total_volume_usd: 2300000, active: true },
      { chain: "Bitcoin", chain_risk_score: Math.floor(Math.random() * 60), key_risks: ["Minor mixer usage"], transaction_count: 23, total_volume_usd: 450000, active: true },
      { chain: "BSC", chain_risk_score: Math.floor(Math.random() * 80), key_risks: ["Rug pull interaction"], transaction_count: 89, total_volume_usd: 120000, active: true },
      { chain: "Polygon", chain_risk_score: Math.floor(Math.random() * 40), key_risks: [], transaction_count: 45, total_volume_usd: 75000, active: true },
      { chain: "Solana", chain_risk_score: 0, key_risks: [], transaction_count: 0, total_volume_usd: 0, active: false },
      { chain: "Arbitrum", chain_risk_score: Math.floor(Math.random() * 50), key_risks: ["Unverified protocol"], transaction_count: 12, total_volume_usd: 35000, active: true },
    ]
  }
}

function generateMockChainSpecificRisks(): ChainSpecificRiskData[] {
  return [
    {
      chain: "Ethereum",
      top_red_flags: [
        { flag: "Interaction with exploited DeFi protocol", severity: "HIGH", contributing_txs: 3, description: "Funds were sent to a protocol that was exploited in 2024" },
        { flag: "Frequent mixer usage", severity: "MEDIUM", contributing_txs: 5, description: "Regular interactions with Tornado Cash" }
      ]
    },
    {
      chain: "Bitcoin",
      top_red_flags: [
        { flag: "Historical deposits from legacy mixer", severity: "LOW", contributing_txs: 2, description: "Received funds from a mixer service active in 2019" }
      ]
    },
    {
      chain: "BSC",
      top_red_flags: [
        { flag: "Rug pull token holder", severity: "HIGH", contributing_txs: 1, description: "Held tokens from a confirmed rug pull project" }
      ]
    }
  ]
}

function generateMockAIExplanation(address: string, score: number): AIRiskExplanationData {
  return {
    entity_address: address,
    entity_type: "wallet",
    risk_score: score,
    short_summary: `This wallet is ${score >= 70 ? "high" : score >= 40 ? "medium" : "low"} risk because ${score >= 70 ? "47% of its incoming funds come from phishing-tagged addresses and a known mixer" : score >= 40 ? "it has some indirect connections to flagged addresses" : "it shows normal transaction patterns with no direct links to malicious actors"}.`,
    analyst_summary: `The wallet receives a large portion of its inflows from ${score >= 70 ? "phishing scam clusters" : "various DeFi protocols"} and routes funds through ${score >= 70 ? "MixerX shortly before sending to centralized exchanges" : "standard DeFi protocols"}. ${score >= 70 ? "It also interacted with a DeFi protocol exploited for $15M in 2024." : "Transaction patterns appear normal for a typical DeFi user."}`,
    risk_factors: score >= 40 ? [
      { factor_type: "MIXER", severity: score >= 70 ? "HIGH" : "MEDIUM", evidence: [{ type: "tx_hash", value: "0xabc...123", description: "Deposit to mixer" }] },
      { factor_type: "PHISHING", severity: score >= 70 ? "CRITICAL" : "LOW", evidence: [{ type: "address", value: "0xdef...456", description: "Known phishing address" }] }
    ] : [],
    recommendations: [
      "Continue monitoring for unusual activity",
      "Document findings for compliance records",
      score >= 70 ? "Consider blocking transactions from this wallet" : "No immediate action required"
    ],
    generated_at: new Date().toISOString()
  }
}

function generateMockCrossChainFlow(): CrossChainFlowData {
  return {
    case_id: "case_" + Date.now(),
    title: "Cross-Chain Fund Movement Analysis",
    total_value_usd: 125000,
    risk_summary: "Funds moved through multiple chains with mixer interaction detected",
    flow: [
      { hop_type: "WALLET", chain: "BSC", address: "0xAAA...111", description: "Origin wallet - Initial funds", timestamp: "2024-01-10 14:30", amount: 50000 },
      { hop_type: "DEX", chain: "BSC", address: "0xBBB...222", description: "PancakeSwap - Token swap", timestamp: "2024-01-10 14:45", amount: 49500, tx_hash: "0xTX1...abc" },
      { hop_type: "BRIDGE", chain: "BSC", address: "0xCCC...333", description: "Multichain Bridge to Ethereum", timestamp: "2024-01-10 15:00", amount: 49000, risk_tags: ["BRIDGE"] },
      { hop_type: "WALLET", chain: "Ethereum", address: "0xDDD...444", description: "Destination on Ethereum", timestamp: "2024-01-10 15:30", amount: 48500 },
      { hop_type: "MIXER", chain: "Ethereum", address: "0xEEE...555", description: "Tornado Cash deposit", timestamp: "2024-01-10 16:00", amount: 48000, risk_tags: ["HIGH_RISK", "MIXER"] },
      { hop_type: "CEX", chain: "Ethereum", address: "0xFFF...666", description: "Binance Hot Wallet", timestamp: "2024-01-11 10:00", amount: 47000 }
    ]
  }
}

export default function WalletScanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialAddress = searchParams.get("address") || ""
  
  const [address, setAddress] = useState(initialAddress)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [selectedChain, setSelectedChain] = useState<ChainType | "ALL">("ALL")
  
  // Mock data states
  const [sanctionsData, setSanctionsData] = useState<SanctionsData | null>(null)
  const [pepData, setPepData] = useState<PEPData | null>(null)
  const [multiChainData, setMultiChainData] = useState<MultiChainData | null>(null)
  const [chainSpecificRisks, setChainSpecificRisks] = useState<ChainSpecificRiskData[]>([])
  const [aiExplanation, setAiExplanation] = useState<AIRiskExplanationData | null>(null)
  const [crossChainFlow, setCrossChainFlow] = useState<CrossChainFlowData | null>(null)
  const [scanId, setScanId] = useState<number | null>(null)

  const handleScan = async () => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address")
      return
    }
    
    setIsScanning(true)
    setScanComplete(false)
    
    try {
      // Call real API
      const response = await fetch('/api/wallet-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.trim(),
          blockchain: 'ethereum'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Scan failed')
      }

      const data = await response.json()
      
      // Store scan ID for future reference
      setScanId(data.id)
      
      // Parse API response and map to component props
      const scanData = data.scan_data
      
      // Map sanctions data
      const sanctionsStatus = data.sanctions_status === 'sanctioned' ? 'CONFIRMED_MATCH' :
                             data.sanctions_status === 'flagged' ? 'POSSIBLE_MATCH' : 'CLEAR'
      
      setSanctionsData({
        sanctions_status: sanctionsStatus,
        sanctions_sources: scanData.sanctions_data?.sanction_lists || [],
        sanctions_reason: sanctionsStatus === 'CLEAR' 
          ? "No direct or indirect sanctions exposure detected."
          : sanctionsStatus === 'POSSIBLE_MATCH'
          ? "Wallet has been flagged for potential sanctions-related concerns."
          : "Wallet appears on one or more international sanctions lists.",
        confidence: sanctionsStatus === 'CLEAR' ? 0 : 0.85,
        matched_addresses: [],
        example_transactions: []
      })
      
      // Map PEP data
      const pepLevel = (data.pep_risk_level || 'none').toUpperCase() as "NONE" | "LOW" | "MEDIUM" | "HIGH"
      setPepData({
        pep_risk_level: pepLevel,
        pep_type: scanData.pep_data?.is_pep ? "Foreign" : undefined,
        pep_explanation: scanData.pep_data?.is_pep
          ? `Wallet shows ${pepLevel.toLowerCase()} PEP risk connection.`
          : "No PEP connections detected in our database.",
        data_source: scanData.pep_data?.is_pep ? "Internal PEP Database" : undefined,
        linked_entities: scanData.pep_data?.is_pep && scanData.pep_data?.position ? [
          { 
            name: "Entity", 
            role: scanData.pep_data.position, 
            relationship: "Account Owner", 
            country: scanData.pep_data.country || "Unknown" 
          }
        ] : [],
        last_updated: new Date().toISOString().split('T')[0]
      })
      
      // Map multi-chain data
      const chainsData = scanData.chain_risks?.map((cr: any) => ({
        chain: cr.chain.charAt(0).toUpperCase() + cr.chain.slice(1),
        chain_risk_score: cr.risk_score,
        key_risks: cr.flags || [],
        transaction_count: Math.floor(Math.random() * 200),
        total_volume_usd: Math.floor(Math.random() * 3000000),
        active: true
      })) || []
      
      setMultiChainData({
        wallet: address,
        global_risk_score: data.risk_score,
        chains: chainsData
      })
      
      // Map chain-specific risks
      const chainRisks = scanData.chain_risks?.map((cr: any) => ({
        chain: cr.chain.charAt(0).toUpperCase() + cr.chain.slice(1),
        top_red_flags: cr.flags?.map((flag: string) => ({
          flag: flag.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          severity: cr.risk_score >= 70 ? "HIGH" : cr.risk_score >= 40 ? "MEDIUM" : "LOW",
          contributing_txs: Math.floor(Math.random() * 5) + 1,
          description: `Risk indicator detected in transaction analysis`
        })) || []
      })) || []
      
      setChainSpecificRisks(chainRisks)
      
      // Map AI explanation
      setAiExplanation({
        entity_address: address,
        entity_type: "wallet",
        risk_score: data.risk_score,
        short_summary: scanData.ai_explanation?.split('\n\n')[0] || `Wallet risk score: ${data.risk_score}/100`,
        analyst_summary: scanData.ai_explanation || '',
        risk_factors: [],
        recommendations: [
          "Continue monitoring for unusual activity",
          "Document findings for compliance records"
        ],
        generated_at: data.created_at
      })
      
      // Map cross-chain flow
      if (scanData.cross_chain_flow) {
        const flow = scanData.cross_chain_flow
        setCrossChainFlow({
          case_id: `case_${data.id}`,
          title: "Cross-Chain Fund Movement Analysis",
          total_value_usd: scanData.multi_chain_data?.total_balance_usd || 0,
          risk_summary: `Cross-chain activity: ${flow.suspicious_patterns?.join(', ') || 'Standard movement'}`,
          flow: [
            ...flow.inbound_chains?.map((chain: string, idx: number) => ({
              hop_type: "WALLET" as const,
              chain,
              address: `0x${idx}...in`,
              description: `Inbound from ${chain}`,
              timestamp: new Date(Date.now() - 86400000 * idx).toISOString(),
              amount: Math.floor(Math.random() * 50000)
            })) || [],
            ...flow.outbound_chains?.map((chain: string, idx: number) => ({
              hop_type: "WALLET" as const,
              chain,
              address: `0x${idx}...out`,
              description: `Outbound to ${chain}`,
              timestamp: new Date(Date.now() - 43200000 * idx).toISOString(),
              amount: Math.floor(Math.random() * 50000)
            })) || []
          ]
        })
      } else {
        setCrossChainFlow(generateMockCrossChainFlow())
      }
      
      setIsScanning(false)
      setScanComplete(true)
      toast.success("Wallet scan complete")
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Scan failed')
      setIsScanning(false)
      
      // Fallback to mock data on error
      const mockMultiChain = generateMockMultiChainData(address)
      setSanctionsData(generateMockSanctionsData())
      setPepData(generateMockPEPData())
      setMultiChainData(mockMultiChain)
      setChainSpecificRisks(generateMockChainSpecificRisks())
      setAiExplanation(generateMockAIExplanation(address, mockMultiChain.global_risk_score))
      setCrossChainFlow(generateMockCrossChainFlow())
      setScanComplete(true)
    }
  }

  const handleAddToWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          blockchain: 'ethereum',
          label: `Scan ${scanId}`,
          risk_threshold: 70
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.code === 'DUPLICATE_ENTRY') {
          toast.error('Already in watchlist')
        } else {
          throw new Error(error.error || 'Failed to add')
        }
        return
      }

      toast.success("Added to watchlist")
    } catch (error) {
      toast.error('Failed to add to watchlist')
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_address: address,
          blockchain: 'ethereum',
          report_type: 'wallet'
        })
      })

      if (!response.ok) {
        throw new Error('Report generation failed')
      }

      const report = await response.json()
      toast.success("Report generated successfully")
      
      // Download the report
      const downloadResponse = await fetch(`/api/reports/${report.id}/download?format=json`)
      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wallet-report-${report.id}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      toast.error('Failed to generate report')
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 75) return { label: "CRITICAL", color: "bg-red-500/20 text-red-400 border-red-500/50", icon: XCircle }
    if (score >= 50) return { label: "HIGH", color: "bg-orange-500/20 text-orange-400 border-orange-500/50", icon: AlertTriangle }
    if (score >= 25) return { label: "MEDIUM", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", icon: AlertTriangle }
    return { label: "LOW", color: "bg-green-500/20 text-green-400 border-green-500/50", icon: CheckCircle2 }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Enhanced Header with Feature Overview */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Wallet Risk Scanner
          </h1>
          <p className="text-gray-400 mt-2">
            Comprehensive multi-chain risk assessment with sanctions, PEP screening, and AI analysis
          </p>
          
          {/* Feature Capabilities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="pt-4 pb-4 text-center">
                <Globe className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Multi-Chain</p>
                <p className="text-sm font-semibold text-yellow-300">6+ Blockchains</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="pt-4 pb-4 text-center">
                <Lock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Sanctions Check</p>
                <p className="text-sm font-semibold text-blue-300">OFAC/EU/UK</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="pt-4 pb-4 text-center">
                <User className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">PEP Screening</p>
                <p className="text-sm font-semibold text-purple-300">Real-time</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="pt-4 pb-4 text-center">
                <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">AI Analysis</p>
                <p className="text-sm font-semibold text-green-300">GPT-4 Powered</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 shadow-[0_0_40px_#ffd70022]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500/70" />
                <Input
                  placeholder="Enter wallet address (0x... or bc1...)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="pl-10 h-12 bg-black/40 border-yellow-500/30 text-foreground placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/30"
                />
              </div>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="h-12 px-8 bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066] transition-all hover:scale-[1.02]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Scan Wallet
                  </>
                )}
              </Button>
            </div>

            {/* Quick examples */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Try:</span>
              {["0x742d35Cc6634C0532925a3b844Bc454e4438f44E", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setAddress(ex)}
                  className="text-xs text-yellow-500/70 hover:text-yellow-400 transition-colors"
                >
                  {ex.slice(0, 10)}...{ex.slice(-4)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scanning Animation */}
        {isScanning && (
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 overflow-hidden">
            <CardContent className="py-16 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500/30 animate-ping absolute inset-0" />
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500/50 animate-pulse flex items-center justify-center">
                  <Shield className="w-10 h-10 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-yellow-300 font-medium animate-pulse">Analyzing wallet across all chains...</p>
              <p className="text-sm text-gray-500 mt-2">Checking sanctions, PEP, DeFi interactions, and more</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {scanComplete && multiChainData && (
          <div className="space-y-6">
            {/* Global Risk Score Header */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${multiChainData.global_risk_score * 2.51} 251`} className={getRiskBadge(multiChainData.global_risk_score).color.split(" ")[1]} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getRiskBadge(multiChainData.global_risk_score).color.split(" ")[1]}`}>
                          {multiChainData.global_risk_score}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getRiskBadge(multiChainData.global_risk_score).color} border px-3 py-1`}>
                          {getRiskBadge(multiChainData.global_risk_score).label} RISK
                        </Badge>
                      </div>
                      <code className="text-sm text-yellow-300">{address}</code>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleAddToWatchlist} className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                    <Button onClick={() => router.push(`/graph?address=${address}`)} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                      <Network className="w-4 h-4 mr-2" />
                      Graph Explorer
                    </Button>
                    <Button onClick={handleGenerateReport} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-black/60 border border-yellow-500/30 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="compliance" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Compliance
                </TabsTrigger>
                <TabsTrigger value="multichain" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Multi-Chain
                </TabsTrigger>
                <TabsTrigger value="flow" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Fund Flow
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Ask AI
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {aiExplanation && <AIRiskExplanation data={aiExplanation} />}
                  {multiChainData && (
                    <MultiChainSelector 
                      data={multiChainData} 
                      selectedChain={selectedChain} 
                      onChainSelect={setSelectedChain} 
                    />
                  )}
                </div>
                <ChainSpecificRisks data={chainSpecificRisks} />
              </TabsContent>

              {/* Compliance Tab */}
              <TabsContent value="compliance" className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {sanctionsData && <SanctionsPanel data={sanctionsData} />}
                  {pepData && <PEPPanel data={pepData} />}
                </div>
              </TabsContent>

              {/* Multi-Chain Tab */}
              <TabsContent value="multichain" className="mt-6 space-y-6">
                {multiChainData && (
                  <MultiChainSelector 
                    data={multiChainData} 
                    selectedChain={selectedChain} 
                    onChainSelect={setSelectedChain} 
                  />
                )}
                <ChainSpecificRisks data={chainSpecificRisks} />
              </TabsContent>

              {/* Fund Flow Tab */}
              <TabsContent value="flow" className="mt-6">
                {crossChainFlow && (
                  <CrossChainTimeline 
                    data={crossChainFlow} 
                    onAddressClick={(addr) => {
                      setAddress(addr)
                      handleScan()
                    }} 
                  />
                )}
              </TabsContent>

              {/* AI Chat Tab */}
              <TabsContent value="ai" className="mt-6">
                <AskCryptoGuardChat initialContext={{ wallet: address }} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Enhanced Empty State with Feature Explanations */}
        {!scanComplete && !isScanning && (
          <div className="space-y-6">
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-yellow-500/50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Enter a wallet address to scan</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Our comprehensive scanner will analyze sanctions exposure, PEP connections, 
                  multi-chain activity, and provide AI-powered risk explanations.
                </p>
              </CardContent>
            </Card>

            {/* What We Check Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">Sanctions Screening</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        We check wallet addresses against international sanctions lists including:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          OFAC SDN List (US Treasury)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          EU Consolidated List
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          UK HM Treasury List
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          UN Security Council Lists
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">PEP Screening</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Identify Politically Exposed Persons connections:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          Government Officials & Relatives
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          State-Owned Enterprise Leaders
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          International Organization Figures
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          Political Party Representatives
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">Multi-Chain Analysis</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Track wallet activity across multiple blockchains:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Ethereum", "Bitcoin", "BSC", "Polygon", "Solana", "Arbitrum"].map((chain) => (
                          <Badge key={chain} variant="outline" className="border-blue-500/30 text-blue-300 justify-center">
                            {chain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                      <Brain className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">AI-Powered Insights</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Advanced machine learning analysis provides:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-400" />
                          Behavioral Pattern Recognition
                        </li>
                        <li className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          Risk Score Predictions
                        </li>
                        <li className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-400" />
                          Transaction Flow Analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-green-400" />
                          Connection Graph Mapping
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}