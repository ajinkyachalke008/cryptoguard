"use client"

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react"
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
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
  Pause,
  Loader2,
  Shield,
  AlertTriangle,
  Flame,
  Globe2,
  Sparkles,
  GitFork,
  Target,
  Compass,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Crosshair,
  Share2,
  Info,
  Clock,
  History,
  TrendingDown,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  Boxes,
  Maximize,
  SlidersHorizontal,
  FileSpreadsheet,
  Dices,
  ListTodo,
  FileText,
  Radio
} from "lucide-react"
import { toast } from "sonner"
import * as d3 from "d3"

type RiskLevel = "low" | "medium" | "high" | "critical"
type GraphViewMode = "2d-force" | "3d-spatial" | "hierarchical-tree" | "radial-ego" | "risk-matrix"
type TemporalStage = "all" | "genesis" | "target" | "mixers" | "peeling" | "offramps"

interface GraphNode {
  id: string
  address: string
  label: string
  nodeType?: "target" | "mixer" | "cex" | "bridge" | "defi" | "peel_hop" | "victim" | "contract" | "cold_wallet" | "otc_broker" | "drainer" | "sybil_node" | "validator" | "darknet" | "ransomware" | "lazarus_proxy" | "sanctioned_pool" | "flash_loan_pool" | "casino" | "market_maker" | "multisig"
  riskScore: number
  riskLevel: RiskLevel
  volume: number
  transactionCount: number
  country?: string
  nodeExplanation?: string
  behavioralTag?: string
  entityRole?: string
  tier?: string
  sanctionDetails?: string
  contractVerified?: boolean
  layer?: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value: number
  token?: string
  transactionCount: number
  hashes: string[]
  patternLabel?: string
  flowReason?: string
  riskLevel?: RiskLevel
  stage?: "ingress" | "core" | "anonymize" | "peel" | "egress"
}

interface ForensicActionPlan {
  actionId: string
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  title: string
  description: string
  targetEntity: string
  legalJurisdiction?: string
}

interface GraphStats {
  totalNodes: number
  totalLinks: number
  riskScore: number
  riskLevel: RiskLevel
  fraudPattern: string
  patternCategory?: string
  patternSummary?: string
  remediationAdvice?: string
  regulatoryImpact?: string
  detectedMixers: number
  bridgesUsed: number
  cexDepositNodes: number
  peelHops?: number
  victimsCount?: number
  depth?: number
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  stats?: GraphStats
  actionPlan?: ForensicActionPlan[]
  target?: any
}

const riskColors: Record<string, string> = {
  low: "#00e676",
  medium: "#ffdd57",
  high: "#ff8c00",
  critical: "#ff2020"
}

const nodeTypeColors: Record<string, string> = {
  target: "#ffd700",
  mixer: "#a855f7",
  bridge: "#06b6d4",
  cex: "#10b981",
  defi: "#3b82f6",
  victim: "#f43f5e",
  peel_hop: "#ef4444",
  contract: "#ec4899",
  cold_wallet: "#94a3b8",
  otc_broker: "#8b5cf6",
  drainer: "#dc2626",
  sybil_node: "#f59e0b",
  validator: "#14b8a6",
  darknet: "#7f1d1d",
  ransomware: "#b91c1c",
  lazarus_proxy: "#e11d48",
  sanctioned_pool: "#9333ea",
  flash_loan_pool: "#0284c7",
  casino: "#d97706",
  market_maker: "#059669",
  multisig: "#38bdf8"
}

