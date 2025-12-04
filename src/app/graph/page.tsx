"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Eye,
  Plus,
  Download,
  Filter,
  Activity,
  Wallet,
  ArrowRight,
  Network,
  Layers,
  Play,
  Pause
} from "lucide-react"
import { toast } from "sonner"
import * as d3 from "d3"

type RiskLevel = "low" | "medium" | "high" | "critical"

interface GraphNode {
  id: string
  address: string
  riskScore: number
  riskLevel: RiskLevel
  volume: number
  transactionCount: number
  label?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value: number
  transactionCount: number
  hashes: string[]
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// Generate mock graph data
function generateGraphData(centerAddress: string, depth: number): GraphData {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const nodeMap = new Set<string>()

  const riskLevels: RiskLevel[] = ["low", "medium", "high", "critical"]
  
  // Center node
  const centerNode: GraphNode = {
    id: centerAddress,
    address: centerAddress,
    riskScore: Math.floor(Math.random() * 100),
    riskLevel: riskLevels[Math.floor(Math.random() * 4)],
    volume: Math.floor(Math.random() * 1000000) + 100000,
    transactionCount: Math.floor(Math.random() * 100) + 20,
    label: "Target"
  }
  centerNode.riskLevel = centerNode.riskScore < 25 ? "low" : centerNode.riskScore < 50 ? "medium" : centerNode.riskScore < 75 ? "high" : "critical"
  nodes.push(centerNode)
  nodeMap.add(centerAddress)

  // Generate connected nodes
  const generateAddress = () => `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
  
  let currentLevel = [centerAddress]
  
  for (let d = 0; d < depth; d++) {
    const nextLevel: string[] = []
    const connectionsPerNode = Math.max(2, 5 - d)
    
    for (const parentId of currentLevel) {
      const numConnections = Math.floor(Math.random() * connectionsPerNode) + 1
      
      for (let i = 0; i < numConnections; i++) {
        const newAddress = generateAddress()
        if (!nodeMap.has(newAddress)) {
          const riskScore = Math.floor(Math.random() * 100)
          const newNode: GraphNode = {
            id: newAddress,
            address: newAddress,
            riskScore,
            riskLevel: riskScore < 25 ? "low" : riskScore < 50 ? "medium" : riskScore < 75 ? "high" : "critical",
            volume: Math.floor(Math.random() * 500000) + 1000,
            transactionCount: Math.floor(Math.random() * 50) + 1
          }
          
          // Add labels for special nodes
          if (riskScore > 80) newNode.label = "🚨 High Risk"
          else if (newNode.volume > 400000) newNode.label = "💰 High Volume"
          
          nodes.push(newNode)
          nodeMap.add(newAddress)
          nextLevel.push(newAddress)
        }
        
        links.push({
          source: parentId,
          target: newAddress,
          value: Math.floor(Math.random() * 100000) + 1000,
          transactionCount: Math.floor(Math.random() * 20) + 1,
          hashes: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
            `0x${Math.random().toString(16).slice(2, 10)}`
          )
        })
      }
    }
    currentLevel = nextLevel
  }

  return { nodes, links }
}

const riskColors = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444"
}

export default function GraphPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [address, setAddress] = useState(searchParams.get("address") || "")
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [depth, setDepth] = useState([2])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all")
  const [zoom, setZoom] = useState(1)

  const handleExplore = useCallback(() => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address")
      return
    }
    const data = generateGraphData(address, depth[0])
    setGraphData(data)
    setSelectedNode(null)
    setSelectedLink(null)
    toast.success(`Graph loaded with ${data.nodes.length} nodes`)
  }, [address, depth])

  // Initialize graph when address is provided via URL
  useEffect(() => {
    const urlAddress = searchParams.get("address")
    if (urlAddress && !graphData) {
      setAddress(urlAddress)
      const data = generateGraphData(urlAddress, depth[0])
      setGraphData(data)
    }
  }, [searchParams, graphData, depth])

  // D3 force simulation
  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight || 600

    // Filter nodes by risk if needed
    const filteredNodes = riskFilter === "all" 
      ? graphData.nodes 
      : graphData.nodes.filter(n => n.riskLevel === riskFilter)
    
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = graphData.links.filter(l => {
      const sourceId = typeof l.source === "string" ? l.source : l.source.id
      const targetId = typeof l.target === "string" ? l.target : l.target.id
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)
    })

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        setZoom(event.transform.k)
      })

    svg.call(zoomBehavior)

    const g = svg.append("g")

    // Arrow marker for directed edges
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#ffd700")
      .style("opacity", 0.6)

    // Force simulation
    const simulation = d3.forceSimulation(filteredNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(filteredLinks)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.5))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40))

    // Links
    const link = g.append("g")
      .selectAll("line")
      .data(filteredLinks)
      .join("line")
      .attr("stroke", "#ffd700")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => Math.min(Math.sqrt(d.value / 10000) + 1, 6))
      .attr("marker-end", "url(#arrowhead)")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation()
        setSelectedLink(d)
        setSelectedNode(null)
      })
      .on("mouseover", function() {
        d3.select(this).attr("stroke-opacity", 0.8).attr("stroke", "#fff")
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-opacity", 0.4).attr("stroke", "#ffd700")
      })

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(filteredNodes)
      .join("g")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }))
      .on("click", (event, d) => {
        event.stopPropagation()
        setSelectedNode(d)
        setSelectedLink(null)
      })

    // Node circles
    node.append("circle")
      .attr("r", (d) => Math.min(Math.sqrt(d.volume / 10000) + 10, 30))
      .attr("fill", (d) => riskColors[d.riskLevel])
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.5)

    // Node labels
    node.append("text")
      .attr("dy", (d) => Math.min(Math.sqrt(d.volume / 10000) + 10, 30) + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("opacity", 0.8)
      .text((d) => d.label || `${d.address.slice(0, 6)}...`)

    // Pulse animation for high-risk nodes
    node.filter((d) => d.riskLevel === "critical")
      .append("circle")
      .attr("r", (d) => Math.min(Math.sqrt(d.volume / 10000) + 10, 30) + 5)
      .attr("fill", "none")
      .attr("stroke", riskColors.critical)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .attr("class", "pulse-ring")

    // Simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Click on background to deselect
    svg.on("click", () => {
      setSelectedNode(null)
      setSelectedLink(null)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [graphData, riskFilter])

  // Live mode simulation
  useEffect(() => {
    if (!isLive || !graphData) return

    const interval = setInterval(() => {
      // Simulate new transaction
      const randomNodeIndex = Math.floor(Math.random() * graphData.nodes.length)
      const node = graphData.nodes[randomNodeIndex]
      toast(`New activity on ${node.address.slice(0, 10)}...`, {
        icon: "⚡",
        duration: 2000
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isLive, graphData])

  const handleZoomIn = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.3
    )
  }

  const handleZoomOut = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.7
    )
  }

  const handleReset = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    )
    setZoom(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-[1600px] px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Graph Explorer
          </h1>
          <p className="text-gray-400 mt-2">Visualize wallet relationships and money flow</p>
        </div>

        {/* Search & Controls */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500/70" />
                <Input
                  placeholder="Enter wallet address to explore..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                  className="pl-10 bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400 whitespace-nowrap">Depth: {depth[0]}</Label>
                  <Slider
                    value={depth}
                    onValueChange={setDepth}
                    min={1}
                    max={3}
                    step={1}
                    className="w-20"
                  />
                </div>
                <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as typeof riskFilter)}>
                  <SelectTrigger className="w-[120px] bg-black/40 border-yellow-500/30">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-yellow-500/30">
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExplore}
                  className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Explore
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Graph Canvas */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
              <div className="flex items-center gap-4">
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                  <Network className="w-3 h-3 mr-1" />
                  {graphData?.nodes.length || 0} Nodes
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                  <ArrowRight className="w-3 h-3 mr-1" />
                  {graphData?.links.length || 0} Edges
                </Badge>
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                  Zoom: {Math.round(zoom * 100)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLive(!isLive)}
                  className={isLive ? "text-green-400 hover:text-green-300" : "text-gray-400 hover:text-yellow-300"}
                >
                  {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-gray-400 hover:text-yellow-300">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-gray-400 hover:text-yellow-300">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 hover:text-yellow-300">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div ref={containerRef} className="relative h-[600px] bg-black/20">
              {!graphData ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Network className="w-16 h-16 text-yellow-500/30 mb-4" />
                  <p className="text-gray-400">Enter a wallet address to explore connections</p>
                </div>
              ) : (
                <svg ref={svgRef} className="w-full h-full" />
              )}
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-black/80 border border-yellow-500/30 text-xs">
                <p className="text-gray-400 mb-2 font-medium">Risk Levels</p>
                <div className="space-y-1">
                  {Object.entries(riskColors).map(([level, color]) => (
                    <div key={level} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-gray-300 capitalize">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Indicator */}
              {isLive && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">LIVE</span>
                </div>
              )}
            </div>
          </Card>

          {/* Details Panel */}
          <div className="space-y-6">
            {/* Node Details */}
            {selectedNode && (
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-300 text-lg flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: riskColors[selectedNode.riskLevel] }} 
                    />
                    Wallet Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <code className="text-sm text-yellow-300 break-all">{selectedNode.address}</code>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                      <p className="text-xl font-bold" style={{ color: riskColors[selectedNode.riskLevel] }}>
                        {selectedNode.riskScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                      <Badge className={`${
                        selectedNode.riskLevel === "low" ? "bg-green-500/20 text-green-400 border-green-500/50" :
                        selectedNode.riskLevel === "medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                        selectedNode.riskLevel === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
                        "bg-red-500/20 text-red-400 border-red-500/50"
                      }`}>
                        {selectedNode.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Volume</p>
                      <p className="text-sm text-gray-300">${selectedNode.volume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Transactions</p>
                      <p className="text-sm text-gray-300">{selectedNode.transactionCount}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => router.push(`/scanner?address=${selectedNode.address}`)}
                      className="w-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Scan Wallet
                    </Button>
                    <Button
                      onClick={() => toast.success("Added to watchlist")}
                      variant="outline"
                      className="w-full border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Link Details */}
            {selectedLink && (
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-300 text-lg flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Transaction Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <code className="text-xs text-gray-300">
                      {typeof selectedLink.source === "string" ? selectedLink.source : selectedLink.source.address}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <code className="text-xs text-gray-300">
                      {typeof selectedLink.target === "string" ? selectedLink.target : selectedLink.target.address}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Value</p>
                      <p className="text-lg font-bold text-yellow-400">${selectedLink.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Transactions</p>
                      <p className="text-lg font-bold text-gray-300">{selectedLink.transactionCount}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Transaction Hashes</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedLink.hashes.map((hash, i) => (
                        <code key={i} className="block text-xs text-gray-400 hover:text-yellow-300 cursor-pointer">
                          {hash}...
                        </code>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            {graphData && !selectedNode && !selectedLink && (
              <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-300 text-lg">Graph Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Nodes</span>
                    <span className="text-yellow-300 font-semibold">{graphData.nodes.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Edges</span>
                    <span className="text-yellow-300 font-semibold">{graphData.links.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">High Risk Nodes</span>
                    <span className="text-red-400 font-semibold">
                      {graphData.nodes.filter(n => n.riskLevel === "high" || n.riskLevel === "critical").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Depth</span>
                    <span className="text-gray-300 font-semibold">{depth[0]} hops</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Options */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-300 text-lg">Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                  size="sm"
                  disabled={!graphData}
                  onClick={() => toast.success("Graph exported as PNG")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PNG
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                  size="sm"
                  disabled={!graphData}
                  onClick={() => router.push(`/reports?address=${address}&type=graph`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Full Report (PDF)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
