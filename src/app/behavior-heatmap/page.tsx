"use client"

import { useState, useEffect, useRef } from "react"
import NavBar from "@/components/NavBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { 
  Activity, 
  Search,
  Zap,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertTriangle,
  Users,
  ArrowRight,
  Clock
} from "lucide-react"

interface WalletNode {
  id: string
  address: string
  x: number
  y: number
  risk: number
  cluster: number
  transactions: number
  volume: number
  isSuspicious: boolean
  label?: string
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: Date
  isSuspicious: boolean
}

const generateWalletNodes = (): WalletNode[] => {
  const clusters = [
    { cx: 200, cy: 200, risk: 85, label: "Whale Cluster A" },
    { cx: 500, cy: 150, risk: 45, label: "Exchange Hot Wallet" },
    { cx: 350, cy: 350, risk: 92, label: "Suspicious Ring" },
    { cx: 600, cy: 300, risk: 30, label: "Retail Holders" },
    { cx: 150, cy: 400, risk: 78, label: "Dev Wallets" }
  ]

  const nodes: WalletNode[] = []
  
  clusters.forEach((cluster, clusterIdx) => {
    const nodeCount = 4 + Math.floor(Math.random() * 4)
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = 40 + Math.random() * 30
      nodes.push({
        id: `node-${clusterIdx}-${i}`,
        address: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
        x: cluster.cx + Math.cos(angle) * radius,
        y: cluster.cy + Math.sin(angle) * radius,
        risk: cluster.risk + (Math.random() - 0.5) * 20,
        cluster: clusterIdx,
        transactions: Math.floor(Math.random() * 500) + 50,
        volume: Math.random() * 100000 + 1000,
        isSuspicious: cluster.risk > 70,
        label: i === 0 ? cluster.label : undefined
      })
    }
  })

  return nodes
}

const generateTransactions = (nodes: WalletNode[]): Transaction[] => {
  const txs: Transaction[] = []
  
  nodes.forEach((node, i) => {
    const sameCluster = nodes.filter(n => n.cluster === node.cluster && n.id !== node.id)
    if (sameCluster.length > 0) {
      const target = sameCluster[Math.floor(Math.random() * sameCluster.length)]
      txs.push({
        id: `tx-${i}`,
        from: node.id,
        to: target.id,
        amount: Math.random() * 10000 + 100,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
        isSuspicious: node.isSuspicious || target.isSuspicious
      })
    }
  })

  return txs
}

const getRiskColor = (risk: number): string => {
  if (risk < 30) return "#22c55e"
  if (risk < 50) return "#84cc16"
  if (risk < 70) return "#f59e0b"
  if (risk < 85) return "#ef4444"
  return "#dc2626"
}

