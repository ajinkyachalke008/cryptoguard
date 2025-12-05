"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Store,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

// Import risk components
import { MarketplaceRiskPanel, MarketplaceRiskData } from "@/components/risk/MarketplaceRiskPanel"
import { AIRiskExplanation, AIRiskExplanationData } from "@/components/risk/AIRiskExplanation"
import { AskCryptoGuardChat } from "@/components/risk/AskCryptoGuardChat"

// Mock marketplace data
const marketplaces = [
  { name: "OpenSea", url: "https://opensea.io", logo: "🌊" },
  { name: "Blur", url: "https://blur.io", logo: "🟣" },
  { name: "LooksRare", url: "https://looksrare.org", logo: "💎" },
  { name: "X2Y2", url: "https://x2y2.io", logo: "✨" },
  { name: "Magic Eden", url: "https://magiceden.io", logo: "🔮" },
  { name: "Rarible", url: "https://rarible.com", logo: "🎨" },
  { name: "Foundation", url: "https://foundation.app", logo: "🏛️" },
  { name: "SuperRare", url: "https://superrare.com", logo: "💫" }
]

function generateMockMarketplaceData(name: string): MarketplaceRiskData {
  const labels = ["LOW", "MEDIUM", "HIGH"] as const
  const label = labels[Math.floor(Math.random() * 3)]
  const score = label === "HIGH" ? 70 + Math.floor(Math.random() * 25) : label === "MEDIUM" ? 40 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 40)
  
  return {
    marketplace: name,
    marketplace_url: marketplaces.find(m => m.name === name)?.url || `https://${name.toLowerCase()}.io`,
    marketplace_risk_score: score,
    marketplace_risk_label: label,
    marketplace_risk_reasons: label !== "LOW" ? [
      "High percentage of wash trading collections.",
      label === "HIGH" ? "Frequent fake collections imitating blue-chip NFTs." : "Some unverified collections present.",
      label === "HIGH" ? "Multiple fraud incidents reported in past 30 days." : undefined
    ].filter(Boolean) as string[] : [],
    metrics: {
      wash_trading_percentage: label === "HIGH" ? 35 : label === "MEDIUM" ? 18 : 8,
      fake_collection_count: label === "HIGH" ? 156 : label === "MEDIUM" ? 45 : 12,
      fraud_incident_count: label === "HIGH" ? 23 : label === "MEDIUM" ? 8 : 2,
      verified_collection_ratio: label === "HIGH" ? 45 : label === "MEDIUM" ? 68 : 89,
      average_response_time_hours: label === "HIGH" ? 72 : label === "MEDIUM" ? 24 : 6
    },
    recent_incidents: label !== "LOW" ? [
      { date: "2024-11-15", type: "Fake Collection", description: "Fake BAYC collection listed and sold 50 items", affected_users: 50, amount_lost: 125000 },
      { date: "2024-10-28", type: "Wash Trading Ring", description: "Coordinated wash trading ring discovered", affected_users: 0, amount_lost: 0 },
      { date: "2024-10-15", type: "Phishing Attack", description: "Malicious listing redirecting to phishing site", affected_users: 12, amount_lost: 45000 }
    ] : [],
    safety_features: [
      { feature: "Verified Collections", implemented: true },
      { feature: "Royalty Enforcement", implemented: label !== "HIGH" },
      { feature: "Spam Detection", implemented: true },
      { feature: "Price Alerts", implemented: label === "LOW" },
      { feature: "Stolen NFT Detection", implemented: label !== "HIGH" },
      { feature: "2FA Required", implemented: true },
      { feature: "Anti-Phishing Warnings", implemented: label !== "HIGH" },
      { feature: "Collection Verification", implemented: true }
    ]
  }
}

function generateMockAIExplanation(marketplace: string, score: number): AIRiskExplanationData {
  return {
    entity_address: marketplace,
    entity_type: "marketplace",
    risk_score: score,
    short_summary: `${marketplace} has ${score >= 70 ? "high" : score >= 40 ? "moderate" : "low"} marketplace risk. ${score >= 70 ? "Multiple fraud incidents and high wash trading presence." : score >= 40 ? "Some concerns around collection verification." : "Strong safety features and low fraud rates."}`,
    analyst_summary: `Marketplace Risk Assessment for ${marketplace}:\n\n${score >= 70 ? "⚠️ This marketplace has significant fraud concerns including fake collections, wash trading, and slow incident response times. User protection features are incomplete." : score >= 40 ? "This marketplace has moderate risk levels. Collection verification is present but some gaps exist. Response to fraud incidents could be improved." : "This marketplace demonstrates strong security practices with comprehensive collection verification, low fraud rates, and quick incident response."}`,
    risk_factors: score >= 40 ? [
      { factor_type: "WASH_TRADING", severity: score >= 70 ? "HIGH" : "MEDIUM", evidence: [{ type: "pattern", value: "wash_trading", description: "High wash trading percentage detected" }] },
      { factor_type: "SCAM", severity: score >= 70 ? "HIGH" : "LOW", evidence: [{ type: "pattern", value: "fake_collections", description: "Fake collections present on platform" }] }
    ] : [],
    recommendations: [
      score >= 70 ? "Exercise extreme caution when using this marketplace" : "Use standard verification practices",
      "Always verify collection authenticity before purchase",
      "Enable all available security features"
    ],
    generated_at: new Date().toISOString()
  }
}

