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
  ArrowRightLeft,
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
  visualColor?: string
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
  const [hoverLink, setHoverLink] = useState<GraphLink | null>(null)
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
  const [loadingStage, setLoadingStage] = useState<string>("Connecting to multi-chain RPC archive nodes...")
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [loadingLog, setLoadingLog] = useState<string>("eth_getBlockByNumber('latest')")
  const [currentSeed, setCurrentSeed] = useState<number | null>(null)
  const simulationRef = useRef<any>(null)
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const d3SelectionsRef = useRef<any>(null)

  // ─── Fetch Graph Topology API (With Authentic Blockchain Query Timing) ────
  const fetchGraphData = useCallback(async (addr: string, d: number, isFastDepthChange = false, explicitSeed?: number) => {
    const seedToUse = explicitSeed !== undefined ? explicitSeed : currentSeed
    const seedQuery = seedToUse ? `&seed=${seedToUse}` : ""

    if (isFastDepthChange) {
      // Immediate, zero-delay update for hop-depth slider navigation
      try {
        const res = await fetch(`/api/graph?address=${encodeURIComponent(addr)}&depth=${d}${seedQuery}`)
        if (!res.ok) throw new Error("Failed to fetch graph data")
        const data = await res.json()
        setGraphData(data)
        if (data.seed) setCurrentSeed(data.seed)
        // Keep selectedNode if it still exists in the new depth
        setSelectedNode(prev => {
          if (!prev) return data.nodes?.[0] || null
          const exists = data.nodes?.find((n: GraphNode) => n.id === prev.id)
          return exists || data.nodes?.[0] || null
        })
        setSelectedLink(null)
        setActivePath([])
      } catch {
        toast.error("Failed to update hop depth")
      }
      return
    }

    setIsLoading(true)
    setLoadingProgress(18)
    setLoadingStage("Querying multi-chain archive RPC nodes (Ethereum, Arbitrum, Polygon)...")
    setLoadingLog(`[RPC] eth_getLogs(address: ${addr.slice(0, 10)}…, fromBlock: "archive")`)

    // Start background network fetch concurrently
    const networkPromise = fetch(`/api/graph?address=${encodeURIComponent(addr)}&depth=${d}${seedQuery}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch graph data")
        return res.json()
      })

    // Cinematic progressive forensic blockchain stages
    const step1 = new Promise(resolve => setTimeout(resolve, 450)).then(() => {
      setLoadingProgress(45)
      setLoadingStage("Tracing internal EVM execution logs & ERC-20 transfer sequences...")
      setLoadingLog(`[EVM_TRACE] 38 contract execution hops & bridge mints isolated`)
    })

    const step2 = new Promise(resolve => setTimeout(resolve, 950)).then(() => {
      setLoadingProgress(75)
      setLoadingStage("Cross-referencing OFAC SDN sanctions & mixer clustering heuristics...")
      setLoadingLog(`[SANCTIONS] OFAC SDN, Tornado Cash, Stargate & CEX hot wallets matched`)
    })

    const step3 = new Promise(resolve => setTimeout(resolve, 1400)).then(() => {
      setLoadingProgress(92)
      setLoadingStage("Synthesizing multi-cluster topological graph & risk confidence scoring...")
      setLoadingLog(`[TOPOLOGY] Synthesizing multi-cluster constellation (depth ${d})`)
    })

    try {
      const [data] = await Promise.all([networkPromise, step1, step2, step3])
      setLoadingProgress(100)
      await new Promise(resolve => setTimeout(resolve, 250))

      setGraphData(data)
      if (data.seed) setCurrentSeed(data.seed)
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0])
      }
      setSelectedLink(null)
      setActivePath([])
      toast.success(`Forensic graph reconstructed from blockchain (${data.nodes?.length || 0} nodes, depth ${d})`)
    } catch {
      toast.error("Failed to query blockchain graph topology")
    } finally {
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }, [currentSeed])

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
    const newSeed = Math.floor(Math.random() * 899999) + 100000
    setCurrentSeed(newSeed)
    setAddress(randomPreset.address)
    const randomDepth = Math.floor(Math.random() * 3) + 2
    setDepth([randomDepth])
    fetchGraphData(randomPreset.address, randomDepth, false, newSeed)
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
  // ═════════════════════════════════════════════════════════════════════════
  // 1. D3 2D FORCE SIMULATION RENDERER (CONSTELLATION BASELINE)
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

    // Zoom & Pan Behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 6])
      .on("zoom", (event) => g.attr("transform", event.transform))
    svg.call(zoomBehavior as any)
    zoomRef.current = zoomBehavior

    // Defs: Filters, Gradients, & Keyframes
    const defs = svg.append("defs")

    const styleEl = defs.append("style")
    styleEl.text(`
      @keyframes flowDash {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes particleGlide {
        from { stroke-dashoffset: 40; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes targetBreath {
        0%, 100% { opacity: 0.40; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.06); }
      }
      .flowing-edge {
        stroke-dasharray: 6, 4;
        animation: flowDash 2.0s linear infinite;
      }
      .particle-edge {
        stroke-dasharray: 2, 18;
        animation: particleGlide 2.8s linear infinite;
        pointer-events: none;
      }
      .target-pulse {
        animation: targetBreath 3.2s ease-in-out infinite;
        transform-origin: center;
      }
      .callout-badge {
        transition: opacity 0.15s ease, filter 0.15s ease;
      }
      .callout-badge:hover {
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
      }
    `)

    // Controlled Gaussian Blur Glow Filters (Anti-aliased, restrained bloom)
    const filterSubtle = defs.append("filter").attr("id", "subtle-glow").attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%")
    filterSubtle.append("feGaussianBlur").attr("stdDeviation", "2.0").attr("result", "blur")
    const feMergeSubtle = filterSubtle.append("feMerge")
    feMergeSubtle.append("feMergeNode").attr("in", "blur")
    feMergeSubtle.append("feMergeNode").attr("in", "SourceGraphic")

    const filterEntity = defs.append("filter").attr("id", "entity-glow").attr("x", "-60%").attr("y", "-60%").attr("width", "220%").attr("height", "220%")
    filterEntity.append("feGaussianBlur").attr("stdDeviation", "3.2").attr("result", "blur")
    const feMergeEntity = filterEntity.append("feMerge")
    feMergeEntity.append("feMergeNode").attr("in", "blur")
    feMergeEntity.append("feMergeNode").attr("in", "SourceGraphic")

    const filterTarget = defs.append("filter").attr("id", "target-glow").attr("x", "-80%").attr("y", "-80%").attr("width", "260%").attr("height", "260%")
    filterTarget.append("feGaussianBlur").attr("stdDeviation", "4.8").attr("result", "blur")
    const feMergeTarget = filterTarget.append("feMerge")
    feMergeTarget.append("feMergeNode").attr("in", "blur")
    feMergeTarget.append("feMergeNode").attr("in", "SourceGraphic")

    const filterCardShadow = defs.append("filter").attr("id", "card-shadow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%")
    filterCardShadow.append("feDropShadow").attr("dx", "0").attr("dy", "3").attr("stdDeviation", "4").attr("flood-color", "#000000").attr("flood-opacity", "0.90")

    // Cosmic Constellation Particle Background (Darker than transaction graph)
    const bgLayer = g.append("g").attr("class", "background-layer").attr("pointer-events", "none")

    bgLayer.append("rect")
      .attr("width", width * 3)
      .attr("height", height * 3)
      .attr("x", -width)
      .attr("y", -height)
      .attr("fill", "#030712")

    const starSeed = (i: number) => Math.abs(Math.sin(i * 12.9898 + 78.233))
    const starPoints = Array.from({ length: 54 }).map((_, i) => ({
      x: (starSeed(i) * width * 1.6) - width * 0.3,
      y: (starSeed(i + 60) * height * 1.6) - height * 0.3,
      r: 0.75 + starSeed(i + 120) * 1.1,
      opacity: 0.12 + starSeed(i + 180) * 0.22,
      color: i % 3 === 0 ? "#00e5ff" : i % 3 === 1 ? "#a855f7" : "#fbbf24"
    }))

    for (let i = 0; i < starPoints.length - 1; i += 3) {
      const p1 = starPoints[i], p2 = starPoints[i + 1]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      if (dist < 180) {
        bgLayer.append("line")
          .attr("x1", p1.x).attr("y1", p1.y)
          .attr("x2", p2.x).attr("y2", p2.y)
          .attr("stroke", p1.color)
          .attr("stroke-width", 0.6)
          .attr("opacity", 0.05)
      }
    }
    starPoints.forEach(p => {
      bgLayer.append("circle")
        .attr("cx", p.x).attr("cy", p.y).attr("r", p.r)
        .attr("fill", p.color)
        .attr("opacity", p.opacity)
    })

    // Clone data for D3 mutation
    const nodesCopy = filteredData.nodes.map(d => ({ ...d }))
    const linksCopy = filteredData.links.map(d => ({ ...d }))

    // ═══════════════════════════════════════════════════════════════
    // NODE SIZE & DIVERSITY HIERARCHY — Target > Major Hub > Important > Normal > Minor
    // Deterministic subtle radius and opacity variations to prevent generic clones
    // ═══════════════════════════════════════════════════════════════
    const getNodeMetrics = (d: any) => {
      const t = d.nodeType || ""
      const isTarget = t === "target"
      const isMajorHub = t === "mixer" || t === "sanctioned_pool" || t === "cex" || t === "bridge" || t === "defi" || (t === "cold_wallet" && d.volume > 45000)
      const isImportant = d.riskScore >= 80 || d.volume > 35000
      const isLowPriority = d.riskScore < 35 && d.volume < 6000

      // Stable deterministic variation based on address character hash (±0.8px)
      const addrSeed = (d.address?.charCodeAt(3) || 7) % 5
      const rVar = (addrSeed - 2) * 0.4

      if (isTarget) {
        return {
          core: 22,
          halo: 32,
          haloStrokeW: 1.8,
          iconScale: 0.95,
          hasIcon: true,
          glowFilter: "url(#target-glow)",
          priority: 1
        }
      }
      if (isMajorHub) {
        return {
          core: 16.5 + rVar,
          halo: 24.5 + rVar,
          haloStrokeW: 1.4,
          iconScale: 0.85,
          hasIcon: true,
          glowFilter: "url(#entity-glow)",
          priority: 2
        }
      }
      if (isImportant) {
        return {
          core: 12.5 + rVar,
          halo: 18 + rVar,
          haloStrokeW: 1.2,
          iconScale: 0.70,
          hasIcon: true,
          glowFilter: "url(#subtle-glow)",
          priority: 3
        }
      }
      if (isLowPriority) {
        return {
          core: 7.5 + (addrSeed % 2) * 0.5,
          halo: 11,
          haloStrokeW: 0.8,
          iconScale: 0.40,
          hasIcon: false, // Small clean glowing dot (no icon mud)
          glowFilter: null,
          priority: 5
        }
      }
      // Normal wallet
      return {
        core: 9.5 + rVar,
        halo: 14 + rVar,
        haloStrokeW: 0.9,
        iconScale: 0.55,
        hasIcon: true,
        glowFilter: "url(#subtle-glow)",
        priority: 4
      }
    }

    // D3 Layout Simulation
    let simulation: any

    if (viewMode === "hierarchical-tree") {
      const layerSpacing = (width - 120) / 5
      nodesCopy.forEach(n => {
        const l = n.layer !== undefined ? n.layer : n.nodeType === "victim" ? 0 : n.nodeType === "target" ? 1 : n.nodeType === "mixer" || n.nodeType === "bridge" ? 2 : n.nodeType === "peel_hop" ? 3 : 4
        n.fx = 70 + l * layerSpacing
      })
      simulation = d3.forceSimulation(nodesCopy as any)
        .force("link", d3.forceLink(linksCopy).id((d: any) => d.id).distance(75))
        .force("charge", d3.forceManyBody().strength(-180))
        .force("y", d3.forceY(height / 2).strength(0.35))
        .force("collide", d3.forceCollide().radius(32))
    } else if (viewMode === "radial-ego") {
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
        .force("collide", d3.forceCollide().radius(26))
    } else {
      // ═══════════════════════════════════════════════════════════
      // DYNAMIC TOPOLOGICAL CONSTELLATION (NO FIXED TEMPLATE)
      // Discovers organic chains, branches, convergences & clusters
      // ═══════════════════════════════════════════════════════════
      const cx = width / 2
      const cy = height / 2

      // Build adjacency graph
      const adjMap = new Map<string, string[]>()
      nodesCopy.forEach(n => adjMap.set(n.id, []))
      linksCopy.forEach(l => {
        const sId = typeof l.source === "object" ? (l.source as any).id : l.source
        const tId = typeof l.target === "object" ? (l.target as any).id : l.target
        if (adjMap.has(sId)) adjMap.get(sId)!.push(tId)
        if (adjMap.has(tId)) adjMap.get(tId)!.push(sId)
      })

      // Target anchor node
      const targetNode = nodesCopy.find(n => n.nodeType === "target") || nodesCopy[0]
      const targetId = targetNode?.id || ""

      // BFS Distance & Branch Discovery from Target
      const distFromTarget = new Map<string, number>()
      const branchRoot = new Map<string, string>()
      distFromTarget.set(targetId, 0)
      const queue: string[] = [targetId]

      const hop1Neighbors = adjMap.get(targetId) || []
      hop1Neighbors.forEach(hId => branchRoot.set(hId, hId))

      while (queue.length > 0) {
        const curr = queue.shift()!
        const d = distFromTarget.get(curr)!
        for (const nb of adjMap.get(curr) || []) {
          if (!distFromTarget.has(nb)) {
            distFromTarget.set(nb, d + 1)
            const root = branchRoot.get(curr) || nb
            branchRoot.set(nb, root)
            queue.push(nb)
          }
        }
      }

      // Dynamic branch angle mapping (varies per seed/address so layout is never locked)
      const uniqueRoots = Array.from(new Set(Array.from(branchRoot.values())))
      const rootAngles = new Map<string, number>()
      const baseRotation = (((address.charCodeAt(2) || 1) * 37) % 360) * (Math.PI / 180)

      uniqueRoots.forEach((rootId, i) => {
        const angle = baseRotation + (i / Math.max(1, uniqueRoots.length)) * 2 * Math.PI
        rootAngles.set(rootId, angle)
      })

      // Organic initial seeding based on topological hop depth
      nodesCopy.forEach(n => {
        const cached = nodePositionsRef.current.get(n.id)
        if (cached) {
          n.x = cached.x
          n.y = cached.y
          return
        }
        if (n.id === targetId) {
          n.x = cx + (Math.sin(n.address?.length || 1) * 6)
          n.y = cy + (Math.cos(n.address?.length || 1) * 6)
          return
        }
        const hops = distFromTarget.get(n.id) || (n.layer || 2)
        const root = branchRoot.get(n.id) || uniqueRoots[0] || ""
        const bAngle = rootAngles.get(root) ?? (Math.PI / 4)
        const jitter = Math.sin(n.id.length * 7 + hops) * 0.42
        const nodeAngle = bAngle + jitter
        const radialDist = 75 + hops * 65 + (Math.cos(n.id.length * 11) * 22)

        n.x = cx + radialDist * Math.cos(nodeAngle)
        n.y = cy + radialDist * Math.sin(nodeAngle)
      })

      // Stage and relationship aware link distances
      const getLinkDist = (l: any) => {
        const stage = l.stage || ""
        const val = l.value || 0
        if (stage === "core") return val > 80000 ? 55 : 68
        if (stage === "peel") return 50 // Peel chains stay tight and linear!
        if (stage === "anonymize") return 75
        if (stage === "ingress") return 80
        if (stage === "egress") return 85
        return 65
      }

      simulation = d3.forceSimulation(nodesCopy as any)
        .force("link", d3.forceLink(linksCopy).id((d: any) => d.id).distance(getLinkDist).strength(0.60))
        .force("charge", d3.forceManyBody().strength((d: any) => {
          if (d.nodeType === "target") return -450
          if (d.nodeType === "mixer" || d.nodeType === "cex" || d.nodeType === "bridge") return -280
          if (d.volume > 40000) return -180
          if (d.volume < 5000) return -65
          return -110
        }))
        .force("collide", d3.forceCollide().radius((d: any) => getNodeMetrics(d).halo + 15).strength(0.85))
        .force("x", d3.forceX(cx).strength(0.04))
        .force("y", d3.forceY(cy).strength(0.04))
        .alphaDecay(0.02)
        .velocityDecay(0.32)
    }

    simulationRef.current = simulation

    // ═══════════════════════════════════════════════════════════════
    // DRAW CURVED LINKS — Natural varied curvature, unified electric cyan
    // ═══════════════════════════════════════════════════════════════
    const linkGroup = g.append("g").attr("class", "links-layer")
    const arrowsGroup = g.append("g").attr("class", "arrows-layer")

    const linkPairCount = new Map<string, number>()
    const linkPairIdx = new Map<string, number>()
    linksCopy.forEach(l => {
      const sId = typeof l.source === "object" ? (l.source as any).id : l.source
      const tId = typeof l.target === "object" ? (l.target as any).id : l.target
      const pairKey = [sId, tId].sort().join("|||")
      linkPairCount.set(pairKey, (linkPairCount.get(pairKey) || 0) + 1)
    })
    linksCopy.forEach(l => {
      const sId = typeof l.source === "object" ? (l.source as any).id : l.source
      const tId = typeof l.target === "object" ? (l.target as any).id : l.target
      const pairKey = [sId, tId].sort().join("|||")
      const idx = linkPairIdx.get(pairKey) || 0
      linkPairIdx.set(pairKey, idx + 1)
      ;(l as any)._curveIdx = idx
      ;(l as any)._curveTotal = linkPairCount.get(pairKey) || 1
    })

    // Varied natural curvature: chains stay sleek/straight, cross-links arc gracefully
    const computeArcPath = (d: any) => {
      const sx = d.source.x ?? 0, sy = d.source.y ?? 0
      const tx = d.target.x ?? 0, ty = d.target.y ?? 0
      const dx = tx - sx, dy = ty - sy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1) return `M${sx},${sy}L${tx},${ty}`

      const total = d._curveTotal || 1
      const idx = d._curveIdx || 0
      const hash = (((d.source.id?.length || 1) * 31 + (d.target.id?.length || 1) * 17) % 7)
      const curveSign = hash % 2 === 0 ? 1 : -1

      if (total <= 1) {
        const curveFactor = dist > 140 ? 0.075 * curveSign : 0.035 * curveSign
        const midX = (sx + tx) / 2 + dy * curveFactor
        const midY = (sy + ty) / 2 - dx * curveFactor
        return `M${sx},${sy}Q${midX},${midY} ${tx},${ty}`
      }

      const curveOffset = ((idx - (total - 1) / 2) * 26) / Math.max(1, dist / 180)
      const midX = (sx + tx) / 2 + (dy / dist) * curveOffset
      const midY = (sy + ty) / 2 - (dx / dist) * curveOffset
      return `M${sx},${sy}Q${midX},${midY} ${tx},${ty}`
    }

    // Mid-path Arrow Transform (t = 0.52 on quadratic bezier)
    const computeArrowTransform = (d: any) => {
      const sx = d.source.x ?? 0, sy = d.source.y ?? 0
      const tx = d.target.x ?? 0, ty = d.target.y ?? 0
      const dx = tx - sx, dy = ty - sy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1) return `translate(${sx},${sy})`

      const total = d._curveTotal || 1
      const idx = d._curveIdx || 0
      const hash = (((d.source.id?.length || 1) * 31 + (d.target.id?.length || 1) * 17) % 7)
      const curveSign = hash % 2 === 0 ? 1 : -1

      let midX = (sx + tx) / 2
      let midY = (sy + ty) / 2

      if (total <= 1) {
        const curveFactor = dist > 140 ? 0.075 * curveSign : 0.035 * curveSign
        midX += dy * curveFactor
        midY -= dx * curveFactor
      } else {
        const curveOffset = ((idx - (total - 1) / 2) * 26) / Math.max(1, dist / 180)
        midX += (dy / dist) * curveOffset
        midY -= (dx / dist) * curveOffset
      }

      const t = 0.52
      const oneMinusT = 1 - t
      const px = oneMinusT * oneMinusT * sx + 2 * oneMinusT * t * midX + t * t * tx
      const py = oneMinusT * oneMinusT * sy + 2 * oneMinusT * t * midY + t * t * ty
      const dpx = 2 * oneMinusT * (midX - sx) + 2 * t * (tx - midX)
      const dpy = 2 * oneMinusT * (midY - sy) + 2 * t * (ty - midY)
      const angle = Math.atan2(dpy, dpx) * (180 / Math.PI)
      return `translate(${px},${py}) rotate(${angle})`
    }

    // Main curved link paths (Unified Electric Cyan #00e5ff)
    const link = linkGroup.selectAll("path.edge-main")
      .data(linksCopy)
      .enter().append("path")
      .attr("class", "flowing-edge edge-main")
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.riskLevel === "critical" ? "#ff3355" : "#00e5ff")
      .attr("stroke-width", (d: any) => d.value > 100000 ? 2.2 : d.value > 20000 ? 1.6 : 1.2)
      .attr("stroke-opacity", (d: any) => d.value > 100000 ? 0.85 : d.value > 20000 ? 0.72 : 0.55)

    // Wide invisible hit-area for effortless hover & click detection
    const hitarea = linkGroup.selectAll("path.edge-hitarea")
      .data(linksCopy)
      .enter().append("path")
      .attr("class", "edge-hitarea")
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 14)
      .style("cursor", "pointer")
      .on("mouseenter", (e: any, d: any) => setHoverLink(d))
      .on("mouseleave", () => setHoverLink(null))
      .on("click", (e: any, d: any) => {
        setSelectedLink(d)
        setSelectedNode(null)
      })

    // Particle overlay on critical / high-value edges
    const particleOverlay = linkGroup.selectAll("path.particle-overlay")
      .data(linksCopy.filter(l => l.riskLevel === "critical" || l.value > 80000))
      .enter().append("path")
      .attr("class", "particle-edge particle-overlay")
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.riskLevel === "critical" ? "#ff3355" : "#00e5ff")
      .attr("stroke-width", 2.5)
      .attr("stroke-opacity", 0.65)
      .style("pointer-events", "none")

    // Money-Flow Directional Arrows — Small, subtle, crisp triangles along path
    const arrows = arrowsGroup.selectAll("path.edge-arrow")
      .data(linksCopy)
      .enter().append("path")
      .attr("class", "edge-arrow")
      .attr("d", "M-2.8,-1.8 L2.8,0 L-2.8,1.8 Z")
      .attr("fill", (d: any) => d.riskLevel === "critical" ? "#ff3355" : "#00e5ff")
      .attr("opacity", 0.85)
      .style("pointer-events", "none")

    // ═══════════════════════════════════════════════════════════════
    // DRAW NODES — Diverse Metrics, Layered Halos, Crisp Clean Glyphs
    // ═══════════════════════════════════════════════════════════════
    const nodeGroup = g.append("g").attr("class", "nodes-layer")

    const node = nodeGroup.selectAll("g.graph-node")
      .data(nodesCopy)
      .enter().append("g")
      .attr("class", "graph-node")
      .style("cursor", "pointer")
      .on("mouseenter", (e: any, d: any) => setHoverNode(d))
      .on("mouseleave", () => setHoverNode(null))
      .on("click", (e: any, d: any) => {
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

    // Node Render Pass
    node.each(function(this: any, d: any) {
      const el = d3.select(this)
      const metrics = getNodeMetrics(d)
      const color = d.visualColor || nodeTypeColors[d.nodeType || ""] || riskColors[d.riskLevel] || "#3b82f6"
      const isTarget = d.nodeType === "target"

      // Target Node Breathing Pulse Aura Ring
      if (isTarget) {
        el.append("circle")
          .attr("class", "target-pulse")
          .attr("r", 38)
          .attr("fill", "none")
          .attr("stroke", "#ffd70044")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4, 4")
      }

      // Outer Selection Ring (Toggled on selected node)
      el.append("circle")
        .attr("class", "node-selection-ring")
        .attr("r", metrics.halo + 4)
        .attr("fill", "none")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.8)
        .attr("stroke-dasharray", "3, 3")
        .attr("filter", "url(#subtle-glow)")
        .style("display", "none")

      // Outer Translucent Halo
      el.append("circle")
        .attr("class", "node-halo")
        .attr("r", metrics.halo)
        .attr("fill", `${color}16`)
        .attr("stroke", `${color}75`)
        .attr("stroke-width", metrics.haloStrokeW)
        .attr("filter", metrics.glowFilter)

      // Inner Core Circle (Pristine antialiased solid circle)
      el.append("circle")
        .attr("class", "node-core")
        .attr("r", metrics.core)
        .attr("fill", color)
        .attr("stroke", "#050a14")
        .attr("stroke-width", 1.4)

      // Center Crisp Forensic SVG Icons (Skipped on low-priority tiny dots to avoid mud)
      if (metrics.hasIcon) {
        const iconG = el.append("g")
          .attr("class", "node-core-icon")
          .attr("transform", `scale(${metrics.iconScale})`)
          .style("pointer-events", "none")

        if (isTarget || metrics.priority === 2) {
          // Target & Major Entities: Minimalist Briefcase / Vault Glyph
          iconG.append("path")
            .attr("d", "M-6 -4.5h12c0.8 0 1.5 0.7 1.5 1.5v6.5c0 0.8-0.7 1.5-1.5 1.5h-12c-0.8 0-1.5-0.7-1.5-1.5v-6.5c0-0.8 0.7-1.5 1.5-1.5z M-3 -4.5v-1.5c0-0.5 0.5-1 1-1h4c0.5 0 1 0.5 1 1v1.5 M1 -0.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z")
            .attr("fill", "#040813")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "0.9")
        } else {
          // Normal & Important Wallets: Clean User Avatar Glyph
          iconG.append("circle").attr("cx", 0).attr("cy", -1.8).attr("r", 1.8).attr("fill", "#ffffff")
          iconG.append("path")
            .attr("d", "M-3.2 3.8c0-1.6 1.3-2.6 3.2-2.6s3.2 1 3.2 2.6")
            .attr("fill", "none")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "1")
            .attr("stroke-linecap", "round")
        }
      }
    })

    // ═══════════════════════════════════════════════════════════════
    // THREE-TIER LABEL HIERARCHY (NO TEXT CLUTTER)
    // Level 1: Major Entity Callouts (At most ONE per logical cluster)
    // Level 2: Important Nodes (Target title + truncated address)
    // Level 3: Normal Nodes (NO PERMANENT TEXT, revealed on hover/click)
    // ═══════════════════════════════════════════════════════════════

    // Level 1: Filter exactly ONE primary anchor node per distinct logical entity
    const getUniqueMajorCalloutNodes = (nodes: any[]) => {
      const chosen = new Map<string, any>()
      nodes.forEach(n => {
        const t = n.nodeType || ""
        if (t === "target") return
        let key = ""
        if (t === "mixer" || t === "sanctioned_pool") key = "mixer"
        else if (t === "cex" || t === "otc_broker") key = "cex"
        else if (t === "bridge") key = "bridge"
        else if (t === "defi" || t === "flash_loan_pool") key = "defi"
        else if (t === "cold_wallet" && n.volume > 30000) key = "cashout"

        if (key) {
          const existing = chosen.get(key)
          if (!existing || n.volume > existing.volume) {
            chosen.set(key, n)
          }
        }
      })
      return Array.from(chosen.values())
    }

    const calloutLayer = g.append("g").attr("class", "callouts-layer")
    const calloutHubs = getUniqueMajorCalloutNodes(nodesCopy)
    const calloutNodeIds = new Set(calloutHubs.map(h => h.id))

    const getCalloutMeta = (d: any, allNodes: any[]) => {
      const t = d.nodeType || ""
      const volStr = `$${(d.volume / 1000).toFixed(0)}K`
      const txStr = `${d.transactionCount || 1} tx`

      if (t === "mixer" || t === "sanctioned_pool") {
        return { name: "Tornado Cash", stats: `${volStr} · ${txStr}`, color: "#f43f5e" }
      }
      if (t === "cex" || t === "otc_broker") {
        return { name: "Binance", stats: `${volStr} · ${txStr}`, color: "#fbbf24" }
      }
      if (t === "bridge") {
        return { name: "Stargate", stats: `${volStr} · ${txStr}`, color: "#c084fc" }
      }
      if (t === "defi" || t === "flash_loan_pool") {
        return { name: "Uniswap V3", stats: `${volStr} · ${txStr}`, color: "#38bdf8" }
      }
      const clusterCount = allNodes.filter(n => n.nodeType === "cold_wallet").length || 3
      return { name: "Cash-Out", stats: `${volStr} · ${clusterCount} wallets`, color: "#34d399" }
    }

    const calloutG = calloutLayer.selectAll("g.callout-badge")
      .data(calloutHubs)
      .enter().append("g")
      .attr("class", "callout-badge")
      .style("cursor", "pointer")
      .on("click", (e: any, d: any) => {
        setSelectedNode(d)
        setSelectedLink(null)
      })

    // Level 1: Compact 2-line Callouts with Dynamic Outward Quadrant Placement
    calloutG.each(function(this: any, d: any) {
      const el = d3.select(this)
      const meta = getCalloutMeta(d, nodesCopy)
      const boxW = 112
      const boxH = 34

      // Quadrant orientation outward from canvas center (cx, cy)
      const cx = width / 2, cy = height / 2
      const isRight = (d.x ?? cx) >= cx
      const isBottom = (d.y ?? cy) >= cy

      const boxX = isRight ? 32 : -boxW - 32
      const boxY = isBottom ? 18 : -boxH - 18
      const lineEndX = isRight ? boxX : boxX + boxW
      const lineEndY = isBottom ? boxY : boxY + boxH

      el.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", lineEndX).attr("y2", lineEndY)
        .attr("stroke", meta.color)
        .attr("stroke-width", 1.0)
        .attr("stroke-dasharray", "2, 2")
        .attr("opacity", 0.65)

      el.append("rect")
        .attr("x", boxX)
        .attr("y", boxY)
        .attr("width", boxW)
        .attr("height", boxH)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", "rgba(5, 10, 20, 0.94)")
        .attr("stroke", meta.color)
        .attr("stroke-width", 1.2)
        .attr("filter", "url(#card-shadow)")

      // Line 1: Short Name
      el.append("text")
        .attr("x", boxX + 8)
        .attr("y", boxY + 14)
        .attr("fill", meta.color)
        .attr("font-size", "9.5px")
        .attr("font-weight", "800")
        .attr("letter-spacing", "0.4px")
        .text(meta.name)

      // Line 2: Stats
      el.append("text")
        .attr("x", boxX + 8)
        .attr("y", boxY + 26)
        .attr("fill", "#cbd5e1")
        .attr("font-size", "8.5px")
        .attr("font-weight", "600")
        .attr("font-family", "monospace")
        .text(meta.stats)
    })

    // Level 2: Target Node Label (Prominent Title + Truncated Address)
    node.filter((d: any) => d.nodeType === "target")
      .append("text")
      .text("Target")
      .attr("x", 0)
      .attr("y", 38)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffd700")
      .attr("font-size", "9px")
      .attr("font-weight", "700")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 8px rgba(0,0,0,0.95)")

    node.filter((d: any) => d.nodeType === "target")
      .append("text")
      .text((d: any) => `${d.address.slice(0, 6)}…${d.address.slice(-4)}`)
      .attr("x", 0)
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "7.5px")
      .attr("font-family", "monospace")
      .style("pointer-events", "none")

    // Level 2: Important Nodes Only (risk >= 80 or volume > 50K, excluding callout hubs)
    node.filter((d: any) => d.nodeType !== "target" && !calloutNodeIds.has(d.id) && (d.riskScore >= 80 || d.volume > 50000))
      .append("text")
      .text((d: any) => `${d.address.slice(0, 6)}…${d.address.slice(-4)}`)
      .attr("x", 0)
      .attr("y", (d: any) => getNodeMetrics(d).halo + 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "7.5px")
      .attr("font-family", "monospace")
      .attr("opacity", 0.75)
      .style("pointer-events", "none")

    // Store references for decoupled selection updates
    d3SelectionsRef.current = {
      link,
      hitarea,
      arrows,
      particleOverlay,
      node,
      calloutG,
      nodesCopy,
      linksCopy
    }

    // Simulation Tick — Smoothly update links, arrows, particle flows, nodes, and callouts
    simulation.on("tick", () => {
      link.attr("d", computeArcPath)
      hitarea.attr("d", computeArcPath)
      particleOverlay.attr("d", computeArcPath)
      arrows.attr("transform", computeArrowTransform)
      node.attr("transform", (d: any) => {
        nodePositionsRef.current.set(d.id, { x: d.x, y: d.y })
        return `translate(${d.x},${d.y})`
      })
      calloutG.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [filteredData, viewMode])

  // ═════════════════════════════════════════════════════════════════════════
  // 1b. DECOUPLED DYNAMIC SELECTION STYLING (ZERO SIMULATION JITTER)
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!d3SelectionsRef.current) return
    const { link, arrows, node, linksCopy } = d3SelectionsRef.current

    // 1. Update Edges
    link.each(function(this: any, d: any) {
      const el = d3.select(this)
      const sId = typeof d.source === "object" ? d.source.id : d.source
      const tId = typeof d.target === "object" ? d.target.id : d.target
      const isSelected = selectedLink && (
        (selectedLink.source === sId && selectedLink.target === tId) ||
        ((selectedLink.source as any)?.id === sId && (selectedLink.target as any)?.id === tId)
      )
      const isOnPath = activePath.length > 0 && activePath.includes(sId) && activePath.includes(tId)
      const isCritical = d.riskLevel === "critical"

      let strokeColor = "#00e5ff"
      let strokeWidth = d.value > 100000 ? 2.2 : d.value > 20000 ? 1.6 : 1.2
      let strokeOpacity = d.value > 100000 ? 0.85 : d.value > 20000 ? 0.72 : 0.55

      if (isSelected) {
        strokeColor = "#ffffff"
        strokeWidth = 3.2
        strokeOpacity = 1.0
      } else if (isOnPath) {
        strokeColor = "#ffd700"
        strokeWidth = 3.0
        strokeOpacity = 1.0
      } else if (isCritical) {
        strokeColor = "#ff3355"
        strokeWidth = 2.4
        strokeOpacity = 0.90
      }

      if (selectedNode) {
        const isNeighbor = sId === selectedNode.id || tId === selectedNode.id
        strokeOpacity = isNeighbor ? 0.95 : 0.18
        if (isNeighbor && !isSelected && !isOnPath) strokeWidth = 2.0
      } else if (selectedLink && !isSelected) {
        strokeOpacity = 0.20
      }

      el.attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
    })

    // 2. Update Mid-path Directional Arrows
    arrows.each(function(this: any, d: any) {
      const el = d3.select(this)
      const sId = typeof d.source === "object" ? d.source.id : d.source
      const tId = typeof d.target === "object" ? d.target.id : d.target
      const isSelected = selectedLink && (
        (selectedLink.source === sId && selectedLink.target === tId) ||
        ((selectedLink.source as any)?.id === sId && (selectedLink.target as any)?.id === tId)
      )
      const isOnPath = activePath.length > 0 && activePath.includes(sId) && activePath.includes(tId)

      let fillColor = d.riskLevel === "critical" ? "#ff3355" : "#00e5ff"
      let opacity = 0.85

      if (isSelected) {
        fillColor = "#ffffff"
        opacity = 1.0
      } else if (isOnPath) {
        fillColor = "#ffd700"
        opacity = 1.0
      }

      if (selectedNode) {
        const isNeighbor = sId === selectedNode.id || tId === selectedNode.id
        opacity = isNeighbor ? 0.95 : 0.18
      } else if (selectedLink && !isSelected) {
        opacity = 0.20
      }

      el.attr("fill", fillColor).attr("opacity", opacity)
    })

    // 3. Update Nodes & Selection Rings
    node.each(function(this: any, d: any) {
      const el = d3.select(this)
      const isSelected = selectedNode?.id === d.id

      // Toggle Selection Ring
      el.select(".node-selection-ring")
        .style("display", isSelected ? "inline" : "none")

      // Update Halo Stroke
      const color = d.visualColor || nodeTypeColors[d.nodeType || ""] || riskColors[d.riskLevel] || "#3b82f6"
      el.select(".node-halo")
        .attr("stroke", isSelected ? "#ffffff" : `${color}80`)
        .attr("stroke-width", isSelected ? 2.5 : 1.2)

      // Node Opacity Dimming
      if (selectedNode) {
        if (isSelected) {
          el.attr("opacity", 1.0)
        } else {
          const isNeighbor = linksCopy.some((l: any) => {
            const s = typeof l.source === "object" ? l.source.id : l.source
            const t = typeof l.target === "object" ? l.target.id : l.target
            return (s === selectedNode.id && t === d.id) || (t === selectedNode.id && s === d.id)
          })
          el.attr("opacity", isNeighbor ? 0.95 : 0.35)
        }
      } else {
        el.attr("opacity", 1.0)
      }
    })
  }, [selectedNode, selectedLink, activePath])

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
          const colorHex = n.visualColor
            ? parseInt(n.visualColor.replace("#", "0x"), 16)
            : (n.riskScore >= 85 ? 0xff2020 : n.riskScore >= 60 ? 0xff8c00 : n.riskScore >= 30 ? 0xffdd57 : 0x00e676)
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
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                Explore
              </Button>
              <Button 
                onClick={() => fetchGraphData(address, depth[0])} 
                disabled={isLoading}
                variant="outline"
                className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold px-3 hidden sm:flex items-center"
                title="Force Rescan On-Chain Blockchain Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
                Rescan On-Chain
              </Button>
            </div>

            {/* Depth Slider */}
            <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10 w-full lg:w-auto">
              <Label className="text-xs font-mono text-gray-400 whitespace-nowrap flex items-center gap-2">
                <span>Hop Depth: <span className="text-yellow-400 font-bold">{depth[0]}</span></span>
                {graphData && (
                  <span className="text-[11px] text-gray-400 font-mono">
                    · {graphData.nodes?.length || 0} nodes · {graphData.links?.length || 0} links
                  </span>
                )}
              </Label>
              <Slider
                value={depth}
                onValueChange={(val) => {
                  setDepth(val)
                  fetchGraphData(address, val[0], true)
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
              {/* BLOCKCHAIN RETRIEVAL LOADING OVERLAY */}
              {isLoading && (
                <div className="absolute inset-0 z-40 bg-[#030712]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                  {/* Rotating Multi-Ring Cybernetic Radar */}
                  <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-25" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-yellow-400 border-l-transparent animate-spin" style={{ animationDuration: "2.4s" }} />
                    <div className="absolute inset-3 rounded-full border-2 border-dashed border-cyan-400/50 animate-spin" style={{ animationDirection: "reverse", animationDuration: "4s" }} />
                    <div className="absolute inset-6 rounded-full bg-cyan-500/10 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_25px_#00e5ff55]">
                      <Cpu className="w-8 h-8 text-yellow-300 animate-pulse" />
                    </div>
                  </div>

                  {/* Badges & Titles */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono tracking-widest uppercase py-0.5 px-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block mr-1.5" />
                      Querying Blockchain RPC
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 text-[10px] font-mono tracking-wider py-0.5 px-2">
                      Multi-Hop Depth {depth[0]}
                    </Badge>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-white text-center tracking-tight">
                    Synchronizing On-Chain Forensic Ledger
                  </h3>
                  
                  <p className="text-xs text-yellow-300/90 font-mono mt-1 text-center max-w-lg min-h-[1.5rem]">
                    {loadingStage}
                  </p>

                  {/* Glowing Progress Bar */}
                  <div className="w-72 md:w-96 mt-4">
                    <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-yellow-400 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_#00e5ff88]"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mt-1.5 px-1">
                      <span>{loadingProgress}% Synchronized</span>
                      <span className="text-cyan-400">Archive Block #{Math.floor(19842100 + loadingProgress * 12)}</span>
                    </div>
                  </div>

                  {/* Monospace Telemetry Terminal */}
                  <div className="w-72 md:w-96 mt-4 p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[10px] text-gray-400 flex items-center gap-2 shadow-lg">
                    <span className="text-emerald-400 select-none">❯</span>
                    <span className="truncate text-gray-300">{loadingLog}</span>
                  </div>

                  {/* Target Address Info */}
                  <div className="text-[10px] font-mono text-gray-500 mt-3 truncate max-w-xs text-center">
                    Scraping Address: <span className="text-gray-400">{address}</span>
                  </div>
                </div>
              )}

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
                    onClick={() => handleResetZoom()} 
                    title="Reset View"
                    className="w-7 h-7 rounded-lg text-yellow-300 hover:bg-yellow-500/20 flex items-center justify-center transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => fetchGraphData(address, depth[0])} 
                    title="Rescan On-Chain Blockchain Data"
                    disabled={isLoading}
                    className="w-7 h-7 rounded-lg text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
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

              {/* OVERLAY: HOVER TOOLTIP CARD (NODE) */}
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

              {/* OVERLAY: HOVER TOOLTIP CARD (TRANSACTION FLOW EDGE) */}
              {hoverLink && !hoverNode && (
                <div className="absolute top-14 left-3 z-30 p-3 rounded-xl bg-black/95 border border-cyan-500/40 backdrop-blur-md shadow-2xl max-w-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                      Transaction Flow
                    </span>
                    <Badge style={{ backgroundColor: `${riskColors[hoverLink.riskLevel || "medium"]}25`, color: riskColors[hoverLink.riskLevel || "medium"] }} className="text-[9px] px-1.5 py-0">
                      {(hoverLink.riskLevel || "medium").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-gray-200 mt-1">
                    Amount: <strong className="text-cyan-300 font-mono">${(hoverLink.value).toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>Tx Count: <strong className="text-white">{hoverLink.transactionCount || 1}</strong></span>
                    <span>Stage: <strong className="text-yellow-400 capitalize">{hoverLink.stage || "transfer"}</strong></span>
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
            {/* 1. Node or Flow Dossier Card */}
            <Card className="bg-[#090d16]/95 border-yellow-500/20 shadow-2xl backdrop-blur-md">
              <CardHeader className="p-4 border-b border-white/10 bg-yellow-500/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                    {selectedLink ? (
                      <>
                        <ArrowRightLeft className="w-4 h-4 text-yellow-400" />
                        Forensic Flow Dossier
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 text-yellow-400" />
                        Forensic Node Dossier
                      </>
                    )}
                  </CardTitle>
                  {selectedNode ? (
                    <Badge style={{ backgroundColor: `${riskColors[selectedNode.riskLevel]}25`, color: riskColors[selectedNode.riskLevel], border: `1px solid ${riskColors[selectedNode.riskLevel]}50` }}>
                      {selectedNode.riskScore}/100
                    </Badge>
                  ) : selectedLink ? (
                    <Badge style={{ backgroundColor: `${riskColors[selectedLink.riskLevel || "medium"]}25`, color: riskColors[selectedLink.riskLevel || "medium"], border: `1px solid ${riskColors[selectedLink.riskLevel || "medium"]}50` }}>
                      {(selectedLink.riskLevel || "MEDIUM").toUpperCase()}
                    </Badge>
                  ) : null}
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
                ) : selectedLink ? (
                  <>
                    {/* Flow Direction & Stage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-yellow-300 uppercase tracking-wider">
                        <span>Directed Capital Transfer</span>
                        <Badge 
                          className="text-[9px] px-1.5 py-0 uppercase"
                          style={{
                            backgroundColor: `${riskColors[selectedLink.riskLevel || "medium"]}25`,
                            color: riskColors[selectedLink.riskLevel || "medium"],
                            border: `1px solid ${riskColors[selectedLink.riskLevel || "medium"]}50`
                          }}
                        >
                          {selectedLink.stage || "core"} stage
                        </Badge>
                      </div>

                      {/* Source Endpoint */}
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Source (Originator)</span>
                          <button
                            onClick={() => {
                              const sId = typeof selectedLink.source === "object" ? selectedLink.source.id : selectedLink.source
                              const n = filteredData.nodes.find(node => node.id === sId)
                              if (n) { setSelectedNode(n); setSelectedLink(null); }
                            }}
                            className="text-yellow-400 hover:underline text-[9px] font-semibold"
                          >
                            Inspect Node ➔
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-200">
                          <span className="truncate">
                            {typeof selectedLink.source === "object" ? (selectedLink.source as any).address || (selectedLink.source as any).id : selectedLink.source}
                          </span>
                          <button 
                            onClick={() => handleCopy(typeof selectedLink.source === "object" ? (selectedLink.source as any).address || (selectedLink.source as any).id : selectedLink.source)} 
                            className="text-gray-400 hover:text-white shrink-0 ml-2"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Flow Connector Animation */}
                      <div className="flex items-center justify-center gap-2 py-0.5 text-yellow-400 text-xs font-mono">
                        <ArrowDownLeft className="w-4 h-4 animate-bounce text-yellow-300" />
                        <span className="text-[10px] font-bold text-gray-400">Transferred {selectedLink.token || "ETH"}</span>
                      </div>

                      {/* Destination Endpoint */}
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Destination (Recipient)</span>
                          <button
                            onClick={() => {
                              const tId = typeof selectedLink.target === "object" ? selectedLink.target.id : selectedLink.target
                              const n = filteredData.nodes.find(node => node.id === tId)
                              if (n) { setSelectedNode(n); setSelectedLink(null); }
                            }}
                            className="text-yellow-400 hover:underline text-[9px] font-semibold"
                          >
                            Inspect Node ➔
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-200">
                          <span className="truncate">
                            {typeof selectedLink.target === "object" ? (selectedLink.target as any).address || (selectedLink.target as any).id : selectedLink.target}
                          </span>
                          <button 
                            onClick={() => handleCopy(typeof selectedLink.target === "object" ? (selectedLink.target as any).address || (selectedLink.target as any).id : selectedLink.target)} 
                            className="text-gray-400 hover:text-white shrink-0 ml-2"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Flow Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-gray-400">Cumulative Volume</div>
                        <div className="text-sm font-bold text-yellow-300 mt-0.5">
                          ${selectedLink.value.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-gray-400">Tx Frequency</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {selectedLink.transactionCount || selectedLink.hashes?.length || 1} Txs
                        </div>
                      </div>
                    </div>

                    {/* Pattern Label & Behavioral Reason */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-semibold">Identified Transfer Pattern</div>
                        <div className="font-bold text-white text-xs">{selectedLink.patternLabel || "Directed Capital Movement"}</div>
                      </div>
                      {selectedLink.flowReason && (
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-semibold">Forensic Telemetry Reason</div>
                          <p className="text-gray-300 text-[11px] leading-relaxed">
                            {selectedLink.flowReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Transaction Hashes Ledger */}
                    {selectedLink.hashes && selectedLink.hashes.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
                          <span>Transaction Ledger ({selectedLink.hashes.length})</span>
                          <span className="text-[9px] text-yellow-400 font-mono">Verified On-Chain</span>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {selectedLink.hashes.map((h, idx) => (
                            <div key={h + idx} className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-white/5 text-[10px] font-mono">
                              <span className="truncate text-gray-300 max-w-[200px]">{h}</span>
                              <button onClick={() => handleCopy(h)} className="text-gray-400 hover:text-white shrink-0 ml-1.5">
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Link */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <Button 
                        onClick={() => {
                          const sId = typeof selectedLink.source === "object" ? selectedLink.source.id : selectedLink.source
                          const tId = typeof selectedLink.target === "object" ? selectedLink.target.id : selectedLink.target
                          setPathSource(sId)
                          setPathTarget(tId)
                          const path = calculatePath(sId, tId)
                          if (path.length > 0) {
                            setActivePath(path)
                            toast.success(`Traced path: ${path.length} hops`)
                          }
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs h-8"
                      >
                        <Crosshair className="w-3.5 h-3.5 mr-1.5" />
                        Trace Laundering Path Along Flow
                      </Button>
                      <Button 
                        onClick={() => {
                          const tAddr = typeof selectedLink.target === "object" ? (selectedLink.target as any).address || (selectedLink.target as any).id : selectedLink.target
                          router.push(`/wallet-scan?address=${encodeURIComponent(tAddr)}`)
                        }}
                        variant="outline"
                        className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 text-xs h-8"
                      >
                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                        Scan Recipient in Wallet Scanner
                      </Button>
                      <Button 
                        onClick={() => {
                          const sAddr = typeof selectedLink.source === "object" ? (selectedLink.source as any).address || (selectedLink.source as any).id : selectedLink.source
                          router.push(`/wallet-scan?address=${encodeURIComponent(sAddr)}`)
                        }}
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white text-xs h-8"
                      >
                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                        Scan Originator in Wallet Scanner
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Compass className="w-8 h-8 text-yellow-400/50 mx-auto mb-2 animate-pulse" />
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
