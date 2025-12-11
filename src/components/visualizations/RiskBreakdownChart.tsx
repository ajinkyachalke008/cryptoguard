"use client"

import { useEffect, useRef } from "react"

interface RiskFactor {
  label: string
  value: number
  severity: "low" | "medium" | "high"
}

interface RiskBreakdownChartProps {
  factors: RiskFactor[]
}

export function RiskBreakdownChart({ factors }: RiskBreakdownChartProps) {
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
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    ctx.clearRect(0, 0, width, height)

    let currentAngle = -Math.PI / 2
    const total = factors.reduce((sum, f) => sum + f.value, 0)

    factors.forEach(factor => {
      const sliceAngle = (factor.value / total) * Math.PI * 2

      const color =
        factor.severity === "high"
          ? "rgba(239, 68, 68, 0.8)"
          : factor.severity === "medium"
          ? "rgba(234, 179, 8, 0.8)"
          : "rgba(34, 197, 94, 0.8)"

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"
      ctx.lineWidth = 2
      ctx.stroke()

      const labelAngle = currentAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = "white"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${Math.round(factor.value)}%`, labelX, labelY)

      currentAngle += sliceAngle
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fill()

    ctx.fillStyle = "white"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Risk", centerX, centerY - 8)
    ctx.font = "bold 18px sans-serif"
    ctx.fillStyle = "#ffd700"
    ctx.fillText(`${Math.round(total)}%`, centerX, centerY + 8)

  }, [factors])

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-[250px]"
      />
      <div className="mt-4 space-y-2">
        {factors.map((factor, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  factor.severity === "high"
                    ? "bg-red-500"
                    : factor.severity === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
              <span className="text-gray-300">{factor.label}</span>
            </div>
            <span className="text-gray-400">{Math.round(factor.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
