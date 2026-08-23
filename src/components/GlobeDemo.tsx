"use client"

import {
  useEffect, useRef, useState, useCallback, useMemo
} from "react"
import { useTransactions, COUNTRIES, Tx } from "@/hooks/useTransactions"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, X,
  AlertTriangle, Activity, Globe2, Layers,
  Sun, Moon, Cloud, Search, Camera, Download, Clock,
  Sparkles, Wifi, Eye, EyeOff, ArrowUpRight,
  ArrowDownLeft, MapPin, ShieldAlert,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════
// TYPES & DATA MODELS
// ═══════════════════════════════════════════════════════════

type FilterType   = "all" | "safe" | "risky" | "fraud"
type DayNightMode = "auto" | "day" | "night"
type PlaybackSpeed = 1 | 10 | 100

interface CountryStats {
  name: string; code: string; lat: number; lng: number
  totalTx: number; safeCount: number; riskyCount: number; fraudCount: number
  totalVolume: number; inboundVolume: number; outboundVolume: number
  avgRiskScore: number
  topCounterparts: { name: string; count: number; vol: number }[]
  recentAlerts: { time: string; type: string; amount: number; from: string; to: string }[]
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS & FINANCIAL HUBS
// ═══════════════════════════════════════════════════════════

const CHAIN_COLORS: Record<string, string> = {
  ETH:"#627EEA", BTC:"#F7931A", USDT:"#26A17B",
  BNB:"#F3BA2F", MATIC:"#8247E5", AVAX:"#E84142", ARB:"#28A0F0",
}

const FINANCIAL_CITIES = [
  { name:"New York",      lat:40.71,  lng:-74.01, tier: 1 },
  { name:"London",        lat:51.51,  lng:-0.13,  tier: 1 },
  { name:"Frankfurt",     lat:50.11,  lng:8.68,   tier: 1 },
  { name:"Dubai",         lat:25.20,  lng:55.27,  tier: 1 },
  { name:"Singapore",     lat:1.35,   lng:103.82, tier: 1 },
  { name:"Hong Kong",     lat:22.31,  lng:114.17, tier: 1 },
  { name:"Tokyo",         lat:35.68,  lng:139.69, tier: 1 },
  { name:"Mumbai",        lat:19.08,  lng:72.88,  tier: 1 },
  { name:"Shanghai",      lat:31.23,  lng:121.47, tier: 1 },
  { name:"Sydney",        lat:-33.87, lng:151.21, tier: 1 },
  { name:"Sao Paulo",     lat:-23.55, lng:-46.63, tier: 2 },
  { name:"Toronto",       lat:43.65,  lng:-79.38, tier: 2 },
  { name:"Zurich",        lat:47.37,  lng:8.54,   tier: 1 },
  { name:"Seoul",         lat:37.57,  lng:126.98, tier: 1 },
  { name:"Lagos",         lat:6.52,   lng:3.38,   tier: 2 },
  { name:"Berlin",        lat:52.52,  lng:13.40,  tier: 2 },
  { name:"San Francisco", lat:37.77,  lng:-122.41,tier: 1 },
]

// ═══════════════════════════════════════════════════════════
// RISK HIERARCHY & STROKE WEIGHTS
// ═══════════════════════════════════════════════════════════

function riskColor(score: number): string {
  if (score >= 85) return "#ff2020" // FRAUD: Vibrant Luminous Red
  if (score >= 60) return "#ff8c00" // RISKY: Amber / Orange
  if (score >= 30) return "#ffdd57" // WATCH / LOW: Warm Golden Yellow
  return "#00e676"                   // SAFE: Crisp Neon Emerald
}

function riskColorHex(score: number): number {
  if (score >= 85) return 0xff2020
  if (score >= 60) return 0xff8c00
  if (score >= 30) return 0xffdd57
  return 0x00e676
}

function riskLabel(score: number): string {
  if (score >= 85) return "FRAUD"
  if (score >= 60) return "RISKY"
  if (score >= 30) return "WATCH"
  return "SAFE"
}

function riskStroke(score: number, focused = false): number {
  if (focused) return 3.8
  if (score >= 85) return 2.8  // Clearly thick for fraud (3.4x ratio)
  if (score >= 60) return 1.6  // Medium for risky (1.8x ratio)
  if (score >= 30) return 0.95 // Medium-thin for watch (1.1x ratio)
  return 0.55                  // Very thin for safe baseline (1.0x ratio)
}

function riskAlt(seed: number, score: number, focused = false): number {
  if (focused) return 0.65
  const base = score >= 85 ? 0.35 : score >= 60 ? 0.26 : score >= 30 ? 0.20 : 0.16
  return base + ((seed % 1000) / 1000) * 0.08
}

const hash11 = (s: string): number => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// ═══════════════════════════════════════════════════════════
// HIGH-RES CARTOGRAPHIC EARTH TEXTURE GENERATOR
// ═══════════════════════════════════════════════════════════

function generateProceduralEarthTexture(): string {
  if (typeof document === "undefined") return ""
  const W = 2048, H = 1024
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  // 1. Vibrant Daytime Ocean Bathymetric Multi-Stop Gradient
  const oceanGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.05, W / 2, H / 2, W * 0.6)
  oceanGrad.addColorStop(0, "#084b83")   // Bright vibrant royal ocean blue
  oceanGrad.addColorStop(0.5, "#0b3966") // Deep sapphire blue
  oceanGrad.addColorStop(1, "#052042")   // Deep abyssal navy
  ctx.fillStyle = oceanGrad
  ctx.fillRect(0, 0, W, H)

  // 2. Latitude & Longitude Cyber Grid (Clean Light Blue)
  ctx.lineWidth = 1
  ctx.strokeStyle = "rgba(125, 211, 252, 0.07)"
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * H
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (let lng = -180; lng < 180; lng += 15) {
    const x = ((lng + 180) / 360) * W
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }

  // Equator, Tropics & Prime Meridian Gold Accents
  ctx.strokeStyle = "rgba(255, 215, 0, 0.18)"
  ctx.beginPath()
  ctx.moveTo(0, H / 2)
  ctx.lineTo(W, H / 2)
  ctx.moveTo(W / 2, 0)
  ctx.lineTo(W / 2, H)
  ctx.stroke()

