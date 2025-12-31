"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  Search, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  Users, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Info,
  History,
  TrendingDown,
  Lock,
  MessageSquare
} from "lucide-react"

// Types based on the feature spec
type ScamArchetype = {
  id: string
  name: string
  key: "classic_rug_pull" | "liquidity_lock_bypass" | "honeypot" | "insider_dump_ring"
  description: string
  phases: string[]
  historicalCase: string
  similarity: number
  confidence: "low" | "medium" | "high"
}

type TimelinePhase = {
  id: string
  label: string
  timestamp: string
  status: "completed" | "pending" | "missing"
  description: string
}

const ARCHETYPES: Record<string, ScamArchetype> = {
  classic_rug_pull: {
    id: "arch_1",
    name: "Classic Rug Pull",
    key: "classic_rug_pull",
    description: "Coordinated removal of liquidity after artificial price inflation.",
    phases: ["liquidity_added", "social_hype_spike", "insider_accumulation", "liquidity_removal", "coordinated_dump"],
    historicalCase: "$SQUID Token (2021)",
    similarity: 82,
    confidence: "high"
  },
  liquidity_lock_bypass: {
    id: "arch_2",
    name: "Liquidity Lock Bypass",
    key: "liquidity_lock_bypass",
    description: "Using contract upgrades or hidden privileges to drain 'locked' funds.",
    phases: ["liquidity_locked", "contract_upgrade", "privilege_added", "liquidity_withdrawn"],
    historicalCase: "$TITAN Finance (2021)",
    similarity: 68,
    confidence: "medium"
  },
  honeypot: {
    id: "arch_3",
    name: "Honeypot",
    key: "honeypot",
    description: "Contract logic that prevents selling while allowing buys.",
    phases: ["buy_enabled", "sell_restricted", "volume_spike", "exit_blocked"],
    historicalCase: "Various ERC20 Variants",
    similarity: 45,
    confidence: "low"
  },
  insider_dump_ring: {
    id: "arch_4",
    name: "Insider Dump Ring",
    key: "insider_dump_ring",
    description: "Coordinated dumping from multiple related wallets.",
    phases: ["wallet_cluster_accumulation", "price_increase", "synchronized_dump"],
    historicalCase: "$EMAX Insider Wallets",
    similarity: 76,
    confidence: "high"
  }
}

const MOCK_CURRENT_TIMELINE: Record<string, TimelinePhase[]> = {
  classic_rug_pull: [
    { id: "p1", label: "Liquidity Added", timestamp: "T-48h", status: "completed", description: "150 ETH added to Uniswap V2" },
    { id: "p2", label: "Social Hype Spike", timestamp: "T-24h", status: "completed", description: "300% increase in Twitter velocity" },
    { id: "p3", label: "Insider Accumulation", timestamp: "T-12h", status: "completed", description: "Top 5 wallets holding 45% of supply" },
    { id: "p4", label: "Liquidity Removal", timestamp: "Pending", status: "pending", description: "Anomalous contract calls detected" },
    { id: "p5", label: "Coordinated Dump", timestamp: "N/A", status: "missing", description: "No synchronized sell events yet" }
  ],
  insider_dump_ring: [
    { id: "p1", label: "Wallet Cluster Accumulation", timestamp: "T-72h", status: "completed", description: "12 wallets linked via common funding source" },
    { id: "p2", label: "Price Increase", timestamp: "T-12h", status: "completed", description: "15x gain since inception" },
    { id: "p3", label: "Synchronized Dump", timestamp: "T-1h", status: "completed", description: "All 12 wallets sold within 5 minute window" }
  ]
}

const HISTORICAL_TIMELINES: Record<string, TimelinePhase[]> = {
  classic_rug_pull: [
    { id: "h1", label: "Liquidity Added", timestamp: "Day 0", status: "completed", description: "Dev adds large liquidity pool" },
    { id: "h2", label: "Social Hype Spike", timestamp: "Day 2", status: "completed", description: "Bot accounts shill project" },
    { id: "h3", label: "Insider Accumulation", timestamp: "Day 3", status: "completed", description: "Wallets connected to dev buy in" },
    { id: "h4", label: "Liquidity Removal", timestamp: "Day 5", status: "completed", description: "Liquidity pulled via emergency function" },
    { id: "h5", label: "Coordinated Dump", timestamp: "Day 5", status: "completed", description: "Remaining tokens dumped on market" }
  ]
}