// ═══════════════════════════════════════════════════════════
// 24+ EXPANDED FORENSIC COMBINATIONS & CRIME PRESETS
// ═══════════════════════════════════════════════════════════
const PRESET_GROUPS = [
  {
    category: "🔴 Critical Threat Scenarios (85–100)",
    presets: [
      { label: "🌪️ Tornado Cash 100 ETH Vault (Mixer Loop)", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bd3e", scenario: "critical" },
      { label: "🛑 Permit2 Batch Phishing Drainer", address: "0xdac17f958d2ee523a2206206994597c13d831ec7", scenario: "critical" },
      { label: "💀 Lazarus Group APT State Heist (Ronin)", address: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96", scenario: "critical" },
      { label: "🕷️ LockBit Ransomware Multi-Tier Extortion", address: "0x3845badAde8e6dFF049820680d1F14bD3903a5d0", scenario: "critical" },
      { label: "🏛️ Darknet Narcotics Escrow & Tumbler", address: "0x1111111254fb6c44bac0bed2854e76f90643097d", scenario: "critical" },
      { label: "🏴‍☠️ SIM-Swap Executive Wallet Takeover", address: "0x4b16c5de96eb2117bbe5fd171e4d203624b014aa", scenario: "critical" },
    ]
  },
  {
    category: "🟠 High-Risk Layering & Bridge Exploits (60–84)",
    presets: [
      { label: "🌉 Stargate Cross-Chain Relayer (ETH ➔ AVAX)", address: "0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE", scenario: "high" },
      { label: "⚡ Flash Loan & Oracle Exploit (Curve Pool)", address: "0x6b175474e89094c44da98b954eedeac495271d0f", scenario: "high" },
      { label: "🎭 Nested Mixer with 10+ Ephemeral Peel Hops", address: "0x8894e0a0c962cb723c1976a4421c95949be2d4e3", scenario: "high" },
      { label: "🔀 LayerZero Cross-Chain OFT Teleportation", address: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af", scenario: "high" },
      { label: "⚠️ High-Volume High-Risk Offshore CEX", address: "0x28c6c06298d514db089934071355e5743bf21d60", scenario: "high" },
      { label: "🏦 Unlicensed P2P OTC Stablecoin Brokerage", address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503", scenario: "high" },
      { label: "🎰 High-Roller Crypto Casino Tumbler", address: "0xa090e606e30bd747d4e6245a1517ebe430f0057e", scenario: "high" },
    ]
  },
  {
    category: "🟡 Medium-Risk Anomalies & Bot Swarms (30–59)",
    presets: [
      { label: "🤖 Sybil Airdrop Swarm (40+ Puppet Nodes)", address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", scenario: "medium" },
      { label: "🔄 DEX Wash Trading Liquidity Ring", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", scenario: "medium" },
      { label: "📦 Unverified Proxy Contract Execution", address: "0x514910771af9ca656af840dff83e8264ecf986ca", scenario: "medium" },
      { label: "⛽ High-Velocity Gas Subsidized Bot Cluster", address: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", scenario: "medium" },
      { label: "🧱 Flashbots Private Miner Bribe Relay", address: "0x00000000000000adc04c56bf30ac9d3c0aaf14dc", scenario: "medium" },
    ]
  },
  {
    category: "🟢 Low-Risk & Institutional Flows (0–29)",
    presets: [
      { label: "🛡️ Coinbase Prime Institutional Custody", address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72", scenario: "clean" },
      { label: "🏦 Audited Aave V3 Lending & Flash Mint", address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", scenario: "clean" },
      { label: "🔐 Gnosis Safe 3/5 Corporate Treasury", address: "0x12302fE9c02ff50939BaAaaf415fc226C078613C", scenario: "clean" },
      { label: "🏢 Tier-1 KYC Market Maker (Wintermute)", address: "0xdbf5e9c5206d0db70a90108bf936da60221dc080", scenario: "clean" },
    ]
  }
]

const TEMPORAL_STAGES: { id: TemporalStage; title: string; subtitle: string; icon: string; layer: number[] }[] = [
  { id: "all", title: "Full Network", subtitle: "All lifecycle hops", icon: "🌐", layer: [0, 1, 2, 3, 4, 5] },
  { id: "genesis", title: "1. Historic Genesis", subtitle: "Victims & seed funders", icon: "⏳", layer: [0, 1] },
  { id: "target", title: "2. Exploit Target", subtitle: "Fund aggregator hub", icon: "🎯", layer: [2] },
  { id: "mixers", title: "3. Anonymity Pools", subtitle: "Mixers & bridge routers", icon: "🌪️", layer: [3] },
  { id: "peeling", title: "4. Peel Chains", subtitle: "Sequential balance splitters", icon: "⛓️", layer: [4] },
  { id: "offramps", title: "5. Recent Liquidation", subtitle: "CEX off-ramps (Recent)", icon: "⚠️", layer: [5] }
]

function GraphContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const svgRef = useRef<SVGSVGElement>(null)
  const threeMountRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<any>(null)
  
  const [address, setAddress] = useState(searchParams.get("address") || "0x742d35Cc6634C0532925a3b844Bc9e7595f2bd3e")
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [depth, setDepth] = useState([2])
  const [viewMode, setViewMode] = useState<GraphViewMode>("2d-force")
  const [selectedStage, setSelectedStage] = useState<TemporalStage>("all")
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null)
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [minVolume, setMinVolume] = useState<number>(0)
  const [pathSource, setPathSource] = useState<string | null>(null)
  const [pathTarget, setPathTarget] = useState<string | null>(null)
  const [activePath, setActivePath] = useState<string[]>([])
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [nodeSearchQ, setNodeSearchQ] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const simulationRef = useRef<any>(null)

  // ─── Fetch Graph Topology API ──────────────────────────────────────────
  const fetchGraphData = useCallback(async (addr: string, d: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/graph?address=${encodeURIComponent(addr)}&depth=${d}`)
      if (!response.ok) throw new Error("Failed to fetch graph data")
      const data: GraphData = await response.json()
      setGraphData(data)
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0])
      }
      setSelectedLink(null)
      setActivePath([])
      toast.success(`Forensic graph synthesized (${data.nodes?.length || 0} nodes, depth ${d})`)
    } catch {
      toast.error("Failed to load graph topology")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleExplore = (targetAddr?: string) => {
    const addr = (targetAddr || address).trim()
    if (!addr) {
      toast.error("Please enter a wallet address or transaction ID")
      return
    }
    setAddress(addr)
    fetchGraphData(addr, depth[0])
  }

  // 🎲 Randomize Unique Scenario Permutation
  const handleRandomize = () => {
    const allPresets = PRESET_GROUPS.flatMap(g => g.presets)
    const randomPreset = allPresets[Math.floor(Math.random() * allPresets.length)]
    setAddress(randomPreset.address)
    const randomDepth = Math.floor(Math.random() * 3) + 2
    setDepth([randomDepth])
    fetchGraphData(randomPreset.address, randomDepth)
    toast.success(`Generated permutation: ${randomPreset.label}`)
  }

  useEffect(() => {
    const urlAddress = searchParams.get("address") || "0x742d35Cc6634C0532925a3b844Bc9e7595f2bd3e"
    if (urlAddress && !graphData && !isLoading) {
      setAddress(urlAddress)
      fetchGraphData(urlAddress, depth[0])
    }
  }, [searchParams, fetchGraphData, graphData, isLoading, depth])

  // ─── Auto Timeline Stepper ─────────────────────────────────────────────
  useEffect(() => {
    if (!isPlayingTimeline) return
    const stageOrder: TemporalStage[] = ["genesis", "target", "mixers", "peeling", "offramps", "all"]
    let idx = 0
    const interval = setInterval(() => {
      setSelectedStage(stageOrder[idx])
      idx = (idx + 1) % stageOrder.length
    }, 3000)
    return () => clearInterval(interval)
  }, [isPlayingTimeline])

  // ─── Filtered Nodes and Links ──────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] }

    const activeStageObj = TEMPORAL_STAGES.find(s => s.id === selectedStage)
    const allowedLayers = activeStageObj ? activeStageObj.layer : [0, 1, 2, 3, 4, 5]

    const nodes = graphData.nodes.filter(n => {
      const nodeLayer = n.layer !== undefined ? n.layer : n.nodeType === "victim" ? 1 : n.nodeType === "target" ? 2 : n.nodeType === "mixer" || n.nodeType === "bridge" ? 3 : n.nodeType === "peel_hop" ? 4 : 5
      if (selectedStage !== "all" && !allowedLayers.includes(nodeLayer)) return false
      if (riskFilter !== "all" && n.riskLevel !== riskFilter) return false
      if (typeFilter !== "all" && n.nodeType !== typeFilter) return false
      if (n.volume < minVolume) return false
      if (nodeSearchQ && !n.label.toLowerCase().includes(nodeSearchQ.toLowerCase()) && !n.address.toLowerCase().includes(nodeSearchQ.toLowerCase())) return false
      return true
    })

    const nodeIds = new Set(nodes.map(n => n.id))
    const links = graphData.links.filter(l => {
      const sId = typeof l.source === "object" ? (l.source as any).id : l.source
      const tId = typeof l.target === "object" ? (l.target as any).id : l.target
      return nodeIds.has(sId) && nodeIds.has(tId)
    })

    return { nodes, links }
  }, [graphData, riskFilter, typeFilter, minVolume, selectedStage, nodeSearchQ])

  // ─── Shortest Path Calculation ─────────────────────────────────────────
  const calculatePath = useCallback((src: string, tgt: string) => {
    if (!graphData || !src || !tgt) return []
    const adj = new Map<string, string[]>()
    graphData.links.forEach(l => {
      const s = typeof l.source === "object" ? (l.source as any).id : l.source
      const t = typeof l.target === "object" ? (l.target as any).id : l.target
      if (!adj.has(s)) adj.set(s, [])
      if (!adj.has(t)) adj.set(t, [])
      adj.get(s)!.push(t)
      adj.get(t)!.push(s)
    })

    const queue: [string, string[]][] = [[src, [src]]]
    const visited = new Set<string>([src])
    while (queue.length > 0) {
      const [curr, path] = queue.shift()!
      if (curr === tgt) return path
      for (const neighbor of adj.get(curr) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push([neighbor, [...path, neighbor]])
        }
      }
    }
    return []
  }, [graphData])

  const handleTracePath = (targetId: string) => {
    if (!pathSource) {
      setPathSource(targetId)
      toast.info("Start node selected. Click a destination node to trace laundering path.")
    } else {
      setPathTarget(targetId)
      const path = calculatePath(pathSource, targetId)
      if (path.length > 0) {
        setActivePath(path)
        toast.success(`Identified tainted path: ${path.length} hops`)
      } else {
        toast.error("No direct connected path found between selected nodes.")
      }
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Address copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 1. D3 2D FORCE SIMULATION RENDERER (WITH FLOW DASH ANIMATIONS)
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (viewMode !== "2d-force" && viewMode !== "hierarchical-tree" && viewMode !== "radial-ego") return
    if (!filteredData.nodes || filteredData.nodes.length === 0 || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const container = containerRef.current
    const width = container ? container.clientWidth || 900 : 900
    const height = container ? container.clientHeight || 650 : 650

    const g = svg.append("g")

    // Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 6])
      .on("zoom", (event) => g.attr("transform", event.transform))
    svg.call(zoomBehavior as any)
    zoomRef.current = zoomBehavior

    // Defs: Filters, Animations & Markers
    const defs = svg.append("defs")

    // Flow Animation Style Block
    const styleEl = defs.append("style")
    styleEl.text(`
      @keyframes dashFlow {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: 0; }
      }
      .flowing-edge {
        stroke-dasharray: 6, 4;
        animation: dashFlow 1.2s linear infinite;
      }
    `)

    // Neon Glow Filter
    const filterGlow = defs.append("filter").attr("id", "neon-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%")
    filterGlow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur")
    const feMerge = filterGlow.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Arrow markers
    defs.selectAll("marker")
      .data(["default", "critical", "high", "medium", "low", "active-path"])
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", d => d === "active-path" ? "#ffd700" : d === "critical" ? "#ff2020" : d === "high" ? "#ff8c00" : d === "medium" ? "#ffdd57" : "#4ade80")

    // Clone data for D3 mutation
    const nodesCopy = filteredData.nodes.map(d => ({ ...d }))
    const linksCopy = filteredData.links.map(d => ({ ...d }))

    // D3 Layout Modes
    let simulation: any

    if (viewMode === "hierarchical-tree") {
      // Stratified Hierarchical DAG
      const layerSpacing = (width - 120) / 5
      nodesCopy.forEach(n => {
        const l = n.layer !== undefined ? n.layer : n.nodeType === "victim" ? 0 : n.nodeType === "target" ? 1 : n.nodeType === "mixer" || n.nodeType === "bridge" ? 2 : n.nodeType === "peel_hop" ? 3 : 4
        n.fx = 70 + l * layerSpacing
      })
      simulation = d3.forceSimulation(nodesCopy as any)
        .force("link", d3.forceLink(linksCopy).id((d: any) => d.id).distance(75))
        .force("charge", d3.forceManyBody().strength(-180))
        .force("y", d3.forceY(height / 2).strength(0.35))
        .force("collide", d3.forceCollide().radius(34))
    } else if (viewMode === "radial-ego") {
      // Radial Concentric Risk Rings
      const cx = width / 2, cy = height / 2
      nodesCopy.forEach((n, i) => {
        if (n.nodeType === "target") {
          n.fx = cx; n.fy = cy
        } else {
          const r = n.riskLevel === "critical" ? 130 : n.riskLevel === "high" ? 210 : n.riskLevel === "medium" ? 290 : 360
          const angle = (i / nodesCopy.length) * 2 * Math.PI
          n.x = cx + r * Math.cos(angle)
          n.y = cy + r * Math.sin(angle)
        }
      })
      simulation = d3.forceSimulation(nodesCopy as any)
        .force("link", d3.forceLink(linksCopy).id((d: any) => d.id).distance(85))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("r", d3.forceRadial((d: any) => d.nodeType === "target" ? 0 : d.riskLevel === "critical" ? 130 : d.riskLevel === "high" ? 210 : 290, cx, cy).strength(0.8))
        .force("collide", d3.forceCollide().radius(28))
    } else {
      // 2D Force-Directed Graph
      simulation = d3.forceSimulation(nodesCopy as any)
        .force("link", d3.forceLink(linksCopy).id((d: any) => d.id).distance(115))
        .force("charge", d3.forceManyBody().strength(-380))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius((d: any) => (d.nodeType === "target" ? 40 : 30)))
    }

    simulationRef.current = simulation

    // Draw Links
    const link = g.append("g")
      .selectAll("line")
      .data(linksCopy)
      .enter().append("line")
      .attr("class", "flowing-edge")
      .attr("stroke", (d: any) => {
        const sId = typeof d.source === "object" ? d.source.id : d.source
        const tId = typeof d.target === "object" ? d.target.id : d.target
        const isPath = activePath.includes(sId) && activePath.includes(tId)
        if (isPath) return "#ffd700"
        return d.riskLevel === "critical" ? "#ff2020aa" : d.riskLevel === "high" ? "#ff8c00aa" : "#00e676aa"
      })
      .attr("stroke-width", (d: any) => {
        const sId = typeof d.source === "object" ? d.source.id : d.source
        const tId = typeof d.target === "object" ? d.target.id : d.target
        return activePath.includes(sId) && activePath.includes(tId) ? 3.8 : Math.max(1.4, Math.min(4.5, Math.log10(d.value + 10) * 0.7))
      })
      .attr("marker-end", (d: any) => `url(#arrow-${d.riskLevel || "default"})`)
      .style("cursor", "pointer")
      .on("click", (e, d: any) => setSelectedLink(d))

    // Draw Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodesCopy)
      .enter().append("g")
      .style("cursor", "pointer")
      .on("mouseenter", (e, d: any) => setHoverNode(d))
      .on("mouseleave", () => setHoverNode(null))
      .on("click", (e, d: any) => {
        setSelectedNode(d)
        setSelectedLink(null)
      })
      .call(d3.drag<any, any>()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x; d.fy = event.y
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          if (viewMode === "2d-force") { d.fx = null; d.fy = null }
        })
      )

    // Outer Halo Rings
    node.append("circle")
      .attr("r", (d: any) => (d.nodeType === "target" ? 25 : d.riskScore >= 85 ? 20 : 15))
      .attr("fill", (d: any) => `${nodeTypeColors[d.nodeType || ""] || riskColors[d.riskLevel]}25`)
      .attr("stroke", (d: any) => selectedNode?.id === d.id ? "#ffffff" : activePath.includes(d.id) ? "#ffd700" : nodeTypeColors[d.nodeType || ""] || riskColors[d.riskLevel])
      .attr("stroke-width", (d: any) => selectedNode?.id === d.id ? 3 : activePath.includes(d.id) ? 3 : 1.5)
      .attr("filter", "url(#neon-glow)")

    // Inner Core Circle
    node.append("circle")
      .attr("r", (d: any) => (d.nodeType === "target" ? 14 : d.riskScore >= 85 ? 11 : 8))
      .attr("fill", (d: any) => nodeTypeColors[d.nodeType || ""] || riskColors[d.riskLevel])

    // Node Labels
    node.append("text")
      .text((d: any) => d.label.length > 20 ? d.label.slice(0, 18) + "…" : d.label)
      .attr("x", 0)
      .attr("y", (d: any) => (d.nodeType === "target" ? 38 : 29))
      .attr("text-anchor", "middle")
      .attr("fill", "#f8fafc")
      .attr("font-size", "10px")
      .attr("font-weight", (d: any) => d.nodeType === "target" ? "700" : "500")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 8px rgba(0,0,0,0.95)")

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)
      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [filteredData, viewMode, activePath, selectedNode])

  // ═════════════════════════════════════════════════════════════════════════
  // 2. THREE.JS 3D SPATIAL CONSTELLATION RENDERER
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (viewMode !== "3d-spatial" || !threeMountRef.current || !filteredData.nodes.length) return

    let dead = false, raf = 0
    const mount = threeMountRef.current

    ;(async () => {
      try {
        const THREE = await import("three")
        if (dead || !mount) return

        mount.innerHTML = ""
        const W = mount.clientWidth || 800
        const H = mount.clientHeight || 600

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000)
        camera.position.set(0, 0, 380)

        // Starfield background
        const starGeom = new THREE.BufferGeometry()
        const starCount = 800
        const starPos = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 1200
        starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3))
        scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.35 })))

        // Lights
        scene.add(new THREE.AmbientLight(0x223344, 2.0))
        const dLight = new THREE.DirectionalLight(0xfff5db, 2.5)
        dLight.position.set(200, 200, 200)
        scene.add(dLight)

        // 3D Nodes Group
        const nodesGroup = new THREE.Group()
        const nodePositions = new Map<string, any>()

        filteredData.nodes.forEach((n, i) => {
          const isTarget = n.nodeType === "target"
          const r = isTarget ? 0 : 120 + (n.riskLevel === "critical" ? 30 : n.riskLevel === "high" ? 60 : 90)
          const theta = (i / filteredData.nodes.length) * Math.PI * 2
          const phi = ((i % 5) - 2) * 0.35
          const pos = isTarget 
            ? new THREE.Vector3(0, 0, 0)
            : new THREE.Vector3(r * Math.cos(theta), r * Math.sin(phi), r * Math.sin(theta))

          nodePositions.set(n.id, pos)

          // Node Sphere
          const sz = isTarget ? 7 : n.riskScore >= 85 ? 5.5 : 3.8
          const colorHex = n.riskScore >= 85 ? 0xff2020 : n.riskScore >= 60 ? 0xff8c00 : n.riskScore >= 30 ? 0xffdd57 : 0x00e676
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(sz, 16, 16),
            new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.2 })
          )
          sphere.position.copy(pos)
          nodesGroup.add(sphere)

          // Halo Ring
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(sz * 1.3, sz * 1.8, 20),
            new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
          )
          ring.position.copy(pos)
          ring.lookAt(camera.position)
          nodesGroup.add(ring)
        })

        // 3D Animated Links
        filteredData.links.forEach(l => {
          const sId = typeof l.source === "object" ? (l.source as any).id : l.source
          const tId = typeof l.target === "object" ? (l.target as any).id : l.target
          const p1 = nodePositions.get(sId)
          const p2 = nodePositions.get(tId)
          if (!p1 || !p2) return

          const geom = new THREE.BufferGeometry().setFromPoints([p1, p2])
          const mat = new THREE.LineBasicMaterial({
            color: l.riskLevel === "critical" ? 0xff2020 : l.riskLevel === "high" ? 0xff8c00 : 0x00e676,
            transparent: true,
            opacity: 0.55
          })
          const line = new THREE.Line(geom, mat)
          nodesGroup.add(line)
        })

        scene.add(nodesGroup)

        // Mouse Drag Orbit Controls
        let dragging = false, pX = 0, pY = 0
        const onDown = (e: MouseEvent) => { dragging = true; pX = e.clientX; pY = e.clientY }
        const onUp = () => { dragging = false }
        const onMove = (e: MouseEvent) => {
          if (!dragging) return
          nodesGroup.rotation.y += (e.clientX - pX) * 0.005
          nodesGroup.rotation.x += (e.clientY - pY) * 0.005
          pX = e.clientX; pY = e.clientY
        }
        mount.addEventListener("mousedown", onDown)
        window.addEventListener("mouseup", onUp)
        window.addEventListener("mousemove", onMove)

        const animate = () => {
          if (dead) return
          raf = requestAnimationFrame(animate)
          if (!dragging) nodesGroup.rotation.y += 0.002
          renderer.render(scene, camera)
        }
        animate()

        return () => {
          dead = true
          cancelAnimationFrame(raf)
          mount.removeEventListener("mousedown", onDown)
          window.removeEventListener("mouseup", onUp)
          window.removeEventListener("mousemove", onMove)
          renderer.dispose()
          if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
        }
      } catch (err) {
        console.error("Three.js 3D spatial graph error:", err)
      }
    })()
  }, [viewMode, filteredData])

  // ─── Canvas Zoom Helpers ───────────────────────────────────────────────
  const handleZoom = (direction: "in" | "out") => {
    if (!svgRef.current || !zoomRef.current) return
    const svg = d3.select(svgRef.current)
    const factor = direction === "in" ? 1.3 : 0.77
    svg.transition().duration(300).call(zoomRef.current.scaleBy, factor)
  }

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity)
  }

  // ─── Selected Node Inbound & Outbound Counterparts ─────────────────────
  const nodeConnections = useMemo(() => {
    if (!selectedNode || !graphData) return { inbound: [], outbound: [] }
    const inbound = graphData.links.filter(l => {
      const tId = typeof l.target === "object" ? (l.target as any).id : l.target
      return tId === selectedNode.id
    })
    const outbound = graphData.links.filter(l => {
      const sId = typeof l.source === "object" ? (l.source as any).id : l.source
      return sId === selectedNode.id
    })
    return { inbound, outbound }
  }, [selectedNode, graphData])

  // ─── Export Graph as JSON ──────────────────────────────────────────────
  const handleExportJSON = () => {
    if (!graphData) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphData, null, 2))
    const dl = document.createElement("a")
    dl.setAttribute("href", dataStr)
    dl.setAttribute("download", `cryptoguard-forensic-topology-${address.slice(0, 8)}.json`)
    dl.click()
    toast.success("Forensic graph exported as JSON")
  }

  // ═════════════════════════════════════════════════════════════════════════
  // JSX RENDERING
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <NavBar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-2.5 py-0.5 font-mono">
                <Network className="w-3.5 h-3.5 mr-1" />
                Forensic Graph Intelligence
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                24+ Forensic Combinations
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-yellow-500">
              Forensic Transaction Graph Engine
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Multi-dimensional topology synthesis, 24+ crime scenarios, temporal hop progression & actionable forensic remediation plans.
            </p>
          </div>

          {/* QUICK PRESETS & RANDOMIZE BUTTONS */}
          <div className="flex items-center gap-2">
            <Select onValueChange={(val) => {
              setAddress(val)
              fetchGraphData(val, depth[0])
            }}>
              <SelectTrigger className="w-[320px] bg-black/80 border-yellow-500/30 text-xs text-yellow-300">
                <SelectValue placeholder="⚡ Select 24+ Forensic Scenarios" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-yellow-500/30 text-xs max-h-80">
                {PRESET_GROUPS.map(grp => (
                  <SelectGroup key={grp.category}>
                    <SelectLabel className="text-[10px] text-gray-400 uppercase tracking-wider font-bold py-1.5 px-2 bg-white/5">
                      {grp.category}
                    </SelectLabel>
                    {grp.presets.map(p => (
                      <SelectItem key={p.label} value={p.address} className="text-xs hover:bg-yellow-500/20 pl-4">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleRandomize}
              variant="outline"
              className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20 text-xs h-9"
              title="Generate Random Procedural Forensic Permutation"
            >
              <Dices className="w-4 h-4 mr-1.5 text-yellow-400" />
              Randomize
            </Button>

            <Button 
              onClick={handleExportJSON} 
              variant="outline" 
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 text-xs h-9"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </div>

        {/* TOP SEARCH & DEPTH CONTROLS BAR */}
        <Card className="bg-[#090d16]/90 border-yellow-500/20 backdrop-blur-md shadow-xl">
          <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4 justify-between">
            <div className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                  placeholder="Enter any Ethereum/BTC address, transaction hash, or ENS domain to reconstruct graph..."
                  className="pl-9 bg-black/60 border-white/15 text-sm text-white focus:border-yellow-500"
                />
              </div>
              <Button 
                onClick={() => handleExplore()} 
                disabled={isLoading}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                Explore
              </Button>
            </div>

            {/* Depth Slider */}
            <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10 w-full lg:w-auto">
              <Label className="text-xs font-mono text-gray-400 whitespace-nowrap">
                Hop Depth: <span className="text-yellow-400 font-bold">{depth[0]}</span>
              </Label>
              <Slider
                value={depth}
                onValueChange={(val) => {
                  setDepth(val)
                  fetchGraphData(address, val[0])
                }}
                min={1}
                max={5}
                step={1}
                className="w-28"
              />
              <span className="text-[10px] text-gray-500 font-mono">1–5 Hops</span>
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              {[
                { id: "2d-force", label: "2D Physics", icon: <Network className="w-3.5 h-3.5 mr-1" /> },
                { id: "3d-spatial", label: "3D Spatial", icon: <Globe2 className="w-3.5 h-3.5 mr-1" /> },
                { id: "hierarchical-tree", label: "Flow Tree", icon: <GitFork className="w-3.5 h-3.5 mr-1" /> },
                { id: "radial-ego", label: "Radial Ego", icon: <Compass className="w-3.5 h-3.5 mr-1" /> },
                { id: "risk-matrix", label: "Risk Matrix", icon: <Layers className="w-3.5 h-3.5 mr-1" /> },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as GraphViewMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-all ${
                    viewMode === mode.id
                      ? "bg-yellow-500 text-black font-bold shadow-[0_0_12px_#ffd70044]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ─── TEMPORAL TIMELINE STEPPER (RECENT ➔ OLD PROGRESSION) ────────── */}
        <Card className="bg-[#090d16]/95 border-yellow-500/30 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardHeader className="p-4 border-b border-white/10 bg-yellow-500/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-yellow-400" />
              <div>
                <CardTitle className="text-sm font-bold text-yellow-300">
                  Chronological Hop Progression (Historic Genesis ➔ Recent Exit)
                </CardTitle>
                <CardDescription className="text-[11px] text-gray-400">
                  Step through each temporal phase of the transaction laundering lifecycle to inspect isolated hops.
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              variant="outline"
              className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20 text-xs h-8"
            >
              {isPlayingTimeline ? <Pause className="w-3.5 h-3.5 mr-1.5 text-yellow-400 animate-pulse" /> : <Play className="w-3.5 h-3.5 mr-1.5 text-yellow-400" />}
              {isPlayingTimeline ? "Pause Timeline" : "Auto Play Timeline"}
            </Button>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {TEMPORAL_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStage(s.id)
                    setIsPlayingTimeline(false)
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedStage === s.id
                      ? "bg-yellow-500/20 border-yellow-400 shadow-[0_0_15px_#ffd70033]"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-[9px] font-mono text-gray-500">
                      {idx === 0 ? "ALL" : idx === 1 ? "OLD" : idx === 5 ? "RECENT" : `HOP ${idx-1}`}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{s.title}</div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5">{s.subtitle}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MAIN GRAPH CANVAS & SIDE INSPECTOR */}
        <div className={`grid grid-cols-1 ${isFullscreen ? "fixed inset-0 z-50 bg-[#030712] p-6 max-w-none" : "lg:grid-cols-4"} gap-6`}>
          {/* LEFT 3 COLS: GRAPH VISUALIZATION CANVAS */}
          <div className={`${isFullscreen ? "col-span-1" : "lg:col-span-3"} flex flex-col gap-4`}>
            <div 
              ref={containerRef}
              className={`relative w-full ${isFullscreen ? "h-[86vh]" : "h-[640px]"} rounded-2xl bg-[#040813] border border-yellow-500/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)_inset]`}
            >
              {/* Flow Tree Column Headers in Hierarchical Mode */}
              {viewMode === "hierarchical-tree" && (
                <div className="absolute top-12 inset-x-6 z-10 grid grid-cols-5 gap-2 pointer-events-none text-center">
                  {[
                    "1. Ingress / Victims",
                    "2. Exploit Target",
                    "3. Anonymity Pools",
                    "4. Peel Chains",
                    "5. Off-Ramp Exits"
                  ].map((label) => (
                    <div key={label} className="py-1 px-2 rounded-lg bg-black/70 border border-white/10 text-[10px] font-mono font-bold text-yellow-300 backdrop-blur-md">
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {/* Active Graph Canvas depending on ViewMode */}
              {viewMode === "3d-spatial" ? (
                <div ref={threeMountRef} className="absolute inset-0 w-full h-full" />
              ) : viewMode === "risk-matrix" ? (
                <div className="absolute inset-0 p-6 overflow-y-auto bg-[#040813]">
                  <h3 className="text-sm font-bold text-yellow-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Forensic Node Risk Breakdown Matrix
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredData.nodes.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => setSelectedNode(n)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedNode?.id === n.id ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_#ffd70033]" : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white truncate max-w-[180px]">{n.label}</span>
                          <Badge style={{ backgroundColor: `${riskColors[n.riskLevel]}25`, color: riskColors[n.riskLevel], border: `1px solid ${riskColors[n.riskLevel]}60` }}>
                            {n.riskScore}/100 · {n.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono truncate mb-2">{n.address}</div>
                        <div className="flex items-center justify-between text-[11px] text-gray-300">
                          <span>Volume: <strong className="text-yellow-400">${n.volume.toLocaleString()}</strong></span>
                          <span>Txs: <strong className="text-white">{n.transactionCount}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <svg ref={svgRef} className="w-full h-full" />
              )}

              {/* OVERLAY: FILTER CONTROLS BAR (TOP LEFT) */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
                {(["all", "critical", "high", "medium", "low"] as const).map(rf => (
                  <button
                    key={rf}
                    onClick={() => setRiskFilter(rf)}
                    className={`h-6 px-2.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                      riskFilter === rf
                        ? rf === "all" ? "bg-yellow-500 text-black shadow-[0_0_8px_#ffd70044]"
                        : rf === "critical" ? "bg-red-600 text-white shadow-[0_0_8px_#ff202066]"
                        : rf === "high" ? "bg-orange-500 text-black shadow-[0_0_8px_#ff8c0055]"
                        : rf === "medium" ? "bg-yellow-500 text-black shadow-[0_0_8px_#ffdd5755]"
                        : "bg-emerald-500 text-black shadow-[0_0_8px_#00e67655]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {rf}
                  </button>
                ))}
              </div>

              {/* OVERLAY: TOP RIGHT TOOLBAR (ZOOM, FULLSCREEN, STATS) */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md flex items-center gap-3 text-xs">
                  <span className="text-gray-400">Nodes: <strong className="text-yellow-400">{filteredData.nodes.length}</strong></span>
                  <span className="text-gray-400">Links: <strong className="text-yellow-400">{filteredData.links.length}</strong></span>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
                  <button 
                    onClick={() => handleZoom("in")} 
                    title="Zoom In"
                    className="w-7 h-7 rounded-lg text-yellow-300 hover:bg-yellow-500/20 flex items-center justify-center transition-all"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleZoom("out")} 
                    title="Zoom Out"
                    className="w-7 h-7 rounded-lg text-yellow-300 hover:bg-yellow-500/20 flex items-center justify-center transition-all"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleResetZoom} 
                    title="Reset View"
                    className="w-7 h-7 rounded-lg text-yellow-300 hover:bg-yellow-500/20 flex items-center justify-center transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)} 
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
                    className="w-7 h-7 rounded-lg text-yellow-300 hover:bg-yellow-500/20 flex items-center justify-center transition-all"
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* OVERLAY: HOVER TOOLTIP CARD */}
              {hoverNode && (
                <div className="absolute top-14 left-3 z-30 p-3 rounded-xl bg-black/95 border border-yellow-500/40 backdrop-blur-md shadow-2xl max-w-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-white truncate">{hoverNode.label}</span>
                    <Badge style={{ backgroundColor: `${riskColors[hoverNode.riskLevel]}25`, color: riskColors[hoverNode.riskLevel] }} className="text-[9px] px-1.5 py-0">
                      {hoverNode.riskScore}/100
                    </Badge>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 truncate mb-1.5">{hoverNode.address}</div>
                  <div className="flex items-center justify-between text-[10px] text-gray-300">
                    <span>Vol: <strong className="text-yellow-400">${hoverNode.volume.toLocaleString()}</strong></span>
                    <span>Role: <strong className="text-white">{hoverNode.entityRole || "Node"}</strong></span>
                  </div>
                </div>
              )}

              {/* OVERLAY: PATH TRACER BANNER */}
              {activePath.length > 0 && (
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-500/50 backdrop-blur-md text-xs text-yellow-300">
                  <Crosshair className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  <span>Tainted Laundering Path: <strong>{activePath.length} nodes highlighted</strong></span>
                  <button onClick={() => { setActivePath([]); setPathSource(null); setPathTarget(null) }} className="text-gray-400 hover:text-white ml-2 underline">Clear</button>
                </div>
              )}
            </div>

            {/* TOPOLOGY SUMMARY CARDS */}
            {graphData?.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-[#090d16]/80 border-white/10 p-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Identified Pattern</div>
                  <div className="text-xs font-bold text-yellow-300 mt-1 truncate">{graphData.stats.fraudPattern}</div>
                </Card>
                <Card className="bg-[#090d16]/80 border-white/10 p-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Laundering Risk Score</div>
                  <div className="text-base font-black mt-0.5" style={{ color: riskColors[graphData.stats.riskLevel] }}>
                    {graphData.stats.riskScore}/100 · {graphData.stats.riskLevel.toUpperCase()}
                  </div>
                </Card>
                <Card className="bg-[#090d16]/80 border-white/10 p-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Anonymity Mixers</div>
                  <div className="text-base font-black text-purple-400 mt-0.5">{graphData.stats.detectedMixers} Pools</div>
                </Card>
                <Card className="bg-[#090d16]/80 border-white/10 p-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Peel Intermediaries</div>
                  <div className="text-base font-black text-red-400 mt-0.5">{graphData.stats.peelHops || 0} Hops</div>
                </Card>
              </div>
            )}
          </div>

          {/* RIGHT COL: FORENSIC INSPECTION DOSSIER & REMEDIATION ACTION PLAN */}
          <div className="flex flex-col gap-4">
            {/* 1. Node Dossier Card */}
            <Card className="bg-[#090d16]/95 border-yellow-500/20 shadow-2xl backdrop-blur-md">
              <CardHeader className="p-4 border-b border-white/10 bg-yellow-500/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    Forensic Node Dossier
                  </CardTitle>
                  {selectedNode && (
                    <Badge style={{ backgroundColor: `${riskColors[selectedNode.riskLevel]}25`, color: riskColors[selectedNode.riskLevel], border: `1px solid ${riskColors[selectedNode.riskLevel]}50` }}>
                      {selectedNode.riskScore}/100
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                {selectedNode ? (
                  <>
                    {/* Node Label & Address with Copy */}
                    <div>
                      <div className="text-sm font-bold text-white">{selectedNode.label}</div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 break-all mt-1 p-2 rounded-lg bg-black/60 border border-white/5">
                        <span className="truncate">{selectedNode.address}</span>
                        <button onClick={() => handleCopy(selectedNode.address)} className="text-gray-400 hover:text-white shrink-0 ml-2">
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-gray-400">Total Volume</div>
                        <div className="text-sm font-bold text-yellow-300 mt-0.5">
                          ${selectedNode.volume.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-gray-400">Tx Count</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {selectedNode.transactionCount}
                        </div>
                      </div>
                    </div>

                    {/* Country & Category */}
                    <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Entity Role:</span>
                        <span className="font-semibold text-white">{selectedNode.entityRole || "Counterparty"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Geographic Origin:</span>
                        <span className="font-semibold text-white">{selectedNode.country || "Global P2P"}</span>
                      </div>
                      {selectedNode.sanctionDetails && (
                        <div className="flex items-center justify-between text-red-400 font-bold">
                          <span>Sanctions:</span>
                          <span>OFAC SDN Designated</span>
                        </div>
                      )}
                    </div>

                    {/* Inbound vs Outbound Summary */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="text-[10px] text-gray-400">Inbound Links</div>
                        <div className="text-sm font-bold text-emerald-400">{nodeConnections.inbound.length}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                        <div className="text-[10px] text-gray-400">Outbound Links</div>
                        <div className="text-sm font-bold text-orange-400">{nodeConnections.outbound.length}</div>
                      </div>
                    </div>

                    {/* Forensic Explanation */}
                    {selectedNode.nodeExplanation && (
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Forensic Explanation</div>
                        <p className="text-gray-300 leading-relaxed text-[11px] p-3 rounded-xl bg-white/5 border border-white/10">
                          {selectedNode.nodeExplanation}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <Button 
                        onClick={() => router.push(`/wallet-scan?address=${encodeURIComponent(selectedNode.address)}`)}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs h-8"
                      >
                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                        Scan in Wallet Scanner
                      </Button>
                      <Button 
                        onClick={() => handleTracePath(selectedNode.id)}
                        variant="outline"
                        className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 text-xs h-8"
                      >
                        <Crosshair className="w-3.5 h-3.5 mr-1.5" />
                        {pathSource === selectedNode.id ? "Select Destination Node" : "Trace Tainted Path From Here"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setAddress(selectedNode.address)
                          fetchGraphData(selectedNode.address, depth[0])
                        }}
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white text-xs h-8"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Set as Central Target & Re-Explore
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Click any node or link in the graph to inspect forensic telemetry.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Actionable Forensic Next Steps Remediation Plan */}
            {graphData?.actionPlan && (
              <Card className="bg-[#090d16]/95 border-yellow-500/20 shadow-2xl backdrop-blur-md">
                <CardHeader className="p-3.5 border-b border-white/10 bg-yellow-500/10">
                  <CardTitle className="text-xs font-bold text-yellow-300 flex items-center gap-2">
                    <ListTodo className="w-3.5 h-3.5 text-yellow-400" />
                    Investigative Next Steps Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {graphData.actionPlan.map(act => (
                    <div key={act.actionId} className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-[11px] truncate">{act.title}</span>
                        <Badge 
                          className="text-[9px] px-1.5 py-0"
                          style={{
                            backgroundColor: act.priority === "CRITICAL" ? "#ff202025" : act.priority === "HIGH" ? "#ff8c0025" : "#00e67625",
                            color: act.priority === "CRITICAL" ? "#ff2020" : act.priority === "HIGH" ? "#ff8c00" : "#00e676"
                          }}
                        >
                          {act.priority}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed mb-1">{act.description}</p>
                      <div className="text-[9px] text-yellow-400/80 font-mono truncate">Jurisdiction: {act.legalJurisdiction}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ─── DEEP NODE TAXONOMY & BEHAVIORAL EXPLANATION SECTION ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
          {/* Col 1: Node Taxonomy Breakdown */}
          <Card className="bg-[#090d16]/80 border-white/10 p-5">
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              Node Classification Taxonomy
            </h3>
            <div className="space-y-2.5 text-xs text-gray-300">
              {[
                { tag: "🎯 Central Target", desc: "The primary address under investigation.", col: "#ffd700" },
                { tag: "🛑 Victim Wallet", desc: "Compromised account drained via phishing/exploits.", col: "#f43f5e" },
                { tag: "🌪️ Anonymity Mixer", desc: "OFAC-designated zero-knowledge pool.", col: "#a855f7" },
                { tag: "⛓️ Peel Hop", desc: "Transient key splitting and forwarding balances.", col: "#ef4444" },
                { tag: "🌉 Bridge Router", desc: "Cross-chain relayer breaking single-chain graph.", col: "#06b6d4" },
                { tag: "⚠️ Offshore CEX", desc: "No-KYC exchange deposit for rapid fiat cashout.", col: "#10b981" },
              ].map(n => (
                <div key={n.tag} className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.col }} />
                    {n.tag}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{n.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Col 2: Chronological Flow Architecture */}
          <Card className="bg-[#090d16]/80 border-white/10 p-5">
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Temporal Flow Stages (Historic ➔ Recent)
            </h3>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                <div>
                  <strong className="text-white">Genesis & Victim Inflow (Historic)</strong>
                  <p className="text-[11px] text-gray-400 mt-0.5">Pre-exploit seed funding and unauthorized drains from victim clusters.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                <div>
                  <strong className="text-white">Target Aggregation Hub</strong>
                  <p className="text-[11px] text-gray-400 mt-0.5">Central wallet where stolen capital is pooled before laundering.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                <div>
                  <strong className="text-white">Layering & Anonymity Pools</strong>
                  <p className="text-[11px] text-gray-400 mt-0.5">Tornado Cash deposits and cross-chain bridge hops to obscure trails.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 font-bold text-[10px]">4</div>
                <div>
                  <strong className="text-white">Recent Liquidation Exit (Most Recent)</strong>
                  <p className="text-[11px] text-gray-400 mt-0.5">Offshore unregulated exchange off-ramps and OTC settlement.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Col 3: Risk Scoring & Compliance Heuristics */}
          <Card className="bg-[#090d16]/80 border-white/10 p-5">
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk Thresholds & OFAC Heuristics
            </h3>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="font-bold text-red-400">Critical Risk (85–100/100)</div>
                <div className="text-[11px] text-gray-300 mt-0.5">Direct contact with OFAC SDN mixers, known ransomware or active drainers.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="font-bold text-orange-400">High Risk (60–84/100)</div>
                <div className="text-[11px] text-gray-300 mt-0.5">Cross-chain bridge layering, unverified smart contract execution, peel hops.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="font-bold text-yellow-400">Medium Risk (30–59/100)</div>
                <div className="text-[11px] text-gray-300 mt-0.5">Automated airdrop farming swarms, high gas volume, unverified proxies.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="font-bold text-emerald-400">Low / Clean Risk (0–29/100)</div>
                <div className="text-[11px] text-gray-300 mt-0.5">Regulated institutional custody, audited AMM pools (Uniswap, Aave).</div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ForensicGraphPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-400 animate-spin" />
      </div>
    }>
      <GraphContent />
    </Suspense>
  )
}