export default function MarketplaceRiskPage() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null)
  const [customMarketplace, setCustomMarketplace] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  
  // Mock data states
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceRiskData | null>(null)
  const [aiExplanation, setAiExplanation] = useState<AIRiskExplanationData | null>(null)

  const handleScan = async (name: string) => {
    setSelectedMarketplace(name)
    setIsScanning(true)
    setScanComplete(false)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const data = generateMockMarketplaceData(name)
    setMarketplaceData(data)
    setAiExplanation(generateMockAIExplanation(name, data.marketplace_risk_score))
    
    setIsScanning(false)
    setScanComplete(true)
    toast.success(`${name} scan complete`)
  }

  const handleCustomScan = () => {
    if (!customMarketplace.trim()) {
      toast.error("Please enter a marketplace name or URL")
      return
    }
    handleScan(customMarketplace)
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Marketplace Risk Scanner
          </h1>
          <p className="text-gray-400 mt-2">
            Analyze NFT marketplaces for fraud, wash trading, and safety features
          </p>
        </div>

        {/* Popular Marketplaces Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Popular Marketplaces</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {marketplaces.map((mp) => (
              <Button
                key={mp.name}
                variant="outline"
                onClick={() => handleScan(mp.name)}
                disabled={isScanning}
                className={`h-auto py-4 flex flex-col items-center gap-2 border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/10 ${
                  selectedMarketplace === mp.name ? "bg-yellow-500/20 border-yellow-500/60" : ""
                }`}
              >
                <span className="text-2xl">{mp.logo}</span>
                <span className="text-xs text-gray-300">{mp.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Search */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 shadow-[0_0_40px_#ffd70022]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500/70" />
                <Input
                  placeholder="Enter marketplace name or URL"
                  value={customMarketplace}
                  onChange={(e) => setCustomMarketplace(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomScan()}
                  className="pl-10 h-12 bg-black/40 border-yellow-500/30 text-foreground placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/30"
                />
              </div>
              <Button
                onClick={handleCustomScan}
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
                    Scan Marketplace
                  </>
                )}
              </Button>
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
                  <Store className="w-10 h-10 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-yellow-300 font-medium animate-pulse">
                Analyzing {selectedMarketplace}...
              </p>
              <p className="text-sm text-gray-500 mt-2">Checking fraud metrics, safety features, and incident history</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {scanComplete && marketplaceData && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="py-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                      <span className="text-4xl">
                        {marketplaces.find(m => m.name === selectedMarketplace)?.logo || "🏪"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-200">{selectedMarketplace}</h2>
                        {marketplaceData.marketplace_url && (
                          <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 h-6 px-2">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Badge className={`${getRiskBadge(marketplaceData.marketplace_risk_score).color} border px-3 py-1`}>
                        {getRiskBadge(marketplaceData.marketplace_risk_score).label} RISK
                      </Badge>
                    </div>
                  </div>
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
                      <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${marketplaceData.marketplace_risk_score * 3.02} 302`} className={getRiskBadge(marketplaceData.marketplace_risk_score).color.split(" ")[1]} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getRiskBadge(marketplaceData.marketplace_risk_score).color.split(" ")[1]}`}>
                        {marketplaceData.marketplace_risk_score}
                      </span>
                      <span className="text-xs text-gray-500">Risk Score</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
              <MarketplaceRiskPanel data={marketplaceData} />
              <div className="space-y-6">
                {aiExplanation && <AIRiskExplanation data={aiExplanation} />}
                <AskCryptoGuardChat initialContext={{ wallet: selectedMarketplace || undefined }} />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!scanComplete && !isScanning && (
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Store className="w-10 h-10 text-yellow-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a marketplace to analyze</h3>
              <p className="text-gray-500 max-w-md">
                Choose from popular marketplaces above or enter a custom marketplace to check for
                fraud metrics, safety features, and incident history.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}
