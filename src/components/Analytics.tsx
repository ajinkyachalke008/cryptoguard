"use client"

import { useState, useEffect, useMemo } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Legend, Area, AreaChart, Bar, BarChart, Tooltip } from "recharts"
import { Activity, TrendingUp, TrendingDown, Zap, Clock, Gauge, Eye, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type ChartType = "line" | "area" | "bar"
type TimeRange = "1m" | "5m" | "15m" | "30m"

export default function Analytics() {
  const { perMinute } = useTransactions()
  const [mounted, setMounted] = useState(false)
  const [chartType, setChartType] = useState<ChartType>("area")
  const [timeRange, setTimeRange] = useState<TimeRange>("5m")
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Filter data based on time range with guaranteed multi-point continuity
  const filteredData = useMemo(() => {
    if (!perMinute || perMinute.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        name: `${9 - i}m`,
        safe: 8 + (i % 3) * 2,
        risky: 2 + (i % 2),
        fraud: i === 7 ? 1 : 0
      }))
    }
    const ranges = { "1m": 6, "5m": 10, "15m": 18, "30m": 30 }
    const limit = ranges[timeRange] || 10
    return perMinute.slice(-limit)
  }, [perMinute, timeRange])

  // Calculate metrics
  const currentData = perMinute[perMinute.length - 1] || { safe: 12, risky: 3, fraud: 1 }
  const previousData = perMinute[perMinute.length - 2] || { safe: 10, risky: 2, fraud: 0 }
  
  const currentTotal = currentData.safe + currentData.risky + currentData.fraud
  const previousTotal = previousData.safe + previousData.risky + previousData.fraud
  const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
  
  const peakTotal = Math.max(...(perMinute.length ? perMinute.map(d => d.safe + d.risky + d.fraud) : [25]))
  const avgTotal = perMinute.length ? perMinute.reduce((sum, d) => sum + d.safe + d.risky + d.fraud, 0) / perMinute.length : 18
  
  const safePercentage = currentTotal > 0 ? ((currentData.safe / currentTotal) * 100).toFixed(1) : "75.0"
  const riskyPercentage = currentTotal > 0 ? ((currentData.risky / currentTotal) * 100).toFixed(1) : "18.5"
  const fraudPercentage = currentTotal > 0 ? ((currentData.fraud / currentTotal) * 100).toFixed(1) : "6.5"

  const networkHealth = currentTotal > 0 ? Math.max(0, 100 - (currentData.fraud / currentTotal * 100) - (currentData.risky / currentTotal * 50)) : 94

  const renderChart = () => {
    if (!mounted) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-32 bg-yellow-500/5 rounded-xl border border-yellow-500/15 animate-pulse" />
        </div>
      )
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const total = payload.reduce((s: number, p: any) => s + (Number(p.value) || 0), 0)
        return (
          <div className="rounded-xl border border-yellow-500/40 bg-black/95 px-3 py-2.5 backdrop-blur-xl shadow-[0_0_20px_rgba(255,215,0,0.25)] text-xs font-mono">
            <div className="text-yellow-400 font-black mb-1.5 border-b border-yellow-500/20 pb-1 flex items-center justify-between gap-4">
              <span>{label} ago</span>
              <span className="text-white font-bold">{total} tx/min</span>
            </div>
            <div className="space-y-1">
              {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 capitalize font-semibold" style={{ color: p.color }}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.dataKey}:
                  </span>
                  <span className="font-bold text-white tabular-nums">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
      return null
    }

    const commonProps = {
      data: filteredData,
    }

    switch (chartType) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%" minHeight={175}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorRisky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.85}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <YAxis stroke="#888" tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="safe" stroke="#10B981" strokeWidth={2.5} fill="url(#colorSafe)" isAnimationActive={false} />
              <Area type="monotone" dataKey="risky" stroke="#F59E0B" strokeWidth={2.5} fill="url(#colorRisky)" isAnimationActive={false} />
              <Area type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2.5} fill="url(#colorFraud)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%" minHeight={175}>
            <BarChart {...commonProps}>
              <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <YAxis stroke="#888" tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="safe" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="risky" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="fraud" fill="#EF4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return (
          <ResponsiveContainer width="100%" height="100%" minHeight={175}>
            <LineChart {...commonProps}>
              <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <YAxis stroke="#888" tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="safe" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981", r: 2 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="risky" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 2 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: "#EF4444", r: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-3 sm:p-4 backdrop-blur-sm shadow-[0_0_30px_#ffd70033] relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.05),transparent_70%)] pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <Activity className="size-3.5 sm:size-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-yellow-400 font-semibold text-xs sm:text-sm">Transactions per Minute</div>
            <div className="text-[10px] sm:text-xs text-gray-400">Real-time monitoring</div>
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
      <div className="relative mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20 backdrop-blur-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-1 tabular-nums">
              {currentTotal}
              <span className="text-sm sm:text-base text-yellow-300 font-normal ml-1">tx/min</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
              <span className={`flex items-center gap-0.5 font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-400">vs last min</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs sm:text-sm font-semibold text-yellow-300">
              {avgTotal.toFixed(0)} <span className="text-[10px] text-gray-400 font-normal">avg</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Peak: {peakTotal} tx/m
            </div>
          </div>
        </div>

        {/* Network Health Bar */}
        <div className="mt-2.5 pt-2.5 border-t border-yellow-500/10">
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
            <span className="text-gray-400 flex items-center gap-1">
              <Gauge className="size-3 text-yellow-400" />
              Network Health
            </span>
            <span className={`font-semibold ${networkHealth >= 80 ? 'text-green-400' : networkHealth >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {networkHealth.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-500 ${networkHealth >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : networkHealth >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
              style={{ width: `${networkHealth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {/* Safe transactions */}
        <div className="p-2 sm:p-3 rounded-lg bg-green-500/5 border border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition-all active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[9px] sm:text-[10px] text-green-400 font-medium mb-0.5 sm:mb-1 flex items-center justify-between">
              <span>SAFE</span>
              <span className="text-green-300">{safePercentage}%</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-green-400 tabular-nums">{currentData.safe}</div>
          </div>
        </div>

        {/* Risky transactions */}
        <div className="p-2 sm:p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 relative overflow-hidden group hover:border-orange-500/40 transition-all active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[9px] sm:text-[10px] text-orange-400 font-medium mb-0.5 sm:mb-1 flex items-center justify-between">
              <span>RISKY</span>
              <span className="text-orange-300">{riskyPercentage}%</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-orange-400 tabular-nums">{currentData.risky}</div>
          </div>
        </div>

        {/* Fraud transactions */}
        <div className="p-2 sm:p-3 rounded-lg bg-red-500/5 border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-all active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[9px] sm:text-[10px] text-red-400 font-medium mb-0.5 sm:mb-1 flex items-center justify-between">
              <span>FRAUD</span>
              <span className="text-red-300">{fraudPercentage}%</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-red-400 tabular-nums">{currentData.fraud}</div>
          </div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-[10px] sm:text-xs overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 whitespace-nowrap">
          <Zap className="size-2.5 sm:size-3 text-yellow-400" />
          <span className="text-gray-400">Peak:</span>
          <span className="font-semibold text-yellow-300 tabular-nums">{peakTotal}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 whitespace-nowrap">
          <Clock className="size-2.5 sm:size-3 text-yellow-400" />
          <span className="text-gray-400">Avg:</span>
          <span className="font-semibold text-yellow-300 tabular-nums">{avgTotal.toFixed(0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 mb-3">
        {/* Chart type selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-yellow-500/20">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChartType("line")}
            className={`h-7 px-2 text-xs active:scale-95 ${chartType === "line" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
          >
            <LineChartIcon className="size-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChartType("area")}
            className={`h-7 px-2 text-xs active:scale-95 ${chartType === "area" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
          >
            <AreaChartIcon className="size-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChartType("bar")}
            className={`h-7 px-2 text-xs active:scale-95 ${chartType === "bar" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
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
              className={`h-7 px-2.5 text-[10px] font-medium active:scale-95 ${timeRange === range ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 sm:h-48 w-full min-w-0 min-h-[175px] relative">
        {renderChart()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-yellow-500/10">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_#10B981]" />
          <span className="text-[10px] sm:text-xs text-gray-400">Safe</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_8px_#F59E0B]" />
          <span className="text-[10px] sm:text-xs text-gray-400">Risky</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
          <span className="text-[10px] sm:text-xs text-gray-400">Fraud</span>
        </div>
      </div>
    </div>
  )
}