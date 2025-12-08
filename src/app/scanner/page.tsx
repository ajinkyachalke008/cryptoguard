"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Eye,
  Plus,
  Download,
  Network,
  Clock,
  ArrowRightLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Link2,
  AlertOctagon,
  Loader2,
  Copy,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

type RiskLevel = "low" | "medium" | "high" | "critical"

interface WalletScanResult {
  id: string
  wallet_address: string
  chain: string
  risk_score: number
  risk_level: RiskLevel
  tags: string[]
  ai_explanation: string
  rule_based_flags: string[]
  confidence: number
  created_at: string
}

const riskColors = {
  low: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400", glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]" },
  medium: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400", glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]" },
  high: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400", glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]" },
  critical: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400", glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]" }
}

const riskIcons = {
  low: CheckCircle2,
  medium: AlertTriangle,
  high: AlertOctagon,
  critical: XCircle
}

export default function ScannerPage() {
  const router = useRouter()
  const { token, isAuthenticated } = useAuth()
  const [address, setAddress] = useState("")
  const [chain, setChain] = useState("eth")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<WalletScanResult | null>(null)

  const handleScan = async () => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address")
      return
    }

    if (!isAuthenticated) {
      toast.error("Please login to scan wallets")
      router.push("/login")
      return
    }
    
    setIsScanning(true)
    setResult(null)
    
    try {
      const res = await fetch("/api/scan/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          walletAddress: address,
          chain: chain
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to scan wallet")
      }

      setResult(data.scan)
      toast.success("Wallet scan complete")
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsScanning(false)
    }
  }

  const handleAddToWatchlist = () => {
    toast.success("Wallet added to watchlist")
    router.push("/watchlist")
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(result?.wallet_address || address)
    toast.success("Address copied to clipboard")
  }

  const RiskIcon = result ? riskIcons[result.risk_level] : Shield

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Wallet Scanner
          </h1>
          <p className="text-gray-400 mt-2">Analyze any crypto wallet for risk assessment and fraud detection</p>
        </div>

        {/* Search Section */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8 shadow-[0_0_40px_#ffd70022]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500/70" />
                <Input
                  placeholder="Enter wallet address (e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f...)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="pl-10 h-12 bg-black/40 border-yellow-500/30 text-foreground placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/30"
                />
              </div>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="h-12 px-4 rounded-md bg-black/40 border border-yellow-500/30 text-foreground focus:border-yellow-500 focus:ring-yellow-500/30"
              >
                <option value="eth">Ethereum</option>
                <option value="bsc">BSC</option>
                <option value="polygon">Polygon</option>
                <option value="avalanche">Avalanche</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
              </select>
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
              {["0x742d35Cc6634C0532925a3b844Bc454e4438f44E", "0xdAC17F958D2ee523a2206206994597C13D831ec7"].map((ex) => (
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
              <p className="mt-6 text-yellow-300 font-medium animate-pulse">Analyzing wallet...</p>
              <p className="text-sm text-gray-500 mt-2">Checking transaction history, connections, and risk patterns</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !isScanning && (
          <div className="space-y-6">
            {/* Risk Score Card */}
            <Card className={`border-2 ${riskColors[result.risk_level].border} bg-black/60 backdrop-blur-sm ${riskColors[result.risk_level].glow}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Score Circle */}
                  <div className="flex flex-col items-center justify-center">
                    <div className={`relative w-40 h-40 rounded-full ${riskColors[result.risk_level].bg} flex items-center justify-center`}>
                      <div className="absolute inset-2 rounded-full bg-black/80 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${riskColors[result.risk_level].text}`}>
                          {result.risk_score}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Risk Score</span>
                      </div>
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="74"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={`${result.risk_score * 4.65} 465`}
                          className={riskColors[result.risk_level].text}
                        />
                      </svg>
                    </div>
                    <Badge className={`mt-4 ${riskColors[result.risk_level].bg} ${riskColors[result.risk_level].text} ${riskColors[result.risk_level].border} text-sm px-4 py-1`}>
                      <RiskIcon className="w-4 h-4 mr-1" />
                      {result.risk_level.toUpperCase()} RISK
                    </Badge>
                    <div className="mt-2 text-xs text-gray-500">
                      Confidence: {result.confidence}%
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <code className="text-sm text-yellow-300 bg-black/50 px-3 py-1.5 rounded-lg border border-yellow-500/30">
                        {result.wallet_address}
                      </code>
                      <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="text-gray-400 hover:text-yellow-300">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-gray-300 mb-6">{result.ai_explanation}</p>

                    {/* Tags */}
                    {result.tags.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-400 mb-2">Risk Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="border-yellow-500/30 text-yellow-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleAddToWatchlist} className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Watchlist
                      </Button>
                      <Button onClick={() => router.push(`/graph?address=${result.wallet_address}`)} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                        <Network className="w-4 h-4 mr-2" />
                        Open Graph Explorer
                      </Button>
                      <Button onClick={() => router.push(`/reports?address=${result.wallet_address}`)} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rule-Based Flags */}
            {result.rule_based_flags.length > 0 && (
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-300 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Detection Rules Triggered
                  </CardTitle>
                  <CardDescription className="text-gray-400">Automated risk detection flags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.rule_based_flags.map((flag, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border border-yellow-500/20 bg-black/40">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                        <span className="text-sm text-gray-300">{flag}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !isScanning && (
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-yellow-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Enter a wallet address to scan</h3>
              <p className="text-gray-500 max-w-md">
                Our AI-powered scanner will analyze transaction history, detect connections to malicious wallets, 
                and provide a comprehensive risk assessment.
              </p>
              {!isAuthenticated && (
                <Button
                  onClick={() => router.push("/login")}
                  className="mt-4 bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Login to Start Scanning
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}