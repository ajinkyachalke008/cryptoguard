"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"
import { 
  Shield, 
  Search, 
  Map, 
  Clock, 
  Users, 
  Fingerprint, 
  Globe, 
  AlertCircle,
  Activity,
  Zap,
  ChevronRight,
  Check,
  X,
  Info,
  Bot,
  User,
  Building2,
  ArrowRight
} from "lucide-react"

type ConfidenceLevel = "high" | "medium" | "low" | "insufficient_data"

interface ClusterSignal {
  type: string
  present: boolean
  weight: number
  description: string
}

interface ClusterData {
  address: string
  cluster_size: number
  is_known_entity: boolean
  known_entity_name?: string
  wallet_role: string
  confidence: ConfidenceLevel
  explanation: string
  limitations: string[]
  signals_used: ClusterSignal[]
}

interface HourlyActivity {
  hour: number
  activity: number
  count: number
}

interface TimezoneSignal {
  type: string
  present: boolean
  weight: number
  description: string
}

interface TimezoneData {
  address: string
  likely_timezone_range: string
  behavior_pattern: "human_like" | "bot_like" | "mixed" | "unknown"
  confidence: ConfidenceLevel
  explanation: string
  peak_hours_utc: number[]
  total_transactions_analyzed: number
  analysis_period_days: number
  activity_distribution: HourlyActivity[]
}

interface RegionProbability {
  region: string
  probability: number
}

interface GeoSignal {
  type: string
  present: boolean
  weight: number
  description: string
}

interface GeoData {
  address: string
  regions: RegionProbability[]
  confidence: ConfidenceLevel
  explanation: string
  limitations: string[]
  methodology: string
  data_sources: string[]
}

const ConfidenceBadge = ({ level }: { level: ConfidenceLevel }) => {
  const config = {
    high: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "HIGH CONFIDENCE" },
    medium: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "MEDIUM CONFIDENCE" },
    low: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "LOW CONFIDENCE" },
    insufficient_data: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "INSUFFICIENT DATA" }
  }
  
  const { color, label } = config[level]
  
  return (
    <Badge className={`${color} border text-[10px] font-black uppercase tracking-widest`}>
      {label}
    </Badge>
  )
}

const ConfidenceBar = ({ level }: { level: ConfidenceLevel }) => {
  const values = { high: 90, medium: 60, low: 30, insufficient_data: 10 }
  const colors = { 
    high: "bg-emerald-500", 
    medium: "bg-amber-500", 
    low: "bg-red-500", 
    insufficient_data: "bg-gray-500" 
  }
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
        <span>Overall Attribution Confidence</span>
        <ConfidenceBadge level={level} />
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${values[level]}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colors[level]}`}
        />
      </div>
    </div>
  )
}

const SignalIndicator = ({ signal }: { signal: ClusterSignal | TimezoneSignal | GeoSignal }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg ${signal.present ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
    <div className={`mt-0.5 ${signal.present ? 'text-emerald-400' : 'text-gray-600'}`}>
      {signal.present ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold ${signal.present ? 'text-white' : 'text-gray-500'}`}>
          {signal.type.replace(/_/g, ' ').toUpperCase()}
        </span>
        <span className="text-[10px] text-gray-600 font-mono">
          Weight: {Math.round(signal.weight * 100)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">{signal.description}</p>
    </div>
  </div>
)

