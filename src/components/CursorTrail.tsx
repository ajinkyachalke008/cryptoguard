"use client"

import { useEffect, useRef } from "react"

export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let animId: number | null = null

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)

    const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = []

    const render = () => {
      ctx.clearRect(0, 0, w, h)
      if (sparks.length === 0) {
        animId = null
        return
      }

      ctx.globalCompositeOperation = "lighter"
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vx *= 0.98
        s.vy *= 0.98
        s.life *= 0.94
        if (s.life < 0.05) {
          sparks.splice(i, 1)
          continue
        }
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10)
        grd.addColorStop(0, `rgba(255,215,0,${0.5 * s.life})`)
        grd.addColorStop(1, `rgba(255,215,0,0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(s.x, s.y, 10, 0, Math.PI * 2)
        ctx.fill()
      }
      animId = requestAnimationFrame(render)
    }

    const onMove = (e: MouseEvent) => {
      const mx = e.clientX
      const my = e.clientY
      for (let i = 0; i < 3; i++) {
        sparks.push({
          x: mx,
          y: my,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1,
        })
      }
      if (!animId) {
        animId = requestAnimationFrame(render)
      }
    }
    window.addEventListener("mousemove", onMove, { passive: true })

    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50" />
}