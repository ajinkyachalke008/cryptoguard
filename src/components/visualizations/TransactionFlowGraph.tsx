"use client"

import { useEffect, useRef } from "react"

interface FlowData {
  nodes: { id: string; label: string; amount?: number; risk: number }[]
  edges: { from: string; to: string; amount: number; timestamp: string }[]
}

interface TransactionFlowGraphProps {
  data: FlowData
}

export function TransactionFlowGraph({ data }: TransactionFlowGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.fillRect(0, 0, width, height)

    const nodeRadius = 40
    const positions = new Map<string, { x: number; y: number }>()
    
    data.nodes.forEach((node, i) => {
      const angle = (Math.PI * 2 * i) / data.nodes.length - Math.PI / 2
      const radius = Math.min(width, height) * 0.35
      const x = width / 2 + Math.cos(angle) * radius
      const y = height / 2 + Math.sin(angle) * radius
      positions.set(node.id, { x, y })
    })

    data.edges.forEach(edge => {
      const from = positions.get(edge.from)
      const to = positions.get(edge.to)
      if (!from || !to) return

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = "rgba(255, 215, 0, 0.4)"
      ctx.lineWidth = 2
      ctx.stroke()

      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      
      ctx.beginPath()
      ctx.arc(midX, midY, 5, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 215, 0, 0.8)"
      ctx.fill()

      ctx.font = "10px monospace"
      ctx.fillStyle = "#ffd700"
      ctx.textAlign = "center"
      ctx.fillText(`${edge.amount.toFixed(2)}`, midX, midY - 10)
    })

    data.nodes.forEach(node => {
      const pos = positions.get(node.id)
      if (!pos) return

      const riskColor =
        node.risk < 30
          ? "rgba(34, 197, 94, 0.8)"
          : node.risk < 70
          ? "rgba(234, 179, 8, 0.8)"
          : "rgba(239, 68, 68, 0.8)"

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)
      ctx.fillStyle = riskColor
      ctx.fill()
      ctx.strokeStyle = "rgba(255, 215, 0, 0.6)"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, pos.x, pos.y - 5)
      
      if (node.amount) {
        ctx.font = "10px monospace"
        ctx.fillText(node.amount.toFixed(2), pos.x, pos.y + 10)
      }

      ctx.font = "9px sans-serif"
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.fillText(`Risk: ${node.risk}`, pos.x, pos.y + 22)
    })

  }, [data])

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-yellow-500/20">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)" }}
      />
    </div>
  )
}