const RadialClock = ({ distribution, peaks }: { distribution: HourlyActivity[], peaks: number[] }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/5">
        <span className="text-gray-500 text-sm">No activity data</span>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="20" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        
        {[0, 6, 12, 18].map(hour => {
          const angle = (hour * 15 * Math.PI) / 180
          const x = 100 + 92 * Math.cos(angle)
          const y = 100 + 92 * Math.sin(angle)
          return (
            <text 
              key={hour} 
              x={x} 
              y={y} 
              fill="rgba(255,255,255,0.3)" 
              fontSize="8" 
              textAnchor="middle" 
              dominantBaseline="middle"
              transform={`rotate(90, ${x}, ${y})`}
            >
              {hour}:00
            </text>
          )
        })}

        {distribution.map((d, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const baseRadius = 65
          const maxExtension = 25
          const length = (d.activity / 100) * maxExtension
          const isPeak = peaks.includes(i)
          
          const x1 = 100 + baseRadius * Math.cos(angle)
          const y1 = 100 + baseRadius * Math.sin(angle)
          const x2 = 100 + (baseRadius + length) * Math.cos(angle)
          const y2 = 100 + (baseRadius + length) * Math.sin(angle)
          
          return (
            <motion.line
              key={i}
              initial={{ x2: x1, y2: y1 }}
              animate={{ x2, y2 }}
              transition={{ duration: 0.5, delay: i * 0.02 }}
              x1={x1}
              y1={y1}
              stroke={isPeak ? "#ef4444" : "rgba(255,255,255,0.15)"}
              strokeWidth={isPeak ? 4 : 2}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Clock className="w-6 h-6 text-gray-600 mb-2" />
        <span className="text-2xl font-black text-white">24H</span>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">UTC Cycle</span>
      </div>
    </div>
  )
}

const RegionBar = ({ region, probability, isTop }: { region: string, probability: number, isTop: boolean }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className={`text-xs font-bold ${isTop ? 'text-white' : 'text-gray-400'}`}>{region}</span>
      <span className={`text-sm font-black ${isTop ? 'text-white' : 'text-gray-500'}`}>{probability}%</span>
    </div>
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${probability}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`h-full ${isTop ? 'bg-indigo-500' : 'bg-gray-600'}`}
      />
    </div>
  </div>
)

const BehaviorPatternBadge = ({ pattern }: { pattern: string }) => {
  const config: Record<string, { icon: any, color: string, label: string }> = {
    human_like: { icon: User, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Human-Like" },
    bot_like: { icon: Bot, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Bot-Like" },
    mixed: { icon: Activity, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Mixed Pattern" },
    unknown: { icon: Info, color: "text-gray-400 bg-gray-500/10 border-gray-500/20", label: "Unknown" }
  }
  
  const { icon: Icon, color, label } = config[pattern] || config.unknown
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function WalletIntelligencePage() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [data, setData] = useState<{
    cluster: ClusterData | null
    timezone: TimezoneData | null
    geo: GeoData | null
  }>({ cluster: null, timezone: null, geo: null })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const addr = params.get("address")
    if (addr && addr !== address) {
      setAddress(addr)
    }
  }, [])

  useEffect(() => {
    if (address && !data.cluster && !isScanning) {
      const params = new URLSearchParams(window.location.search)
      if (params.get("address") === address) {
        handleScan()
      }
    }
  }, [address])

  const handleScan = async () => {
    if (!address) return
    setIsScanning(true)
    setData({ cluster: null, timezone: null, geo: null })
    
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

  const overallConfidence = (): ConfidenceLevel => {
    if (!data.cluster) return "insufficient_data"
    const levels = [data.cluster?.confidence, data.timezone?.confidence, data.geo?.confidence]
    if (levels.includes("insufficient_data")) return "low"
    if (levels.every(l => l === "high")) return "high"
    if (levels.some(l => l === "low")) return "low"
    return "medium"
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white selection:bg-indigo-500/30">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Fingerprint className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                Wallet Attribution Intelligence
              </h1>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                Probabilistic Behavioral Analysis // Forensic Grade
              </p>
            </div>
          </div>

          <Card className="border-indigo-500/20 bg-black/40 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Enter wallet address (0x...)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    className="pl-10 bg-black/60 border-indigo-500/20 text-white placeholder:text-gray-600 font-mono"
                  />
                </div>
                <Button 
                  onClick={handleScan}
                  disabled={isScanning || !address}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8"
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    "Run Attribution"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {data.cluster ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 border-white/5 bg-black/60">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        {data.cluster.is_known_entity ? (
                          <Building2 className="w-8 h-8 text-indigo-400" />
                        ) : (
                          <Users className="w-8 h-8 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Target Address</h4>
                          <BlockchainIdentifier type="address" value={address} truncate={false} className="text-lg font-bold text-white" />
                        </div>
                        <ConfidenceBar level={overallConfidence()} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-white/5 bg-black/60">
                  <CardContent className="p-6 h-full flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Forensic Integrity</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      All outputs are probabilistic. CryptoGuard does not identify real-world individuals, exact locations, or IP addresses.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-indigo-500/20 bg-black/60 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> Identity Clustering
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.cluster.is_known_entity ? (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-5 h-5 text-amber-400" />
                          <span className="font-bold text-amber-400">Known Entity Detected</span>
                        </div>
                        <p className="text-xs text-gray-400">{data.cluster.explanation}</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Cluster Size</span>
                            <span className="text-2xl font-black text-white">{data.cluster.cluster_size}</span>
                            <span className="text-xs text-gray-500 ml-1">wallets</span>
                          </div>
                          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Inferred Role</span>
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold">
                              {data.cluster.wallet_role}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Signal Analysis</span>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {data.cluster.signals_used.map((signal, i) => (
                              <SignalIndicator key={i} signal={signal} />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-3 border-t border-white/5">
                      <ConfidenceBadge level={data.cluster.confidence} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/5 bg-black/60 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Behavioral Timezone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadialClock 
                      distribution={data.timezone?.activity_distribution || []} 
                      peaks={data.timezone?.peak_hours_utc || []} 
                    />
                    
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Likely Timezone</span>
                        <span className="text-xs font-bold text-white">{data.timezone?.likely_timezone_range}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Behavior Pattern</span>
                        <BehaviorPatternBadge pattern={data.timezone?.behavior_pattern || "unknown"} />
                      </div>
                      
                      <div className="text-[10px] text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Transactions Analyzed:</span>
                          <span className="text-white font-bold">{data.timezone?.total_transactions_analyzed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Analysis Period:</span>
                          <span className="text-white font-bold">{data.timezone?.analysis_period_days} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <ConfidenceBadge level={data.timezone?.confidence || "insufficient_data"} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/5 bg-black/60 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Map className="w-4 h-4" /> Probabilistic Geo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {data.geo?.regions.map((region, i) => (
                        <RegionBar 
                          key={i} 
                          region={region.region} 
                          probability={region.probability} 
                          isTop={i === 0}
                        />
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Methodology</span>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{data.geo?.methodology}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Data Sources</span>
                      <div className="flex flex-wrap gap-1">
                        {data.geo?.data_sources.map((source, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] text-gray-400 border-gray-700">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <ConfidenceBadge level={data.geo?.confidence || "insufficient_data"} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-indigo-500/10 bg-gradient-to-br from-black to-indigo-950/10">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-400" /> Forensic Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Why We Think This</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-white">Clustering Analysis</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{data.cluster.explanation}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-white">Temporal Analysis</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{data.timezone?.explanation}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-white">Geographic Analysis</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{data.geo?.explanation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Limitations & Honesty</h3>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 border-dashed space-y-3">
                        {[...(data.cluster.limitations || []), ...(data.geo?.limitations || [])].slice(0, 5).map((limitation, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Info className="w-3 h-3 text-gray-500 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                        onClick={() => router.push("/trust-timeline")}
                      >
                        View Trust Timeline Integration
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <p className="text-[10px] text-gray-600 leading-relaxed">
                        CryptoGuard provides probabilistic behavioral analysis based on publicly observable blockchain activity. 
                        It does not identify real-world individuals, exact locations, or IP addresses.
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
              className="mt-16 text-center max-w-xl mx-auto"
            >
              {!isScanning && (
                <>
                  <div className="inline-block p-6 rounded-full bg-indigo-500/5 border border-indigo-500/10 mb-6">
                    <Fingerprint className="w-12 h-12 text-indigo-500 opacity-30" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase mb-4">
                    Behavioral Fingerprinting
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Enter a wallet address to analyze its behavioral patterns. We use temporal analysis, 
                    cluster detection, and geographic inference to build a probabilistic profile — 
                    all without compromising privacy.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {["Identity Clustering", "Timezone Analysis", "Geo-Inference"].map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs text-gray-400 border-gray-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