  // 3. Realistic Continent Landmasses with Vibrant Daytime Topography
  const landmasses = [
    // North America (Can, US, Mex)
    { cx: 0.22 * W, cy: 0.28 * H, rx: 0.12 * W, ry: 0.16 * H, color: "#1b4d24", desert: "#c28b38" },
    { cx: 0.18 * W, cy: 0.20 * H, rx: 0.09 * W, ry: 0.08 * H, color: "#143a1b", desert: "#b37e33" },
    { cx: 0.20 * W, cy: 0.38 * H, rx: 0.04 * W, ry: 0.08 * H, color: "#9e702c", desert: "#d19a43" },
    // South America (Brazil, Andes, Arg)
    { cx: 0.32 * W, cy: 0.65 * H, rx: 0.07 * W, ry: 0.20 * H, color: "#154d20", desert: "#996f2a" },
    { cx: 0.28 * W, cy: 0.60 * H, rx: 0.02 * W, ry: 0.16 * H, color: "#8c6527", desert: "#ba893a" }, // Andes Ridge
    // Eurasia (Europe, Russia, China, Siberia)
    { cx: 0.62 * W, cy: 0.22 * H, rx: 0.24 * W, ry: 0.14 * H, color: "#1a4e23", desert: "#b88334" },
    { cx: 0.74 * W, cy: 0.32 * H, rx: 0.14 * W, ry: 0.12 * H, color: "#1d5427", desert: "#c78f3c" },
    // Himalayas & Tibetan Plateau (Highlands)
    { cx: 0.73 * W, cy: 0.34 * H, rx: 0.06 * W, ry: 0.04 * H, color: "#a8752c", desert: "#deb15b" },
    // India Subcontinent
    { cx: 0.72 * W, cy: 0.42 * H, rx: 0.038 * W, ry: 0.075 * H, color: "#235c2d", desert: "#b58235" },
    // Middle East & Arabian Peninsula
    { cx: 0.63 * W, cy: 0.38 * H, rx: 0.055 * W, ry: 0.07 * H, color: "#c48c3b", desert: "#e0a74d" },
    // Africa (Sahara, Central Basin, South)
    { cx: 0.54 * W, cy: 0.44 * H, rx: 0.095 * W, ry: 0.10 * H, color: "#ce9440", desert: "#e6b057" }, // Sahara
    { cx: 0.55 * W, cy: 0.60 * H, rx: 0.075 * W, ry: 0.13 * H, color: "#164b1f", desert: "#a8772f" }, // Central/South
    // Madagascar
    { cx: 0.63 * W, cy: 0.68 * H, rx: 0.015 * W, ry: 0.04 * H, color: "#1a5323", desert: "#996b27" },
    // Australia & Oceania
    { cx: 0.86 * W, cy: 0.70 * H, rx: 0.072 * W, ry: 0.09 * H, color: "#b87e32", desert: "#db9c44" },
    { cx: 0.94 * W, cy: 0.78 * H, rx: 0.018 * W, ry: 0.04 * H, color: "#1a5223", desert: "#9c6e2a" }, // New Zealand
    // Southeast Asia & Indonesia
    { cx: 0.80 * W, cy: 0.50 * H, rx: 0.055 * W, ry: 0.045 * H, color: "#174e20", desert: "#946726" },
    { cx: 0.82 * W, cy: 0.58 * H, rx: 0.065 * W, ry: 0.035 * H, color: "#14481c", desert: "#8a5e20" },
    // UK, Scandinavia & Japan
    { cx: 0.49 * W, cy: 0.20 * H, rx: 0.035 * W, ry: 0.055 * H, color: "#1a4e21", desert: "#8e6426" },
    { cx: 0.54 * W, cy: 0.14 * H, rx: 0.03 * W, ry: 0.06 * H, color: "#13421b", desert: "#7d541b" },
    { cx: 0.88 * W, cy: 0.33 * H, rx: 0.025 * W, ry: 0.05 * H, color: "#1c5425", desert: "#9c6f2a" },
  ]

  landmasses.forEach(({ cx, cy, rx, ry, color, desert }) => {
    // Coastal Shallow Reef Ring
    const reefGrad = ctx.createRadialGradient(cx, cy, rx * 0.7, cx, cy, rx * 1.08)
    reefGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)")
    reefGrad.addColorStop(1, "rgba(56, 189, 248, 0)")
    ctx.fillStyle = reefGrad
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx * 1.08, ry * 1.08, 0, 0, Math.PI * 2)
    ctx.fill()

    // Continent Fill with Topography Gradient
    const landGrad = ctx.createRadialGradient(cx, cy, rx * 0.15, cx, cy, rx)
    landGrad.addColorStop(0, desert || "#c28b38")
    landGrad.addColorStop(0.65, color || "#1b4d24")
    landGrad.addColorStop(1, "#123819")
    ctx.fillStyle = landGrad
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()

    // Luminous coastline edge
    ctx.strokeStyle = "rgba(125, 211, 252, 0.45)"
    ctx.lineWidth = 1.6
    ctx.stroke()
  })

  // 4. Financial Hubs Luminous Highlights
  FINANCIAL_CITIES.forEach(city => {
    const x = ((city.lng + 180) / 360) * W
    const y = ((90 - city.lat) / 180) * H
    const glow = ctx.createRadialGradient(x, y, 1, x, y, 16)
    glow.addColorStop(0, "#ffffff")
    glow.addColorStop(0.3, "rgba(255, 215, 0, 0.85)")
    glow.addColorStop(1, "rgba(255, 215, 0, 0)")
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, 16, 0, Math.PI * 2)
    ctx.fill()
  })

  return canvas.toDataURL("image/png")
}

// ═══════════════════════════════════════════════════════════
// PROCEDURAL CLOUD LAYER GENERATOR
// ═══════════════════════════════════════════════════════════

function generateProceduralCloudTexture(): string {
  if (typeof document === "undefined") return ""
  const W = 1024, H = 512
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  ctx.fillStyle = "rgba(0,0,0,0)"
  ctx.fillRect(0, 0, W, H)

  // Draw soft cloud wisps
  const clouds = [
    { x: 0.20 * W, y: 0.30 * H, rx: 120, ry: 40 },
    { x: 0.40 * W, y: 0.50 * H, rx: 160, ry: 50 },
    { x: 0.65 * W, y: 0.25 * H, rx: 140, ry: 45 },
    { x: 0.80 * W, y: 0.65 * H, rx: 180, ry: 55 },
    { x: 0.35 * W, y: 0.75 * H, rx: 110, ry: 35 },
    { x: 0.55 * W, y: 0.35 * H, rx: 130, ry: 40 },
  ]

  clouds.forEach(({ x, y, rx, ry }) => {
    const grad = ctx.createRadialGradient(x, y, 10, x, y, rx)
    grad.addColorStop(0, "rgba(255, 255, 255, 0.18)")
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)")
    grad.addColorStop(1, "rgba(255, 255, 255, 0)")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0.1, 0, Math.PI * 2)
    ctx.fill()
  })

  return canvas.toDataURL("image/png")
}

// ═══════════════════════════════════════════════════════════
// TRUE 3D SPHERICAL GEOGRAPHIC PROJECTION
// ═══════════════════════════════════════════════════════════

function latLngToVec3(lat: number, lng: number, r: number, THREE: any) {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  )
}

