"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, ArrowRight, Network, Search, Filter, ShieldCheck, ShieldAlert, AlertTriangle, Radio, Play, Pause } from "lucide-react"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"
import { useRouter } from "next/navigation"

export default function TransactionFeed() {
  const { txs } = useTransactions()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [filter, setFilter] = useState<"all" | "safe" | "risky" | "fraud">("all")
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-scroll effect: smoothly scrolls down and loops back up
  useEffect(() => {
    if (!isAutoScrolling || !scrollRef.current) return

    const el = scrollRef.current
    const interval = setInterval(() => {
      if (el) {
        if (el.scrollTop >= el.scrollHeight - el.clientHeight - 5) {
          el.scrollTo({ top: 0, behavior: "smooth" })
        } else {
          el.scrollBy({ top: 36, behavior: "smooth" })
        }
      }
    }, 2800)

    return () => clearInterval(interval)
  }, [isAutoScrolling])

  const formatTime = (date?: Date | number) => {
    try {
      const d = typeof date === "number" ? new Date(date) : (date instanceof Date ? date : new Date())
      if (!d || isNaN(d.getTime())) return "12:00:00"
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      })
    } catch {
      return "12:00:00"
    }
  }

  const getTransactionTime = (timestamp: number, index: number) => {
    try {
      const timeToUse = typeof timestamp === "number" && !isNaN(timestamp) ? timestamp : (Date.now() - index * 2000)
      const d = new Date(timeToUse)
      if (isNaN(d.getTime())) return "12:00:00"
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      })
    } catch {
      return "12:00:00"
    }
  }

  const filteredTxs = useMemo(() => {
    if (filter === "all") return txs
    return txs.filter(t => t.status === filter)
  }, [txs, filter])

  return (
    <div 
      className="rounded-xl border border-yellow-500/40 bg-black/60 p-3 sm:p-4 backdrop-blur-sm shadow-[0_0_30px_#ffd70033] relative overflow-hidden"
      onMouseEnter={() => setIsAutoScrolling(false)}
      onMouseLeave={() => setIsAutoScrolling(true)}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-yellow-500/30 mb-3">
        <div className="flex items-center gap-2">
          <div className="text-yellow-400 font-black text-base sm:text-lg flex items-center gap-2 drop-shadow-[0_0_10px_#ffd70044]">
            Live Transactions
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-300">
              <Radio className="size-2.5 animate-pulse" /> LIVE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="text-xs font-bold text-gray-300 hover:text-yellow-300 flex items-center gap-1.5 bg-yellow-500/15 px-2.5 py-1 rounded-lg border border-yellow-500/30 transition-all"
            title={isAutoScrolling ? "Pause Auto-scroll" : "Enable Auto-scroll"}
          >
            {isAutoScrolling ? <Pause className="size-3 text-yellow-400" /> : <Play className="size-3 text-yellow-400" />}
            {isAutoScrolling ? "Auto" : "Paused"}
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 border border-yellow-500/30 text-yellow-300 font-mono shadow-[0_0_12px_rgba(255,215,0,0.15)]">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs sm:text-sm font-black tracking-wider text-yellow-300 drop-shadow-[0_0_8px_#ffd70066]">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Feed List - Original compact scrollable size with auto-scroll */}
      <div 
        ref={scrollRef}
        className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar scroll-smooth"
      >
        {filteredTxs.map((t, index) => (
          <div
            key={t.id}
            className={cn(
              "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl p-3 text-xs transition-all border",
              t.status === "safe" && "border-emerald-500/40 bg-emerald-950/30 hover:border-emerald-500/70 hover:bg-emerald-950/50",
              t.status === "risky" && "border-amber-500/40 bg-amber-950/30 hover:border-amber-500/70 hover:bg-amber-950/50",
              t.status === "fraud" && "border-red-500/50 bg-red-950/40 hover:border-red-500/80 hover:bg-red-950/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
            )}
          >
            <div className="flex-1 min-w-0">
              {/* Route & Chain Badge */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-yellow-500/25 border border-yellow-500/50 text-yellow-300 font-mono text-[11px] font-black shadow-[0_0_8px_#ffd70033]">
                  {t.chain === "SOL" ? "ETH" : (t.chain || "ETH")}
                </span>
                <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                  <span className="text-gray-200 font-bold">{t.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span className="text-yellow-300 font-black">{t.to}</span>
                </div>
              </div>

              {/* Hash, Value and Bold Timestamp */}
              <div className="flex items-center gap-2 text-gray-300 text-xs font-mono flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-bold">Tx:</span>
                  <BlockchainIdentifier type="tx" value={t.id} className="font-bold text-gray-200" />
                </div>
                <span className="text-yellow-500/60">•</span>
                <span className="text-yellow-300 font-black text-xs sm:text-sm drop-shadow-[0_0_6px_#ffd70044]">${t.amount.toLocaleString()}</span>
                <span className="text-yellow-500/60">•</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-yellow-500/20 text-yellow-300 font-black text-[11px] tracking-tight">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  {getTransactionTime(t.timestamp, index)}
                </span>
              </div>
            </div>

            {/* Badges & 1-Click Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <div className="hidden group-hover:flex items-center gap-1.5 animate-in fade-in duration-200">
                <button
                  onClick={() => router.push(`/graph?address=${t.id}`)}
                  className="px-2.5 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black shadow-[0_0_10px_#ffd70044] flex items-center gap-1"
                >
                  <Network className="size-3" />
                  Graph
                </button>
                <button
                  onClick={() => router.push(`/scanner?address=${t.id}`)}
                  className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-black text-xs font-black shadow-[0_0_10px_#38bdf844] flex items-center gap-1"
                >
                  <Search className="size-3" />
                  Scan
                </button>
              </div>

              <Badge
                className={cn(
                  "capitalize font-black text-xs px-2.5 py-1 border shadow-sm whitespace-nowrap",
                  t.status === "safe" && "bg-emerald-500/25 text-emerald-300 border-emerald-500/60",
                  t.status === "risky" && "bg-amber-500/25 text-amber-300 border-amber-500/60",
                  t.status === "fraud" && "bg-red-600/35 text-red-300 border-red-500/70"
                )}
              >
                {t.status === "fraud" ? `🚨 Threat (${Math.round(t.riskScore)})` : t.status === "risky" ? `⚠️ Flagged (${Math.round(t.riskScore)})` : `✓ Verified`}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