const EXPLANATIONS: Record<string, string[]> = {
  classic_rug_pull: [
    "Liquidity dropped rapidly after social hype spikes",
    "Wallets dumped in a synchronized time window in previous similar cases",
    "Ownership concentration increased before exit events"
  ],
  insider_dump_ring: [
    "Identified 12 addresses with 98% correlation in transaction timing",
    "Funding source trace leads to a common centralized exchange deposit address",
    "Wallets holding significant supply never participated in organic social hype"
  ]
}

export default function PatternMatchingPage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [selectedArchetype, setSelectedArchetype] = useState<ScamArchetype>(ARCHETYPES.classic_rug_pull)
  const [showResults, setShowResults] = useState(false)

  const currentTimeline = useMemo(() => 
    MOCK_CURRENT_TIMELINE[selectedArchetype.key] || MOCK_CURRENT_TIMELINE.classic_rug_pull
  , [selectedArchetype])

  const historicalTimeline = useMemo(() => 
    HISTORICAL_TIMELINES[selectedArchetype.key] || HISTORICAL_TIMELINES.classic_rug_pull
  , [selectedArchetype])

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2000)
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      case "medium": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
      case "low": return "text-red-400 border-red-500/30 bg-red-500/10"
      default: return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white selection:bg-red-500/30">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Target className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                AI Scam Pattern Matching
              </h1>
              <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                Behavioral Intelligence Engine // Archetype Analysis
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <Card className="border-red-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                  <Input
                    placeholder="ENTER TOKEN CONTRACT OR WALLET ADDRESS..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 bg-black/60 border-red-500/20 text-white placeholder:text-gray-600 font-mono focus-visible:ring-red-500/50"
                  />
                </div>
                <Button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="bg-red-600 hover:bg-red-500 text-white font-black px-8 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      COMPUTING VECTORS...
                    </div>
                  ) : (
                    "MATCH PATTERNS"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showResults && (
          <div className="space-y-8">
            {/* Top Analysis Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Archetype Selector */}
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Select Archetype</h3>
                <div className="space-y-2">
                  {Object.values(ARCHETYPES).map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedArchetype(arch)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedArchetype.id === arch.id 
                          ? "bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                          : "bg-black/40 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-black ${selectedArchetype.id === arch.id ? "text-red-400" : "text-gray-400"}`}>
                          {arch.name}
                        </span>
                        {selectedArchetype.id === arch.id && <Zap className="w-3 h-3 text-red-400 fill-red-400" />}
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono leading-tight">{arch.historicalCase}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Similarity Ring & Summary */}
              <Card className="md:col-span-3 border-white/5 bg-black/60 backdrop-blur-md">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Similarity Ring */}
                    <div className="relative shrink-0">
                      <svg width="200" height="200" className="transform -rotate-90">
                        <circle
                          cx="100"
                          cy="100"
                          r="88"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="16"
                          fill="none"
                        />
                        <motion.circle
                          initial={{ strokeDashoffset: 552 }}
                          animate={{ strokeDashoffset: 552 - (selectedArchetype.similarity / 100) * 552 }}
                          cx="100"
                          cy="100"
                          r="88"
                          stroke="rgb(239, 68, 68)"
                          strokeWidth="16"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="552"
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-5xl font-black text-red-500"
                        >
                          {selectedArchetype.similarity}%
                        </motion.span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Similarity</span>
                      </div>
                    </div>

                    {/* Analysis Narrative */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">
                            {selectedArchetype.name} Match
                          </h2>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`uppercase text-[10px] font-black border ${getConfidenceColor(selectedArchetype.confidence)}`}>
                                Confidence: {selectedArchetype.confidence}
                              </Badge>
                              <span className="text-gray-600 text-xs font-mono">{"// Case Ref: "}{selectedArchetype.historicalCase}</span>
                            </div>

                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Behavioral Intent
                          </h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {selectedArchetype.description}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Investigator Note
                          </h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Similarity is never presented as certainty. This pattern suggests 
                            <span className="text-white"> structural replication</span> of historical scams.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pattern Comparison Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Current Timeline */}
              <Card className="border-red-500/30 bg-black/60 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-24 h-24 text-red-500" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Current Asset Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative">
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-red-500/50 before:to-transparent">
                    {currentTimeline.map((phase, idx) => (
                      <motion.div 
                        key={phase.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative pl-12"
                      >
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-black flex items-center justify-center transition-all ${
                          phase.status === "completed" ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : 
                          phase.status === "pending" ? "bg-zinc-800 animate-pulse" : "bg-zinc-900 opacity-30"
                        }`}>
                          {phase.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                          {phase.status === "pending" && <div className="w-2 h-2 rounded-full bg-red-400" />}
                        </div>
                        <div className={phase.status === "missing" ? "opacity-30" : ""}>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-sm font-black text-white uppercase italic">{phase.label}</h4>
                            <span className="text-[10px] font-mono text-gray-500">{phase.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono leading-snug">{phase.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Historical Pattern Timeline */}
              <Card className="border-white/5 bg-black/60 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <History className="w-24 h-24 text-gray-500" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-4 h-4" /> Historical Scam Archetype
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative">
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                    {historicalTimeline.map((phase, idx) => {
                      const isMatch = currentTimeline.some(p => p.label === phase.label && p.status === "completed")
                      return (
                        <motion.div 
                          key={phase.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`relative pl-12 ${isMatch ? "glow-phase" : "opacity-30"}`}
                        >
                          <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-black flex items-center justify-center transition-all ${
                            isMatch ? "bg-red-500/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-zinc-900"
                          }`}>
                            <History className="w-4 h-4 text-white/50" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className={`text-sm font-black uppercase italic ${isMatch ? "text-red-400" : "text-gray-500"}`}>
                                {phase.label}
                              </h4>
                              {isMatch && (
                                <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Verified Match</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono leading-snug">{phase.description}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Explanation Engine */}
            <Card className="border-red-500/20 bg-gradient-to-br from-black to-red-950/20 backdrop-blur-md overflow-hidden">
              <CardHeader className="border-b border-red-500/10">
                <CardTitle className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-500" /> AI Behavioral Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Structural Commonalities</h3>
                    <div className="space-y-4">
                      {EXPLANATIONS[selectedArchetype.key]?.map((point, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-red-500/30 transition-all"
                        >
                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Zap className="w-3 h-3 text-red-400" />
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed italic">{point}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Similarity Logic Engine</h3>
                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <Shield className="w-12 h-12 text-blue-500 opacity-10" />
                      </div>
                      <p className="text-sm text-blue-300/80 font-mono leading-relaxed mb-6">
                        System using <span className="text-blue-400 font-bold">Cosine Similarity</span> over 
                        multi-dimensional feature vectors including liquidity decay rate, wallet 
                        synchronization, and social velocity lag.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-gray-500">Vector Alignment</span>
                            <span className="text-blue-400">92%</span>
                          </div>
                          <Progress value={92} className="h-1 bg-blue-950/50" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-gray-500">Temporal Correlation</span>
                            <span className="text-blue-400">74%</span>
                          </div>
                          <Progress value={74} className="h-1 bg-blue-950/50" />
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 uppercase font-black text-xs"
                    >
                      Export Forensic Report <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State / Philosophy */}
        {!showResults && !isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-24 text-center max-w-2xl mx-auto"
          >
            <div className="inline-block p-4 rounded-full bg-red-500/5 border border-red-500/10 mb-8">
              <Shield className="w-8 h-8 text-red-500 opacity-40" />
            </div>
            <h2 className="text-xl font-black text-white uppercase italic mb-4">"We have seen this behavior before"</h2>
            <p className="text-gray-500 text-sm font-mono leading-relaxed">
              CryptoGuard matches full behavioral timelines against our curated database of historical 
              scam structures. We detect intent by matching structural repetition, not isolated numbers.
            </p>
          </motion.div>
        )}
      </main>

      <style jsx global>{`
        .glow-phase {
          filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.2));
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
      `}</style>
    </div>
  )
}
