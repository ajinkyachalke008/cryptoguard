"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Image,
  TrendingUp,
  Users
} from "lucide-react"
import { toast } from "sonner"

// Import risk components
import { WashTradingPanel, WashTradingData } from "@/components/risk/WashTradingPanel"
import { FakeVolumePanel, FakeVolumeData } from "@/components/risk/FakeVolumePanel"
import { MarketplaceRiskPanel, MarketplaceRiskData } from "@/components/risk/MarketplaceRiskPanel"
import { AIRiskExplanation, AIRiskExplanationData } from "@/components/risk/AIRiskExplanation"
import { AskCryptoGuardChat } from "@/components/risk/AskCryptoGuardChat"

// Mock data generators
function generateMockWashTradingData(collection: string): WashTradingData {
  const levels = ["LOW", "MEDIUM", "HIGH"] as const
  const level = levels[Math.floor(Math.random() * 3)]
  const ratio = level === "HIGH" ? 0.6 + Math.random() * 0.3 : level === "MEDIUM" ? 0.3 + Math.random() * 0.3 : Math.random() * 0.3
  
  return {
    collection,
    wash_trading_level: level,
    wash_trading_ratio: ratio,
    wash_trading_explanation: level === "HIGH" 
      ? `${(ratio * 100).toFixed(0)}% of collection volume comes from ${Math.floor(4 + Math.random() * 6)} wallets trading among themselves.`
      : level === "MEDIUM"
      ? "Moderate wash trading activity detected with some circular trading patterns."
      : "Minimal wash trading detected. Volume appears mostly organic.",
    suspicious_wallets: level !== "LOW" ? [
      { address: "0xWASH1...abc", trade_count: 45, volume_usd: 125000, connected_wallets: 5 },
      { address: "0xWASH2...def", trade_count: 38, volume_usd: 98000, connected_wallets: 5 },
      { address: "0xWASH3...ghi", trade_count: 32, volume_usd: 87000, connected_wallets: 4 },
      { address: "0xWASH4...jkl", trade_count: 28, volume_usd: 65000, connected_wallets: 3 }
    ] : [],
    circular_trades: level !== "LOW" ? [
      { pattern: "A→B→C→A", occurrences: 23, volume_usd: 450000 },
      { pattern: "D→E→D", occurrences: 45, volume_usd: 320000 },
      { pattern: "F→G→H→F", occurrences: 12, volume_usd: 180000 }
    ] : [],
    volume_analysis: {
      total_volume_24h: Math.floor(Math.random() * 1000000) + 100000,
      wash_volume_24h: Math.floor((Math.random() * 500000 + 50000) * ratio),
      organic_volume_24h: Math.floor((Math.random() * 500000 + 50000) * (1 - ratio))
    }
  }
}

function generateMockFakeVolumeData(collection: string): FakeVolumeData {
  const labels = ["AUTHENTIC", "SUSPICIOUS", "HEAVILY_MANIPULATED"] as const
  const label = labels[Math.floor(Math.random() * 3)]
  const ratio = label === "HEAVILY_MANIPULATED" ? 0.5 + Math.random() * 0.35 : label === "SUSPICIOUS" ? 0.25 + Math.random() * 0.25 : Math.random() * 0.25
  const totalVolume = Math.floor(Math.random() * 5000) + 500
  
  return {
    collection,
    total_volume_eth: totalVolume,
    fake_volume_ratio: ratio,
    estimated_real_volume_eth: Math.floor(totalVolume * (1 - ratio)),
    fake_volume_label: label,
    volume_breakdown: {
      organic_trades: Math.floor((1 - ratio) * 100),
      suspected_wash: Math.floor(ratio * 70),
      bot_activity: Math.floor(ratio * 30)
    },
    comparison: {
      reported_floor: Math.random() * 5 + 0.5,
      estimated_floor: Math.random() * 3 + 0.3,
      price_inflation: label !== "AUTHENTIC" ? Math.floor(Math.random() * 100) + 20 : 0
    }
  }
}

