"use client"

import { useState, useEffect, useRef } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Droplets, 
  Users, 
  AlertTriangle, 
  MessageSquare,
  FileCode,
  Search,
  Zap,
  Info,
  ChevronRight
} from "lucide-react"

interface TimelineEvent {
  id: string
  timestamp: Date
  type: "liquidity" | "ownership" | "social" | "contract" | "whale" | "anomaly"
  title: string
  description: string
  riskDelta: number
  severity: "low" | "medium" | "high" | "critical"
  aiExplanation: string
  evidence?: string[]
}

interface RiskDataPoint {
  timestamp: Date
  score: number
  liquidity: number
  ownership: number
  social: number
  confidence: number
  event?: TimelineEvent
}

const generateRiskData = (events: TimelineEvent[], days: number = 7): RiskDataPoint[] => {
  const data: RiskDataPoint[] = []
  let currentRisk = 25
  let currentLiquidity = 80
  let currentOwnership = 40
  let currentSocial = 30
  
  const points = days * 4 // 4 points per day
  const startTime = new Date(Date.now() - 86400000 * days)
  
  for (let i = 0; i <= points; i++) {
    const timestamp = new Date(startTime.getTime() + (i / points) * (days * 86400000))
    const matchingEvent = events.find(e => 
      Math.abs(e.timestamp.getTime() - timestamp.getTime()) < (days * 86400000 / points / 2)
    )
    
    // Simulate some noise
    currentLiquidity = Math.max(0, Math.min(100, currentLiquidity + (Math.random() - 0.5) * 5))
    currentOwnership = Math.max(0, Math.min(100, currentOwnership + (Math.random() - 0.5) * 3))
    currentSocial = Math.max(0, Math.min(100, currentSocial + (Math.random() - 0.5) * 10))

    if (matchingEvent) {
      currentRisk = Math.min(100, Math.max(0, currentRisk + matchingEvent.riskDelta))
      if (matchingEvent.type === "liquidity") currentLiquidity -= matchingEvent.riskDelta
      if (matchingEvent.type === "ownership") currentOwnership += matchingEvent.riskDelta
      if (matchingEvent.type === "social") currentSocial += matchingEvent.riskDelta
      
      data.push({ 
        timestamp, 
        score: currentRisk, 
        liquidity: currentLiquidity,
        ownership: currentOwnership,
        social: currentSocial,
        confidence: 85 + Math.random() * 10,
        event: matchingEvent 
      })
    } else {
      // Drift risk towards historical trends
      currentRisk = Math.max(0, Math.min(100, currentRisk + (Math.random() - 0.45) * 2))
      data.push({ 
        timestamp, 
        score: currentRisk,
        liquidity: currentLiquidity,
        ownership: currentOwnership,
        social: currentSocial,
        confidence: 90 + Math.random() * 5
      })
    }
  }
  
  return data
}