function buildGreatCircleBezierPts(startV: any, endV: any, altFrac: number, THREE: any, segs = 64): any[] {
  const mid = new THREE.Vector3().addVectors(startV, endV).multiplyScalar(0.5)
  const r = startV.length()
  const dist = startV.distanceTo(endV)
  const effectiveAlt = altFrac + (dist / (2 * r)) * 0.14
  const ctrl = mid.clone().normalize().multiplyScalar(r * (1 + effectiveAlt))
  
  const pts = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, it = 1 - t
    pts.push(new THREE.Vector3(
      it * it * startV.x + 2 * it * t * ctrl.x + t * t * endV.x,
      it * it * startV.y + 2 * it * t * ctrl.y + t * t * endV.y,
      it * it * startV.z + 2 * it * t * ctrl.z + t * t * endV.z,
    ))
  }
  return pts
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function GlobeDemoComponent() {
  const { txs } = useTransactions()

  // UI state
  const [mounted,         setMounted]         = useState(false)
  const [webgl,           setWebgl]           = useState(true)
  const [filter,          setFilter]          = useState<FilterType>("all")
  const [chainFilter,     setChainFilter]     = useState("all")
  const [isPlaying,       setIsPlaying]       = useState(true)
  const [showHeatmap,     setShowHeatmap]     = useState(true)
  const [showHotspots,    setShowHotspots]    = useState(true)
  const [showParticles,   setShowParticles]   = useState(true)
  const [dayNight,        setDayNight]        = useState<DayNightMode>("day")
  const [speed,           setSpeed]           = useState<PlaybackSpeed>(1)
  const [timeline,        setTimeline]        = useState(100)
  const [showControls,    setShowControls]    = useState(true)
  const [showSearch,      setShowSearch]      = useState(false)
  const [searchQ,         setSearchQ]         = useState("")
  const [searchRes,       setSearchRes]       = useState<typeof COUNTRIES>([])
  const [selectedCountry, setSelectedCountry] = useState<CountryStats | null>(null)
  const [focusTx,         setFocusTx]         = useState<Tx | null>(null)
  const [fraudAlert,      setFraudAlert]      = useState<string | null>(null)
  const [isMobile,        setIsMobile]        = useState(false)
  const [liveStats,       setLiveStats]       = useState({ safe:0, risky:0, fraud:0, total:0 })

  // Three.js & Animation refs
  const mountRef      = useRef<HTMLDivElement>(null)
  const globeRef      = useRef<any>(null)
  const cloudMeshRef  = useRef<any>(null)
  const rendererRef   = useRef<any>(null)
  const cameraRef     = useRef<any>(null)
  const sceneRef      = useRef<any>(null)
  const sunRef        = useRef<any>(null)
  const atmosphereRef = useRef<any>(null)
  const particleGRef  = useRef<any>(null)
  const pulseGRef     = useRef<any>(null)
  const hotspotGRef   = useRef<any>(null)
  const cityGRef      = useRef<any>(null)
  const autoRotateRef = useRef(true)
  const isPlayingRef  = useRef(true)
  const speedRef      = useRef(speed)
  const dayNightRef   = useRef(dayNight)
  const initDoneRef   = useRef(false)

  // Camera animation target for smooth transitions
  const targetCamPosRef = useRef<{ z?: number; rotX?: number; rotY?: number } | null>(null)

  useEffect(() => { speedRef.current   = speed    }, [speed])
  useEffect(() => { dayNightRef.current = dayNight }, [dayNight])
  useEffect(() => { isPlayingRef.current = isPlaying; autoRotateRef.current = isPlaying }, [isPlaying])

  // ─── Mount & Global Listeners ─────────────────────────────
  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return
    setIsMobile(window.innerWidth < 768)
    const c = document.createElement("canvas")
    setWebgl(!!(c.getContext("webgl") || c.getContext("experimental-webgl")))
    const onR = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", onR)

    const onFocus = (e: any) => { 
      const t = e.detail
      if (!t) return
      setFocusTx(t)
      // Focus camera on transaction midpoint
      const midLat = (t.latLngFrom[0] + t.latLngTo[0]) / 2
      const midLng = (t.latLngFrom[1] + t.latLngTo[1]) / 2
      zoomToCountry(midLat, midLng, 230)
      setTimeout(() => setFocusTx(null), 8500) 
    }
    window.addEventListener("CRYPTOGUARD_GLOBE_FOCUS_TX", onFocus)
    return () => { 
      window.removeEventListener("resize", onR)
      window.removeEventListener("CRYPTOGUARD_GLOBE_FOCUS_TX", onFocus) 
    }
  }, [])

  // ─── Search Autocomplete ─────────────────────────────────
  useEffect(() => {
    if (!searchQ) { setSearchRes([]); return }
    setSearchRes(COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQ.toLowerCase())
    ).slice(0, 8))
  }, [searchQ])

  // ─── Filtered Canonical Transactions ─────────────────────
  const filteredTxs = useMemo(() => {
    const threshold = (timeline / 100) * 10 * 60 * 1000
    const now = Date.now()
    return txs.filter(t => {
      if (filter !== "all" && t.status !== filter) return false
      if (chainFilter !== "all" && t.chain !== chainFilter) return false
      if (now - t.timestamp > threshold) return false
      return true
    })
  }, [txs, filter, chainFilter, timeline])

  useEffect(() => {
    setLiveStats({
      safe:  filteredTxs.filter(t => t.status === "safe").length,
      risky: filteredTxs.filter(t => t.status === "risky").length,
      fraud: filteredTxs.filter(t => t.status === "fraud").length,
      total: filteredTxs.length,
    })
  }, [filteredTxs])

  // ─── Fraud Alert Watcher ──────────────────────────────────
  useEffect(() => {
    const fresh = txs.filter(t => t.status === "fraud" && Date.now() - t.timestamp < 3500)
    if (fresh.length) {
      const t = fresh[0]
      setFraudAlert(`🚨 HIGH THREAT [${t.riskScore}/100]: ${t.from} → ${t.to} · $${t.amount.toLocaleString()} ${t.chain} detected`)
      const tid = setTimeout(() => setFraudAlert(null), 6000)
      return () => clearTimeout(tid)
    }
  }, [txs])

  // ─── Country Statistics Dossier ──────────────────────────
  const getCountryStats = useCallback((name: string): CountryStats | null => {
    const c = COUNTRIES.find(x => x.name === name)
    if (!c) return null
    const rel  = filteredTxs.filter(t => t.from === name || t.to === name)
    const inc  = filteredTxs.filter(t => t.to   === name)
    const out  = filteredTxs.filter(t => t.from  === name)
    const cc: Record<string, { count: number; vol: number }> = {}
    out.forEach(t => { if (!cc[t.to])   cc[t.to]   = { count:0, vol:0 }; cc[t.to].count++;   cc[t.to].vol   += t.amount })
    inc.forEach(t => { if (!cc[t.from]) cc[t.from] = { count:0, vol:0 }; cc[t.from].count++; cc[t.from].vol += t.amount })
    return {
      name: c.name, code: c.code, lat: c.lat, lng: c.lng,
      totalTx:        rel.length,
      safeCount:      rel.filter(t => t.status === "safe").length,
      riskyCount:     rel.filter(t => t.status === "risky").length,
      fraudCount:     rel.filter(t => t.status === "fraud").length,
      totalVolume:    rel.reduce((s, t) => s + t.amount, 0),
      inboundVolume:  inc.reduce((s, t) => s + t.amount, 0),
      outboundVolume: out.reduce((s, t) => s + t.amount, 0),
      avgRiskScore:   rel.length ? rel.reduce((s, t) => s + t.riskScore, 0) / rel.length : 0,
      topCounterparts: Object.entries(cc)
        .map(([n, v]) => ({ name:n, count:v.count, vol:v.vol }))
        .sort((a,b) => b.count - a.count).slice(0, 6),
      recentAlerts: rel.filter(t => t.status !== "safe").slice(0, 6)
        .map(t => ({ time: new Date(t.timestamp).toLocaleTimeString(), type: t.status, amount: t.amount, from: t.from, to: t.to })),
    }
  }, [filteredTxs])

  // ═══════════════════════════════════════════════════════════
  // THREE.JS INITIALIZATION & SCENE SETUP
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!mounted || !mountRef.current || !webgl || initDoneRef.current) return
    initDoneRef.current = true
    let dead = false, raf = 0

    ;(async () => {
      try {
        const THREE = await import("three")
        const { default: ThreeGlobe } = await import("three-globe")
        if (dead || !mountRef.current) return

        const container = mountRef.current
        const W = container.clientWidth || 800
        const H = container.clientHeight || 600

        // Canvas Element
        const canvas = document.createElement("canvas")
        canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;display:block"
        container.appendChild(canvas)

        // WebGL Renderer
        let renderer: any
        try {
          renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: !isMobile, 
            alpha: true, 
            powerPreference: "high-performance" 
          })
        } catch { setWebgl(false); return }

        renderer.setSize(W, H, false)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.10
        rendererRef.current = renderer

        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Dynamic Starfield
        const sSz = isMobile ? 900 : 2200
        const sPos = new Float32Array(sSz * 3)
        for (let i = 0; i < sSz * 3; i++) sPos[i] = (Math.random() - 0.5) * 2600
        const sGeom = new THREE.BufferGeometry()
        sGeom.setAttribute("position", new THREE.BufferAttribute(sPos, 3))
        scene.add(new THREE.Points(sGeom, new THREE.PointsMaterial({ color:0xffffff, size:0.55, transparent:true, opacity:0.42 })))

        // Camera
        const aspect = H > 0 ? W / H : 16 / 9
        const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 3000)
        camera.position.z = 290
        cameraRef.current = camera

        // High-Res Procedural Base Texture (Guaranteed Instant Rich Visuals on Frame 1)
        const proceduralTexture = generateProceduralEarthTexture()

        // ThreeGlobe Instantiation in Vibrant Day Mode
        const globe = new (ThreeGlobe as any)()
          .globeImageUrl(proceduralTexture || "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
          .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
          .showAtmosphere(true)
          .atmosphereColor("#ffd700")
          .atmosphereAltitude(0.15)

        // Configure underlying Physically-Rendered Material
        const globeMaterial = globe.globeMaterial() as any
        if (globeMaterial) {
          globeMaterial.roughness = 0.55
          globeMaterial.metalness = 0.08
          globeMaterial.bumpScale = 6
        }

        // Asynchronously enhance to NASA Blue Marble daytime texture
        if (proceduralTexture) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            if (!dead && globe) {
              globe.globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
            }
          }
          img.src = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        }

        globeRef.current = globe
        scene.add(globe as any)

        // Atmosphere Fresnel Glow Shell
        const atmoGeom = new THREE.SphereGeometry(102.8, 48, 48)
        const atmoMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.12,
          side: THREE.BackSide,
          depthWrite: false
        })
        const atmoMesh = new THREE.Mesh(atmoGeom, atmoMat)
        scene.add(atmoMesh)
        atmosphereRef.current = atmoMesh

        // Subtle Transparent Cloud Layer
        const cloudTexData = generateProceduralCloudTexture()
        if (cloudTexData) {
          const cloudTexLoader = new THREE.TextureLoader()
          cloudTexLoader.load(cloudTexData, (cloudTex) => {
            if (dead) return
            const cloudGeom = new THREE.SphereGeometry(101.4, 48, 48)
            const cloudMat = new THREE.MeshStandardMaterial({
              map: cloudTex,
              transparent: true,
              opacity: 0.14,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            })
            const cloudMesh = new THREE.Mesh(cloudGeom, cloudMat)
            scene.add(cloudMesh)
            cloudMeshRef.current = cloudMesh
          })
        }

        // Radiant 3-Point Multi-Angle Cinematic Daylight Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 2.2))
        
        const sun = new THREE.DirectionalLight(0xfff8db, 3.2)
        sun.position.set(380, 200, 300)
        scene.add(sun)
        sunRef.current = sun

        const sunFill = new THREE.DirectionalLight(0xdbeafe, 2.2)
        sunFill.position.set(-360, -100, 240)
        scene.add(sunFill)

        const topFill = new THREE.DirectionalLight(0xfff0b3, 1.8)
        topFill.position.set(0, 450, 200)
        scene.add(topFill)

        // GeoJSON Country Borders (Subtle Warm Gold / Olive)
        fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
          .then(r => r.json())
          .then(geo => {
            if (dead || !globe) return
            globe
              .polygonsData(geo.features)
              .polygonCapColor(() => "rgba(255,215,0,0.035)")
              .polygonSideColor(() => "rgba(255,215,0,0.05)")
              .polygonStrokeColor(() => "rgba(195,175,75,0.45)")
              .polygonAltitude(0.005)
          }).catch(() => {})

        // Groups for Dynamic Elements
        const particleG = new THREE.Group(); scene.add(particleG); particleGRef.current = particleG
        const pulseG    = new THREE.Group(); scene.add(pulseG);    pulseGRef.current    = pulseG
        const hotspotG  = new THREE.Group(); scene.add(hotspotG);  hotspotGRef.current  = hotspotG
        const cityG     = new THREE.Group(); scene.add(cityG);     cityGRef.current     = cityG

        // Financial City Hubs
        FINANCIAL_CITIES.forEach(city => {
          const pos = latLngToVec3(city.lat, city.lng, 101.4, THREE)
          const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.85, 1.6, 24),
            new THREE.MeshBasicMaterial({ color:0xffd700, transparent:true, opacity:0.25, side:THREE.DoubleSide, depthWrite:false })
          )
          halo.position.copy(pos); halo.lookAt(0,0,0)
          halo.userData = { type:"cityHalo", t: Math.random() * Math.PI * 2 }
          cityG.add(halo)

          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 8, 8),
            new THREE.MeshBasicMaterial({ color:0xfff0a0, transparent:true, opacity:0.85, depthWrite:false })
          )
          dot.position.copy(pos); cityG.add(dot)
        })

        // User Interactive Orbit Drag Controls
        let dragging = false, pX = 0, pY = 0
        const onDown = (e: MouseEvent) => { dragging=true; pX=e.clientX; pY=e.clientY; autoRotateRef.current=false }
        const onUp   = () => { dragging=false; setTimeout(()=>{ if(isPlayingRef.current) autoRotateRef.current=true }, 2500) }
        const onMove = (e: MouseEvent) => {
          if (!dragging) return
          const dx=(e.clientX-pX)*0.0042, dy=(e.clientY-pY)*0.0042
          pX=e.clientX; pY=e.clientY
          ;(globe as any).rotation.y += dx
          ;(globe as any).rotation.x = Math.max(-0.5, Math.min(0.5, (globe as any).rotation.x + dy))
        }
        container.addEventListener("mousedown", onDown)
        window.addEventListener("mouseup", onUp)
        window.addEventListener("mousemove", onMove)

        // Smooth Wheel Zoom
        const onWheel = (e: WheelEvent) => { 
          e.preventDefault()
          camera.position.z = Math.max(140, Math.min(560, camera.position.z + e.deltaY * 0.09)) 
        }
        container.addEventListener("wheel", onWheel, { passive:false })

        // Touch Interaction
        let td = 0
        const onTS = (e: TouchEvent) => { if(e.touches.length===2) td=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY) }
        const onTM = (e: TouchEvent) => {
          if(e.touches.length===2){
            const nd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)
            camera.position.z=Math.max(140,Math.min(560,camera.position.z+(td-nd)*0.4)); td=nd
          }
        }
        container.addEventListener("touchstart",onTS); container.addEventListener("touchmove",onTM)

        // Viewport ResizeObserver
        const updateViewport = () => {
          if (dead || !mountRef.current || !rendererRef.current || !cameraRef.current) return
          const w = mountRef.current.clientWidth || 800
          const h = mountRef.current.clientHeight || 600
          if (w > 0 && h > 0) {
            rendererRef.current.setSize(w, h, false)
            cameraRef.current.aspect = w / h
            cameraRef.current.updateProjectionMatrix()
          }
        }
        const resizeObserver = new ResizeObserver(updateViewport)
        resizeObserver.observe(container)
        window.addEventListener("resize", updateViewport)
        requestAnimationFrame(updateViewport)

        // ─── MAIN ANIMATION LOOP ────────────────────────────────────────────
        let time = 0, last = performance.now()
        const animate = () => {
          if (dead) return
          raf = requestAnimationFrame(animate)
          const now = performance.now()
          const dt  = Math.min((now - last) / 1000, 0.05)
          last = now; time += dt

          try {
            // Smooth Camera Interpolation
            if (targetCamPosRef.current) {
              const tgt = targetCamPosRef.current
              if (tgt.z !== undefined) camera.position.z += (tgt.z - camera.position.z) * 0.06
              if (tgt.rotX !== undefined && globe) (globe as any).rotation.x += (tgt.rotX - (globe as any).rotation.x) * 0.06
              if (tgt.rotY !== undefined && globe) (globe as any).rotation.y += (tgt.rotY - (globe as any).rotation.y) * 0.06
            }

            // Globe Auto-Rotate (Increased lively daytime rotation speed)
            if (autoRotateRef.current && isPlayingRef.current && globe) {
              ;(globe as any).rotation.y += 0.115 * dt * speedRef.current
            }

            // Cloud Layer Subtle Orbit
            if (cloudMeshRef.current && isPlayingRef.current) {
              cloudMeshRef.current.rotation.y += 0.070 * dt * speedRef.current
            }

            // Sun Dynamic Orbit in Auto Mode
            if (sunRef.current && dayNightRef.current === "auto") {
              sunRef.current.position.x = Math.cos(time * 0.033) * 450
              sunRef.current.position.z = Math.sin(time * 0.033) * 450
            }

            // City Halo Pulses
            cityG.children.forEach((c: any) => {
              if (c.userData?.type === "cityHalo") {
                c.userData.t = (c.userData.t || 0) + dt * 1.2
                if (c.material) {
                  c.material.opacity = 0.16 + Math.sin(c.userData.t) * 0.12
                }
              }
            })

            // Directional Moving Particles & Trails
            particleG.children.forEach((mesh: any) => {
              if (!mesh.userData?.pts || mesh.userData.pts.length < 2) return
              mesh.userData.prog = (mesh.userData.prog || 0) + dt * (mesh.userData.spd || 0.22) * speedRef.current

              // Destination arrival event -> trigger pulse ring
              if (mesh.userData.prog >= 1) {
                mesh.userData.prog = 0
                const ep = mesh.userData.pts[mesh.userData.pts.length - 1]
                if (ep) {
                  const pg = new THREE.RingGeometry(0.25, 0.65, 20)
                  const pm = new THREE.MeshBasicMaterial({ 
                    color: mesh.userData.colorHex || 0xffd700, 
                    transparent: true, 
                    opacity: 0.75, 
                    side: THREE.DoubleSide, 
                    depthWrite: false 
                  })
                  const pMesh = new THREE.Mesh(pg, pm)
                  pMesh.position.copy(ep)
                  pMesh.lookAt(0, 0, 0)
                  pMesh.userData = { t: 0, isFraud: mesh.userData.isFraud }
                  pulseG.add(pMesh)
                }
              }

              const total  = mesh.userData.pts.length - 1
              const rawIdx = mesh.userData.prog * total
              const idx    = Math.min(Math.floor(rawIdx), total - 1)
              const frac   = rawIdx - idx
              if (mesh.userData.pts[idx] && mesh.userData.pts[Math.min(idx + 1, total)]) {
                mesh.position.lerpVectors(mesh.userData.pts[idx], mesh.userData.pts[Math.min(idx + 1, total)], frac)
              }

              // Far-Side Depth Occlusion
              const camFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
              const dotVal = camFwd.dot(mesh.position.clone().normalize())
              const depth  = dotVal < 0 ? Math.max(0.04, (dotVal + 1) * 0.5) : 1
              const edge   = Math.sin(mesh.userData.prog * Math.PI)

              if (mesh.material) {
                mesh.material.opacity = Math.min(0.96, edge * depth)
              }
              mesh.scale.setScalar(0.6 + edge * 0.5)

              // Trailing Tail Particles
              mesh.userData.trail?.forEach((tm: any, i: number) => {
                const tp = Math.max(0, mesh.userData.prog - (i + 1) * 0.024)
                const ti = Math.min(Math.floor(tp * total), total - 1)
                if (mesh.userData.pts[ti] && mesh.userData.pts[Math.min(ti + 1, total)]) {
                  tm.position.lerpVectors(mesh.userData.pts[ti], mesh.userData.pts[Math.min(ti + 1, total)], tp * total - ti)
                }
                if (tm.material) {
                  tm.material.opacity = edge * depth * Math.max(0, 0.45 - i * 0.10)
                }
              })
            })

            // Expanding Destination Arrival Pulses
            pulseG.children.slice().forEach((c: any) => {
              const speedMult = c.userData?.isFraud ? 2.5 : 1.8
              c.userData.t = (c.userData.t || 0) + dt * speedMult
              c.scale.setScalar(1 + c.userData.t * (c.userData?.isFraud ? 4.5 : 3.0))
              if (c.material) {
                c.material.opacity = Math.max(0, 0.75 * (1 - c.userData.t))
              }
              if (c.userData.t >= 1) pulseG.remove(c)
            })

            // Hotspot Beacon Shockwaves
            hotspotG.children.forEach((c: any, i: number) => {
              if (c.userData?.isRing && c.material) {
                c.material.opacity = 0.22 + Math.sin(time * 2.4 + i * 0.65) * 0.18
                c.scale.setScalar(1 + Math.sin(time * 1.6 + i * 0.4) * 0.12)
              }
            })

            renderer.render(scene, camera)
          } catch (renderErr) {
            console.warn("Globe animation frame exception:", renderErr)
          }
        }
        animate()

        // Cleanup Handler
        return () => {
          dead = true
          cancelAnimationFrame(raf)
          resizeObserver.disconnect()
          window.removeEventListener("resize", updateViewport)
          window.removeEventListener("mouseup", onUp)
          window.removeEventListener("mousemove", onMove)
          container.removeEventListener("mousedown", onDown)
          container.removeEventListener("wheel", onWheel)
          container.removeEventListener("touchstart", onTS)
          container.removeEventListener("touchmove", onTM)
          renderer?.dispose?.(); renderer?.forceContextLoss?.()
          if (canvas.parentNode === container) container.removeChild(canvas)
          globeRef.current = rendererRef.current = cameraRef.current = sceneRef.current = null
          initDoneRef.current = false
        }
      } catch (e) {
        console.error("Globe init failure:", e)
        setWebgl(false)
      }
    })()
  }, [mounted, isMobile, webgl])

  // ═══════════════════════════════════════════════════════════
  // TRANSACTION ARCS CONFIGURATION (4-TIER RISK HIERARCHY)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return
    const MAX = isMobile ? 65 : 190
    const sorted = [...filteredTxs].sort((a,b) => b.riskScore - a.riskScore).slice(0, MAX)
    
    const arcs = sorted.map(t => {
      const seed = hash11(t.id)
      const focused = focusTx?.id === t.id
      return {
        id: t.id,
        startLat: t.latLngFrom[0], 
        startLng: t.latLngFrom[1],
        endLat:   t.latLngTo[0],   
        endLng:   t.latLngTo[1],
        col:      riskColor(t.riskScore),
        stroke:   riskStroke(t.riskScore, focused),
        alt:      riskAlt(seed, t.riskScore, focused),
        spd:      (t.riskScore >= 85 ? 750 : t.riskScore >= 60 ? 1100 : 1700) / speed,
        gap:      (hash11(t.id) % 100) / 100,
      }
    })

    globe
      .arcsData(arcs)
      .arcColor((d: any)           => d.col)
      .arcStroke((d: any)          => d.stroke)
      .arcAltitude((d: any)        => d.alt)
      .arcDashLength(0.52)
      .arcDashGap(0.015)
      .arcDashInitialGap((d: any)  => d.gap)
      .arcDashAnimateTime((d: any) => d.spd)
  }, [filteredTxs, speed, focusTx, isMobile])

  // ═══════════════════════════════════════════════════════════
  // GEOGRAPHIC HEATMAP DENSITY
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return
    const rbc: Record<string, number[]> = {}
    filteredTxs.forEach(t => [t.from, t.to].forEach(k => { 
      if (!rbc[k]) rbc[k] = []
      rbc[k].push(t.riskScore) 
    }))

    globe.polygonCapColor((d: any) => {
      if (!showHeatmap) return "rgba(255,215,0,0.02)"
      const nm = (d?.properties?.name || d?.properties?.ADMIN || "") as string
      const mc = COUNTRIES.find(c => nm.includes(c.name) || c.name.includes(nm))
      const sc = rbc[mc?.name || ""] || []
      if (!sc.length) return "rgba(255,215,0,0.02)"

      const avg = sc.reduce((a,b)=>a+b, 0) / sc.length
      const intensity = Math.min(0.48, 0.10 + sc.length * 0.008)
      if (avg >= 85) return `rgba(255,32,32,${intensity})`
      if (avg >= 60) return `rgba(255,140,0,${(intensity*0.85).toFixed(3)})`
      if (avg >= 30) return `rgba(255,221,87,${(intensity*0.7).toFixed(3)})`
      return `rgba(0,230,118,${(intensity*0.6).toFixed(3)})`
    })
  }, [filteredTxs, showHeatmap])

  // ═══════════════════════════════════════════════════════════
  // COUNTRY LABELS & COUNTERS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return
    const labels = COUNTRIES.map(c => {
      const acts   = filteredTxs.filter(t => t.from === c.name || t.to === c.name)
      if (acts.length < 5) return null
      const frauds = acts.filter(t => t.status === "fraud").length
      return { 
        lat: c.lat, 
        lng: c.lng, 
        text: c.code, 
        size: 0.48 + Math.min(0.9, acts.length / 55), 
        frauds 
      }
    }).filter(Boolean)

    globe
      .labelsData(labels)
      .labelLat((d: any)   => d.lat)
      .labelLng((d: any)   => d.lng)
      .labelText((d: any)  => d.text)
      .labelColor((d: any) => d.frauds > 4 ? "#ff2020" : d.frauds > 0 ? "#ff8c00" : "#e8c842")
      .labelSize((d: any)  => d.size)
      .labelResolution(2)
      .labelDotRadius(0.28)
      .labelAltitude(0.008)
  }, [filteredTxs])

  // ═══════════════════════════════════════════════════════════
  // ANIMATED 3D PARTICLES & TRAILS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const pg = particleGRef.current
    if (!pg) return
    pg.children.slice().forEach((c: any) => {
      c.userData.trail?.forEach((tm: any) => { tm.geometry?.dispose?.(); tm.material?.dispose?.() })
      c.geometry?.dispose?.(); c.material?.dispose?.(); pg.remove(c)
    })
    if (!showParticles) return

    import("three").then(THREE => {
      const MAX = isMobile ? 35 : 100
      const src = [...filteredTxs].sort((a,b) => b.riskScore - a.riskScore).slice(0, MAX)
      src.forEach(tx => {
        const seed     = hash11(tx.id)
        const alt      = riskAlt(seed, tx.riskScore)
        const colorHex = riskColorHex(tx.riskScore)
        const sz       = tx.riskScore >= 85 ? 0.72 : tx.riskScore >= 60 ? 0.54 : tx.riskScore >= 30 ? 0.38 : 0.30
        const startV   = latLngToVec3(tx.latLngFrom[0], tx.latLngFrom[1], 101.4, THREE)
        const endV     = latLngToVec3(tx.latLngTo[0],   tx.latLngTo[1],   101.4, THREE)
        const pts      = buildGreatCircleBezierPts(startV, endV, alt, THREE, 60)

        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(sz, 10, 10),
          new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity:0.95, depthWrite:false })
        )
        mesh.position.copy(pts[0])

        // Directional Tail Spheres
        const trailLen = tx.riskScore >= 85 ? 4 : tx.riskScore >= 60 ? 3 : 2
        const trail: any[] = []
        for (let i = 0; i < trailLen; i++) {
          const tm = new THREE.Mesh(
            new THREE.SphereGeometry(sz * 0.6 * (1 - i * 0.18), 7, 7),
            new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity:0.35 - i * 0.08, depthWrite:false })
          )
          tm.position.copy(pts[0]); pg.add(tm); trail.push(tm)
        }
        const baseSpd = tx.riskScore >= 85 ? 0.32 : tx.riskScore >= 60 ? 0.23 : 0.16
        mesh.userData = { 
          pts, 
          colorHex, 
          trail, 
          prog: (seed % 1000) / 1000, 
          spd: baseSpd + (seed % 100) / 1000 * 0.08,
          isFraud: tx.riskScore >= 85
        }
        pg.add(mesh)
      })
    })
  }, [filteredTxs, showParticles, isMobile])

  // ═══════════════════════════════════════════════════════════
  // ANOMALY HOTSPOTS & BEACONS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const hg = hotspotGRef.current
    if (!hg) return
    hg.children.slice().forEach((c: any) => { c.geometry?.dispose?.(); c.material?.dispose?.(); hg.remove(c) })
    if (!showHotspots) return

    import("three").then(THREE => {
      const act: Record<string,{total:number;fraud:number}> = {}
      filteredTxs.forEach(t => [t.from,t.to].forEach(k => {
        if(!act[k]) act[k]={total:0,fraud:0}; act[k].total++; if(t.status==="fraud") act[k].fraud++
      }))

      COUNTRIES.forEach(c => {
        const a = act[c.name]; if(!a || a.total < 4) return
        const pos   = latLngToVec3(c.lat, c.lng, 101.5, THREE)
        const color = a.fraud > 3 ? 0xff2020 : a.fraud > 0 ? 0xff8c00 : 0x00e676
        const sz    = 0.42 + Math.min(1.0, a.total / 65)

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(sz, 12, 12),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.80, depthWrite:false })
        )
        beacon.position.copy(pos)
        hg.add(beacon)

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(sz * 1.4, sz * 2.4, 26),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.28, side:THREE.DoubleSide, depthWrite:false })
        )
        ring.position.copy(pos); ring.lookAt(0,0,0); ring.userData.isRing = true
        hg.add(ring)

        if (a.total > 20) {
          const ring2 = new THREE.Mesh(
            new THREE.RingGeometry(sz * 3, sz * 4.2, 26),
            new THREE.MeshBasicMaterial({ color:0xffd700, transparent:true, opacity:0.16, side:THREE.DoubleSide, depthWrite:false })
          )
          ring2.position.copy(pos); ring2.lookAt(0,0,0); ring2.userData.isRing = true
          hg.add(ring2)
        }
      })
    })
  }, [filteredTxs, showHotspots])

  // ═══════════════════════════════════════════════════════════
  // DAY / NIGHT LIGHTING TRANSITION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const globe = globeRef.current as any
    const sun = sunRef.current
    if (!globe || !sun) return

    if (dayNight === "day") {
      globe.globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      sun.intensity = 2.8; sun.position.set(380, 50, 160)
    } else {
      globe.globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
      sun.intensity = 2.6; sun.position.set(450, 180, 350)
    }
  }, [dayNight])

  // ═══════════════════════════════════════════════════════════
  // CAMERA NAVIGATION & FOCUS HELPERS
  // ═══════════════════════════════════════════════════════════
  const zoomToCountry = useCallback((lat: number, lng: number, z = 215) => {
    autoRotateRef.current = false
    targetCamPosRef.current = {
      z,
      rotY: -(lng + 180) * (Math.PI / 180) + Math.PI,
      rotX: -((90 - lat) * (Math.PI / 180) - Math.PI / 2) * 0.38
    }
    setTimeout(() => {
      targetCamPosRef.current = null
      if (isPlayingRef.current) autoRotateRef.current = true
    }, 6000)
  }, [])

  const handleZoom = (d: "in"|"out") => { 
    const cam = cameraRef.current
    if (cam) cam.position.z = Math.max(140, Math.min(560, cam.position.z + (d === "in" ? -38 : 38))) 
  }

  const handleReset = () => { 
    const cam = cameraRef.current, globe = globeRef.current
    if (!cam || !globe) return
    targetCamPosRef.current = null
    cam.position.z = 290
    globe.rotation.set(0, 0, 0)
    autoRotateRef.current = true 
  }

  const handleCountryClick = (name: string) => { 
    const s = getCountryStats(name)
    if (s) {
      setSelectedCountry(s)
      zoomToCountry(s.lat, s.lng)
    }
    setShowSearch(false)
    setSearchQ("") 
  }

  const handleSnapshot = async () => {
    const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current
    if (!r || !s || !c) return
    r.render(s, c)
    const a = document.createElement("a")
    a.href = r.domElement.toDataURL("image/png")
    a.download = `cryptoguard-globe-${Date.now()}.png`
    a.click()
  }

  const uniqueChains = useMemo(() => ["all", ...Array.from(new Set(txs.map(t => t.chain)))], [txs])

  // ═══════════════════════════════════════════════════════════
  // JSX RENDERING
  // ═══════════════════════════════════════════════════════════
  if (!mounted) return (
    <div className="relative w-full h-[720px] rounded-2xl bg-[#020508] border border-yellow-500/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-yellow-500/20 border-t-yellow-400 animate-spin" />
        <p className="text-yellow-500/50 text-xs tracking-[0.25em] uppercase">Initialising 3D Earth Engine</p>
      </div>
    </div>
  )

  if (!webgl) return (
    <div className="relative w-full h-[720px] rounded-2xl bg-[#020508] border border-yellow-500/20 flex flex-col items-center justify-center gap-5 p-8">
      <Globe2 className="w-16 h-16 text-yellow-500/30" />
      <p className="text-yellow-300 font-semibold">WebGL not available — enable hardware acceleration in your browser settings.</p>
    </div>
  )

  return (
    <div 
      className="relative w-full h-[720px] rounded-2xl overflow-hidden" 
      id="globe-container"
      style={{boxShadow:"0 0 60px rgba(255,215,0,0.08), 0 0 120px rgba(0,0,0,0.8) inset"}}
    >
      {/* Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 bg-[#020508] rounded-2xl" />

      {/* Cinematic Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{background:"radial-gradient(ellipse 78% 78% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)"}} 
      />

      {/* TOP LIVE STATUS BAR */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl">
          {[
            { dot:"bg-emerald-400 shadow-[0_0_8px_#00e676]", val:liveStats.safe,  lbl:"Safe",  col:"text-emerald-400" },
            { dot:"bg-orange-400 shadow-[0_0_8px_#ff8c00]",  val:liveStats.risky, lbl:"Risky", col:"text-orange-400"  },
            { dot:"bg-red-500 shadow-[0_0_8px_#ff2020]",     val:liveStats.fraud, lbl:"Fraud", col:"text-red-400"     },
          ].map(({ dot, val, lbl, col }) => (
            <div key={lbl} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dot}`} />
              <span className={`text-[10px] font-bold tabular-nums ${col}`}>{val}</span>
              <span className="text-[9px] text-gray-500">{lbl}</span>
            </div>
          ))}
          <div className="w-px h-3 bg-white/15" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span className="text-[10px] text-yellow-300 font-bold">{liveStats.total} Live</span>
          </div>
        </div>
      </div>

      {/* CONTROLS TOGGLE */}
      <button 
        onClick={() => setShowControls(!showControls)}
        className="absolute top-3 left-3 z-30 h-7 w-7 rounded-lg bg-black/65 border border-white/10 text-yellow-300 hover:bg-yellow-500/15 flex items-center justify-center transition-all"
        title={showControls ? "Hide Controls" : "Show Controls"}
      >
        {showControls ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
      </button>

      {showControls && (<>
        {/* LEFT CONTROL PANEL */}
        <div className="absolute top-14 left-3 flex flex-col gap-1.5 z-20">
          {/* Risk Filters */}
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
            {(["all", "safe", "risky", "fraud"] as FilterType[]).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`h-6 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all ${
                  filter === f
                    ? f === "all" ? "bg-yellow-500 text-black shadow-[0_0_10px_#ffd70055]"
                    : f === "safe" ? "bg-emerald-500 text-black shadow-[0_0_10px_#00e67655]"
                    : f === "risky" ? "bg-orange-500 text-black shadow-[0_0_10px_#ff8c0055]"
                    : "bg-red-600 text-white shadow-[0_0_10px_#ff202066]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Chain Filters */}
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md flex-wrap max-w-[280px]">
            {uniqueChains.slice(0, 8).map(ch => (
              <button 
                key={ch} 
                onClick={() => setChainFilter(ch)}
                style={ch !== "all" ? { borderLeft: `2px solid ${CHAIN_COLORS[ch] || "#FFD700"}` } : {}}
                className={`h-6 px-2 rounded-md text-[9px] font-medium transition-all ${
                  chainFilter === ch ? "bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {ch === "all" ? "All Chains" : ch}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
            {[
              { k:"heat", ico:<Layers className="w-3 h-3"/>,   lbl:"Heat",    on:showHeatmap,   cb:()=>setShowHeatmap(!showHeatmap) },
              { k:"hot",  ico:<Activity className="w-3 h-3"/>, lbl:"Hotspot", on:showHotspots,  cb:()=>setShowHotspots(!showHotspots) },
              { k:"ptcl", ico:<Sparkles className="w-3 h-3"/>, lbl:"Flow",    on:showParticles, cb:()=>setShowParticles(!showParticles) },
            ].map(({ k, ico, lbl, on, cb }) => (
              <button 
                key={k} 
                onClick={cb}
                className={`h-6 px-2 rounded-lg text-[9px] flex items-center gap-1 transition-all ${
                  on ? "text-yellow-300 bg-yellow-500/20 font-bold border border-yellow-500/30" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {ico}{lbl}
              </button>
            ))}
          </div>

          {/* Day / Night / Auto Mode */}
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
            {(["auto", "day", "night"] as DayNightMode[]).map(m => (
              <button 
                key={m} 
                onClick={() => setDayNight(m)}
                className={`h-6 px-2 rounded-lg text-[9px] flex items-center gap-1 transition-all ${
                  dayNight === m ? "text-yellow-300 bg-yellow-500/20 font-bold border border-yellow-500/30" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {m === "auto" ? <Cloud className="w-3 h-3"/> : m === "day" ? <Sun className="w-3 h-3"/> : <Moon className="w-3 h-3"/>}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT TOOLBAR */}
        <div className="absolute top-14 right-3 z-20">
          <div className="flex flex-col gap-1 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
            {[
              { ico:<Search className="w-3.5 h-3.5"/>,   cb:()=>setShowSearch(!showSearch), title:"Search Country" },
              { ico:isPlaying?<Pause className="w-3.5 h-3.5"/>:<Play className="w-3.5 h-3.5"/>, cb:()=>setIsPlaying(!isPlaying), title:"Play/Pause Rotation" },
              { ico:<ZoomIn className="w-3.5 h-3.5"/>,   cb:()=>handleZoom("in"),           title:"Zoom In" },
              { ico:<ZoomOut className="w-3.5 h-3.5"/>,  cb:()=>handleZoom("out"),          title:"Zoom Out" },
              { ico:<RotateCcw className="w-3.5 h-3.5"/>,cb:handleReset,                    title:"Reset View" },
              { ico:<Camera className="w-3.5 h-3.5"/>,   cb:handleSnapshot,                 title:"Capture Snapshot" },
            ].map(({ ico, cb, title }) => (
              <button 
                key={title} 
                onClick={cb} 
                title={title}
                className="h-7 w-7 rounded-lg text-yellow-300 hover:bg-yellow-500/20 flex items-center justify-center transition-all"
              >
                {ico}
              </button>
            ))}
          </div>
        </div>

        {/* COUNTRY SEARCH MODAL */}
        {showSearch && (
          <div className="absolute top-14 right-12 w-56 z-30 animate-in slide-in-from-right-3 duration-200">
            <div className="rounded-xl bg-black/95 border border-white/15 backdrop-blur-md p-2 shadow-2xl">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"/>
                <Input 
                  placeholder="Search Country…" 
                  value={searchQ} 
                  onChange={e => setSearchQ(e.target.value)} 
                  autoFocus
                  className="h-8 pl-8 text-xs bg-black/60 border-white/15 text-white placeholder:text-gray-500"
                />
              </div>
              {searchRes.length > 0 && (
                <div className="mt-1.5 space-y-0.5 max-h-48 overflow-y-auto">
                  {searchRes.map(c => (
                    <button 
                      key={c.code} 
                      onClick={() => handleCountryClick(c.name)}
                      className="w-full h-7 text-left px-2 rounded-lg text-[11px] text-yellow-300 hover:bg-yellow-500/15 flex items-center gap-2 transition-all"
                    >
                      <span className="text-gray-500 font-mono text-[10px]">{c.code}</span>{c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RISK SCALE LEGEND */}
        <div className="absolute bottom-28 left-3 z-20">
          <div className="p-2.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
            <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-semibold">Risk Hierarchy</p>
            {[
              { lbl:"Safe (0–29)",   col:"#00e676", stroke:"0.6x" },
              { lbl:"Watch (30–59)", col:"#ffdd57", stroke:"1.0x" },
              { lbl:"Risky (60–84)", col:"#ff8c00", stroke:"1.8x" },
              { lbl:"Fraud (85+)",   col:"#ff2020", stroke:"3.4x" },
            ].map(({ lbl, col, stroke }) => (
              <div key={lbl} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col, boxShadow: `0 0 6px ${col}` }} />
                  <span className="text-[10px] text-gray-300 font-medium">{lbl}</span>
                </div>
                <span className="text-[9px] font-mono text-gray-500">{stroke}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE CONTROLS */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-72">
          <div className="p-2.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-yellow-500"/>
                <span className="text-[10px] text-gray-400 font-medium">Timeline Window</span>
              </div>
              <div className="flex gap-0.5">
                {([1, 10, 100] as PlaybackSpeed[]).map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`h-5 px-1.5 rounded text-[9px] transition-all ${
                      speed === s ? "text-yellow-300 bg-yellow-500/25 font-bold border border-yellow-500/40" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 font-mono">0m</span>
              <Slider value={[timeline]} onValueChange={([v]) => setTimeline(v)} max={100} step={1} className="flex-1"/>
              <span className="text-[9px] text-gray-500 font-mono">10m</span>
            </div>
          </div>
        </div>

        {/* QUICK SELECT COUNTRIES */}
        <div className="absolute bottom-28 right-3 z-20">
          <div className="p-2.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md">
            <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-semibold">Quick Select</p>
            <div className="grid grid-cols-2 gap-1 w-[188px]">
              {["United States", "China", "Russia", "Nigeria", "UAE", "Germany", "Japan", "India"].map(c => (
                <button 
                  key={c} 
                  onClick={() => handleCountryClick(c)}
                  className="h-6 px-2 rounded-lg text-[9px] text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all text-left truncate font-medium"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>)}

      {/* FRAUD ALERT BANNER */}
      {fraudAlert && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-3 duration-300 max-w-lg w-full px-4">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-950/95 border border-red-500/60 backdrop-blur-md shadow-[0_0_28px_rgba(255,32,32,0.4)]">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse shrink-0"/>
            <span className="text-[11px] text-red-200 font-semibold flex-1 truncate">{fraudAlert}</span>
            <button onClick={() => setFraudAlert(null)} className="text-red-500 hover:text-red-300 shrink-0">
              <X className="w-3 h-3"/>
            </button>
          </div>
        </div>
      )}

      {/* COUNTRY INTELLIGENCE DOSSIER */}
      {selectedCountry && (
        <div className="absolute top-14 right-3 w-72 z-30 animate-in slide-in-from-right-4 duration-250">
          <div className="rounded-2xl bg-black/95 border border-white/15 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-yellow-500/10">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-yellow-400"/>
                <span className="text-sm font-bold text-yellow-300">{selectedCountry.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">· {selectedCountry.code}</span>
              </div>
              <button 
                onClick={() => setSelectedCountry(null)} 
                className="w-6 h-6 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Risk Breakdown Matrix */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l:"Safe",  v:selectedCountry.safeCount,  c:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/30" },
                  { l:"Risky", v:selectedCountry.riskyCount, c:"text-orange-400",  bg:"bg-orange-500/10 border-orange-500/30" },
                  { l:"Fraud", v:selectedCountry.fraudCount, c:"text-red-400",     bg:"bg-red-500/10 border-red-500/30" },
                  { l:"Avg Risk", v:`${selectedCountry.avgRiskScore.toFixed(0)}`, c:"text-yellow-400", bg:"bg-yellow-500/10 border-yellow-500/30" },
                ].map(({ l, v, c, bg }) => (
                  <div key={l} className={`p-2.5 rounded-xl border ${bg}`}>
                    <div className={`text-xl font-bold ${c}`}>{v}</div>
                    <div className="text-[10px] text-gray-400">{l}</div>
                  </div>
                ))}
              </div>

              {/* Inbound vs Outbound Volumes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowDownLeft className="w-3 h-3 text-emerald-400"/>
                    <span className="text-[9px] text-gray-400">Inbound</span>
                  </div>
                  <div className="text-sm font-bold text-white">${(selectedCountry.inboundVolume / 1000).toFixed(0)}K</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowUpRight className="w-3 h-3 text-orange-400"/>
                    <span className="text-[9px] text-gray-400">Outbound</span>
                  </div>
                  <div className="text-sm font-bold text-white">${(selectedCountry.outboundVolume / 1000).toFixed(0)}K</div>
                </div>
              </div>

              {/* Total Monitored Volume */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[9px] text-gray-400 mb-0.5">Total Monitored Volume</div>
                <div className="text-base font-bold text-yellow-300">${selectedCountry.totalVolume.toLocaleString()}</div>
              </div>

              {/* Top Connected Counterparties */}
              {selectedCountry.topCounterparts.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-[0.18em] mb-1.5 font-semibold">Top Counterparties</p>
                  <div className="space-y-1">
                    {selectedCountry.topCounterparts.slice(0, 5).map(cp => (
                      <div key={cp.name} className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-300 truncate max-w-[120px]">{cp.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">${(cp.vol / 1000).toFixed(0)}K</span>
                          <span className="text-yellow-400 font-bold">{cp.count}×</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Flagged Alerts */}
              {selectedCountry.recentAlerts.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-[0.18em] mb-1.5 font-semibold">Recent Alerts</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedCountry.recentAlerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-black/50 border border-white/5">
                        <span className={`font-semibold ${a.type === "fraud" ? "text-red-400" : "text-orange-400"}`}>
                          {a.type.toUpperCase()}
                        </span>
                        <span className="text-gray-300 font-mono">${a.amount.toLocaleString()}</span>
                        <span className="text-gray-500">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1 border-t border-white/10">
                <button 
                  onClick={handleSnapshot}
                  className="flex-1 h-7 rounded-xl border border-yellow-500/30 text-yellow-400 text-[10px] hover:bg-yellow-500/15 flex items-center justify-center gap-1 transition-all"
                >
                  <Download className="w-3 h-3"/>Export
                </button>
                <button 
                  onClick={() => setFraudAlert(`FLAGGED: ${selectedCountry.name} added to institutional scrutiny list.`)}
                  className="flex-1 h-7 rounded-xl border border-red-500/30 text-red-400 text-[10px] hover:bg-red-500/15 flex items-center justify-center gap-1 transition-all"
                >
                  <ShieldAlert className="w-3 h-3"/>Flag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOCUSED TRANSACTION CARD */}
      {focusTx && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in zoom-in-95 duration-250">
          <div 
            className="px-5 py-4 rounded-2xl bg-black/96 backdrop-blur-md min-w-[300px]"
            style={{
              border: `2px solid ${riskColor(focusTx.riskScore)}66`,
              boxShadow: `0 0 35px ${riskColor(focusTx.riskScore)}33`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: riskColor(focusTx.riskScore) }}>
                {riskLabel(focusTx.riskScore)} · Active Surveillance
              </span>
              <button onClick={() => setFocusTx(null)} className="text-gray-500 hover:text-white">
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>
            <div className="space-y-2">
              <div className="font-mono text-[10px] text-gray-400 truncate">{focusTx.id}</div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">${focusTx.amount.toLocaleString()}</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                  style={{
                    backgroundColor: `${riskColor(focusTx.riskScore)}25`,
                    color: riskColor(focusTx.riskScore),
                    border: `1px solid ${riskColor(focusTx.riskScore)}50`
                  }}
                >
                  {focusTx.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                <MapPin className="w-3 h-3 text-yellow-400 shrink-0"/>
                <span className="font-medium text-white">{focusTx.from}</span>
                <span className="text-yellow-500">➔</span>
                <span className="font-medium text-white">{focusTx.to}</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Chain: <span className="text-yellow-300 font-bold">{focusTx.chain}</span>
                {" · Risk: "}<span className="font-bold" style={{ color: riskColor(focusTx.riskScore) }}>{focusTx.riskScore}</span>
                {" · "}{new Date(focusTx.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
