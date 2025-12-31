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
  const [animationProgress, setAnimationProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setRiskData(generateRiskData(mockEvents))
  }, [])

  useEffect(() => {
    if (showResults && animationProgress < 100) {
      const timer = setTimeout(() => {
        setAnimationProgress(prev => Math.min(100, prev + 2))
      }, 20)
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

    const padding = { top: 40, right: 40, bottom: 60, left: 60 }
    const graphWidth = rect.width - padding.left - padding.right
    const graphHeight = rect.height - padding.top - padding.bottom

    ctx.strokeStyle = "rgba(255,215,0,0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + graphWidth, y)
      ctx.stroke()
      
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      ctx.font = "11px JetBrains Mono, monospace"
      ctx.textAlign = "right"
      ctx.fillText(`${100 - i * 25}%`, padding.left - 10, y + 4)
    }

    const visiblePoints = Math.floor((riskData.length * animationProgress) / 100)
    
    if (visiblePoints > 1) {
      const gradient = ctx.createLinearGradient(padding.left, 0, padding.left + graphWidth, 0)
      riskData.slice(0, visiblePoints).forEach((point, i) => {
        const progress = i / (riskData.length - 1)
        gradient.addColorStop(progress, getRiskColor(point.score))
      })

      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      riskData.slice(0, visiblePoints).forEach((point, i) => {
        const x = padding.left + (i / (riskData.length - 1)) * graphWidth
        const y = padding.top + ((100 - point.score) / 100) * graphHeight
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevPoint = riskData[i - 1]
          const prevX = padding.left + ((i - 1) / (riskData.length - 1)) * graphWidth
          const prevY = padding.top + ((100 - prevPoint.score) / 100) * graphHeight
          const cpX = (prevX + x) / 2
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y)
        }
      })
      ctx.stroke()

      const areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + graphHeight)
      areaGradient.addColorStop(0, "rgba(255,215,0,0.15)")
      areaGradient.addColorStop(1, "rgba(255,215,0,0)")

      ctx.beginPath()
      riskData.slice(0, visiblePoints).forEach((point, i) => {
        const x = padding.left + (i / (riskData.length - 1)) * graphWidth
        const y = padding.top + ((100 - point.score) / 100) * graphHeight
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevPoint = riskData[i - 1]
          const prevX = padding.left + ((i - 1) / (riskData.length - 1)) * graphWidth
          const prevY = padding.top + ((100 - prevPoint.score) / 100) * graphHeight
          const cpX = (prevX + x) / 2
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y)
        }
      })
      
      const lastX = padding.left + ((visiblePoints - 1) / (riskData.length - 1)) * graphWidth
      ctx.lineTo(lastX, padding.top + graphHeight)
      ctx.lineTo(padding.left, padding.top + graphHeight)
      ctx.closePath()
      ctx.fillStyle = areaGradient
      ctx.fill()
    }

    riskData.slice(0, visiblePoints).forEach((point, i) => {
      if (!point.event) return
      
      const x = padding.left + (i / (riskData.length - 1)) * graphWidth
      const y = padding.top + ((100 - point.score) / 100) * graphHeight
      const color = getSeverityColor(point.event.severity)

      const pulse = Math.sin(Date.now() / 500 + i) * 0.3 + 0.7
      ctx.beginPath()
      ctx.arc(x, y, 12 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `${color}33`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.stroke()
    })

    riskData.forEach((point, i) => {
      const x = padding.left + (i / (riskData.length - 1)) * graphWidth
      const date = point.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      ctx.font = "10px JetBrains Mono, monospace"
      ctx.textAlign = "center"
      ctx.fillText(date, x, rect.height - padding.bottom + 20)
    })

  }, [riskData, animationProgress])

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
                    <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Risk Evolution Timeline
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Current Risk</div>
                        <div 
                          className="text-2xl font-mono font-bold"
                          style={{ color: getRiskColor(currentRisk) }}
                        >
                          {currentRisk}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[400px] w-full">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full"
                      style={{ display: "block" }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Timeline Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 opacity-30" />
                    
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
                                  <div className="bg-black/40 rounded p-3">
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
