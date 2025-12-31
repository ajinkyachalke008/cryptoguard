"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Search, 
  Map, 
  Clock, 
  Users, 
  Fingerprint, 
  Globe, 
  Info, 
  AlertCircle,
  Link as LinkIcon,
  Activity,
  Zap,
  ChevronRight
} from "lucide-react"

// --- Types ---
type ClusterData = {
  cluster_id: string
  cluster_size: number
  wallet_role: string
  confidence: "low" | "medium" | "high"
}

type TimezoneData = {
  peak_hours_utc: number[]
  activity_distribution: { hour: number; activity: number }[]
  likely_timezone_range: string
  confidence: "low" | "medium" | "high"
}

type GeoData = {
  regions: { region: string; probability: string }[]
  confidence: "low" | "medium" | "high"
}

// --- Components ---

const ConfidenceBar = ({ level }: { level: "low" | "medium" | "high" }) => {
  const value = level === "high" ? 90 : level === "medium" ? 60 : 30
  const color = level === "high" ? "bg-emerald-500" : level === "medium" ? "bg-yellow-500" : "bg-red-500"
  
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
        <span>Attribution Confidence</span>
        <span className={level === "high" ? "text-emerald-400" : level === "medium" ? "text-yellow-400" : "text-red-400"}>
          {level}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        />
      </div>
    </div>
  )
}

