"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import ThreeGlobe from "three-globe"
import { useTransactions } from "@/hooks/useTransactions"

export default function GlobeDemo() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { txs } = useTransactions()

  // Keep a ref to globe and arcs
  const globeRef = useRef<ThreeGlobe | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    const container = mountRef.current!
    const width = container.clientWidth
    const height = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 250
    cameraRef.current = camera

    const globe = new (ThreeGlobe as any)()
      .globeImageUrl(
        // NASA Blue Marble
        "https://unpkg.com/three-globe/example/img/earth-night.jpg"
      )
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#FFD700")
      .atmosphereAltitude(0.12)

    globeRef.current = globe

    scene.add(globe as unknown as THREE.Object3D)

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(200, 200, 200)
    scene.add(dir)

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      ;(globe as any).rotation.y += 0.0008
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

    // Simple drag rotate
    let isDragging = false
    let prevX = 0
    container.addEventListener("mousedown", (e) => {
      isDragging = true
      prevX = e.clientX
    })
    window.addEventListener("mouseup", () => (isDragging = false))
    window.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const delta = (e.clientX - prevX) * 0.005
        prevX = e.clientX
        ;(globe as any).rotation.y += delta
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      container.innerHTML = ""
      renderer.dispose()
    }
  }, [])

  // Update arcs when txs change
  useEffect(() => {
    const globe = globeRef.current as any
    if (!globe) return

    const arcsData = txs.map((t) => ({
      startLat: t.latLngFrom[0],
      startLng: t.latLngFrom[1],
      endLat: t.latLngTo[0],
      endLng: t.latLngTo[1],
      status: t.status,
      color:
        t.status === "safe" ? "#00ff88" : t.status === "risky" ? "#ffb020" : "#ff2e2e",
    }))

    globe
      .arcsData(arcsData)
      .arcColor((d: any) => d.color)
      .arcStroke(1.4)
      .arcAltitude((d: any) => (d.status === "fraud" ? 0.25 : d.status === "risky" ? 0.18 : 0.12))
      .arcDashLength(0.9)
      .arcDashGap(0.01)
      .arcDashAnimateTime(1800)
  }, [txs])

  return (
    <div ref={mountRef} className="relative h-[520px] w-full rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-500/30 shadow-[0_0_40px_#ffd70033]" />
  )
}