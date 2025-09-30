"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTransactions } from "@/hooks/useTransactions"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

export default function Analytics() {
  const { perMinute } = useTransactions()

  const config = {
    safe: { label: "Safe", color: "#10B981" },
    risky: { label: "Risky", color: "#F59E0B" },
    fraud: { label: "Fraud", color: "#EF4444" },
  }

  const currentTotal = perMinute[perMinute.length - 1]?.safe + perMinute[perMinute.length - 1]?.risky + perMinute[perMinute.length - 1]?.fraud || 0

  return (
    <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Transactions per minute</div>
      <div className="text-2xl font-bold text-yellow-400 mb-2">
        Live: {currentTotal} tx/min
      </div>
      <ChartContainer config={config} className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={perMinute}>
            <XAxis dataKey="name" stroke="#999" tickLine={false} axisLine={false} />
            <YAxis stroke="#999" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="safe"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="risky"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="fraud"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#EF4444", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}