const RadialClock = ({ distribution, peaks }: { distribution: any[], peaks: number[] }) => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
        {/* Outer Ring */}
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        
        {/* Hour Markers */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const x1 = 100 + 75 * Math.cos(angle)
          const y1 = 100 + 75 * Math.sin(angle)
          const x2 = 100 + 85 * Math.cos(angle)
          const y2 = 100 + 85 * Math.sin(angle)
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          )
        })}

        {/* Activity Bars */}
        {distribution.map((d, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const length = (d.activity / 100) * 60
          const x2 = 100 + (70 + length) * Math.cos(angle)
          const y2 = 100 + (70 + length) * Math.sin(angle)
          const isPeak = peaks.includes(i)
          
          return (
            <motion.line
              key={i}
              initial={{ x2: 100 + 70 * Math.cos(angle), y2: 100 + 70 * Math.sin(angle) }}
              animate={{ x2, y2 }}
              x1={100 + 70 * Math.cos(angle)}
              y1={100 + 70 * Math.sin(angle)}
              stroke={isPeak ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.2)"}
              strokeWidth={isPeak ? "4" : "2"}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-white italic">24H</span>
        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Behavioral Cycle</span>
      </div>
    </div>
  )
}

const HeatmapWorldMap = ({ regions }: { regions: any[] }) => {
  // Simple SVG representation of world map for MVP
  return (
    <div className="relative w-full aspect-video bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
      <Globe className="w-32 h-32 text-white/5 absolute" />
      <div className="relative z-10 w-full h-full p-4 grid grid-cols-2 gap-4">
        {regions.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-lg bg-black/40 border border-white/5 backdrop-blur-sm flex flex-col justify-center"
          >
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{r.region}</span>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-white italic">{r.probability}</span>
              <div className="mb-1 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500/50" 
                  style={{ width: r.probability }} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Pulse Animation for Heat Zones */}
      <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-red-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
    </div>
  )
}

export default function WalletIntelligencePage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [data, setData] = useState<{
    cluster: ClusterData | null
    timezone: TimezoneData | null
    geo: GeoData | null
  }>({ cluster: null, timezone: null, geo: null })

  const handleScan = async () => {
    if (!address) return
    setIsScanning(true)
    
    try {
      const [clusterRes, timezoneRes, geoRes] = await Promise.all([
        fetch(`/api/v1/wallet-intelligence/cluster/${address}`),
        fetch(`/api/v1/wallet-intelligence/timezone/${address}`),
        fetch(`/api/v1/wallet-intelligence/geo/${address}`)
      ])
      
      const [cluster, timezone, geo] = await Promise.all([
        clusterRes.json(),
        timezoneRes.json(),
        geoRes.json()
      ])
      
      setData({ cluster, timezone, geo })
    } catch (error) {
      console.error("Scan failed:", error)
    } finally {
      setIsScanning(false)
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Fingerprint className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                Wallet Attribution & Geo-Intelligence
              </h1>
              <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                Probabilistic Behavioral Fingerprinting // MVP v1.0
              </p>
            </div>
          </motion.div>

          <Card className="border-indigo-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    placeholder="ENTER WALLET ADDRESS FOR ATTRIBUTION..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 bg-black/60 border-indigo-500/20 text-white placeholder:text-gray-600 font-mono focus-visible:ring-indigo-500/50"
                  />
                </div>
                <Button 
                  onClick={handleScan}
                  disabled={isScanning || !address}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      EXTRACTING FINGERPRINT...
                    </div>
                  ) : (
                    "RUN ATTRIBUTION"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence mode="wait">
          {data.cluster ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Wallet Summary Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-white/5 bg-black/60 backdrop-blur-md">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="shrink-0">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-indigo-400" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Target Identity</h4>
                        <div className="flex items-center gap-2">
                          <code className="text-xl font-black text-white truncate max-w-md">{address}</code>
                          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono uppercase text-[10px]">
                            {data.cluster.cluster_id}
                          </Badge>
                        </div>
                      </div>
                      <ConfidenceBar level={data.cluster.confidence} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/5 bg-black/60 backdrop-blur-md flex flex-col justify-center p-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Forensic Integrity</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono mt-4 leading-relaxed">
                    All attribution data is probabilistic. We do not claim real-world identity or exact IP locations.
                  </p>
                </Card>
              </div>

              {/* Unified Intelligence Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Identity Clustering */}
                <Card className="border-indigo-500/30 bg-black/60 backdrop-blur-md relative overflow-hidden group">
                  <CardHeader>
                    <CardTitle className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Users className="w-4 h-4" /> Identity Clustering
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cluster Size</span>
                        <span className="text-lg font-black text-white italic">{data.cluster.cluster_size} Wallets</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Inferred Role</span>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase text-[10px] font-black italic">
                          {data.cluster.wallet_role}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cluster Evidence</h5>
                      <p className="text-xs text-gray-400 font-mono italic leading-relaxed">
                        "Deterministic links found via common exchange deposit addresses and synchronized funding patterns."
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Behavioral Timezone Clock */}
                <Card className="border-white/5 bg-black/60 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Behavioral Clock
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <RadialClock 
                      distribution={data.timezone?.activity_distribution || []} 
                      peaks={data.timezone?.peak_hours_utc || []} 
                    />
                    <div className="mt-6 w-full p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Operating Window</span>
                        <span className="text-xs font-black text-white italic">{data.timezone?.likely_timezone_range}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Geo-Inference Map */}
                <Card className="border-white/5 bg-black/60 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-sm font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Map className="w-4 h-4" /> Probabilistic Geo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <HeatmapWorldMap regions={data.geo?.regions || []} />
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Inference Signal</h5>
                      <p className="text-xs text-gray-400 font-mono italic leading-relaxed">
                        Signal based on latency measurements of pings to P2P nodes and historical transaction time clustering.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Evidence & Why We Think This */}
              <Card className="border-indigo-500/20 bg-gradient-to-br from-black to-indigo-950/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-500" /> Forensic Evidence Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest">Why We Think This</h3>
                      <div className="space-y-4">
                        {[
                          "Activity peaks align with standard business hours in South Asia.",
                          "Deterministic link to known Market Maker cluster identified in 2023.",
                          "P2P node proximity suggests eastern regional exit nodes."
                        ].map((point, i) => (
                          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                            <Zap className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                            <p className="text-sm text-gray-300 italic">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Limitations & Honesty</h3>
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
                        <p className="text-xs text-gray-500 font-mono leading-relaxed mb-4 italic">
                          Probabilistic models are subject to error. Use of VPNs, automated scripts, or shared infrastructure 
                          may distort behavioral fingerprints.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-400">
                          <LinkIcon className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase">View Trust Timeline Integration</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-600 font-mono leading-relaxed">
                        CryptoGuard provides probabilistic behavioral analysis based on publicly observable blockchain activity. It does not identify real-world individuals, exact locations, or IP addresses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-24 text-center max-w-2xl mx-auto"
            >
              {!isScanning && (
                <>
                  <div className="inline-block p-4 rounded-full bg-indigo-500/5 border border-indigo-500/10 mb-8">
                    <Fingerprint className="w-8 h-8 text-indigo-500 opacity-40" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase italic mb-4">"Identifying actors through behavior"</h2>
                  <p className="text-gray-500 text-sm font-mono leading-relaxed">
                    Search for a wallet address to uncover its behavioral fingerprint. We use temporal patterns, 
                    cluster analysis, and network latency to infer identity and regional presence without 
                    invading privacy.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
