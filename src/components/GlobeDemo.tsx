"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useTransactions, COUNTRIES, TxStatus, Tx } from "@/hooks/useTransactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
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
  Moon,
  Cloud,
  Search,
  Camera,
  Download,
  Clock,
  Sparkles,
  Wifi,
  Eye,
  EyeOff
} from "lucide-react"

type FilterType = "all" | "safe" | "risky" | "fraud"
type DayNightMode = "auto" | "day" | "night"
type PlaybackSpeed = 1 | 10 | 100

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
  recentAlerts: { time: string; type: string; amount: number }[]
}

interface FraudBurst {
  id: string
  lat: number
  lng: number
  timestamp: number
  intensity: number
}

interface ArcParticle {
  mesh: any
  startPos: any
  endPos: any
  controlPoint: any
  progress: number
  speed: number
  color: number
  trail: any[]
}

const CHAIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#00FFA3",
  USDT: "#26A17B",
  BNB: "#F3BA2F",
  XRP: "#23292F",
  ADA: "#0033AD",
  MATIC: "#8247E5",
}

function GlobeDemoComponent() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { txs } = useTransactions()
  const [mounted, setMounted] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [chainFilter, setChainFilter] = useState<string>("all")
  const [isPlaying, setIsPlaying] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showHotspots, setShowHotspots] = useState(true)
  const [showParticles, setShowParticles] = useState(true)
  const [dayNight, setDayNight] = useState<DayNightMode>("auto")
  const [selectedCountry, setSelectedCountry] = useState<CountryStats | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof COUNTRIES>([])
  const [showSearch, setShowSearch] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1)
  const [timelinePosition, setTimelinePosition] = useState(100)
  const [fraudBursts, setFraudBursts] = useState<FraudBurst[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const globeRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const autoRotateRef = useRef(true)
  const isPlayingRef = useRef(true)
  const hotspotsRef = useRef<any[]>([])
  const arcParticlesRef = useRef<ArcParticle[]>([])
  const sunRef = useRef<any>(null)
  const atmosphereRef = useRef<any>(null)
  const burstMeshesRef = useRef<any[]>([])
  const arcLinesRef = useRef<any[]>([])
  const energyRingsRef = useRef<any[]>([])
  const rafRef = useRef<number>(0)
  const initStartedRef = useRef(false)
  const playbackSpeedRef = useRef(playbackSpeed)
  const dayNightRef = useRef(dayNight)

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed
  }, [playbackSpeed])

  useEffect(() => {
    dayNightRef.current = dayNight
  }, [dayNight])

  useEffect(() => {
    isPlayingRef.current = isPlaying
    autoRotateRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768)
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebglSupported(!!gl)
      
      const handleResize = () => setIsMobile(window.innerWidth < 768)
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(results.slice(0, 8))
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    const newFrauds = txs.filter(t => 
      t.status === "fraud" && 
      Date.now() - t.timestamp < 3000
    )
    
    if (newFrauds.length > 0) {
      const bursts: FraudBurst[] = newFrauds.map(t => ({
        id: t.id,
        lat: t.latLngTo[0],
        lng: t.latLngTo[1],
        timestamp: Date.now(),
        intensity: t.riskScore
      }))
      setFraudBursts(prev => [...prev, ...bursts].slice(-10))
    }

    const cleanup = setTimeout(() => {
      setFraudBursts(prev => prev.filter(b => Date.now() - b.timestamp < 5000))
    }, 5000)

    return () => clearTimeout(cleanup)
  }, [txs])

  const filteredTxs = useMemo(() => {
    let result = txs
    
    if (filter !== "all") {
      result = result.filter(t => t.status === filter)
    }
    
    if (chainFilter !== "all") {
      result = result.filter(t => t.chain === chainFilter)
    }

    const timeThreshold = (timelinePosition / 100) * 10 * 60 * 1000
    const now = Date.now()
    result = result.filter(t => now - t.timestamp <= timeThreshold)
    
    return result
  }, [txs, filter, chainFilter, timelinePosition])

  const getCountryStats = useCallback((countryName: string): CountryStats | null => {
    const country = COUNTRIES.find(c => c.name === countryName)
    if (!country) return null

    const relatedTxs = filteredTxs.filter(t => t.from === countryName || t.to === countryName)
    const outgoing = filteredTxs.filter(t => t.from === countryName)
    const incoming = filteredTxs.filter(t => t.to === countryName)

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

    const recentAlerts = relatedTxs
      .filter(t => t.status !== "safe")
      .slice(0, 5)
      .map(t => ({
        time: new Date(t.timestamp).toLocaleTimeString(),
        type: t.status,
        amount: t.amount
      }))

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
      recentAlerts,
    }
  }, [filteredTxs])

  useEffect(() => {
    if (!mounted || !mountRef.current || !webglSupported || initStartedRef.current) return

    initStartedRef.current = true
    let isCleanedUp = false
    let animationId = 0

    const initGlobe = async () => {
      if (isCleanedUp) return

      try {
        const THREE = await import("three")
        const ThreeGlobeModule = await import("three-globe")
        const ThreeGlobe = ThreeGlobeModule.default

        if (isCleanedUp || !mountRef.current) return

        const container = mountRef.current
        const width = container.clientWidth
        const height = container.clientHeight

        const canvas = document.createElement('canvas')
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        container.appendChild(canvas)

        let renderer: any
        try {
          renderer = new THREE.WebGLRenderer({ 
            canvas,
            antialias: !isMobile, 
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
          })
        } catch (e) {
          console.warn("WebGL renderer creation failed")
          setWebglSupported(false)
          return
        }

        if (!renderer.getContext()) {
          console.warn("WebGL context not available")
          setWebglSupported(false)
          return
        }

        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.2
        rendererRef.current = renderer

        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          console.warn("WebGL context lost")
          cancelAnimationFrame(animationId)
        })

        canvas.addEventListener('webglcontextrestored', () => {
          console.log("WebGL context restored")
        })

        const scene = new THREE.Scene()
        sceneRef.current = scene

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        camera.position.z = 280
        cameraRef.current = camera

        const globe = new (ThreeGlobe as any)()
          .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
          .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
          .showAtmosphere(true)
          .atmosphereColor("#87CEEB")
          .atmosphereAltitude(isMobile ? 0.1 : 0.18)

        globeRef.current = globe
        scene.add(globe as unknown as THREE.Object3D)

        const ambient = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambient)
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
        sunLight.position.set(200, 100, 200)
        scene.add(sunLight)
        sunRef.current = sunLight

        const pointLight = new THREE.PointLight(0xffd700, 0.5)
        pointLight.position.set(-200, 100, -200)
        scene.add(pointLight)

        if (!isMobile) {
          const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64)
          const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vec3 viewDir = normalize(-vPosition);
                float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
                rim = pow(rim, 3.0);
                vec3 atmosphereColor = mix(vec3(0.1, 0.4, 1.0), vec3(1.0, 0.84, 0.0), rim * 0.3);
                gl_FragColor = vec4(atmosphereColor, rim * 0.4);
              }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
          })
          const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
          scene.add(atmosphere)
          atmosphereRef.current = atmosphere
        }

        const hotspotsGroup = new THREE.Group()
        hotspotsGroup.name = "hotspots"
        scene.add(hotspotsGroup)

        const arcParticlesGroup = new THREE.Group()
        arcParticlesGroup.name = "arcParticles"
        scene.add(arcParticlesGroup)

        const burstsGroup = new THREE.Group()
        burstsGroup.name = "bursts"
        scene.add(burstsGroup)

        const energyLinesGroup = new THREE.Group()
        energyLinesGroup.name = "energyLines"
        scene.add(energyLinesGroup)

        let time = 0
        let lastTime = performance.now()
        
        const animate = () => {
          if (isCleanedUp) return
          animationId = requestAnimationFrame(animate)
          
          const currentTime = performance.now()
          const deltaTime = (currentTime - lastTime) / 1000
          lastTime = currentTime
          time += deltaTime

          if (autoRotateRef.current && isPlayingRef.current && globe) {
            const rotationSpeed = 0.15 * playbackSpeedRef.current * deltaTime
            ;(globe as any).rotation.y += rotationSpeed
          }

          if (sunRef.current && dayNightRef.current === "auto") {
            const sunAngle = time * 0.05
            sunRef.current.position.x = Math.cos(sunAngle) * 300
            sunRef.current.position.z = Math.sin(sunAngle) * 300
          }

          hotspotsRef.current.forEach((hotspot, i) => {
            if (hotspot.ring) {
              const pulse = 1 + Math.sin(time * 2 + i * 0.5) * 0.2
              hotspot.ring.scale.setScalar(pulse)
              hotspot.ring.material.opacity = 0.3 + Math.sin(time * 3 + i) * 0.2
            }
            if (hotspot.beacon) {
              hotspot.beacon.material.opacity = 0.5 + Math.sin(time * 4 + i) * 0.3
            }
            if (hotspot.strengthRing) {
              hotspot.strengthRing.rotation.z = time * 0.5
              hotspot.strengthRing.material.opacity = 0.2 + Math.sin(time * 2) * 0.1
            }
          })

          arcParticlesRef.current.forEach((particle) => {
            if (particle.mesh && particle.startPos && particle.endPos && particle.controlPoint) {
              particle.progress += particle.speed * playbackSpeedRef.current * deltaTime * 60
              if (particle.progress > 1) particle.progress = 0
              
              const t = particle.progress
              const oneMinusT = 1 - t
              
              const pos = new THREE.Vector3()
              pos.x = oneMinusT * oneMinusT * particle.startPos.x + 2 * oneMinusT * t * particle.controlPoint.x + t * t * particle.endPos.x
              pos.y = oneMinusT * oneMinusT * particle.startPos.y + 2 * oneMinusT * t * particle.controlPoint.y + t * t * particle.endPos.y
              pos.z = oneMinusT * oneMinusT * particle.startPos.z + 2 * oneMinusT * t * particle.controlPoint.z + t * t * particle.endPos.z
              
              particle.mesh.position.copy(pos)
              
              const fadeIn = Math.min(1, t * 5)
              const fadeOut = Math.min(1, (1 - t) * 5)
              particle.mesh.material.opacity = fadeIn * fadeOut * 0.9
              
              const scale = 0.8 + Math.sin(t * Math.PI) * 0.4
              particle.mesh.scale.setScalar(scale)

              if (particle.trail && particle.trail.length > 0) {
                particle.trail.forEach((trailMesh: any, idx: number) => {
                  const trailT = Math.max(0, t - (idx + 1) * 0.02)
                  const trailOneMinusT = 1 - trailT
                  trailMesh.position.x = trailOneMinusT * trailOneMinusT * particle.startPos.x + 2 * trailOneMinusT * trailT * particle.controlPoint.x + trailT * trailT * particle.endPos.x
                  trailMesh.position.y = trailOneMinusT * trailOneMinusT * particle.startPos.y + 2 * trailOneMinusT * trailT * particle.controlPoint.y + trailT * trailT * particle.endPos.y
                  trailMesh.position.z = trailOneMinusT * trailOneMinusT * particle.startPos.z + 2 * trailOneMinusT * trailT * particle.controlPoint.z + trailT * trailT * particle.endPos.z
                  trailMesh.material.opacity = Math.max(0, (fadeIn * fadeOut * 0.5) * (1 - idx * 0.15))
                  trailMesh.scale.setScalar(scale * (1 - idx * 0.1))
                })
              }
            }
          })

          energyRingsRef.current.forEach((ring) => {
            if (ring.mesh) {
              ring.progress += 0.008 * playbackSpeedRef.current * deltaTime * 60
              if (ring.progress > 1) {
                ring.progress = 0
              }
              const scale = 1 + ring.progress * 3
              ring.mesh.scale.setScalar(scale)
              ring.mesh.material.opacity = Math.max(0, 0.6 * (1 - ring.progress))
            }
          })

          burstMeshesRef.current.forEach((burst) => {
            if (burst.mesh) {
              const age = (Date.now() - burst.timestamp) / 1000
              if (age < 3) {
                const scale = 1 + age * 5
                burst.mesh.scale.setScalar(scale)
                burst.mesh.material.opacity = Math.max(0, 0.8 - age * 0.3)
              } else {
                burst.mesh.visible = false
              }
            }
          })

          try {
            renderer.render(scene, camera)
          } catch (e) {
            // Render error - context may be lost
          }
        }
        animate()
        rafRef.current = animationId

        const onResize = () => {
          if (!container || isCleanedUp) return
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
        
        const onMouseDown = (e: MouseEvent) => {
          isDragging = true
          prevX = e.clientX
          prevY = e.clientY
          autoRotateRef.current = false
        }
        
        const onMouseUp = () => {
          isDragging = false
          setTimeout(() => { if (isPlayingRef.current) autoRotateRef.current = true }, 3000)
        }
        
        const onMouseMove = (e: MouseEvent) => {
          if (isDragging && globe) {
            const deltaX = (e.clientX - prevX) * 0.005
            const deltaY = (e.clientY - prevY) * 0.005
            prevX = e.clientX
            prevY = e.clientY
            ;(globe as any).rotation.y += deltaX
            ;(globe as any).rotation.x += deltaY
            ;(globe as any).rotation.x = Math.max(-0.5, Math.min(0.5, (globe as any).rotation.x))
          }
        }

        container.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mouseup", onMouseUp)
        window.addEventListener("mousemove", onMouseMove)

        const onWheel = (e: WheelEvent) => {
          e.preventDefault()
          const zoomSpeed = 0.1
          camera.position.z += e.deltaY * zoomSpeed
          camera.position.z = Math.max(150, Math.min(500, camera.position.z))
        }
        container.addEventListener("wheel", onWheel, { passive: false })

        let touchStartDist = 0
        const onTouchStart = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            touchStartDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            )
          }
        }
        const onTouchMove = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            )
            const delta = (touchStartDist - dist) * 0.5
            camera.position.z = Math.max(150, Math.min(500, camera.position.z + delta))
            touchStartDist = dist
          }
        }
        container.addEventListener("touchstart", onTouchStart)
        container.addEventListener("touchmove", onTouchMove)

        fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
          .then((r) => r.json())
          .then((geojson) => {
            if (!isCleanedUp && globe) {
              globe
                .polygonsData(geojson.features)
                .polygonStrokeColor(() => "#FFD70066")
                .polygonSideColor(() => "rgba(255,215,0,0.08)")
                .polygonAltitude(() => 0.006)
            }
          })
          .catch(() => {})

        return () => {
          isCleanedUp = true
          cancelAnimationFrame(animationId)
          window.removeEventListener("resize", onResize)
          window.removeEventListener("mouseup", onMouseUp)
          window.removeEventListener("mousemove", onMouseMove)
          container.removeEventListener("mousedown", onMouseDown)
          container.removeEventListener("wheel", onWheel)
          container.removeEventListener("touchstart", onTouchStart)
          container.removeEventListener("touchmove", onTouchMove)
          
          if (renderer) {
            renderer.dispose()
            renderer.forceContextLoss()
          }
          
          if (container && canvas && canvas.parentNode === container) {
            container.removeChild(canvas)
          }
          
          globeRef.current = null
          sceneRef.current = null
          cameraRef.current = null
          rendererRef.current = null
          initStartedRef.current = false
        }

      } catch (error) {
        console.error("Globe initialization error:", error)
        setWebglSupported(false)
      }
    }

    const cleanup = initGlobe()

    return () => {
      cleanup?.then(fn => fn?.())
    }
  }, [mounted, isMobile, webglSupported])

  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const fraudCounts: Record<string, number> = {}
    const riskScores: Record<string, number[]> = {}
    
    filteredTxs.forEach((t) => {
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
      
      if (avgRisk > 0.7) return "rgba(255,46,46,0.5)"
      if (avgRisk > 0.5) return "rgba(255,165,0,0.4)"
      if (avgRisk > 0.3) return "rgba(255,255,102,0.35)"
      if (avgRisk > 0) return "rgba(0,255,157,0.3)"
      return "rgba(255,215,0,0.08)"
    })
  }, [filteredTxs, showHeatmap])

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

    const countryActivity: Record<string, { fraud: number; risky: number; total: number; volume: number }> = {}
    filteredTxs.forEach((t) => {
      [t.from, t.to].forEach(country => {
        if (!countryActivity[country]) countryActivity[country] = { fraud: 0, risky: 0, total: 0, volume: 0 }
        countryActivity[country].total++
        countryActivity[country].volume += t.amount
        if (t.status === "fraud") countryActivity[country].fraud++
        if (t.status === "risky") countryActivity[country].risky++
      })
    })

    const importThree = async () => {
      const THREE = await import("three")

      COUNTRIES.forEach(country => {
        const activity = countryActivity[country.name] || { fraud: 0, risky: 0, total: 0, volume: 0 }
        if (activity.total < 3) return

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

        const beaconGeometry = new THREE.SphereGeometry(0.6 + Math.min(1, activity.total / 50), 16, 16)
        const beaconMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.7,
        })
        const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial)
        beacon.position.set(x, y, z)

        hotspotsGroup.add(ring)
        hotspotsGroup.add(beacon)

        let strengthRing = null
        if (activity.total > 20) {
          const strengthGeometry = new THREE.RingGeometry(3, 4, 32)
          const strengthMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
          })
          strengthRing = new THREE.Mesh(strengthGeometry, strengthMaterial)
          strengthRing.position.set(x, y, z)
          strengthRing.lookAt(0, 0, 0)
          hotspotsGroup.add(strengthRing)
        }

        hotspotsRef.current.push({ ring, beacon, strengthRing, country: country.name })
      })
    }

    importThree()
  }, [filteredTxs, showHotspots])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !showParticles) return

    const arcParticlesGroup = scene.children.find((c: any) => c.name === "arcParticles")
    const energyLinesGroup = scene.children.find((c: any) => c.name === "energyLines")
    if (!arcParticlesGroup) return

    while (arcParticlesGroup.children.length > 0) {
      arcParticlesGroup.remove(arcParticlesGroup.children[0])
    }
    if (energyLinesGroup) {
      while (energyLinesGroup.children.length > 0) {
        energyLinesGroup.remove(energyLinesGroup.children[0])
      }
    }
    arcParticlesRef.current = []
    energyRingsRef.current = []

    const createArcParticles = async () => {
      const THREE = await import("three")
      const maxParticles = isMobile ? 80 : 250
      const particlesPerArc = isMobile ? 3 : 6
      const trailLength = isMobile ? 2 : 5

      filteredTxs.slice(0, maxParticles / particlesPerArc).forEach((tx, txIdx) => {
        const fromPhi = (90 - tx.latLngFrom[0]) * (Math.PI / 180)
        const fromTheta = (tx.latLngFrom[1] + 180) * (Math.PI / 180)
        const toPhi = (90 - tx.latLngTo[0]) * (Math.PI / 180)
        const toTheta = (tx.latLngTo[1] + 180) * (Math.PI / 180)
        const radius = 101

        const startPos = new THREE.Vector3(
          -radius * Math.sin(fromPhi) * Math.cos(fromTheta),
          radius * Math.cos(fromPhi),
          radius * Math.sin(fromPhi) * Math.sin(fromTheta)
        )
        const endPos = new THREE.Vector3(
          -radius * Math.sin(toPhi) * Math.cos(toTheta),
          radius * Math.cos(toPhi),
          radius * Math.sin(toPhi) * Math.sin(toTheta)
        )

        const midPoint = new THREE.Vector3()
          .addVectors(startPos, endPos)
          .multiplyScalar(0.5)
        const arcHeight = startPos.distanceTo(endPos) * 0.4 + 15 + tx.riskScore * 20
        const controlPoint = midPoint.clone().normalize().multiplyScalar(radius + arcHeight)

        let colorHex = 0x00ff9d
        if (tx.riskScore >= 0.85) colorHex = 0xff2e2e
        else if (tx.riskScore >= 0.6) colorHex = 0xffa500
        else if (tx.riskScore >= 0.3) colorHex = 0xffff66

        for (let p = 0; p < particlesPerArc; p++) {
          const particleGeometry = new THREE.SphereGeometry(0.4 + tx.riskScore * 0.3, 12, 12)
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.9,
          })
          const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial)
          arcParticlesGroup.add(particleMesh)

          const trail: any[] = []
          for (let t = 0; t < trailLength; t++) {
            const trailGeometry = new THREE.SphereGeometry(0.25 - t * 0.03, 8, 8)
            const trailMaterial = new THREE.MeshBasicMaterial({
              color: colorHex,
              transparent: true,
              opacity: 0.5 - t * 0.08,
            })
            const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial)
            arcParticlesGroup.add(trailMesh)
            trail.push(trailMesh)
          }

          arcParticlesRef.current.push({
            mesh: particleMesh,
            startPos,
            endPos,
            controlPoint,
            progress: (p / particlesPerArc) + (txIdx % 10) * 0.1,
            speed: 0.003 + Math.random() * 0.002 + tx.riskScore * 0.002,
            color: colorHex,
            trail,
          })
        }

        if (energyLinesGroup && tx.riskScore > 0.5 && txIdx < 30) {
          const ringGeometry = new THREE.RingGeometry(0.8, 1.2, 16)
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
          })
          const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial)
          ringMesh.position.copy(startPos)
          ringMesh.lookAt(0, 0, 0)
          energyLinesGroup.add(ringMesh)
          energyRingsRef.current.push({ mesh: ringMesh, progress: Math.random() })
        }
      })
    }

    createArcParticles()
  }, [filteredTxs, showParticles, isMobile])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const burstsGroup = scene.children.find((c: any) => c.name === "bursts")
    if (!burstsGroup) return

    const createBursts = async () => {
      const THREE = await import("three")

      fraudBursts.forEach(burst => {
        const existing = burstMeshesRef.current.find(b => b.id === burst.id)
        if (existing) return

        const phi = (90 - burst.lat) * (Math.PI / 180)
        const theta = (burst.lng + 180) * (Math.PI / 180)
        const radius = 102

        const x = -radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)

        const geometry = new THREE.RingGeometry(0.5, 1, 32)
        const material = new THREE.MeshBasicMaterial({
          color: 0xff2e2e,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.lookAt(0, 0, 0)
        burstsGroup.add(mesh)

        burstMeshesRef.current.push({
          id: burst.id,
          mesh,
          timestamp: burst.timestamp,
        })
      })
    }

    createBursts()
  }, [fraudBursts])

  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const getRiskColor = (riskScore: number, chain: string) => {
      // Logic from spec: risk_score >= 70 FRAUD (red), >= 40 RISKY (orange), else SAFE (green)
      if (riskScore >= 0.7) return ["rgba(255,46,46,0.95)", "rgba(255,46,46,0.4)"]
      if (riskScore >= 0.4) return ["rgba(255,165,0,0.95)", "rgba(255,165,0,0.4)"]
      return ["rgba(16,185,129,0.95)", "rgba(16,185,129,0.4)"]
    }

    const getArcWidth = (tx: Tx) => {
      // base_width: SAFE: 0.6, RISKY: 1.0, FRAUD: 1.6
      let width = 0.6
      if (tx.riskScore >= 0.7) width = 1.6
      else if (tx.riskScore >= 0.4) width = 1.0

      // modifiers: high_transaction_value: +0.1
      if (tx.amount > 50000) width += 0.1
      
      return Math.min(Math.max(width, 0.5), 1.8)
    }

    const maxArcs = isMobile ? 100 : 300
    const arcsData = filteredTxs.slice(0, maxArcs).map((t) => ({
      startLat: t.latLngFrom[0],
      startLng: t.latLngFrom[1],
      endLat: t.latLngTo[0],
      endLng: t.latLngTo[1],
      status: t.status,
      riskScore: t.riskScore,
      color: getRiskColor(t.riskScore, t.chain),
      amount: t.amount,
      chain: t.chain,
      width: getArcWidth(t)
    }))

    globe
      .arcsData(arcsData)
      .arcColor((d: any) => d.color)
      .arcStroke((d: any) => d.width)
      .arcAltitude((d: any) => 0.12 + d.riskScore * 0.3)
      .arcDashLength(0.4)
      .arcDashGap(0.02)
      .arcDashInitialGap((d: any) => Math.random())
      .arcDashAnimateTime((d: any) => {
        // speed: SAFE: 0.25, RISKY: 0.35, FRAUD: 0.55
        let baseTime = 2000
        if (d.riskScore >= 0.7) baseTime = 1000
        else if (d.riskScore >= 0.4) baseTime = 1500
        return baseTime / playbackSpeed
      })
  }, [filteredTxs, isMobile, chainFilter, playbackSpeed])

  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const countryLabels = COUNTRIES.map(country => {
      const activity = filteredTxs.filter(t => t.from === country.name || t.to === country.name)
      const fraudCount = activity.filter(t => t.status === "fraud").length
      
      if (activity.length < 8) return null
      
      return {
        lat: country.lat,
        lng: country.lng,
        text: country.name,
        size: 0.6 + Math.min(1.2, activity.length / 40),
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
  }, [filteredTxs])

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
      zoomToCountry(stats.lat, stats.lng)
    }
    setShowSearch(false)
    setSearchQuery("")
  }

  const zoomToCountry = (lat: number, lng: number) => {
    const globe = globeRef.current
    const camera = cameraRef.current
    if (!globe || !camera) return

    autoRotateRef.current = false
    
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    globe.rotation.y = -theta + Math.PI
    globe.rotation.x = -(phi - Math.PI / 2) * 0.5
    camera.position.z = 200

    setTimeout(() => { if (isPlayingRef.current) autoRotateRef.current = true }, 5000)
  }

  const handleExportSnapshot = async () => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    if (!renderer || !scene || !camera) return

    renderer.render(scene, camera)
    const dataUrl = renderer.domElement.toDataURL("image/png")
    
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `cryptoguard-globe-${Date.now()}.png`
    link.click()
  }

  const uniqueChains = useMemo(() => {
    const chains = new Set(txs.map(t => t.chain))
    return ["all", ...Array.from(chains)]
  }, [txs])

  if (!mounted) {
    return (
      <div className="relative h-[600px] w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
      </div>
    )
  }

  if (!webglSupported) {
    return (
      <div className="relative h-[600px] w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033] flex flex-col items-center justify-center gap-4 p-6">
        <Globe2 className="w-16 h-16 text-yellow-500/50" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">3D Globe Unavailable</h3>
          <p className="text-sm text-gray-400 max-w-md">
            WebGL is not supported or has been disabled in your browser. 
            Please enable hardware acceleration or try a different browser to view the interactive globe.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xl font-bold text-green-400">{filteredTxs.filter(t => t.status === "safe").length}</div>
            <div className="text-[10px] text-gray-400">Safe</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
            <div className="text-xl font-bold text-orange-400">{filteredTxs.filter(t => t.status === "risky").length}</div>
            <div className="text-[10px] text-gray-400">Risky</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-xl font-bold text-red-400">{filteredTxs.filter(t => t.status === "fraud").length}</div>
            <div className="text-[10px] text-gray-400">Fraud</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
            <div className="text-xl font-bold text-yellow-400">{filteredTxs.length}</div>
            <div className="text-[10px] text-gray-400">Total</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] w-full">
      <div ref={mountRef} className="h-full w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033]" />
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowControls(!showControls)}
        className="absolute top-2 left-2 z-30 h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20 bg-black/60 border border-yellow-500/30"
      >
        {showControls ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </Button>

      {showControls && (
        <>
          <div className="absolute top-3 left-10 flex flex-col gap-2 z-20">
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

            <div className="flex items-center gap-1 p-1 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm flex-wrap">
              {uniqueChains.slice(0, 6).map(chain => (
                <Button
                  key={chain}
                  size="sm"
                  variant="ghost"
                  onClick={() => setChainFilter(chain)}
                  className={`h-6 px-2 text-[9px] ${chainFilter === chain ? "bg-yellow-500/30 text-yellow-300" : "text-gray-400 hover:bg-yellow-500/10"}`}
                  style={chain !== "all" ? { borderLeft: `3px solid ${CHAIN_COLORS[chain] || "#FFD700"}` } : {}}
                >
                  {chain === "all" ? "All Chains" : chain}
                </Button>
              ))}
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowParticles(!showParticles)}
                className={`h-7 px-2 text-[10px] ${showParticles ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400 hover:bg-yellow-500/10"}`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Particles
              </Button>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDayNight("auto")}
                className={`h-7 px-2 text-[10px] ${dayNight === "auto" ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400 hover:bg-yellow-500/10"}`}
              >
                <Cloud className="w-3 h-3 mr-1" />
                Auto
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDayNight("day")}
                className={`h-7 px-2 text-[10px] ${dayNight === "day" ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400 hover:bg-yellow-500/10"}`}
              >
                <Sun className="w-3 h-3 mr-1" />
                Day
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDayNight("night")}
                className={`h-7 px-2 text-[10px] ${dayNight === "night" ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400 hover:bg-yellow-500/10"}`}
              >
                <Moon className="w-3 h-3 mr-1" />
                Night
              </Button>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
            <div className="flex flex-col gap-1 p-1 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSearch(!showSearch)}
                className="h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20"
                title="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </Button>
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
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportSnapshot}
                className="h-7 w-7 p-0 text-yellow-300 hover:bg-yellow-500/20"
                title="Export snapshot"
              >
                <Camera className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {showSearch && (
            <div className="absolute top-14 right-3 w-64 z-30 animate-in slide-in-from-right-5 duration-300">
              <div className="rounded-lg bg-black/90 border border-yellow-500/40 backdrop-blur-sm p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {searchResults.map(country => (
                      <Button
                        key={country.code}
                        variant="ghost"
                        onClick={() => handleCountryClick(country.name)}
                        className="w-full h-7 justify-start text-[11px] text-yellow-300 hover:bg-yellow-500/20"
                      >
                        <span className="text-gray-500 mr-2">{country.code}</span>
                        {country.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-20 left-3 z-20">
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

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-72">
            <div className="p-2 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] text-gray-400">Timeline</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPlaybackSpeed(1)}
                    className={`h-5 px-1.5 text-[9px] ${playbackSpeed === 1 ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400"}`}
                  >
                    1x
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPlaybackSpeed(10)}
                    className={`h-5 px-1.5 text-[9px] ${playbackSpeed === 10 ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400"}`}
                  >
                    10x
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPlaybackSpeed(100)}
                    className={`h-5 px-1.5 text-[9px] ${playbackSpeed === 100 ? "text-yellow-300 bg-yellow-500/20" : "text-gray-400"}`}
                  >
                    100x
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">0m</span>
                <Slider
                  value={[timelinePosition]}
                  onValueChange={([val]) => setTimelinePosition(val)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-[9px] text-gray-500">10m</span>
              </div>
            </div>
          </div>

          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-400 font-medium">{filteredTxs.filter(t => t.status === "safe").length}</span>
              </div>
              <div className="w-px h-3 bg-yellow-500/30" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] text-orange-400 font-medium">{filteredTxs.filter(t => t.status === "risky").length}</span>
              </div>
              <div className="w-px h-3 bg-yellow-500/30" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400 font-medium">{filteredTxs.filter(t => t.status === "fraud").length}</span>
              </div>
              <div className="w-px h-3 bg-yellow-500/30" />
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-green-400 animate-pulse" />
                <span className="text-[10px] text-yellow-300 font-semibold">
                  {filteredTxs.length} Live
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 right-3 z-20">
            <div className="p-2 rounded-lg bg-black/80 border border-yellow-500/30 backdrop-blur-sm">
              <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Quick Select</div>
              <div className="flex flex-wrap gap-1 max-w-[180px]">
                {["United States", "China", "Russia", "Nigeria", "UAE", "Germany", "Japan", "Brazil"].map(country => (
                  <Button
                    key={country}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCountryClick(country)}
                    className="h-6 px-2 text-[9px] text-yellow-300 hover:bg-yellow-500/20 border border-yellow-500/20"
                  >
                    {country.length > 10 ? country.slice(0, 8) + ".." : country}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedCountry && (
        <div className="absolute top-14 right-3 w-72 z-30 animate-in slide-in-from-right-5 duration-300">
          <div className="rounded-lg bg-black/90 border border-yellow-500/40 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/30">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300">{selectedCountry.name}</span>
                <span className="text-[10px] text-gray-500">({selectedCountry.code})</span>
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
                    {selectedCountry.topCounterparts.map((cp) => (
                      <div key={cp.name} className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-300">{cp.name}</span>
                        <span className="text-yellow-400 font-medium">{cp.count} txs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedCountry.recentAlerts.length > 0 && (
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Recent Alerts</div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedCountry.recentAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] p-1 rounded bg-black/40">
                        <span className={alert.type === "fraud" ? "text-red-400" : "text-orange-400"}>
                          {alert.type.toUpperCase()}
                        </span>
                        <span className="text-gray-400">${alert.amount.toLocaleString()}</span>
                        <span className="text-gray-500">{alert.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-yellow-500/20">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-[10px] border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-[10px] border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Flag
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fraudBursts.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-sm animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[11px] text-red-300 font-medium">
              Fraud Alert: {fraudBursts.length} suspicious {fraudBursts.length === 1 ? "transaction" : "transactions"} detected
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobeDemoComponent