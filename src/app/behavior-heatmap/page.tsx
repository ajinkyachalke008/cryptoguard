"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Clock,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Terminal
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WalletNode {
  id: string
  address: string
  x: number
  y: number
  vx: number
  vy: number
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

interface Particle {
  id: string
  fromId: string
  toId: string
  progress: number
  speed: number
  color: string
}

interface Camera {
  x: number
  y: number
  zoom: number
}

interface IntelligenceEvent {
  id: string
  type: "warning" | "info" | "critical"
  message: string
  timestamp: string
  wallet?: string
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
    const nodeCount = 6 + Math.floor(Math.random() * 6)
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = 50 + Math.random() * 40
      nodes.push({
        id: `node-${clusterIdx}-${i}`,
        address: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
        x: cluster.cx + Math.cos(angle) * radius,
        y: cluster.cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
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
    // Inner cluster transactions
    const sameCluster = nodes.filter(n => n.cluster === node.cluster && n.id !== node.id)
    if (sameCluster.length > 0) {
      const count = 1 + Math.floor(Math.random() * 2)
      for (let j = 0; j < count; j++) {
        const target = sameCluster[Math.floor(Math.random() * sameCluster.length)]
        txs.push({
          id: `tx-${i}-${j}`,
          from: node.id,
          to: target.id,
          amount: Math.random() * 10000 + 100,
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
          isSuspicious: node.isSuspicious || target.isSuspicious
        })
      }
    }

    // Cross cluster transactions
    if (Math.random() > 0.8) {
      const crossNode = nodes[Math.floor(Math.random() * nodes.length)]
      if (crossNode.cluster !== node.cluster) {
        txs.push({
          id: `tx-cross-${i}`,
          from: node.id,
          to: crossNode.id,
          amount: Math.random() * 50000 + 5000,
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
          isSuspicious: node.isSuspicious || crossNode.isSuspicious
        })
      }
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
  const [particles, setParticles] = useState<Particle[]>([])
  const [timeSlider, setTimeSlider] = useState([100])
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<WalletNode | null>(null)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const [events, setEvents] = useState<IntelligenceEvent[]>([])
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showParticles, setShowParticles] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: 1 })
  const lastTimeRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const initialNodes = generateWalletNodes()
    setNodes(initialNodes)
    setTransactions(generateTransactions(initialNodes))
    
    setEvents([
      { id: "1", type: "info", message: "System initialized. Scanning network topology...", timestamp: new Date().toLocaleTimeString() },
      { id: "2", type: "warning", message: "High volume cluster detected: Whale Cluster A", timestamp: new Date().toLocaleTimeString() },
      { id: "3", type: "critical", message: "Coordinated wash trading pattern detected in Suspicious Ring", timestamp: new Date().toLocaleTimeString() }
    ])
  }, [])

  const updateParticles = useCallback(() => {
    if (!showParticles) {
      particlesRef.current = []
      return
    }

    const visibleTxs = transactions.filter((_, i) => 
      (i / transactions.length) * 100 <= timeSlider[0]
    )

    // Add new particles occasionally
    if (Math.random() > 0.7 && visibleTxs.length > 0) {
      const tx = visibleTxs[Math.floor(Math.random() * visibleTxs.length)]
      const fromNode = nodes.find(n => n.id === tx.from)
      const toNode = nodes.find(n => n.id === tx.to)
      
      if (fromNode && toNode) {
        particlesRef.current.push({
          id: Math.random().toString(),
          fromId: tx.from,
          toId: tx.to,
          progress: 0,
          speed: 0.005 + Math.random() * 0.01,
          color: tx.isSuspicious ? "#ef4444" : "#38bdf8"
        })
      }
    }

    // Update existing particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.progress += p.speed
      return p.progress < 1
    })
  }, [transactions, nodes, timeSlider, showParticles])

  const updatePhysics = useCallback((nodes: WalletNode[]) => {
    const damping = 0.95
    const springStrength = 0.001
    const repulsionStrength = 200
    const centerForce = 0.0005

    nodes.forEach((node, i) => {
      // Repulsion between all nodes
      nodes.forEach((other, j) => {
        if (i === j) return
        const dx = node.x - other.x
        const dy = node.y - other.y
        const distSq = dx * dx + dy * dy
        const dist = Math.sqrt(distSq)
        if (dist < 1) return

        const force = repulsionStrength / distSq
        node.vx += (dx / dist) * force
        node.vy += (dy / dist) * force
      })

      // Spring force to cluster center
      const clusterCenters = [
        { cx: 200, cy: 200 },
        { cx: 500, cy: 150 },
        { cx: 350, cy: 350 },
        { cx: 600, cy: 300 },
        { cx: 150, cy: 400 }
      ]
      const center = clusterCenters[node.cluster]
      node.vx += (center.cx - node.x) * springStrength
      node.vy += (center.cy - node.y) * springStrength

      // Force towards screen center
      node.vx += (400 - node.x) * centerForce
      node.vy += (250 - node.y) * centerForce

      // Apply velocity
      node.x += node.vx
      node.y += node.vy
      node.vx *= damping
      node.vy *= damping
    })
  }, [])

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

    const draw = (time: number) => {
      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      updatePhysics(nodes)
      updateParticles()

      ctx.save()
      ctx.clearRect(0, 0, rect.width, rect.height)
      
      // Apply Camera
      ctx.translate(rect.width / 2, rect.height / 2)
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom)
      ctx.translate(-rect.width / 2 + cameraRef.current.x, -rect.height / 2 + cameraRef.current.y)

      // Draw Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.03)"
      ctx.lineWidth = 1
      const gridSize = 50
      for (let i = -rect.width; i < rect.width * 2; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, -rect.height)
        ctx.lineTo(i, rect.height * 2)
        ctx.stroke()
      }
      for (let i = -rect.height; i < rect.height * 2; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(-rect.width, i)
        ctx.lineTo(rect.width * 2, i)
        ctx.stroke()
      }

      // Draw Heatmap Layer
      if (showHeatmap) {
        nodes.forEach(node => {
          if (node.risk > 60) {
            const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 100)
            grad.addColorStop(0, node.risk > 85 ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.05)")
            grad.addColorStop(1, "transparent")
            ctx.fillStyle = grad
            ctx.fillRect(node.x - 100, node.y - 100, 200, 200)
          }
        })
      }

      const visibleTxs = transactions.filter((_, i) => 
        (i / transactions.length) * 100 <= timeSlider[0]
      )

      // Draw Edges
      visibleTxs.forEach(tx => {
        const fromNode = nodes.find(n => n.id === tx.from)
        const toNode = nodes.find(n => n.id === tx.to)
        if (!fromNode || !toNode) return

        ctx.beginPath()
        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2 - 30
        
        const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y)
        gradient.addColorStop(0, tx.isSuspicious ? "rgba(239,68,68,0.2)" : "rgba(56,189,248,0.1)")
        gradient.addColorStop(0.5, tx.isSuspicious ? "rgba(239,68,68,0.4)" : "rgba(56,189,248,0.2)")
        gradient.addColorStop(1, tx.isSuspicious ? "rgba(239,68,68,0.2)" : "rgba(56,189,248,0.1)")

        ctx.strokeStyle = gradient
        ctx.lineWidth = Math.min(tx.amount / 5000, 2) + 0.5
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
        ctx.stroke()
      })

      // Draw Particles
      particlesRef.current.forEach(p => {
        const fromNode = nodes.find(n => n.id === p.fromId)
        const toNode = nodes.find(n => n.id === p.toId)
        if (!fromNode || !toNode) return

        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2 - 30
        
        // Quadratic bezier interpolation
        const t = p.progress
        const px = (1-t)*(1-t)*fromNode.x + 2*(1-t)*t*midX + t*t*toNode.x
        const py = (1-t)*(1-t)*fromNode.y + 2*(1-t)*t*midY + t*t*toNode.y

        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw Nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id
        const isSelected = selectedNode?.id === node.id
        const radius = isHovered || isSelected ? 16 : 10
        const color = getRiskColor(node.risk)

        // Glow
        if (node.isSuspicious) {
          const pulse = Math.sin(time / 200) * 0.3 + 0.7
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 2.5 * pulse, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239, 68, 68, ${0.1 * pulse})`
          ctx.fill()
        }

        // HUD Outer Ring
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2)
        ctx.strokeStyle = `${color}44`
        ctx.setLineDash([2, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Core Node
        const gradient = ctx.createRadialGradient(node.x - radius/3, node.y - radius/3, 0, node.x, node.y, radius)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, `${color}99`)
        
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        if (isHovered || isSelected) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2)
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        if (node.label) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.font = "bold 10px JetBrains Mono, monospace"
          ctx.textAlign = "center"
          ctx.fillText(node.label.toUpperCase(), node.x, node.y - radius - 15)
        }
      })

      ctx.restore()
      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [nodes, transactions, timeSlider, hoveredNode, selectedNode, showHeatmap, showParticles, updatePhysics, updateParticles])

  useEffect(() => {
    if (isPlaying && timeSlider[0] < 100) {
      const interval = setInterval(() => {
        setTimeSlider(prev => [Math.min(100, prev[0] + 0.5)])
      }, 50)
      return () => clearInterval(interval)
    } else if (timeSlider[0] >= 100) {
      setIsPlaying(false)
    }
  }, [isPlaying, timeSlider])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x
      const dy = e.clientY - lastMousePosRef.current.y
      cameraRef.current.x += dx / cameraRef.current.zoom
      cameraRef.current.y += dy / cameraRef.current.zoom
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
      setCamera({ ...cameraRef.current })
    }

    // Node detection logic with camera transform
    const x = (e.clientX - rect.left - rect.width/2) / cameraRef.current.zoom + rect.width/2 - cameraRef.current.x
    const y = (e.clientY - rect.top - rect.height/2) / cameraRef.current.zoom + rect.height/2 - cameraRef.current.y

    const hovered = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
      return distance < 20 / cameraRef.current.zoom
    })
    setHoveredNode(hovered || null)
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(cameraRef.current.zoom * delta, 0.5), 3)
    cameraRef.current.zoom = newZoom
    setCamera({ ...cameraRef.current })
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    const x = (e.clientX - rect.left - rect.width/2) / cameraRef.current.zoom + rect.width/2 - cameraRef.current.x
    const y = (e.clientY - rect.top - rect.height/2) / cameraRef.current.zoom + rect.height/2 - cameraRef.current.y

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
      return distance < 20 / cameraRef.current.zoom
    })

    setSelectedNode(clickedNode || null)
    if (clickedNode) {
      const newEvent: IntelligenceEvent = {
        id: Math.random().toString(),
        type: clickedNode.risk > 70 ? "warning" : "info",
        message: `Analyzing wallet ${clickedNode.address.slice(0, 8)}... Risk Factor: ${Math.round(clickedNode.risk)}%`,
        timestamp: new Date().toLocaleTimeString(),
        wallet: clickedNode.address
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 9)])
    }
  }

  const handleScan = () => {
    setIsScanning(true)
    setTimeSlider([0])
    setTimeout(() => {
      const newNodes = generateWalletNodes()
      setNodes(newNodes)
      setTransactions(generateTransactions(newNodes))
      setIsScanning(false)
      setShowResults(true)
      setIsPlaying(true)
      setEvents(prev => [
        { id: Date.now().toString(), type: "info", message: "Scan complete. Network topology updated.", timestamp: new Date().toLocaleTimeString() },
        ...prev
      ])
    }, 2000)
  }

  const suspiciousCount = nodes.filter(n => n.isSuspicious).length
  const clusterCount = new Set(nodes.map(n => n.cluster)).size

  return (
    <div className="min-h-screen bg-[#05060a] text-white selection:bg-orange-500/30">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Wallet Behavior Heatmap</h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  AI-Powered Network Forensics v2.4
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-500/5 border-orange-500/20 text-orange-400 py-1.5 px-3">
              <RefreshCw className="w-3 h-3 mr-2 animate-spin-slow" />
              Live Monitoring
            </Badge>
          </div>
        </div>

        <Card className="border-orange-500/20 bg-black/60 backdrop-blur-xl mb-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                <Input
                  placeholder="Enter token contract or wallet address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 bg-black/40 border-orange-500/20 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 h-12 rounded-xl transition-all"
                />
              </div>
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-orange-500 hover:bg-orange-400 text-black font-bold h-12 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Graph...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2 fill-current" />
                    Deep Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-orange-500/20 bg-black/60 backdrop-blur-sm overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-orange-500/10 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                      <Layers className="w-5 h-5 text-orange-400" />
                      Interactive Forensic Canvas
                    </CardTitle>
                    <div className="flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded-full border border-orange-500/10">
                      <button 
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`text-[10px] uppercase font-bold tracking-widest ${showHeatmap ? 'text-orange-400' : 'text-gray-600'}`}
                      >
                        Heatmap
                      </button>
                      <button 
                        onClick={() => setShowParticles(!showParticles)}
                        className={`text-[10px] uppercase font-bold tracking-widest ${showParticles ? 'text-cyan-400' : 'text-gray-600'}`}
                      >
                        Flow
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[600px] w-full bg-[#0a0b0e] cursor-grab active:cursor-grabbing group/canvas">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onWheel={handleWheel}
                      onClick={handleCanvasClick}
                    />

                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-black/60 border border-white/10 text-white rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
                        onClick={() => {
                          const newZoom = Math.min(cameraRef.current.zoom + 0.2, 3)
                          cameraRef.current.zoom = newZoom
                          setCamera({ ...cameraRef.current })
                        }}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-black/60 border border-white/10 text-white rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
                        onClick={() => {
                          const newZoom = Math.max(cameraRef.current.zoom - 0.2, 0.5)
                          cameraRef.current.zoom = newZoom
                          setCamera({ ...cameraRef.current })
                        }}
                      >
                        <Minimize2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-black/60 border border-white/10 text-white rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
                        onClick={() => {
                          cameraRef.current = { x: 0, y: 0, zoom: 1 }
                          setCamera({ ...cameraRef.current })
                        }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Scale Legend */}
                    <div className="absolute top-6 left-6 p-3 bg-black/60 backdrop-blur-md border border-white/5 rounded-lg pointer-events-none">
                      <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-tighter">Network Density</div>
                      <div className="h-1.5 w-32 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
                    </div>
                    
                    {hoveredNode && !isDraggingRef.current && (
                      <div 
                        className="absolute bg-black/95 border border-orange-500/50 rounded-xl p-4 pointer-events-none z-50 min-w-[240px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                        style={{ 
                          left: Math.min(hoveredNode.x * camera.zoom + camera.x + 20, 500),
                          top: hoveredNode.y * camera.zoom + camera.y - 40
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-mono text-xs text-orange-400 font-bold">{hoveredNode.address}</div>
                          <Badge className="bg-orange-500/10 text-orange-400 border-none text-[10px]">
                            {hoveredNode.risk > 70 ? 'SUSPICIOUS' : 'SECURE'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Risk Matrix</span>
                            <span className="text-xs font-bold font-mono" style={{ color: getRiskColor(hoveredNode.risk) }}>
                              {Math.round(hoveredNode.risk)}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${hoveredNode.risk}%` }}
                              className="h-full"
                              style={{ backgroundColor: getRiskColor(hoveredNode.risk) }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <div className="text-[9px] text-gray-500 uppercase tracking-tighter">Volume</div>
                              <div className="text-xs font-mono font-bold">${hoveredNode.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-500 uppercase tracking-tighter">Transactions</div>
                              <div className="text-xs font-mono font-bold">{hoveredNode.transactions}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 border-t border-orange-500/10 bg-black/40">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white hover:bg-white/5"
                          onClick={() => setTimeSlider([0])}
                        >
                          <SkipBack className="w-5 h-5" />
                        </Button>
                        <Button 
                          size="lg" 
                          className={`w-12 h-12 rounded-full ${isPlaying ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-white/10 text-white'} transition-all`}
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white hover:bg-white/5"
                          onClick={() => setTimeSlider([100])}
                        >
                          <SkipForward className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                          <span>Playback Timeline</span>
                          <span className="text-orange-400 font-bold">{Math.round(timeSlider[0])}% Completed</span>
                        </div>
                        <Slider
                          value={timeSlider}
                          onValueChange={setTimeSlider}
                          max={100}
                          step={0.1}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Intelligence Feed */}
              <Card className="border-orange-500/20 bg-black/60 backdrop-blur-sm shadow-xl">
                <CardHeader className="py-4 border-b border-orange-500/10 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-orange-500" />
                    Live Intelligence Log
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                    {events.length} EVENTS BUFFERED
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 overflow-y-auto scrollbar-hide font-mono text-xs p-4 space-y-3">
                    <AnimatePresence initial={false}>
                      {events.map((event) => (
                        <motion.div 
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex gap-3 p-2 rounded ${
                            event.type === 'critical' ? 'bg-red-500/10 border-l-2 border-red-500' :
                            event.type === 'warning' ? 'bg-orange-500/10 border-l-2 border-orange-500' :
                            'bg-blue-500/5 border-l-2 border-blue-500/50'
                          }`}
                        >
                          <span className="text-gray-600 shrink-0">[{event.timestamp}]</span>
                          <span className={
                            event.type === 'critical' ? 'text-red-400 font-bold' :
                            event.type === 'warning' ? 'text-orange-400' :
                            'text-blue-400'
                          }>
                            {event.message}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-orange-500/20 bg-black/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <CardHeader>
                  <CardTitle className="text-lg text-white font-bold">Network Composition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-3xl font-bold text-white font-mono">{nodes.length}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total Entities</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-3xl font-bold text-orange-400 font-mono">{clusterCount}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Core Clusters</div>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="text-3xl font-bold text-red-500 font-mono">{suspiciousCount}</div>
                      <div className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mt-1">High Risk</div>
                    </div>
                    <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                      <div className="text-3xl font-bold text-cyan-400 font-mono">{transactions.length}</div>
                      <div className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-widest mt-1">Active Links</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Risk Distribution Matrix</div>
                    {[
                      { label: "Level 4: Critical", count: nodes.filter(n => n.risk > 85).length, color: "#dc2626", p: (nodes.filter(n => n.risk > 85).length / nodes.length) * 100 },
                      { label: "Level 3: High", count: nodes.filter(n => n.risk > 70 && n.risk <= 85).length, color: "#ef4444", p: (nodes.filter(n => n.risk > 70 && n.risk <= 85).length / nodes.length) * 100 },
                      { label: "Level 2: Moderate", count: nodes.filter(n => n.risk > 50 && n.risk <= 70).length, color: "#f59e0b", p: (nodes.filter(n => n.risk > 50 && n.risk <= 70).length / nodes.length) * 100 },
                      { label: "Level 1: Nominal", count: nodes.filter(n => n.risk <= 50).length, color: "#22c55e", p: (nodes.filter(n => n.risk <= 50).length / nodes.length) * 100 }
                    ].map(item => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{item.label}</span>
                          <span className="text-xs font-mono font-bold text-white">{item.count}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.p}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence mode="wait">
                {selectedNode ? (
                  <motion.div
                    key="selected"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <Card className="border-orange-500/50 bg-orange-500/5 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-orange-400 font-bold">Entity Profile</CardTitle>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={() => setSelectedNode(null)}>
                            <Minimize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-orange-300 mb-4 break-all border border-orange-500/20">
                          {selectedNode.address}
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Risk Assessment</span>
                            <span className="text-2xl font-bold font-mono" style={{ color: getRiskColor(selectedNode.risk) }}>
                              {Math.round(selectedNode.risk)}%
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase font-bold">Total Flow</span>
                              <div className="text-sm font-bold text-white font-mono">${selectedNode.volume.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase font-bold">Txs</span>
                              <div className="text-sm font-bold text-white font-mono">{selectedNode.transactions}</div>
                            </div>
                          </div>

                          <div className="pt-4 space-y-2">
                            <Button className="w-full bg-orange-500 text-black font-bold h-11 rounded-lg hover:bg-orange-400">
                              Trace Origin Flow
                            </Button>
                            <Button variant="outline" className="w-full border-orange-500/30 text-orange-400 bg-transparent h-11 rounded-lg hover:bg-orange-500/10">
                              Export Forensic Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signals"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Neural Risk Signals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { signal: "Cluster Synchronicity", value: "0.98", risk: "critical" },
                          { signal: "Wash Trading Index", value: "High", risk: "critical" },
                          { signal: "Entropy Delta", value: "-14.2%", risk: "high" },
                          { signal: "Hop Distance", value: "1.2 Avg", risk: "medium" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-xs text-gray-400 font-medium">{item.signal}</span>
                            <span className={`text-xs font-mono font-bold ${
                              item.risk === 'critical' ? 'text-red-400' :
                              item.risk === 'high' ? 'text-orange-400' :
                              'text-yellow-400'
                            }`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                        <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                          <p className="text-[10px] text-red-400 leading-relaxed font-medium">
                            CRITICAL: Wallet clusters exhibit high temporal alignment consistent with automated Sybil attack patterns. Recommend immediate blacklisting of identified nodes.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