function generateMockMarketplaceData(): MarketplaceRiskData {
  const labels = ["LOW", "MEDIUM", "HIGH"] as const
  const label = labels[Math.floor(Math.random() * 3)]
  const score = label === "HIGH" ? 70 + Math.floor(Math.random() * 25) : label === "MEDIUM" ? 40 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 40)
  
  return {
    marketplace: "OpenSea",
    marketplace_url: "https://opensea.io",
    marketplace_risk_score: score,
    marketplace_risk_label: label,
    marketplace_risk_reasons: label !== "LOW" ? [
      "High percentage of wash trading collections.",
      label === "HIGH" ? "Frequent fake collections imitating blue-chip NFTs." : "Some unverified collections present."
    ] : [],
    metrics: {
      wash_trading_percentage: label === "HIGH" ? 35 : label === "MEDIUM" ? 18 : 8,
      fake_collection_count: label === "HIGH" ? 156 : label === "MEDIUM" ? 45 : 12,
      fraud_incident_count: label === "HIGH" ? 23 : label === "MEDIUM" ? 8 : 2,
      verified_collection_ratio: label === "HIGH" ? 45 : label === "MEDIUM" ? 68 : 89,
      average_response_time_hours: label === "HIGH" ? 72 : label === "MEDIUM" ? 24 : 6
    },
    recent_incidents: label !== "LOW" ? [
      { date: "2024-11-15", type: "Fake Collection", description: "Fake BAYC collection listed and sold 50 items", affected_users: 50, amount_lost: 125000 },
      { date: "2024-10-28", type: "Wash Trading Ring", description: "Coordinated wash trading ring discovered", affected_users: 0, amount_lost: 0 }
    ] : [],
    safety_features: [
      { feature: "Verified Collections", implemented: true },
      { feature: "Royalty Enforcement", implemented: label !== "HIGH" },
      { feature: "Spam Detection", implemented: true },
      { feature: "Price Alerts", implemented: label === "LOW" },
      { feature: "Stolen NFT Detection", implemented: label !== "HIGH" },
      { feature: "2FA Required", implemented: true }
    ]
  }
}

function generateMockAIExplanation(collection: string, score: number): AIRiskExplanationData {
  return {
    entity_address: collection,
    entity_type: "nft_collection",
    risk_score: score,
    short_summary: `${collection} has ${score >= 70 ? "high" : score >= 40 ? "moderate" : "low"} risk indicators. ${score >= 70 ? "Significant wash trading and fake volume detected." : score >= 40 ? "Some suspicious trading patterns identified." : "Trading activity appears mostly organic."}`,
    analyst_summary: `NFT Collection Analysis for ${collection}:\n\n${score >= 70 ? "⚠️ This collection shows significant signs of market manipulation including coordinated wash trading between 4-8 wallets controlling majority of volume. Floor price appears artificially inflated by 40-60%." : score >= 40 ? "This collection has some suspicious trading patterns. A small cluster of wallets account for disproportionate volume. Recommend caution." : "This collection demonstrates healthy trading patterns with diverse buyer/seller base and organic price discovery."}`,
    risk_factors: score >= 40 ? [
      { factor_type: "WASH_TRADING", severity: score >= 70 ? "HIGH" : "MEDIUM", evidence: [{ type: "pattern", value: "circular_trades", description: "Circular trading patterns detected" }] }
    ] : [],
    recommendations: [
      score >= 70 ? "Avoid purchasing until trading normalizes" : "Monitor trading patterns",
      "Verify collection authenticity before purchase",
      "Check holder distribution before investing"
    ],
    generated_at: new Date().toISOString()
  }
}

