"use client"

import { useEffect, useRef, useState } from "react"

interface Transaction {
  id: string
  hash: string
  from: string
  to: string
}

interface RelatedAddress {
  address: string
  label?: string
  riskScore: number
  relationship: string
  transactionCount: number
}

interface NetworkGraphProps {
  transaction: Transaction
  relatedAddresses: RelatedAddress[]
}

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  risk: number
  label?: string
  isMain: boolean
}

export function NetworkGraph({ transaction, relatedAddresses }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const initialNodes: Node[] = [
      {
        id: transaction.from,
        x: width * 0.3,
        y: height / 2,
        vx: 0,
        vy: 0,
        radius: 35,
        risk: 50,
        label: "From",
        isMain: true
      },
      {
        id: transaction.to,
        x: width * 0.7,
        y: height / 2,
        vx: 0,
        vy: 0,
        radius: 35,
        risk: 50,
        label: "To",
        isMain: true
      },
      ...relatedAddresses.map((addr, i) => {
        const angle = (Math.PI * 2 * i) / relatedAddresses.length
        const radius = Math.min(width, height) * 0.25
        return {
          id: addr.address,
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 20 + addr.transactionCount * 0.5,
          risk: addr.riskScore,
          label: addr.label,
          isMain: false
        }
      })
    ]

    setNodes(initialNodes)
  }, [transaction, relatedAddresses])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.scale(1, 1)

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, width, height)

      nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
          if (i >= j) return

          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > 0 && dist < 200) {
            const opacity = 1 - dist / 200
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.3})`
            ctx.lineWidth = 1
            ctx.stroke()
          }

          if (dist < node.radius + other.radius + 20) {
            const force = (node.radius + other.radius + 20 - dist) * 0.02
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force
            node.vx -= fx
            node.vy -= fy
            other.vx += fx
            other.vy += fy
          }
        })
      })

      setNodes(prevNodes =>
        prevNodes.map(node => {
          let { x, y, vx, vy } = node

          vx *= 0.95
          vy *= 0.95

          x += vx
          y += vy

          const padding = node.radius
          if (x < padding) {
            x = padding
            vx *= -0.5
          }
          if (x > width - padding) {
            x = width - padding
            vx *= -0.5
          }
          if (y < padding) {
            y = padding
            vy *= -0.5
          }
          if (y > height - padding) {
            y = height - padding
            vy *= -0.5
          }

          return { ...node, x, y, vx, vy }
        })
      )

      nodes.forEach(node => {
        const riskColor =
          node.risk < 30
            ? "rgba(34, 197, 94, 0.9)"
            : node.risk < 70
            ? "rgba(234, 179, 8, 0.9)"
            : "rgba(239, 68, 68, 0.9)"

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = riskColor
        ctx.fill()

        if (node.isMain) {
          ctx.strokeStyle = "rgba(255, 215, 0, 0.8)"
          ctx.lineWidth = 3
          ctx.stroke()
        }

        ctx.font = node.isMain ? "bold 11px sans-serif" : "9px sans-serif"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        
        if (node.label) {
          ctx.fillText(node.label, node.x, node.y - 3)
        }

        ctx.font = "8px monospace"
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillText(`${node.risk}`, node.x, node.y + (node.label ? 8 : 0))
      })

      if (hoveredNode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(hoveredNode.x + 10, hoveredNode.y - 30, 150, 50)
        
        ctx.fillStyle = "white"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(`Risk: ${hoveredNode.risk}`, hoveredNode.x + 15, hoveredNode.y - 15)
        ctx.fillText(`ID: ${hoveredNode.id.slice(0, 12)}...`, hoveredNode.x + 15, hoveredNode.y)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [nodes, hoveredNode])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = nodes.find(node => {
      const dx = x - node.x
      const dy = y - node.y
      return Math.sqrt(dx * dx + dy * dy) < node.radius
    })

    setHoveredNode(hovered || null)
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-yellow-500/20">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ background: "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      <div className="mt-2 text-xs text-gray-400 text-center">
        Interactive network graph • Hover over nodes for details
      </div>
    </div>
  )
}
