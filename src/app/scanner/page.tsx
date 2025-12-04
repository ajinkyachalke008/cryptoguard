"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  address: string
  riskScore: number
  riskLevel: RiskLevel
  explanation: string
  stats: {
    totalVolumeIn: number
    totalVolumeOut: number
    transactionCount: number
    firstSeen: string
    lastSeen: string
    riskyConnections: number
  }
  riskFactors: {
    factor: string
    impact: number
    description: string
  }[]
  recentTransactions: {
    hash: string
    type: "in" | "out"
    amount: number
    counterparty: string
    timestamp: string
    riskLevel: RiskLevel
  }[]
}

// Mock wallet scan function
function mockScanWallet(address: string): Promise<WalletScanResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const riskScore = Math.floor(Math.random() * 100)
      const riskLevel: RiskLevel = 
        riskScore < 25 ? "low" : 
        riskScore < 50 ? "medium" : 
        riskScore < 75 ? "high" : "critical"
      
      resolve({
        address,
        riskScore,
        riskLevel,
        explanation: riskScore < 25 
          ? "This wallet shows normal transaction patterns with no direct links to known malicious actors."
          : riskScore < 50
          ? "This wallet has some indirect connections to flagged addresses. Monitor for unusual activity."
          : riskScore < 75
          ? "Warning: This wallet has interacted with multiple high-risk addresses and shows suspicious patterns."
          : "Critical: Direct interaction with known mixer services and sanctioned addresses detected.",
        stats: {
          totalVolumeIn: Math.floor(Math.random() * 1000000) + 10000,
          totalVolumeOut: Math.floor(Math.random() * 900000) + 5000,
          transactionCount: Math.floor(Math.random() * 500) + 10,
          firstSeen: "2023-03-15",
          lastSeen: "2024-12-04",
          riskyConnections: Math.floor(Math.random() * 20)
        },
        riskFactors: [
          { factor: "Mixer Interaction", impact: riskScore > 50 ? 35 : 0, description: "Direct transfers to/from known mixing services" },
          { factor: "New Wallet Activity", impact: riskScore > 30 ? 20 : 5, description: "Large transfers shortly after wallet creation" },
          { factor: "Transaction Bursts", impact: riskScore > 40 ? 15 : 0, description: "High-frequency transaction patterns detected" },
          { factor: "Sanctioned Links", impact: riskScore > 70 ? 25 : 0, description: "Connections to OFAC sanctioned addresses" },
          { factor: "Exchange Activity", impact: -10, description: "Regular interaction with verified exchanges" },
        ].filter(f => f.impact !== 0),
        recentTransactions: Array.from({ length: 8 }, (_, i) => ({
          hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          type: Math.random() > 0.5 ? "in" : "out",
          amount: Math.floor(Math.random() * 50000) + 100,
          counterparty: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
          timestamp: `${Math.floor(Math.random() * 24)}h ago`,
          riskLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as RiskLevel
        }))
      })
    }, 2000)
  })
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
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<WalletScanResult | null>(null)

  const handleScan = async () => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address")
      return
    }
    
    setIsScanning(true)
    setResult(null)
    
    try {
      const scanResult = await mockScanWallet(address)
      setResult(scanResult)
      toast.success("Wallet scan complete")
    } catch {
      toast.error("Failed to scan wallet")
    } finally {
      setIsScanning(false)
    }
  }

  const handleAddToWatchlist = () => {
    toast.success("Wallet added to watchlist")
    router.push("/watchlist")
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(result?.address || address)
    toast.success("Address copied to clipboard")
  }

  const RiskIcon = result ? riskIcons[result.riskLevel] : Shield

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
            <Card className={`border-2 ${riskColors[result.riskLevel].border} bg-black/60 backdrop-blur-sm ${riskColors[result.riskLevel].glow}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Score Circle */}
                  <div className="flex flex-col items-center justify-center">
                    <div className={`relative w-40 h-40 rounded-full ${riskColors[result.riskLevel].bg} flex items-center justify-center`}>
                      <div className="absolute inset-2 rounded-full bg-black/80 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${riskColors[result.riskLevel].text}`}>
                          {result.riskScore}
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
                          strokeDasharray={`${result.riskScore * 4.65} 465`}
                          className={riskColors[result.riskLevel].text}
                        />
                      </svg>
                    </div>
                    <Badge className={`mt-4 ${riskColors[result.riskLevel].bg} ${riskColors[result.riskLevel].text} ${riskColors[result.riskLevel].border} text-sm px-4 py-1`}>
                      <RiskIcon className="w-4 h-4 mr-1" />
                      {result.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <code className="text-sm text-yellow-300 bg-black/50 px-3 py-1.5 rounded-lg border border-yellow-500/30">
                        {result.address}
                      </code>
                      <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="text-gray-400 hover:text-yellow-300">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-gray-300 mb-6">{result.explanation}</p>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleAddToWatchlist} className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Watchlist
                      </Button>
                      <Button onClick={() => router.push(`/graph?address=${result.address}`)} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                        <Network className="w-4 h-4 mr-2" />
                        Open Graph Explorer
                      </Button>
                      <Button onClick={() => router.push(`/reports?address=${result.address}`)} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <TrendingDown className="w-3 h-3" />
                    Volume In
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    ${result.stats.totalVolumeIn.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Volume Out
                  </div>
                  <div className="text-lg font-bold text-orange-400">
                    ${result.stats.totalVolumeOut.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <ArrowRightLeft className="w-3 h-3" />
                    Transactions
                  </div>
                  <div className="text-lg font-bold text-yellow-300">
                    {result.stats.transactionCount}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    First Seen
                  </div>
                  <div className="text-lg font-bold text-gray-300">
                    {result.stats.firstSeen}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Activity className="w-3 h-3" />
                    Last Seen
                  </div>
                  <div className="text-lg font-bold text-gray-300">
                    {result.stats.lastSeen}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Link2 className="w-3 h-3" />
                    Risky Links
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    {result.stats.riskyConnections}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Factors & Transactions */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Risk Factors */}
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-300 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Risk Factor Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-400">Factors contributing to the risk score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.riskFactors.map((factor, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{factor.factor}</span>
                          <span className={`text-sm font-semibold ${factor.impact > 0 ? "text-red-400" : "text-green-400"}`}>
                            {factor.impact > 0 ? "+" : ""}{factor.impact}
                          </span>
                        </div>
                        <Progress 
                          value={Math.abs(factor.impact)} 
                          className={`h-2 ${factor.impact > 0 ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}`}
                        />
                        <p className="text-xs text-gray-500">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-300 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-gray-400">Latest activity from this wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {result.recentTransactions.map((tx, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/20 bg-black/40 hover:border-yellow-500/40 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "in" ? "bg-green-500/20" : "bg-orange-500/20"}`}>
                          {tx.type === "in" ? (
                            <TrendingDown className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-gray-400">{tx.hash}</code>
                            <Badge className={`${riskColors[tx.riskLevel].bg} ${riskColors[tx.riskLevel].text} text-[10px] px-1.5`}>
                              {tx.riskLevel}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tx.type === "in" ? "From" : "To"}: {tx.counterparty}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${tx.type === "in" ? "text-green-400" : "text-orange-400"}`}>
                            {tx.type === "in" ? "+" : "-"}${tx.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{tx.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}