const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 86400000 * 7),
    type: "contract",
    title: "Contract Deployed",
    description: "Token contract deployed on Ethereum mainnet",
    riskDelta: 0,
    severity: "low",
    aiExplanation: "New contract deployment detected. Initial risk assessment pending behavioral data.",
    evidence: ["Contract: 0x742d...3a91", "Deployer: 0x8f2a...b4c2"]
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 86400000 * 6),
    type: "liquidity",
    title: "Liquidity Added",
    description: "$2.4M liquidity added to Uniswap V3",
    riskDelta: -5,
    severity: "low",
    aiExplanation: "Substantial liquidity provision indicates commitment. Risk reduced by 5%.",
    evidence: ["Pool: ETH/TOKEN", "LP Tokens: 847,231", "Lock Period: None"]
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 86400000 * 5),
    type: "social",
    title: "Social Hype Spike",
    description: "300% increase in Twitter mentions within 4 hours",
    riskDelta: 8,
    severity: "medium",
    aiExplanation: "Sudden social engagement spike detected. Pattern matches coordinated promotion campaigns. Risk +8%.",
    evidence: ["Mentions: 2,847 → 11,388", "Bot Likelihood: 34%", "Influencer Activity: High"]
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 86400000 * 4),
    type: "whale",
    title: "Whale Accumulation",
    description: "Top 10 wallets now hold 68% of supply",
    riskDelta: 12,
    severity: "high",
    aiExplanation: "Ownership concentration exceeds safety threshold. High dump risk if whales coordinate exit.",
    evidence: ["Top Holder: 24.3%", "Top 10: 68.2%", "Retail: 31.8%"]
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 86400000 * 3),
    type: "liquidity",
    title: "Liquidity Removal",
    description: "22% liquidity removed within 14 minutes",
    riskDelta: 18,
    severity: "critical",
    aiExplanation: "Rapid liquidity withdrawal detected. Pattern matches pre-rug behavior. Risk +18%.",
    evidence: ["Removed: $528,000", "Remaining: $1.87M", "Time Window: 14min"]
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 86400000 * 2),
    type: "ownership",
    title: "Insider Transfer",
    description: "Dev wallet transferred 15% to fresh wallets",
    riskDelta: 15,
    severity: "critical",
    aiExplanation: "Developer wallet splitting tokens across new addresses. Common exit preparation pattern.",
    evidence: ["Source: 0x7a2f...c891", "Destinations: 12 wallets", "Amount: 15M tokens"]
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 86400000),
    type: "anomaly",
    title: "Wash Trading Detected",
    description: "Circular transaction pattern identified",
    riskDelta: 10,
    severity: "high",
    aiExplanation: "AI detected wash trading loop involving 8 wallets. Volume inflated by estimated 340%.",
    evidence: ["Wallets: 8", "Loop Volume: $2.1M", "Real Volume: ~$480K"]
  }
]

const generateRiskData = (events: TimelineEvent[]): RiskDataPoint[] => {
  const data: RiskDataPoint[] = []
  let currentRisk = 25
  const startTime = new Date(Date.now() - 86400000 * 8)
  
  for (let i = 0; i <= 8; i++) {
    const timestamp = new Date(startTime.getTime() + i * 86400000)
    const matchingEvent = events.find(e => 
      Math.abs(e.timestamp.getTime() - timestamp.getTime()) < 43200000
    )
    
    if (matchingEvent) {
      currentRisk = Math.min(100, Math.max(0, currentRisk + matchingEvent.riskDelta))
      data.push({ timestamp, score: currentRisk, event: matchingEvent })
    } else {
      data.push({ timestamp, score: currentRisk })
    }
  }
  
  return data
}

const getEventIcon = (type: TimelineEvent["type"]) => {
  switch (type) {
    case "liquidity": return <Droplets className="w-4 h-4" />
    case "ownership": return <Users className="w-4 h-4" />
    case "social": return <MessageSquare className="w-4 h-4" />
    case "contract": return <FileCode className="w-4 h-4" />
    case "whale": return <TrendingUp className="w-4 h-4" />
    case "anomaly": return <AlertTriangle className="w-4 h-4" />
  }
}

const getSeverityColor = (severity: TimelineEvent["severity"]) => {
  switch (severity) {
    case "low": return "#22c55e"
    case "medium": return "#f59e0b"
    case "high": return "#ef4444"
    case "critical": return "#dc2626"
  }
}

const getRiskColor = (score: number) => {
  if (score < 30) return "#22c55e"
  if (score < 50) return "#84cc16"
  if (score < 70) return "#f59e0b"
  if (score < 85) return "#ef4444"
  return "#dc2626"
}

