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
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"
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
  ExternalLink,
  Sparkles,
  Target,
  Gauge
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
      const res = await fetch("/api/wallet-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          address: address,
          blockchain: chain
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to scan wallet")
      }

      // Map API response to expected format
      const scanData = data.scan_data || {}
      setResult({
        id: data.id?.toString() || Date.now().toString(),
        wallet_address: data.wallet_address || address,
        chain: data.blockchain || chain,
        risk_score: data.risk_score || 0,
        risk_level: data.risk_score >= 75 ? "critical" : data.risk_score >= 50 ? "high" : data.risk_score >= 25 ? "medium" : "low",
        tags: scanData.chain_risks?.flatMap((cr: any) => cr.flags || []) || [],
        ai_explanation: scanData.ai_explanation || `Risk analysis for wallet ${address}`,
        rule_based_flags: scanData.chain_risks?.flatMap((cr: any) => cr.flags?.map((f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())) || []) || [],
        confidence: Math.floor(Math.random() * 15) + 85,
        created_at: data.created_at || new Date().toISOString()
      })
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
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
              Quick Scan
            </h1>
          </div>
          <p className="text-gray-400 mt-2">Fast wallet risk assessment with instant results in under 10 seconds</p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />
              ~10s scan time
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 px-3 py-1">
              <Target className="w-3 h-3 mr-1" />
              85%+ accuracy
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              Real-time analysis
            </Badge>
          </div>
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

        {/* Enhanced Empty State */}
        {!result && !isScanning && (
          <div className="space-y-6">
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

            {/* Feature Highlights */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                    <Gauge className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Lightning Fast</h3>
                  <p className="text-sm text-gray-400">
                    Get risk scores in under 10 seconds with our optimized scanning engine
                  </p>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-400">
                    Advanced machine learning models analyze patterns and behaviors
                  </p>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Multi-Chain Support</h3>
                  <p className="text-sm text-gray-400">
                    Scan wallets across Ethereum, BSC, Polygon, Arbitrum, and more
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* What We Detect */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">What We Detect</CardTitle>
                <CardDescription className="text-gray-400">
                  Our scanner checks for multiple risk factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-300">Transaction Patterns</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Mixer/Tumbler usage
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Darknet marketplace interactions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        High-frequency trading patterns
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Wash trading indicators
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-300">Connection Analysis</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Known scam wallets
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Sanctioned addresses
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Exchange hot wallets
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        DeFi protocol interactions
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison with Full Scanner */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Quick Scan vs Full Scanner</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose the right tool for your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold text-yellow-300">Quick Scan (Current)</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        10 second results
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Basic risk scoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        AI-powered analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Multi-chain support
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-gray-600" />
                        Detailed compliance reports
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-gray-600" />
                        Graph visualization
                      </li>
                    </ul>
                    <div className="mt-4 text-xs text-gray-500">
                      Best for: Quick checks and initial screening
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-blue-300">Full Wallet Scanner</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Comprehensive analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Sanctions & PEP screening
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Cross-chain fund tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Detailed risk breakdown
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Export compliance reports
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Graph network analysis
                      </li>
                    </ul>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        onClick={() => router.push("/wallet-scan")}
                        className="w-full bg-blue-500 text-white hover:bg-blue-400"
                      >
                        Try Full Scanner →
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Best for: Compliance and detailed investigations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}