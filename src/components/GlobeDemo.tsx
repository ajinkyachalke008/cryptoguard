"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, useCallback } from "react"
import { useTransactions, COUNTRIES, TxStatus } from "@/hooks/useTransactions"
import { Button } from "@/components/ui/button"
import { 
  Filter, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  X,
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  Globe2,
  Layers,
  Sun,
  Moon
} from "lucide-react"

type FilterType = "all" | "safe" | "risky" | "fraud"

interface CountryStats {
  name: string
  code: string
  lat: number
  lng: number
  totalTx: number
  safeCount: number
  riskyCount: number
  fraudCount: number
  totalVolume: number
  avgRiskScore: number
  topCounterparts: { name: string; count: number }[]
}

function GlobeDemoComponent() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { txs } = useTransactions()
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [isPlaying, setIsPlaying] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showHotspots, setShowHotspots] = useState(true)
  const [dayNight, setDayNight] = useState<"auto" | "day" | "night">("auto")
  const [selectedCountry, setSelectedCountry] = useState<CountryStats | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const globeRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const autoRotateRef = useRef(true)
  const hotspotsRef = useRef<any[]>([])
  const particlesRef = useRef<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const getCountryStats = useCallback((countryName: string): CountryStats | null => {
    const country = COUNTRIES.find(c => c.name === countryName)
    if (!country) return null

    const relatedTxs = txs.filter(t => t.from === countryName || t.to === countryName)
    const outgoing = txs.filter(t => t.from === countryName)
    const incoming = txs.filter(t => t.to === countryName)

    const counterpartCounts: Record<string, number> = {}
    outgoing.forEach(t => {
      counterpartCounts[t.to] = (counterpartCounts[t.to] || 0) + 1
    })
    incoming.forEach(t => {
      counterpartCounts[t.from] = (counterpartCounts[t.from] || 0) + 1
    })

    const topCounterparts = Object.entries(counterpartCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      name: country.name,
      code: country.code,
      lat: country.lat,
      lng: country.lng,
      totalTx: relatedTxs.length,
      safeCount: relatedTxs.filter(t => t.status === "safe").length,
      riskyCount: relatedTxs.filter(t => t.status === "risky").length,
      fraudCount: relatedTxs.filter(t => t.status === "fraud").length,
      totalVolume: relatedTxs.reduce((sum, t) => sum + t.amount, 0),
      avgRiskScore: relatedTxs.length > 0 
        ? relatedTxs.reduce((sum, t) => sum + t.riskScore, 0) / relatedTxs.length 
        : 0,
      topCounterparts,
    }
  }, [txs])

  useEffect(() => {
    if (!mounted || !mountRef.current) return

    const initGlobe = async () => {
      const THREE = await import("three")
      const ThreeGlobeModule = await import("three-globe")
      const ThreeGlobe = ThreeGlobeModule.default

      const container = mountRef.current!
      const width = container.clientWidth
      const height = container.clientHeight

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      const scene = new THREE.Scene()
      sceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.z = 280
      cameraRef.current = camera

      const globe = new (ThreeGlobe as any)()
        .globeImageUrl(
          "https://unpkg.com/three-globe/example/img/earth-night.jpg"
        )
        .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
        .showAtmosphere(true)
        .atmosphereColor("#FFD700")
        .atmosphereAltitude(0.15)

      globeRef.current = globe
      scene.add(globe as unknown as THREE.Object3D)

      const ambient = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambient)
      const dir = new THREE.DirectionalLight(0xffffff, 0.8)
      dir.position.set(200, 200, 200)
      scene.add(dir)

      const pointLight = new THREE.PointLight(0xffd700, 0.5)
      pointLight.position.set(-200, 100, -200)
      scene.add(pointLight)

      const hotspotsGroup = new THREE.Group()
      hotspotsGroup.name = "hotspots"
      scene.add(hotspotsGroup)

      let raf = 0
      let time = 0
      const animate = () => {
        raf = requestAnimationFrame(animate)
        time += 0.016

        if (autoRotateRef.current) {
          ;(globe as any).rotation.y += 0.001
        }

        hotspotsRef.current.forEach((hotspot, i) => {
          if (hotspot.ring) {
            hotspot.ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.15)
            hotspot.ring.material.opacity = 0.3 + Math.sin(time * 3 + i) * 0.2
          }
          if (hotspot.beacon) {
            hotspot.beacon.material.opacity = 0.5 + Math.sin(time * 4 + i) * 0.3
          }
        })

        renderer.render(scene, camera)
      }
      animate()

      const onResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener("resize", onResize)

      let isDragging = false
      let prevX = 0
      let prevY = 0
      container.addEventListener("mousedown", (e) => {
        isDragging = true
        prevX = e.clientX
        prevY = e.clientY
        autoRotateRef.current = false
      })
      window.addEventListener("mouseup", () => {
        isDragging = false
        setTimeout(() => { autoRotateRef.current = true }, 3000)
      })
      window.addEventListener("mousemove", (e) => {
        if (isDragging) {
          const deltaX = (e.clientX - prevX) * 0.005
          const deltaY = (e.clientY - prevY) * 0.005
          prevX = e.clientX
          prevY = e.clientY
          ;(globe as any).rotation.y += deltaX
          ;(globe as any).rotation.x += deltaY
          ;(globe as any).rotation.x = Math.max(-0.5, Math.min(0.5, (globe as any).rotation.x))
        }
      })

      container.addEventListener("wheel", (e) => {
        e.preventDefault()
        const zoomSpeed = 0.1
        camera.position.z += e.deltaY * zoomSpeed
        camera.position.z = Math.max(150, Math.min(500, camera.position.z))
      }, { passive: false })

      fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then((r) => r.json())
        .then((geojson) => {
          globe
            .polygonsData(geojson.features)
            .polygonStrokeColor(() => "#FFD70066")
            .polygonSideColor(() => "rgba(255,215,0,0.08)")
            .polygonAltitude(() => 0.006)
        })
        .catch(() => {})

      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener("resize", onResize)
        container.innerHTML = ""
        renderer.dispose()
      }
    }

    const cleanup = initGlobe()
    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [mounted])

  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const fraudCounts: Record<string, number> = {}
    const riskScores: Record<string, number[]> = {}
    
    txs.forEach((t) => {
      if (t.status === "fraud") {
        fraudCounts[t.to] = (fraudCounts[t.to] || 0) + 1
        fraudCounts[t.from] = (fraudCounts[t.from] || 0) + 1
      }
      if (!riskScores[t.to]) riskScores[t.to] = []
      if (!riskScores[t.from]) riskScores[t.from] = []
      riskScores[t.to].push(t.riskScore)
      riskScores[t.from].push(t.riskScore)
    })

    globe.polygonCapColor((d: any) => {
      const name: string = d?.properties?.name || d?.properties?.ADMIN || ""
      const matchedCountry = COUNTRIES.find(c => 
        name.includes(c.name) || c.name.includes(name) || name === c.name
      )
      
      if (!showHeatmap) return "rgba(255,215,0,0.08)"
      
      const key = matchedCountry?.name || ""
      const scores = riskScores[key] || []
      const avgRisk = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      
      if (avgRisk > 0.7) return "rgba(255,46,46,0.4)"
      if (avgRisk > 0.5) return "rgba(255,165,0,0.35)"
      if (avgRisk > 0.3) return "rgba(255,255,102,0.3)"
      if (avgRisk > 0) return "rgba(0,255,157,0.25)"
      return "rgba(255,215,0,0.08)"
    })
  }, [txs, showHeatmap])

  useEffect(() => {
    const globe = globeRef.current as any
    const scene = sceneRef.current
    if (!globe || !scene) return

    const hotspotsGroup = scene.children.find((c: any) => c.name === "hotspots")
    if (!hotspotsGroup) return

    while (hotspotsGroup.children.length > 0) {
      hotspotsGroup.remove(hotspotsGroup.children[0])
    }
    hotspotsRef.current = []

    if (!showHotspots) return

    const countryActivity: Record<string, { fraud: number; risky: number; total: number }> = {}
    txs.forEach((t) => {
      [t.from, t.to].forEach(country => {
        if (!countryActivity[country]) countryActivity[country] = { fraud: 0, risky: 0, total: 0 }
        countryActivity[country].total++
        if (t.status === "fraud") countryActivity[country].fraud++
        if (t.status === "risky") countryActivity[country].risky++
      })
    })

    const importThree = async () => {
      const THREE = await import("three")

      COUNTRIES.forEach(country => {
        const activity = countryActivity[country.name] || { fraud: 0, risky: 0, total: 0 }
        if (activity.total < 5) return

        const phi = (90 - country.lat) * (Math.PI / 180)
        const theta = (country.lng + 180) * (Math.PI / 180)
        const radius = 101

        const x = -radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)

        let color = 0x00ff9d
        if (activity.fraud > 3) color = 0xff2e2e
        else if (activity.risky > 5 || activity.fraud > 0) color = 0xffa500
        else if (activity.risky > 2) color = 0xffff66

        const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 32)
        const ringMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.position.set(x, y, z)
        ring.lookAt(0, 0, 0)

        const beaconGeometry = new THREE.SphereGeometry(0.8, 16, 16)
        const beaconMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.7,
        })
        const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial)
        beacon.position.set(x, y, z)

        hotspotsGroup.add(ring)
        hotspotsGroup.add(beacon)

        hotspotsRef.current.push({ ring, beacon, country: country.name })
      })
    }

    importThree()
  }, [txs, showHotspots])

  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const filteredTxs = filter === "all" 
      ? txs 
      : txs.filter(t => t.status === filter)

    const getRiskColor = (riskScore: number) => {
      if (riskScore >= 0.85) return ["rgba(255,46,46,0.9)", "rgba(255,46,46,0.3)"]
      if (riskScore >= 0.6) return ["rgba(255,165,0,0.9)", "rgba(255,165,0,0.3)"]
      if (riskScore >= 0.3) return ["rgba(255,255,102,0.9)", "rgba(255,255,102,0.3)"]
      return ["rgba(0,255,157,0.9)", "rgba(0,255,157,0.3)"]
    }

    const arcsData = filteredTxs.slice(0, 200).map((t) => ({
      startLat: t.latLngFrom[0],
      startLng: t.latLngFrom[1],
      endLat: t.latLngTo[0],
      endLng: t.latLngTo[1],
      status: t.status,
      riskScore: t.riskScore,
      color: getRiskColor(t.riskScore),
      amount: t.amount,
    }))

    globe
      .arcsData(arcsData)
      .arcColor((d: any) => d.color)
      .arcStroke((d: any) => 0.3 + Math.sqrt(d.amount) * 0.008)
      .arcAltitude((d: any) => 0.1 + d.riskScore * 0.2)
      .arcDashLength(0.6)
      .arcDashGap(0.15)
      .arcDashAnimateTime((d: any) => 2500 - d.riskScore * 1000)
  }, [txs, filter])

  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const countryLabels = COUNTRIES.map(country => {
      const activity = txs.filter(t => t.from === country.name || t.to === country.name)
      const fraudCount = activity.filter(t => t.status === "fraud").length
      
      if (activity.length < 10) return null
      
      return {
        lat: country.lat,
        lng: country.lng,
        text: country.name,
        size: 0.6 + Math.min(1, activity.length / 50),
        fraud: fraudCount,
      }
    }).filter(Boolean)

    globe
      .labelsData(countryLabels)
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.text)
      .labelColor((d: any) => d.fraud > 3 ? "#ff2e2e" : d.fraud > 0 ? "#ffa500" : "#FFD700")
      .labelSize((d: any) => d.size)
      .labelResolution(2)
      .labelDotRadius(0.4)
  }, [txs])

  const handleZoom = (direction: "in" | "out") => {
    const camera = cameraRef.current
    if (!camera) return
    const delta = direction === "in" ? -30 : 30
    camera.position.z = Math.max(150, Math.min(500, camera.position.z + delta))
  }

  const handleReset = () => {
    const camera = cameraRef.current
    const globe = globeRef.current
    if (!camera || !globe) return
    camera.position.z = 280
    globe.rotation.x = 0
    globe.rotation.y = 0
    autoRotateRef.current = true
  }

  const handleCountryClick = (countryName: string) => {
    const stats = getCountryStats(countryName)
    if (stats) {
      setSelectedCountry(stats)
    }
  }

  if (!mounted) {
    return (
      <div className="relative h-[600px] w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative h-[600px] w-full">
      <div ref={mountRef} className="h-full w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033]" />
      
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "ghost"}
            onClick={() => setFilter("all")}
            className={`h-7 px-2 text-[10px] ${filter === "all" ? "bg-yellow-500 text-black" : "text-yellow-300 hover:bg-yellow-500/20"}`}
          >
            <Globe2 className="w-3 h-3 mr-1" />
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "safe" ? "default" : "ghost"}
            onClick={() => setFilter("safe")}
            className={`h-7 px-2 text-[10px] ${filter === "safe" ? "bg-green-500 text-black" : "text-green-400 hover:bg-green-500/20"}`}
          >
            <Shield className="w-3 h-3 mr-1" />
            Safe
          </Button>
          <Button
            size="sm"
            variant={filter === "risky" ? "default" : "ghost"}
            onClick={() => setFilter("risky")}
            className={`h-7 px-2 text-[10px] ${filter === "risky" ? "bg-orange-500 text-black" : "text-orange-400 hover:bg-orange-500/20"}`}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Risky
          </Button>
          <Button
            size="sm"
            variant={filter === "fraud" ? "default" : "ghost"}
            onClick={() => setFilter("fraud")}
            className={`h-7 px-2 text-[10px] ${filter === "fraud" ? "bg-red-500 text-black" : "text-red-400 hover:bg-red-500/20"}`}
          >
            <Activity className="w-3 h-3 mr-1" />
            Fraud
          </Button>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`h-7 px-2 text-[10px] ${showHeatmap ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400 hover:bg-yellow-500/10"}`}
          >
            <Layers className="w-3 h-3 mr-1" />
            Heatmap
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`h-7 px-2 text-[10px] ${showHotspots ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400 hover:bg-yellow-500/10"}`}
          >
            <Activity className="w-3 h-3 mr-1" />
            Hotspots
          </Button>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
        <div className="flex flex-col gap-1 p-1 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20"
            title={isPlaying ? "Pause rotation" : "Resume rotation"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleZoom("in")}
            className="h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleZoom("out")}
            className="h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20"
            title="Reset view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-16 left-3 z-20">
        <div className="p-2 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
          <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Risk Scale</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]" />
              <span className="text-[10px] text-gray-300">Safe (0-30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ffff66] shadow-[0_0_8px_#ffff66]" />
              <span className="text-[10px] text-gray-300">Low (30-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ffa500] shadow-[0_0_8px_#ffa500]" />
              <span className="text-[10px] text-gray-300">Risky (60-85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff2e2e] shadow-[0_0_8px_#ff2e2e]" />
              <span className="text-[10px] text-gray-300">Fraud (85%+)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">{txs.filter(t => t.status === "safe").length}</span>
          </div>
          <div className="w-px h-3 bg-yellow-500/30" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] text-orange-400 font-medium">{txs.filter(t => t.status === "risky").length}</span>
          </div>
          <div className="w-px h-3 bg-yellow-500/30" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-medium">{txs.filter(t => t.status === "fraud").length}</span>
          </div>
          <div className="w-px h-3 bg-yellow-500/30" />
          <div className="text-[10px] text-yellow-300 font-semibold">
            {txs.length} Live
          </div>
        </div>
      </div>

      {selectedCountry && (
        <div className="absolute top-14 right-3 w-64 z-30 animate-in slide-in-from-right-5 duration-300">
          <div className="rounded-lg bg-black/90 border border-yellow-500/40 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/30">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300">{selectedCountry.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCountry(null)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                  <div className="text-lg font-bold text-green-400">{selectedCountry.safeCount}</div>
                  <div className="text-[10px] text-gray-400">Safe Txs</div>
                </div>
                <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                  <div className="text-lg font-bold text-orange-400">{selectedCountry.riskyCount}</div>
                  <div className="text-[10px] text-gray-400">Risky Txs</div>
                </div>
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-lg font-bold text-red-400">{selectedCountry.fraudCount}</div>
                  <div className="text-[10px] text-gray-400">Fraud Txs</div>
                </div>
                <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-lg font-bold text-yellow-400">{(selectedCountry.avgRiskScore * 100).toFixed(0)}%</div>
                  <div className="text-[10px] text-gray-400">Avg Risk</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Total Volume</div>
                <div className="text-sm font-semibold text-white">
                  ${selectedCountry.totalVolume.toLocaleString()}
                </div>
              </div>
              {selectedCountry.topCounterparts.length > 0 && (
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Top Counterparts</div>
                  <div className="space-y-1">
                    {selectedCountry.topCounterparts.map((cp, i) => (
                      <div key={cp.name} className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-300">{cp.name}</span>
                        <span className="text-yellow-400 font-medium">{cp.count} txs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-16 right-3 z-20">
        <div className="p-2 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
          <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Quick Select</div>
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {["United States", "China", "Russia", "Nigeria", "UAE"].map(country => (
              <Button
                key={country}
                size="sm"
                variant="ghost"
                onClick={() => handleCountryClick(country)}
                className="h-6 px-2 text-[9px] text-yellow-300 hover:bg-yellow-500/20 border border-yellow-500/20"
              >
                {country.length > 12 ? country.slice(0, 10) + ".." : country}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobeDemoComponent