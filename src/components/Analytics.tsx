"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTransactions } from "@/hooks/useTransactions"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Legend, Area, AreaChart, Bar, BarChart } from "recharts"
import { Activity, TrendingUp, TrendingDown, Zap, Clock, Gauge, Eye, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type ChartType = "line" | "area" | "bar"
type TimeRange = "1m" | "5m" | "15m" | "30m"

export default function Analytics() {
  const { perMinute } = useTransactions()
  const [chartType, setChartType] = useState<ChartType>("area")
  const [timeRange, setTimeRange] = useState<TimeRange>("5m")
  const [pulse, setPulse] = useState(false)

  // Trigger pulse animation when data updates
  useEffect(() => {
    setPulse(true)
    const timer = setTimeout(() => setPulse(false), 1000)
    return () => clearTimeout(timer)
  }, [perMinute])

  const config = {
    safe: { label: "Safe", color: "#10B981" },
    risky: { label: "Risky", color: "#F59E0B" },
    fraud: { label: "Fraud", color: "#EF4444" },
  }

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const ranges = { "1m": 1, "5m": 5, "15m": 15, "30m": 30 }
    const limit = ranges[timeRange]
    return perMinute.slice(-limit)
  }, [perMinute, timeRange])

  // Calculate metrics
  const currentData = perMinute[perMinute.length - 1] || { safe: 0, risky: 0, fraud: 0 }
  const previousData = perMinute[perMinute.length - 2] || { safe: 0, risky: 0, fraud: 0 }
  
  const currentTotal = currentData.safe + currentData.risky + currentData.fraud
  const previousTotal = previousData.safe + previousData.risky + previousData.fraud
  const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
  
  const peakTotal = Math.max(...perMinute.map(d => d.safe + d.risky + d.fraud))
  const avgTotal = perMinute.reduce((sum, d) => sum + d.safe + d.risky + d.fraud, 0) / perMinute.length
  
  const safePercentage = currentTotal > 0 ? ((currentData.safe / currentTotal) * 100).toFixed(1) : 0
  const riskyPercentage = currentTotal > 0 ? ((currentData.risky / currentTotal) * 100).toFixed(1) : 0
  const fraudPercentage = currentTotal > 0 ? ((currentData.fraud / currentTotal) * 100).toFixed(1) : 0

  const networkHealth = currentTotal > 0 ? Math.max(0, 100 - (currentData.fraud / currentTotal * 100) - (currentData.risky / currentTotal * 50)) : 100

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRisky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
            <YAxis stroke="#666" tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '11px' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="safe" stroke="#10B981" strokeWidth={2} fill="url(#colorSafe)" isAnimationActive={true} />
            <Area type="monotone" dataKey="risky" stroke="#F59E0B" strokeWidth={2} fill="url(#colorRisky)" isAnimationActive={true} />
            <Area type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2} fill="url(#colorFraud)" isAnimationActive={true} />
          </AreaChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
            <YAxis stroke="#666" tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '11px' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="safe" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            <Bar dataKey="risky" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            <Bar dataKey="fraud" fill="#EF4444" radius={[4, 4, 0, 0]} isAnimationActive={true} />
          </BarChart>
        )
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
            <YAxis stroke="#666" tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '11px' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="safe" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 3 }} isAnimationActive={true} />
            <Line type="monotone" dataKey="risky" stroke="#F59E0B" strokeWidth={3} dot={{ fill: "#F59E0B", r: 3 }} isAnimationActive={true} />
            <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={3} dot={{ fill: "#EF4444", r: 3 }} isAnimationActive={true} />
          </LineChart>
        )
    }
  }

  return (
    <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-5 backdrop-blur shadow-[0_0_40px_#ffd70033] relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.05),transparent_70%)] pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <Activity className="size-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-yellow-400 font-semibold text-sm">Transactions per Minute</div>
            <div className="text-xs text-gray-400">Real-time monitoring</div>
          </div>
        </div>
        
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 ${pulse ? 'animate-pulse' : ''}`}>
            <div className="size-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#ffd700]" />
            <span className="text-[10px] font-medium text-yellow-300 uppercase tracking-wide">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main metric card */}
      <div className="relative mb-4 p-4 rounded-lg bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20 backdrop-blur-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-yellow-400 mb-1 tabular-nums">
              {currentTotal}
              <span className="text-base text-yellow-300 font-normal ml-1">tx/min</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {change > 0 ? (
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="size-3" />
                  <span>+{change.toFixed(1)}%</span>
                </div>
              ) : change < 0 ? (
                <div className="flex items-center gap-1 text-red-400">
                  <TrendingDown className="size-3" />
                  <span>{change.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <span>No change</span>
                </div>
              )}
              <span className="text-gray-500">vs previous min</span>
            </div>
          </div>
          
          {/* Network health gauge */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <Gauge className="size-3.5 text-yellow-400" />
              <span className="text-xs text-gray-400">Network Health</span>
            </div>
            <div className="text-2xl font-bold" style={{
              color: networkHealth > 80 ? '#10B981' : networkHealth > 60 ? '#F59E0B' : '#EF4444'
            }}>
              {networkHealth.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Safe transactions */}
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[10px] text-green-400 font-medium mb-1 flex items-center justify-between">
              <span>SAFE</span>
              <span className="text-green-300">{safePercentage}%</span>
            </div>
            <div className="text-lg font-bold text-green-400 tabular-nums">{currentData.safe}</div>
          </div>
        </div>

        {/* Risky transactions */}
        <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 relative overflow-hidden group hover:border-orange-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[10px] text-orange-400 font-medium mb-1 flex items-center justify-between">
              <span>RISKY</span>
              <span className="text-orange-300">{riskyPercentage}%</span>
            </div>
            <div className="text-lg font-bold text-orange-400 tabular-nums">{currentData.risky}</div>
          </div>
        </div>

        {/* Fraud transactions */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[10px] text-red-400 font-medium mb-1 flex items-center justify-between">
              <span>FRAUD</span>
              <span className="text-red-300">{fraudPercentage}%</span>
            </div>
            <div className="text-lg font-bold text-red-400 tabular-nums">{currentData.fraud}</div>
          </div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <Zap className="size-3 text-yellow-400" />
          <span className="text-gray-400">Peak:</span>
          <span className="font-semibold text-yellow-300 tabular-nums">{peakTotal}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <Clock className="size-3 text-yellow-400" />
          <span className="text-gray-400">Avg:</span>
          <span className="font-semibold text-yellow-300 tabular-nums">{avgTotal.toFixed(0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        {/* Chart type selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-yellow-500/20">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChartType("line")}
            className={`h-7 px-2 text-xs ${chartType === "line" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
          >
            <LineChartIcon className="size-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChartType("area")}
            className={`h-7 px-2 text-xs ${chartType === "area" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
          >
            <AreaChartIcon className="size-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChartType("bar")}
            className={`h-7 px-2 text-xs ${chartType === "bar" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
          >
            <BarChart3 className="size-3" />
          </Button>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-yellow-500/20">
          {(["1m", "5m", "15m", "30m"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              size="sm"
              variant="ghost"
              onClick={() => setTimeRange(range)}
              className={`h-7 px-2.5 text-[10px] font-medium ${timeRange === range ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={config} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </ChartContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-yellow-500/10">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_#10B981]" />
          <span className="text-xs text-gray-400">Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_8px_#F59E0B]" />
          <span className="text-xs text-gray-400">Risky</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
          <span className="text-xs text-gray-400">Fraud</span>
        </div>
      </div>
    </div>
  )
}