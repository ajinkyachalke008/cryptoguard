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
    tx: { label: "Transactions", color: "#FFD700" },
  }

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-black/40 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Transactions per minute</div>
      <ChartContainer config={config} className="h-56 w-full">
        <LineChart data={perMinute}>
          <XAxis dataKey="name" stroke="#777" tickLine={false} axisLine={false} />
          <YAxis stroke="#777" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#FFD700"
            strokeWidth={2}
            dot={false}
            isAnimationActive
          />
        </LineChart>
      </ChartContainer>
      <ChartLegend content={<ChartLegendContent />} />
    </div>
  )
}