export default function BehaviorHeatmapPage() {
  const [address, setAddress] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [nodes, setNodes] = useState<WalletNode[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [timeSlider, setTimeSlider] = useState([100])
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<WalletNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    setNodes(generateWalletNodes())
  }, [])

  useEffect(() => {
    if (nodes.length > 0) {
      setTransactions(generateTransactions(nodes))
    }
  }, [nodes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      ctx.strokeStyle = "rgba(255,215,0,0.05)"
      ctx.lineWidth = 1
      for (let i = 0; i < rect.width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, rect.height)
        ctx.stroke()
      }
      for (let i = 0; i < rect.height; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(rect.width, i)
        ctx.stroke()
      }

      const visibleTxs = transactions.filter((_, i) => 
        (i / transactions.length) * 100 <= timeSlider[0]
      )

      visibleTxs.forEach(tx => {
        const fromNode = nodes.find(n => n.id === tx.from)
        const toNode = nodes.find(n => n.id === tx.to)
        if (!fromNode || !toNode) return

        const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y)
        gradient.addColorStop(0, tx.isSuspicious ? "rgba(239,68,68,0.6)" : "rgba(56,189,248,0.4)")
        gradient.addColorStop(1, tx.isSuspicious ? "rgba(239,68,68,0.2)" : "rgba(56,189,248,0.1)")
        
        ctx.beginPath()
        ctx.strokeStyle = gradient
        ctx.lineWidth = Math.min(tx.amount / 2000, 3) + 1
        ctx.moveTo(fromNode.x, fromNode.y)
        
        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2 - 20
        ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
        ctx.stroke()

        const angle = Math.atan2(toNode.y - midY, toNode.x - midX)
        const arrowSize = 8
        ctx.beginPath()
        ctx.fillStyle = tx.isSuspicious ? "rgba(239,68,68,0.8)" : "rgba(56,189,248,0.6)"
        ctx.moveTo(toNode.x, toNode.y)
        ctx.lineTo(
          toNode.x - arrowSize * Math.cos(angle - Math.PI / 6),
          toNode.y - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          toNode.x - arrowSize * Math.cos(angle + Math.PI / 6),
          toNode.y - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fill()
      })

      nodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id
        const isSelected = selectedNode?.id === node.id
        const baseRadius = 12 + (node.transactions / 100)
        const radius = isHovered || isSelected ? baseRadius * 1.3 : baseRadius

        if (node.isSuspicious) {
          const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 2 * pulse, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239,68,68,${0.2 * pulse})`
          ctx.fill()
        }

        const gradient = ctx.createRadialGradient(
          node.x - radius * 0.3, node.y - radius * 0.3, 0,
          node.x, node.y, radius
        )
        const color = getRiskColor(node.risk)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, `${color}88`)

        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        if (isHovered || isSelected) {
          ctx.strokeStyle = "#ffd700"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        if (node.label) {
          ctx.fillStyle = "rgba(255,255,255,0.9)"
          ctx.font = "11px Inter, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(node.label, node.x, node.y - radius - 8)
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [nodes, transactions, timeSlider, hoveredNode, selectedNode])

  useEffect(() => {
    if (isPlaying && timeSlider[0] < 100) {
      const interval = setInterval(() => {
        setTimeSlider(prev => [Math.min(100, prev[0] + 1)])
      }, 100)
      return () => clearInterval(interval)
    } else if (timeSlider[0] >= 100) {
      setIsPlaying(false)
    }
  }, [isPlaying, timeSlider])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
      return distance < 20
    })

    setSelectedNode(clickedNode || null)
  }

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
      return distance < 20
    })

    setHoveredNode(hovered || null)
  }

  const handleScan = () => {
    setIsScanning(true)
    setTimeSlider([0])
    setTimeout(() => {
      setNodes(generateWalletNodes())
      setIsScanning(false)
      setShowResults(true)
      setIsPlaying(true)
    }, 2000)
  }

  const suspiciousCount = nodes.filter(n => n.isSuspicious).length
  const clusterCount = new Set(nodes.map(n => n.cluster)).size

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Wallet Behavior Heatmap</h1>
              <p className="text-gray-400 text-sm">Visualize manipulation via wallet activity patterns</p>
            </div>
          </div>
        </div>

        <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Enter token contract to analyze wallet behavior..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-orange-500 hover:bg-orange-400 text-black font-semibold"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Behavior
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-yellow-300 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Wallet Cluster Visualization
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-400">Low Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-gray-400">Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-400">High Risk</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[500px] w-full">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full cursor-crosshair"
                      style={{ display: "block" }}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMove}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                    
                    {hoveredNode && (
                      <div 
                        className="absolute bg-black/90 border border-yellow-500/50 rounded-lg p-3 pointer-events-none z-10 min-w-[200px]"
                        style={{ 
                          left: Math.min(hoveredNode.x + 20, 550),
                          top: hoveredNode.y - 40
                        }}
                      >
                        <div className="font-mono text-xs text-yellow-300 mb-1">{hoveredNode.address}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Risk:</span>
                            <span className="ml-1 font-bold" style={{ color: getRiskColor(hoveredNode.risk) }}>
                              {Math.round(hoveredNode.risk)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Txs:</span>
                            <span className="ml-1 text-white">{hoveredNode.transactions}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Volume:</span>
                            <span className="ml-1 text-white">${hoveredNode.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-yellow-500/20 bg-black/40">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-yellow-500/50"
                          onClick={() => setTimeSlider([0])}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-yellow-500 text-black"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-yellow-500/50"
                          onClick={() => setTimeSlider([100])}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <Slider
                          value={timeSlider}
                          onValueChange={setTimeSlider}
                          max={100}
                          step={1}
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="text-sm text-gray-400 min-w-[60px]">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {Math.round(timeSlider[0])}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Detected Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Wash Trading Loop",
                        description: "Circular transaction pattern detected between 8 wallets",
                        severity: "critical",
                        wallets: 8,
                        volume: "$2.1M"
                      },
                      {
                        title: "Synchronized Dumps",
                        description: "5 wallets executed sells within 14-second window",
                        severity: "high",
                        wallets: 5,
                        volume: "$847K"
                      },
                      {
                        title: "Sybil Attack Pattern",
                        description: "23 wallets funded from single source, same amounts",
                        severity: "high",
                        wallets: 23,
                        volume: "$9.6K"
                      },
                      {
                        title: "Exchange Staging",
                        description: "Large transfers to exchange hot wallet in preparation",
                        severity: "medium",
                        wallets: 3,
                        volume: "$1.4M"
                      }
                    ].map((pattern, i) => (
                      <div 
                        key={i}
                        className={`p-4 rounded-lg border ${
                          pattern.severity === "critical" ? "bg-red-500/10 border-red-500/30" :
                          pattern.severity === "high" ? "bg-orange-500/10 border-orange-500/30" :
                          "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{pattern.title}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              pattern.severity === "critical" ? "border-red-500 text-red-400" :
                              pattern.severity === "high" ? "border-orange-500 text-orange-400" :
                              "border-yellow-500 text-yellow-400"
                            }
                          >
                            {pattern.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{pattern.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span><Users className="w-3 h-3 inline mr-1" />{pattern.wallets} wallets</span>
                          <span>Volume: {pattern.volume}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-yellow-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-300">Network Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{nodes.length}</div>
                      <div className="text-xs text-gray-500">Total Wallets</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{clusterCount}</div>
                      <div className="text-xs text-gray-500">Clusters</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">{suspiciousCount}</div>
                      <div className="text-xs text-gray-500">Suspicious</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-cyan-400">{transactions.length}</div>
                      <div className="text-xs text-gray-500">Transactions</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Risk Distribution</div>
                    {[
                      { label: "Critical (>85%)", count: nodes.filter(n => n.risk > 85).length, color: "#dc2626" },
                      { label: "High (70-85%)", count: nodes.filter(n => n.risk > 70 && n.risk <= 85).length, color: "#ef4444" },
                      { label: "Medium (50-70%)", count: nodes.filter(n => n.risk > 50 && n.risk <= 70).length, color: "#f59e0b" },
                      { label: "Low (<50%)", count: nodes.filter(n => n.risk <= 50).length, color: "#22c55e" }
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-sm font-mono text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedNode && (
                <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-cyan-400">Selected Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm text-white mb-4 break-all">{selectedNode.address}</div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Risk Score</span>
                        <span className="font-bold" style={{ color: getRiskColor(selectedNode.risk) }}>
                          {Math.round(selectedNode.risk)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transactions</span>
                        <span className="text-white">{selectedNode.transactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volume</span>
                        <span className="text-white">${selectedNode.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <Badge variant={selectedNode.isSuspicious ? "destructive" : "outline"}>
                          {selectedNode.isSuspicious ? "Suspicious" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30">
                      Deep Analyze <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    AI Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { signal: "Transaction Entropy", value: "Low (0.23)", risk: "high" },
                      { signal: "Amount Similarity", value: "94.7%", risk: "critical" },
                      { signal: "Temporal Alignment", value: "Strong", risk: "high" },
                      { signal: "Exchange Symmetry", value: "Detected", risk: "medium" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded">
                        <span className="text-sm text-gray-400">{item.signal}</span>
                        <span className={`text-sm font-mono ${
                          item.risk === "critical" ? "text-red-400" :
                          item.risk === "high" ? "text-orange-400" :
                          "text-yellow-400"
                        }`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    These signals indicate high probability of coordinated manipulation across the detected wallet clusters.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