export default function TrustTimelinePage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [riskData, setRiskData] = useState<RiskDataPoint[]>([])
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d")
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["risk", "liquidity", "ownership", "social"]))
  const [animationProgress, setAnimationProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    setRiskData(generateRiskData(mockEvents, days))
    setAnimationProgress(0)
  }, [timeRange])

  useEffect(() => {
    if (showResults && animationProgress < 100) {
      const timer = setTimeout(() => {
        setAnimationProgress(prev => Math.min(100, prev + 2))
      }, 16)
      return () => clearTimeout(timer)
    }
  }, [showResults, animationProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || riskData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const padding = { top: 40, right: 60, bottom: 60, left: 60 }
    const graphWidth = rect.width - padding.left - padding.right
    const graphHeight = rect.height - padding.top - padding.bottom

    // Draw Grid
    ctx.strokeStyle = "rgba(255,215,0,0.05)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + graphWidth, y)
      ctx.stroke()
      
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.font = "10px JetBrains Mono, monospace"
      ctx.textAlign = "right"
      ctx.fillText(`${100 - i * 25}`, padding.left - 15, y + 4)
    }

    const visiblePoints = Math.floor((riskData.length * animationProgress) / 100)
    if (visiblePoints <= 1) return

    const getX = (i: number) => padding.left + (i / (riskData.length - 1)) * graphWidth
    const getY = (val: number) => padding.top + ((100 - val) / 100) * graphHeight

    // 1. Confidence Band (Layer 1 Background)
    if (activeLayers.has("risk")) {
      ctx.beginPath()
      const bandOpacity = 0.1 * (animationProgress / 100)
      ctx.fillStyle = `rgba(255, 215, 0, ${bandOpacity})`
      
      // Top of band
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(Math.min(100, riskData[i].score + (100 - riskData[i].confidence) / 2))
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      // Bottom of band
      for (let i = visiblePoints - 1; i >= 0; i--) {
        const x = getX(i)
        const y = getY(Math.max(0, riskData[i].score - (100 - riskData[i].confidence) / 2))
        ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
    }

    // 2. Liquidity Health (Layer 2 - Underlay Area)
    if (activeLayers.has("liquidity")) {
      ctx.beginPath()
      ctx.fillStyle = "rgba(56, 189, 248, 0.15)"
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].liquidity)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.lineTo(getX(visiblePoints - 1), padding.top + graphHeight)
      ctx.lineTo(padding.left, padding.top + graphHeight)
      ctx.closePath()
      ctx.fill()
      
      ctx.beginPath()
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)"
      ctx.lineWidth = 1
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].liquidity)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // 3. Ownership Concentration (Layer 3 - Purple Dotted)
    if (activeLayers.has("ownership")) {
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.strokeStyle = "rgba(168, 85, 247, 0.6)"
      ctx.lineWidth = 2
      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].ownership)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 4. Social Pressure Glow (Layer 4)
    if (activeLayers.has("social")) {
      for (let i = 0; i < visiblePoints; i += 4) {
        const x = getX(i)
        const y = getY(riskData[i].social)
        const intensity = riskData[i].social / 100
        const pulse = Math.sin(Date.now() / 1000 + i) * 0.2 + 0.8
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 30 * intensity * pulse)
        grad.addColorStop(0, `rgba(244, 114, 182, ${0.2 * intensity})`)
        grad.addColorStop(1, "rgba(244, 114, 182, 0)")
        
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, 30 * intensity * pulse, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 5. Primary Risk Curve (Layer 1)
    if (activeLayers.has("risk")) {
      const gradient = ctx.createLinearGradient(padding.left, 0, padding.left + graphWidth, 0)
      riskData.slice(0, visiblePoints).forEach((point, i) => {
        const progress = i / (riskData.length - 1)
        gradient.addColorStop(progress, getRiskColor(point.score))
      })

      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      for (let i = 0; i < visiblePoints; i++) {
        const x = getX(i)
        const y = getY(riskData[i].score)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Predictive Projection
      if (visiblePoints === riskData.length) {
        ctx.beginPath()
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        const lastPoint = riskData[riskData.length - 1]
        ctx.moveTo(getX(riskData.length - 1), getY(lastPoint.score))
        
        // Simulating 3 more points into the future
        for (let j = 1; j <= 4; j++) {
          const fx = padding.left + graphWidth + (j / 4) * 60
          const fy = getY(lastPoint.score + (Math.random() - 0.3) * 15)
          ctx.lineTo(fx, fy)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // 6. Event Markers
    riskData.slice(0, visiblePoints).forEach((point, i) => {
      if (!point.event) return
      
      const x = getX(i)
      const y = getY(point.score)
      const color = getSeverityColor(point.event.severity)

      const pulse = Math.sin(Date.now() / 500 + i) * 0.3 + 0.7
      ctx.beginPath()
      ctx.arc(x, y, 14 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `${color}22`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.stroke()
      
      // HUD Ring
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.strokeStyle = `${color}66`
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.stroke()
      ctx.setLineDash([])
    })

    // X-Axis Labels
    const labelStep = Math.ceil(riskData.length / 6)
    riskData.forEach((point, i) => {
      if (i % labelStep === 0) {
        const x = getX(i)
        const date = point.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ctx.fillStyle = "rgba(255,255,255,0.4)"
        ctx.font = "9px JetBrains Mono, monospace"
        ctx.textAlign = "center"
        ctx.fillText(date, x, rect.height - padding.bottom + 25)
      }
    })

  }, [riskData, animationProgress, activeLayers])

  useEffect(() => {
    if (showResults) {
      const interval = setInterval(() => {
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            setRiskData(prev => [...prev])
          }
        }
      }, 50)
      return () => clearInterval(interval)
    }
  }, [showResults])

  const handleScan = () => {
    setIsScanning(true)
    setAnimationProgress(0)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2000)
  }

  const currentRisk = riskData[riskData.length - 1]?.score || 0

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dynamic Trust Timeline</h1>
              <p className="text-gray-400 text-sm">Track how token/wallet risk evolves over time</p>
            </div>
          </div>
        </div>

        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Enter token contract or wallet address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Timeline
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

          {showResults && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Risk Evolution Timeline
                        </CardTitle>
                        <div className="flex bg-black/40 rounded-lg p-1 border border-yellow-500/20">
                          {(["24h", "7d", "30d", "all"] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => setTimeRange(r)}
                              className={`px-3 py-1 text-xs rounded transition-all ${
                                timeRange === r 
                                  ? "bg-yellow-500 text-black font-bold" 
                                  : "text-gray-500 hover:text-gray-300"
                              }`}
                            >
                              {r.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {[
                            { id: "risk", label: "Risk", color: "bg-yellow-500" },
                            { id: "liquidity", label: "Liquidity", color: "bg-sky-400" },
                            { id: "ownership", label: "Ownership", color: "bg-purple-500" },
                            { id: "social", label: "Social", color: "bg-pink-400" }
                          ].map(layer => (
                            <button
                              key={layer.id}
                              onClick={() => {
                                const next = new Set(activeLayers)
                                if (next.has(layer.id)) next.delete(layer.id); else next.add(layer.id)
                                setActiveLayers(next)
                              }}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${
                                activeLayers.has(layer.id)
                                  ? "border-white/20 bg-white/5 opacity-100"
                                  : "border-transparent opacity-30 grayscale"
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${layer.color}`} />
                              <span className="text-[10px] font-medium uppercase">{layer.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 relative">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-mono text-emerald-400">LIVE TRACKING ACTIVE</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-[450px] w-full bg-[#08090d] cursor-crosshair">
                      <canvas 
                        ref={canvasRef}
                        className="w-full h-full"
                        style={{ display: "block" }}
                      />
                      {/* Depth Overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#05060a] via-transparent to-transparent opacity-40" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg text-yellow-300">Forensic Event Log</CardTitle>
                    <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-500/70">
                      {mockEvents.length} DETECTED ANOMALIES
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-emerald-500/50 via-yellow-500/50 to-red-500/50" />

                    
                    <div className="space-y-4">
                      {mockEvents.map((event, index) => (
                        <div 
                          key={event.id}
                          className={`relative pl-16 transition-all duration-300 cursor-pointer group ${
                            selectedEvent?.id === event.id ? "scale-[1.02]" : ""
                          }`}
                          onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                          style={{
                            opacity: animationProgress > (index / mockEvents.length) * 100 ? 1 : 0.3,
                            transform: `translateX(${animationProgress > (index / mockEvents.length) * 100 ? 0 : -20}px)`
                          }}
                        >
                          <div 
                            className="absolute left-4 w-5 h-5 rounded-full flex items-center justify-center border-2 border-black transition-transform group-hover:scale-125"
                            style={{ 
                              backgroundColor: getSeverityColor(event.severity),
                              boxShadow: `0 0 12px ${getSeverityColor(event.severity)}66`
                            }}
                          >
                            {getEventIcon(event.type)}
                          </div>

                          <div className={`p-4 rounded-lg border transition-all ${
                            selectedEvent?.id === event.id 
                              ? "bg-yellow-500/10 border-yellow-500/50" 
                              : "bg-black/40 border-gray-800 hover:border-yellow-500/30"
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-white">{event.title}</h4>
                                <p className="text-sm text-gray-400">{event.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: getSeverityColor(event.severity),
                                    color: getSeverityColor(event.severity)
                                  }}
                                >
                                  {event.severity}
                                </Badge>
                                <span className={`text-sm font-mono font-bold ${
                                  event.riskDelta > 0 ? "text-red-400" : event.riskDelta < 0 ? "text-green-400" : "text-gray-400"
                                }`}>
                                  {event.riskDelta > 0 ? "+" : ""}{event.riskDelta}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              {event.timestamp.toLocaleString()}
                            </div>

                            {selectedEvent?.id === event.id && (
                              <div className="mt-4 pt-4 border-t border-yellow-500/20 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-2 mb-3">
                                  <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-cyan-300">{event.aiExplanation}</p>
                                </div>
                                
                                  {event.evidence && (
                                    <div className="bg-black/40 rounded p-3 mb-3">
                                      <div className="text-xs text-gray-500 mb-2">Evidence</div>
                                      <div className="space-y-1">
                                        {event.evidence.map((item, i) => (
                                          <div key={i} className="text-xs font-mono text-gray-400">
                                            {item}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {event.type === "contract" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        window.location.href = "/contract-explainer"
                                      }}
                                    >
                                      <FileCode className="w-3 h-3 mr-2" />
                                      Deep Dive Contract Analysis
                                    </Button>
                                  )}

                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Risk Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div 
                      className="text-5xl font-mono font-bold mb-2"
                      style={{ color: getRiskColor(currentRisk) }}
                    >
                      {currentRisk}%
                    </div>
                    <div className="text-sm text-gray-400">Current Risk Score</div>
                    <div className="text-xs text-gray-500 mt-1">± 6% confidence band</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 rounded-lg p-3 text-center">
                      <div className="text-red-400 font-bold text-lg">+58%</div>
                      <div className="text-xs text-gray-500">7-Day Change</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 text-center">
                      <div className="text-yellow-400 font-bold text-lg">7</div>
                      <div className="text-xs text-gray-500">Risk Events</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Event Breakdown</div>
                    {[
                      { type: "Liquidity", count: 2, color: "#38bdf8" },
                      { type: "Ownership", count: 1, color: "#a78bfa" },
                      { type: "Social", count: 1, color: "#f472b6" },
                      { type: "Whale", count: 1, color: "#fbbf24" },
                      { type: "Anomaly", count: 1, color: "#ef4444" },
                      { type: "Contract", count: 1, color: "#22c55e" }
                    ].map(item => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-400">{item.type}</span>
                        </div>
                        <span className="text-sm font-mono text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockEvents.filter(e => e.severity === "critical").map(event => (
                      <div 
                        key={event.id}
                        className="p-3 bg-black/40 rounded-lg border border-red-500/30 cursor-pointer hover:bg-red-500/10 transition-colors"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white">{event.title}</span>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-xs text-gray-400">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Based on current trajectory and historical pattern matching, this token has an 
                    <span className="text-red-400 font-bold"> 78% probability </span>
                    of experiencing a significant dump within the next 72 hours.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    High confidence prediction
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
