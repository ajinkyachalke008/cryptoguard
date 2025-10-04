"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Shield, AlertTriangle, TrendingUp } from "lucide-react"
import GlobeDemo from "@/components/GlobeDemo"

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  status: "safe" | "risky" | "fraud"
  timestamp: number
  country: string
}

export function LiveDemoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    risky: 0,
    fraud: 0,
    blocked: 0
  })
  const intervalRef = useRef<NodeJS.Timeout>()

  // Mock transaction generator
  const generateTransaction = (): Transaction => {
    const statuses: Array<"safe" | "risky" | "fraud"> = ["safe", "safe", "safe", "safe", "risky", "risky", "fraud"]
    const countries = ["USA", "China", "India", "Russia", "UK", "Germany", "Japan", "Brazil"]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      id: `TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      from: `0x${Math.random().toString(16).substr(2, 8)}...`,
      to: `0x${Math.random().toString(16).substr(2, 8)}...`,
      amount: (Math.random() * 50 + 0.1).toFixed(4),
      status,
      timestamp: Date.now(),
      country: countries[Math.floor(Math.random() * countries.length)]
    }
  }

  // Simulate real-time transactions
  useEffect(() => {
    if (!open || !isPlaying) return

    intervalRef.current = setInterval(() => {
      const newTx = generateTransaction()
      setTransactions(prev => [newTx, ...prev.slice(0, 9)])
      setStats(prev => ({
        total: prev.total + 1,
        safe: prev.safe + (newTx.status === "safe" ? 1 : 0),
        risky: prev.risky + (newTx.status === "risky" ? 1 : 0),
        fraud: prev.fraud + (newTx.status === "fraud" ? 1 : 0),
        blocked: prev.blocked + (newTx.status === "fraud" ? 1 : 0)
      }))
    }, 1500)

    return () => clearInterval(intervalRef.current)
  }, [open, isPlaying])

  const handleReset = () => {
    setTransactions([])
    setStats({ total: 0, safe: 0, risky: 0, fraud: 0, blocked: 0 })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe": return "text-green-400 bg-green-950/60"
      case "risky": return "text-orange-400 bg-orange-950/60"
      case "fraud": return "text-red-400 bg-red-950/60"
      default: return "text-gray-400 bg-gray-950/60"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe": return <Shield className="size-3" />
      case "risky": return <AlertTriangle className="size-3" />
      case "fraud": return <Zap className="size-3" />
      default: return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden border-yellow-500/50 bg-black/95 text-foreground backdrop-blur-xl shadow-[0_0_60px_#ffd70030]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl font-bold">
            <span className="flex items-center gap-2">
              <Zap className="size-6 text-yellow-400" />
              <span className="bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
                Live Fraud Detection Demo
              </span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="border-yellow-500/50 bg-black/60 text-yellow-300 hover:bg-yellow-500/20"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="border-yellow-500/50 bg-black/60 text-yellow-300 hover:bg-yellow-500/20"
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 h-[calc(100%-80px)] overflow-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-3">
            <div className="rounded-lg border border-yellow-500/30 bg-black/60 p-3 backdrop-blur-sm">
              <div className="text-xs text-gray-400 font-medium">Total Scanned</div>
              <div className="mt-1 text-2xl font-bold text-yellow-400">{stats.total}</div>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-950/30 p-3 backdrop-blur-sm">
              <div className="text-xs text-gray-400 font-medium">Safe</div>
              <div className="mt-1 text-2xl font-bold text-green-400">{stats.safe}</div>
            </div>
            <div className="rounded-lg border border-orange-500/30 bg-orange-950/30 p-3 backdrop-blur-sm">
              <div className="text-xs text-gray-400 font-medium">Risky</div>
              <div className="mt-1 text-2xl font-bold text-orange-400">{stats.risky}</div>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 backdrop-blur-sm">
              <div className="text-xs text-gray-400 font-medium">Fraud Detected</div>
              <div className="mt-1 text-2xl font-bold text-red-400">{stats.fraud}</div>
            </div>
            <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 backdrop-blur-sm shadow-[0_0_20px_#ff000020]">
              <div className="text-xs text-gray-400 font-medium">Blocked</div>
              <div className="mt-1 text-2xl font-bold text-red-400">{stats.blocked}</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-4 h-full">
            {/* Globe Visualization */}
            <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-4 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-yellow-300">Global Transaction Map</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <span className="mr-1 inline-block size-2 rounded-full bg-green-400 animate-pulse" />
                  Live
                </Badge>
              </div>
              <div className="h-[400px]">
                <GlobeDemo />
              </div>
            </div>

            {/* Transaction Stream */}
            <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-4 backdrop-blur-sm overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-yellow-300">Live Transaction Stream</h3>
                <TrendingUp className="size-4 text-yellow-400" />
              </div>
              <div className="space-y-2 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-500/30 scrollbar-track-transparent">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-lg border border-yellow-500/20 bg-black/40 p-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{tx.id}</span>
                          <Badge className={`text-xs ${getStatusColor(tx.status)} border-0`}>
                            {getStatusIcon(tx.status)}
                            {tx.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">From:</span>
                            <span className="font-mono">{tx.from}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">To:</span>
                            <span className="font-mono">{tx.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-yellow-400">{tx.amount} ETH</div>
                        <div className="text-xs text-gray-500">{tx.country}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    {isPlaying ? "Waiting for transactions..." : "Demo paused. Click Play to start."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-br from-yellow-950/20 to-black/60 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="size-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-yellow-300">AI Analysis Engine</h3>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                Hybrid Detection
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-gray-400">Graph Analysis</div>
                <div className="text-green-400 font-medium">✓ Network patterns analyzed</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Rule Engine</div>
                <div className="text-green-400 font-medium">✓ 247 rules evaluated</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">LLM Intelligence</div>
                <div className="text-green-400 font-medium">✓ Behavioral analysis active</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}