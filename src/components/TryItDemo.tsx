"use client"

import { useState, useEffect } from "react"
import { Search, AlertTriangle, CheckCircle, XCircle, ArrowRight, Loader2, TrendingUp, Clock, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const sampleWallets = [
  { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bd3e", label: "Known Fraud Wallet", risk: "high" },
  { address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72", label: "Exchange Hot Wallet", risk: "low" },
  { address: "0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE", label: "Suspicious Activity", risk: "medium" },
]

interface ScanResult {
  address: string
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  transactionCount: number
  totalVolume: string
  riskyConnections: number
  lastSeen: string
}

export function TryItDemo() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const router = useRouter()

  const handleScan = async () => {
    if (!address.trim()) return
    
    setIsScanning(true)
    setResult(null)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate mock result based on address
    const hash = address.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    const riskScore = (hash % 100)
    
    setResult({
      address: address,
      riskScore,
      riskLevel: riskScore > 75 ? "critical" : riskScore > 50 ? "high" : riskScore > 25 ? "medium" : "low",
      transactionCount: Math.floor(hash % 10000) + 100,
      totalVolume: `$${((hash % 1000) * 1000 + 50000).toLocaleString()}`,
      riskyConnections: Math.floor(riskScore / 10),
      lastSeen: "2 hours ago",
    })
    
    setIsScanning(false)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-400 bg-green-500/20 border-green-500/50"
      case "medium": return "text-orange-400 bg-orange-500/20 border-orange-500/50"
      case "high": return "text-red-400 bg-red-500/20 border-red-500/50"
      case "critical": return "text-red-500 bg-red-600/20 border-red-600/50"
      default: return "text-gray-400 bg-gray-500/20 border-gray-500/50"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return <CheckCircle className="size-5" />
      case "medium": return <AlertTriangle className="size-5" />
      case "high": 
      case "critical": return <XCircle className="size-5" />
      default: return null
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-black/60 px-4 py-1.5 text-xs text-yellow-300 shadow-[0_0_20px_#ffd70044] backdrop-blur-sm">
          <Search className="size-3 text-yellow-400" />
          TRY IT YOURSELF
        </div>
        <h2 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_22%,#b58100_50%,#ffd700_78%,#fff7cc_100%)] bg-clip-text text-transparent mb-4">
          Scan Any Wallet
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
          Enter a wallet address to instantly analyze its risk profile with our AI engine
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Input Section */}
        <div className="rounded-2xl border border-yellow-500/40 bg-black/60 p-6 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className="w-full rounded-xl border border-yellow-500/30 bg-black/60 px-4 py-3 pl-11 text-sm text-white placeholder:text-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning || !address.trim()}
              className="rounded-xl bg-yellow-500 px-6 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 shadow-[0_0_20px_#ffd70066] transition-all"
            >
              {isScanning ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan"
              )}
            </Button>
          </div>

          {/* Sample Wallets */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try sample:</span>
            {sampleWallets.map((wallet, idx) => (
              <button
                key={idx}
                onClick={() => setAddress(wallet.address)}
                className={`text-xs px-2 py-1 rounded-md border transition-all ${
                  wallet.risk === "high" 
                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10" 
                    : wallet.risk === "medium"
                    ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                }`}
              >
                {wallet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scanning Animation */}
        {isScanning && (
          <div className="mt-6 rounded-2xl border border-yellow-500/40 bg-black/60 p-8 backdrop-blur-sm text-center">
            <div className="relative inline-flex">
              <div className="h-16 w-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="size-6 text-yellow-400" />
              </div>
            </div>
            <p className="mt-4 text-gray-300">Analyzing wallet on blockchain...</p>
            <div className="mt-2 flex justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Result */}
        {result && !isScanning && (
          <div className="mt-6 rounded-2xl border border-yellow-500/40 bg-black/60 p-6 backdrop-blur-sm shadow-[0_0_40px_#ffd70022] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <p className="text-sm text-gray-300 font-mono break-all">{result.address}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getRiskColor(result.riskLevel)}`}>
                {getRiskIcon(result.riskLevel)}
                <span className="text-sm font-bold uppercase">{result.riskLevel} Risk</span>
              </div>
            </div>

            {/* Risk Score Meter */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Risk Score</span>
                <span className="text-2xl font-black text-yellow-400">{result.riskScore}/100</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    result.riskScore > 75 ? "bg-gradient-to-r from-red-500 to-red-600" :
                    result.riskScore > 50 ? "bg-gradient-to-r from-orange-500 to-red-500" :
                    result.riskScore > 25 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                    "bg-gradient-to-r from-green-500 to-yellow-500"
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border border-yellow-500/20 bg-black/40 p-3 text-center">
                <TrendingUp className="size-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{result.transactionCount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 uppercase">Transactions</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-black/40 p-3 text-center">
                <span className="text-yellow-400 text-sm">$</span>
                <p className="text-lg font-bold text-white">{result.totalVolume}</p>
                <p className="text-[10px] text-gray-500 uppercase">Total Volume</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-black/40 p-3 text-center">
                <Link2 className="size-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{result.riskyConnections}</p>
                <p className="text-[10px] text-gray-500 uppercase">Risky Links</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-black/40 p-3 text-center">
                <Clock className="size-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{result.lastSeen}</p>
                <p className="text-[10px] text-gray-500 uppercase">Last Seen</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/scanner?address=${result.address}`)}
                className="flex-1 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_20px_#ffd70066]"
              >
                Full Analysis
                <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/graph?address=${result.address}`)}
                className="flex-1 rounded-xl border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 hover:text-yellow-200"
              >
                View Graph
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
