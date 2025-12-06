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

export default function MarketplaceRiskPage() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null)
  const [customMarketplace, setCustomMarketplace] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceRiskData | null>(null)
  const [aiExplanation, setAiExplanation] = useState<AIRiskExplanationData | null>(null)

  const handleScan = async (name: string) => {
    setSelectedMarketplace(name)
    setIsScanning(true)
    setScanComplete(false)
    
    try {
      // Call API to scan marketplace
      const response = await fetch("/api/marketplace-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace_name: name })
      })

      if (!response.ok) {
        throw new Error("Failed to scan marketplace")
      }

      const result = await response.json()
      
      // Fetch the scan result
      const scanRes = await fetch(`/api/marketplace-scan/${result.id}`)
      if (!scanRes.ok) {
        throw new Error("Failed to fetch scan results")
      }

      const scanData = await scanRes.json()
      setMarketplaceData(scanData.marketplace_risk)
      setAiExplanation(scanData.ai_explanation)
      
      setScanComplete(true)
      toast.success(`${name} scan complete`)
    } catch (error) {
      console.error("Scan error:", error)
      toast.error("Failed to scan marketplace")
      setIsScanning(false)
    } finally {
      setIsScanning(false)
    }
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