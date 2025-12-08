"use client"

import { useEffect, useState } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

export default function TransactionFeed() {
  const { txs } = useTransactions()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="rounded-lg sm:rounded-xl border border-yellow-500/40 bg-black/60 p-3 sm:p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <div className="text-yellow-400 font-semibold text-sm sm:text-base">Live Transactions</div>
          <div className="relative flex items-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500 shadow-[0_0_8px_#ffd700]"></span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-yellow-300 font-mono">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-xs sm:text-sm font-semibold tracking-wider">
              {formatTime(currentTime)}
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400 font-mono">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1 sm:pr-2 custom-scrollbar">
        {txs.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-sm transition-all active:scale-95",
              t.status === "safe" && "border border-emerald-400/40 bg-emerald-950/40",
              t.status === "risky" && "border border-amber-400/40 bg-amber-950/40",
              t.status === "fraud" && "border border-red-500/40 bg-red-950/40"
            )}
          >
            <div className="flex-1 min-w-0 mr-2">
              <div className="text-foreground font-medium truncate">
                {t.from} → {t.to}
              </div>
              <div className="text-gray-400 text-[10px] sm:text-xs truncate">
                Tx {t.id.slice(-6)} · ${t.amount.toLocaleString()}
              </div>
            </div>
            <Badge
              className={cn(
                "capitalize font-semibold text-[10px] sm:text-xs px-2 py-0.5 flex-shrink-0",
                t.status === "safe" && "bg-emerald-400/90 text-black",
                t.status === "risky" && "bg-amber-400/90 text-black",
                t.status === "fraud" && "bg-red-500/90 text-black"
              )}
            >
              {t.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}