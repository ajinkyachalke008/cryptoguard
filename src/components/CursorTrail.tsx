"use client"

import { useEffect, useRef } from "react"

export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)

    const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = []
    let mx = w / 2,
      my = h / 2

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      for (let i = 0; i < 4; i++) {
        sparks.push({
          x: mx,
          y: my,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1,
        })
      }
    }
    window.addEventListener("mousemove", onMove)

    const render = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vx *= 0.98
        s.vy *= 0.98
        s.life *= 0.96
        if (s.life < 0.05) {
          sparks.splice(i, 1)
          continue
        }
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 12)
        grd.addColorStop(0, `rgba(255,215,0,${0.6 * s.life})`)
        grd.addColorStop(1, `rgba(255,215,0,0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(s.x, s.y, 12, 0, Math.PI * 2)
        ctx.fill()
      }
      requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50" />
}