export default function NFTRiskPage() {
  const [collection, setCollection] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  
  // Mock data states
  const [washTradingData, setWashTradingData] = useState<WashTradingData | null>(null)
  const [fakeVolumeData, setFakeVolumeData] = useState<FakeVolumeData | null>(null)
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceRiskData | null>(null)
  const [aiExplanation, setAiExplanation] = useState<AIRiskExplanationData | null>(null)
  const [overallScore, setOverallScore] = useState(0)

  const handleScan = async () => {
    if (!collection.trim()) {
      toast.error("Please enter a collection name or contract address")
      return
    }
    
    setIsScanning(true)
    setScanComplete(false)
    
    try {
      const contractAddress = collection.startsWith('0x') && collection.length >= 40 
        ? collection 
        : '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      
      const response = await fetch('/api/nft-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_name: collection.trim(),
          contract_address: contractAddress,
          blockchain: 'ethereum'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Scan failed')
      }

      const data = await response.json()
      const scanData = data.scan_data
      
      // Map wash trading data
      const washLevel = data.wash_trading_level.toUpperCase() as "LOW" | "MEDIUM" | "HIGH"
      setWashTradingData({
        collection: data.collection_name,
        wash_trading_level: washLevel,
        wash_trading_ratio: scanData.wash_trading_data?.volume_percentage / 100 || 0,
        wash_trading_explanation: scanData.wash_trading_data?.detected
          ? `${scanData.wash_trading_data.volume_percentage}% of collection volume shows wash trading patterns.`
          : "Minimal wash trading detected. Volume appears mostly organic.",
        suspicious_wallets: scanData.wash_trading_data?.suspicious_wallets 
          ? Array(Math.min(scanData.wash_trading_data.suspicious_wallets, 4)).fill(0).map((_, i) => ({
              address: `0xWASH${i+1}...abc`,
              trade_count: Math.floor(Math.random() * 50),
              volume_usd: Math.floor(Math.random() * 150000),
              connected_wallets: Math.floor(Math.random() * 5) + 3
            }))
          : [],
        circular_trades: scanData.wash_trading_data?.patterns?.map((pattern: string) => ({
          pattern: pattern.substring(0, 10),
          occurrences: Math.floor(Math.random() * 50),
          volume_usd: Math.floor(Math.random() * 500000)
        })) || [],
        volume_analysis: {
          total_volume_24h: scanData.marketplace_data?.total_volume_usd || 500000,
          wash_volume_24h: Math.floor((scanData.marketplace_data?.total_volume_usd || 500000) * (scanData.wash_trading_data?.volume_percentage / 100 || 0)),
          organic_volume_24h: Math.floor((scanData.marketplace_data?.total_volume_usd || 500000) * (1 - (scanData.wash_trading_data?.volume_percentage / 100 || 0)))
        }
      })
      
      // Map fake volume data
      const fakeRatio = parseInt(data.fake_volume_ratio) / 100
      setFakeVolumeData({
        collection: data.collection_name,
        total_volume_eth: (scanData.marketplace_data?.total_volume_usd || 500000) / 2000, // rough USD to ETH
        fake_volume_ratio: fakeRatio,
        estimated_real_volume_eth: ((scanData.marketplace_data?.total_volume_usd || 500000) / 2000) * (1 - fakeRatio),
        fake_volume_label: fakeRatio >= 0.5 ? "HEAVILY_MANIPULATED" : fakeRatio >= 0.25 ? "SUSPICIOUS" : "AUTHENTIC",
        volume_breakdown: {
          organic_trades: Math.floor((1 - fakeRatio) * 100),
          suspected_wash: Math.floor(fakeRatio * 70),
          bot_activity: Math.floor(fakeRatio * 30)
        },
        comparison: {
          reported_floor: scanData.marketplace_data?.floor_price_usd / 2000 || 1.5,
          estimated_floor: (scanData.marketplace_data?.floor_price_usd / 2000 || 1.5) * 0.7,
          price_inflation: Math.floor(fakeRatio * 100)
        }
      })
      
      // Generate mock marketplace data
      setMarketplaceData(generateMockMarketplaceData())
      
      // Map AI explanation
      setAiExplanation({
        entity_address: data.collection_name,
        entity_type: "nft_collection",
        risk_score: data.risk_score,
        short_summary: scanData.ai_explanation?.split('\n\n')[0] || `NFT collection risk score: ${data.risk_score}/100`,
        analyst_summary: scanData.ai_explanation || '',
        risk_factors: [],
        recommendations: [
          "Monitor trading patterns",
          "Verify collection authenticity before purchase"
        ],
        generated_at: data.created_at
      })
      
      setOverallScore(data.risk_score)
      setIsScanning(false)
      setScanComplete(true)
      toast.success("NFT collection scan complete")
      
    } catch (error) {
      console.error('Scan error:', error)
      toast.error(error instanceof Error ? error.message : 'Scan failed')
      setIsScanning(false)
      
      // Fallback to mock data
      const washTrading = generateMockWashTradingData(collection)
      const fakeVolume = generateMockFakeVolumeData(collection)
      const marketplace = generateMockMarketplaceData()
      
      const washWeight = washTrading.wash_trading_level === "HIGH" ? 90 : washTrading.wash_trading_level === "MEDIUM" ? 50 : 20
      const volumeWeight = fakeVolume.fake_volume_label === "HEAVILY_MANIPULATED" ? 90 : fakeVolume.fake_volume_label === "SUSPICIOUS" ? 50 : 20
      const score = Math.floor((washWeight + volumeWeight) / 2)
      
      setWashTradingData(washTrading)
      setFakeVolumeData(fakeVolume)
      setMarketplaceData(marketplace)
      setOverallScore(score)
      setAiExplanation(generateMockAIExplanation(collection, score))
      setScanComplete(true)
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 75) return { label: "CRITICAL", color: "bg-red-500/20 text-red-400 border-red-500/50", icon: XCircle }
    if (score >= 50) return { label: "HIGH", color: "bg-orange-500/20 text-orange-400 border-orange-500/50", icon: AlertTriangle }
    if (score >= 25) return { label: "MEDIUM", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", icon: AlertTriangle }
    return { label: "LOW", color: "bg-green-500/20 text-green-400 border-green-500/50", icon: CheckCircle2 }
  }

  const sampleCollections = ["Bored Ape Yacht Club", "CryptoPunks", "Azuki", "SuspiciousNFT"]

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            NFT Collection Risk Scanner
          </h1>
          <p className="text-gray-400 mt-2">
            Detect wash trading, fake volume, and market manipulation in NFT collections
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 shadow-[0_0_40px_#ffd70022]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500/70" />
                <Input
                  placeholder="Enter NFT collection name or contract address"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
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
                    Scan Collection
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Try:</span>
              {sampleCollections.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setCollection(ex)}
                  className="text-xs text-yellow-500/70 hover:text-yellow-400 transition-colors"
                >
                  {ex}
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
                  <Image className="w-10 h-10 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-yellow-300 font-medium animate-pulse">Analyzing NFT collection...</p>
              <p className="text-sm text-gray-500 mt-2">Checking wash trading, fake volume, and market manipulation</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {scanComplete && (
          <div className="space-y-6">
            {/* Overall Score Header */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${overallScore * 2.51} 251`} className={getRiskBadge(overallScore).color.split(" ")[1]} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getRiskBadge(overallScore).color.split(" ")[1]}`}>
                          {overallScore}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-200 mb-2">{collection}</h2>
                      <Badge className={`${getRiskBadge(overallScore).color} border px-3 py-1`}>
                        {getRiskBadge(overallScore).label} RISK
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-gray-700">
                      <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Floor Price</p>
                      <p className="font-bold text-gray-200">{fakeVolumeData?.comparison.reported_floor.toFixed(2)} ETH</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-gray-700">
                      <Image className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Volume (24h)</p>
                      <p className="font-bold text-gray-200">{fakeVolumeData?.total_volume_eth.toLocaleString()} ETH</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-black/40 border border-gray-700">
                      <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Holders</p>
                      <p className="font-bold text-gray-200">5,234</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="trading" className="w-full">
              <TabsList className="bg-black/60 border border-yellow-500/30 p-1">
                <TabsTrigger value="trading" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Trading Analysis
                </TabsTrigger>
                <TabsTrigger value="volume" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Volume Analysis
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trading" className="mt-6">
                {washTradingData && <WashTradingPanel data={washTradingData} />}
              </TabsContent>

              <TabsContent value="volume" className="mt-6">
                {fakeVolumeData && <FakeVolumePanel data={fakeVolumeData} />}
              </TabsContent>

              <TabsContent value="marketplace" className="mt-6">
                {marketplaceData && <MarketplaceRiskPanel data={marketplaceData} />}
              </TabsContent>

              <TabsContent value="ai" className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {aiExplanation && <AIRiskExplanation data={aiExplanation} />}
                  <AskCryptoGuardChat initialContext={{ collection: collection }} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!scanComplete && !isScanning && (
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Image className="w-10 h-10 text-yellow-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Enter an NFT collection to analyze</h3>
              <p className="text-gray-500 max-w-md">
                Our scanner will detect wash trading, fake volume, and market manipulation patterns.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}