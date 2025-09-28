"use client"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTransactions } from "@/hooks/useTransactions"
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

export default function Analytics() {
  const { perMinute } = useTransactions()

  const config = {
    safe: { label: "Safe", color: "#10B981" },
    risky: { label: "Risky", color: "#F59E0B" },
    fraud: { label: "Fraud", color: "#EF4444" },
  }

  const currentTotal = perMinute[perMinute.length - 1]?.safe + perMinute[perMinute.length - 1]?.risky + perMinute[perMinute.length - 1]?.fraud || 0

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-black/40 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Transactions per minute</div>
      <div className="text-2xl font-bold text-yellow-400 mb-2">
        Live: {currentTotal} tx/min
      </div>
      <ChartContainer config={config} className="h-56 w-full">
        <LineChart data={perMinute}>
          <XAxis dataKey="name" stroke="#777" tickLine={false} axisLine={false} />
          <YAxis stroke="#777" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="safe"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
          <Line
            type="monotone"
            dataKey="risky"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
          <Line
            type="monotone"
            dataKey="fraud"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
        </LineChart>
      </ChartContainer>
      <ChartLegend content={<ChartLegendContent />} />
    </div>
  )
}