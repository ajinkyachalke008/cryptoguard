"use client"

import { useState, useEffect, ReactNode } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown,
  Droplets, 
  Users, 
  AlertTriangle, 
  MessageSquare,
  RefreshCw,
  Search,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ExternalLink
} from "lucide-react"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"

interface DeltaChange {
  id: string
  category: "risk" | "liquidity" | "wallet" | "contract" | "social"
  title: string
  previousValue: string | number
  currentValue: string | number
  delta: number
  deltaType: "increase" | "decrease" | "neutral"
  severity: "low" | "medium" | "high" | "critical"
  timestamp: Date
  aiExplanation: string
  evidence: ReactNode[]
  expanded: boolean
}

const mockDeltaChanges: DeltaChange[] = [
  {
    id: "1",
    category: "risk",
    title: "Overall Risk Score",
    previousValue: 42,
    currentValue: 67,
    delta: 25,
    deltaType: "increase",
    severity: "critical",
    timestamp: new Date(Date.now() - 3600000),
    aiExplanation: "Risk score increased significantly due to combination of liquidity removal, whale movement, and suspicious social activity patterns detected in the last hour.",
    evidence: [
      "Liquidity: -18% in 45 minutes",
      "Whale wallet moved 2.4M tokens to exchange",
      "Bot activity spike: +340% Twitter mentions"
    ],
    expanded: false
  },
  {
    id: "2",
    category: "liquidity",
    title: "Liquidity Pool Depth",
    previousValue: "$2.4M",
    currentValue: "$1.97M",
    delta: -17.9,
    deltaType: "decrease",
    severity: "high",
    timestamp: new Date(Date.now() - 2400000),
    aiExplanation: "Single large liquidity provider removed $430K from the main ETH/TOKEN pool. This matches patterns seen before coordinated exits.",
      evidence: [
        "LP Address: 0x7f2a...c891",
        <BlockchainIdentifier key="lp-addr" type="address" value="0x7f2a12345678901234567890123456789012c891" label="LP" truncate={true} />,
        "Removed: 847,231 LP tokens",
        "Remaining LPs: 12 → 11",
        "Slippage impact: +2.3%"
      ],
      expanded: false
    },
    {
      id: "3",
      category: "wallet",
      title: "New Wallet Clusters",
      previousValue: "3 clusters",
      currentValue: "7 clusters",
      delta: 133,
      deltaType: "increase",
      severity: "high",
      timestamp: new Date(Date.now() - 1800000),
      aiExplanation: "AI detected 4 new wallet clusters exhibiting coordinated behavior. Transaction timing suggests single entity control across 23 new wallets.",
      evidence: [
        "New wallets: 23",
        "Avg. funding amount: 0.42 ETH",
        <BlockchainIdentifier key="funding-source" type="address" value="0x8a3fb2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9" label="Source" truncate={true} />,
        "Transaction interval: 12-18 seconds"
      ],
      expanded: false
    },
    {
      id: "4",
      category: "contract",
      title: "Contract Proxy Update",
      previousValue: "v1.2.0",
      currentValue: "v1.2.1",
      delta: 0,
      deltaType: "neutral",
      severity: "medium",
      timestamp: new Date(Date.now() - 1200000),
      aiExplanation: "Upgradeable proxy contract was modified. New implementation adds an admin-controlled pause function that could freeze all transfers.",
      evidence: [
        "New function: emergencyPause()",
        <BlockchainIdentifier key="admin-addr" type="address" value="0x7a2f12345678901234567890123456789012c891" label="Admin" truncate={true} />,
        "Timelock: None detected",
        "Audit status: Unverified"
      ],
    expanded: false
  },
  {
    id: "5",
    category: "social",
    title: "Social Engagement",
    previousValue: "2.8K/hr",
    currentValue: "11.2K/hr",
    delta: 300,
    deltaType: "increase",
    severity: "medium",
    timestamp: new Date(Date.now() - 600000),
    aiExplanation: "Massive spike in social mentions correlates with influencer posts. Pattern analysis suggests coordinated promotion campaign with 34% likely bot activity.",
    evidence: [
      "Twitter mentions: +300%",
      "Telegram messages: +180%",
      "Bot likelihood: 34%",
      "Unique authors: 847 → 2,341"
    ],
    expanded: false
  },
  {
    id: "6",
    category: "wallet",
    title: "Top Holder Concentration",
    previousValue: "58.2%",
    currentValue: "62.7%",
    delta: 4.5,
    deltaType: "increase",
    severity: "medium",
    timestamp: new Date(Date.now() - 300000),
    aiExplanation: "Top 10 wallets increased their holdings. Whale accumulation before social spike suggests informed buying ahead of promotion.",
    evidence: [
      "Top wallet: 24.3% → 26.1%",
      "Top 10 wallets: 58.2% → 62.7%",
      "Retail holders: -4.5%",
      "Gini coefficient: 0.78"
    ],
    expanded: false
  }
]

