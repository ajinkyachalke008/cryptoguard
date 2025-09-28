"use client"

import { useCallback } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { useEffect, useState } from "react"
import { loadSlim } from "@tsparticles/slim"

export default function NeonParticles() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  const options = {
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: { value: 80, density: { enable: true, area: 800 } },
      color: { value: ["#FFD700", "#E6C200", "#FFE066"] },
      shape: { type: "circle" },
      opacity: { value: 0.5, animation: { enable: true, speed: 0.5, minimumValue: 0.2 } },
      size: { value: { min: 1, max: 3 } },
      links: { enable: true, color: "#FFD700", distance: 120, opacity: 0.2, width: 1 },
      move: {
        enable: true,
        speed: 0.6,
        direction: "none",
        outModes: { default: "bounce" },
        attract: { enable: true, rotate: { x: 300, y: 1200 } },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: ["repulse", "bubble"] },
        onClick: { enable: true, mode: ["push"] },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        bubble: { distance: 120, size: 6, opacity: 0.6 },
        push: { quantity: 3 },
      },
    },
    fullScreen: { enable: false },
    detectRetina: true,
  } as const

  if (!ready) return null

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Particles id="neon-gold-particles" options={options as any} />
    </div>
  )
}