const getCategoryIcon = (category: DeltaChange["category"]) => {
  switch (category) {
    case "risk": return <AlertTriangle className="w-4 h-4" />
    case "liquidity": return <Droplets className="w-4 h-4" />
    case "wallet": return <Users className="w-4 h-4" />
    case "contract": return <GitCompare className="w-4 h-4" />
    case "social": return <MessageSquare className="w-4 h-4" />
  }
}

const getCategoryColor = (category: DeltaChange["category"]) => {
  switch (category) {
    case "risk": return "#ef4444"
    case "liquidity": return "#38bdf8"
    case "wallet": return "#a78bfa"
    case "contract": return "#22c55e"
    case "social": return "#f472b6"
  }
}

const getSeverityColor = (severity: DeltaChange["severity"]) => {
  switch (severity) {
    case "low": return "#22c55e"
    case "medium": return "#f59e0b"
    case "high": return "#ef4444"
    case "critical": return "#dc2626"
  }
}

const getDeltaIcon = (type: DeltaChange["deltaType"]) => {
  switch (type) {
    case "increase": return <ArrowUpRight className="w-4 h-4" />
    case "decrease": return <ArrowDownRight className="w-4 h-4" />
    case "neutral": return <Minus className="w-4 h-4" />
  }
}

export default function DeltaEnginePage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [deltaChanges, setDeltaChanges] = useState<DeltaChange[]>(mockDeltaChanges)
  const [lastScan, setLastScan] = useState<Date>(new Date(Date.now() - 3600000))
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (showResults) {
      deltaChanges.forEach((change, index) => {
        setTimeout(() => {
          setAnimatedCards(prev => new Set([...prev, change.id]))
        }, index * 150)
      })
    }
  }, [showResults])

  const handleScan = () => {
    setIsScanning(true)
    setAnimatedCards(new Set())
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
      setLastScan(new Date())
    }, 2500)
  }

  const toggleExpand = (id: string) => {
    setDeltaChanges(prev => 
      prev.map(change => 
        change.id === id ? { ...change, expanded: !change.expanded } : change
      )
    )
  }

  const timeSinceLastScan = () => {
    const diff = Date.now() - lastScan.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m ago`
    return `${minutes}m ago`
  }

  const criticalChanges = deltaChanges.filter(c => c.severity === "critical" || c.severity === "high")
  const overallDelta = deltaChanges.find(c => c.category === "risk")

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Delta Engine</h1>
              <p className="text-gray-400 text-sm">Compare scans and detect what changed</p>
            </div>
          </div>
        </div>

        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Enter token contract or wallet address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-semibold"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rescan & Compare
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last scan: {timeSinceLastScan()}
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                {criticalChanges.length} critical changes
              </div>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {overallDelta && (
                <Card 
                  className={`border-2 bg-black/60 backdrop-blur-sm overflow-hidden transition-all duration-500 ${
                    animatedCards.has(overallDelta.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ borderColor: getSeverityColor(overallDelta.severity) }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ 
                            backgroundColor: `${getSeverityColor(overallDelta.severity)}20`,
                            boxShadow: `0 0 30px ${getSeverityColor(overallDelta.severity)}40`
                          }}
                        >
                          <AlertTriangle className="w-6 h-6" style={{ color: getSeverityColor(overallDelta.severity) }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Risk Score Delta</h3>
                          <p className="text-sm text-gray-400">Primary risk indicator change</p>
                        </div>
                      </div>
                      <Badge 
                        className="text-sm px-3 py-1"
                        style={{ 
                          backgroundColor: `${getSeverityColor(overallDelta.severity)}20`,
                          color: getSeverityColor(overallDelta.severity),
                          borderColor: getSeverityColor(overallDelta.severity)
                        }}
                      >
                        {overallDelta.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-3xl font-mono font-bold text-gray-400">{overallDelta.previousValue}%</div>
                        <div className="text-xs text-gray-500 mt-1">Previous</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center flex flex-col items-center justify-center">
                        <div 
                          className="text-3xl font-mono font-bold flex items-center gap-1"
                          style={{ color: overallDelta.delta > 0 ? "#ef4444" : "#22c55e" }}
                        >
                          {overallDelta.delta > 0 ? "+" : ""}{overallDelta.delta}%
                          {getDeltaIcon(overallDelta.deltaType)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Change</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div 
                          className="text-3xl font-mono font-bold"
                          style={{ color: getSeverityColor(overallDelta.severity) }}
                        >
                          {overallDelta.currentValue}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Current</div>
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-200">{overallDelta.aiExplanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-yellow-300 mb-4">Change Details</h3>
                
                {deltaChanges.filter(c => c.category !== "risk").map((change, index) => (
                  <Card 
                    key={change.id}
                    className={`border-yellow-500/20 bg-black/40 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-500 hover:border-yellow-500/40 ${
                      animatedCards.has(change.id) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                    }`}
                    onClick={() => toggleExpand(change.id)}
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      boxShadow: change.expanded ? `0 0 20px ${getCategoryColor(change.category)}30` : "none"
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${getCategoryColor(change.category)}20`,
                              border: `1px solid ${getCategoryColor(change.category)}40`
                            }}
                          >
                            {getCategoryIcon(change.category)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{change.title}</h4>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">{String(change.previousValue)}</span>
                              <span className="text-gray-600">→</span>
                              <span className="text-white font-mono">{String(change.currentValue)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div 
                            className={`flex items-center gap-1 font-mono font-bold ${
                              change.deltaType === "increase" ? "text-red-400" : 
                              change.deltaType === "decrease" ? "text-green-400" : "text-gray-400"
                            }`}
                          >
                            {change.delta > 0 ? "+" : ""}{change.delta}%
                            {getDeltaIcon(change.deltaType)}
                          </div>
                          <Badge 
                            variant="outline"
                            className="text-xs"
                            style={{ 
                              borderColor: getSeverityColor(change.severity),
                              color: getSeverityColor(change.severity)
                            }}
                          >
                            {change.severity}
                          </Badge>
                          {change.expanded ? 
                            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          }
                        </div>
                      </div>

                      {change.expanded && (
                        <div className="mt-4 pt-4 border-t border-yellow-500/20 animate-in slide-in-from-top-2">
                          <div className="bg-black/40 rounded-lg p-4 mb-3">
                            <div className="flex items-start gap-2 mb-3">
                              <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-cyan-300">{change.aiExplanation}</p>
                            </div>
                          </div>
                          
                          <div className="bg-black/60 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Evidence</div>
                            <div className="grid grid-cols-2 gap-2">
                              {change.evidence.map((item, i) => (
                                <div key={i} className="text-xs font-mono text-gray-400 bg-black/40 rounded px-2 py-1">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Detected {change.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Delta Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {deltaChanges.filter(c => c.severity === "critical").length}
                      </div>
                      <div className="text-xs text-gray-500">Critical</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {deltaChanges.filter(c => c.severity === "high").length}
                      </div>
                      <div className="text-xs text-gray-500">High</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {deltaChanges.filter(c => c.severity === "medium").length}
                      </div>
                      <div className="text-xs text-gray-500">Medium</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {deltaChanges.filter(c => c.severity === "low").length}
                      </div>
                      <div className="text-xs text-gray-500">Low</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">By Category</div>
                    {[
                      { cat: "risk", label: "Risk Score" },
                      { cat: "liquidity", label: "Liquidity" },
                      { cat: "wallet", label: "Wallet Activity" },
                      { cat: "contract", label: "Contract" },
                      { cat: "social", label: "Social" }
                    ].map(item => {
                      const count = deltaChanges.filter(c => c.category === item.cat as DeltaChange["category"]).length
                      return (
                        <div key={item.cat} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: getCategoryColor(item.cat as DeltaChange["category"]) }} 
                            />
                            <span className="text-sm text-gray-400">{item.label}</span>
                          </div>
                          <span className="text-sm font-mono text-white">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    The combination of <span className="text-red-400 font-semibold">liquidity removal</span>, 
                    <span className="text-purple-400 font-semibold"> new wallet clusters</span>, and 
                    <span className="text-pink-400 font-semibold"> social hype spike</span> suggests 
                    a coordinated pump-and-dump setup. Historical pattern matching indicates 
                    <span className="text-red-400 font-bold"> 73% similarity </span> 
                    to previous rug pull events.
                  </p>
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Recommended Actions</div>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500" />
                        Monitor whale wallet movements closely
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500" />
                        Set up liquidity alerts for further removals
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500" />
                        Track new wallet cluster transaction patterns
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Scan History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { time: "1h ago", changes: 6, risk: 67 },
                      { time: "3h ago", changes: 2, risk: 42 },
                      { time: "6h ago", changes: 1, risk: 38 },
                      { time: "12h ago", changes: 3, risk: 35 },
                      { time: "24h ago", changes: 0, risk: 28 }
                    ].map((scan, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-black/40 hover:bg-black/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-400">{scan.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{scan.changes} changes</span>
                          <span 
                            className="text-sm font-mono font-bold"
                            style={{ color: scan.risk > 60 ? "#ef4444" : scan.risk > 40 ? "#f59e0b" : "#22c55e" }}
                          >
                            {scan.risk}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
