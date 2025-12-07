"use client"

import { useTransactions } from "@/hooks/useTransactions"

export function GlobeLegend() {
  const { txs } = useTransactions()
  
  const safeCount = txs.filter(t => t.status === "safe").length
  const riskyCount = txs.filter(t => t.status === "risky").length
  const fraudCount = txs.filter(t => t.status === "fraud").length
  const totalCount = txs.length

  return (
    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 sm:gap-4 rounded-lg border border-yellow-500/30 bg-black/90 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm z-10">
      {/* Transaction Count */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-black text-yellow-400 tabular-nums animate-pulse">
            {totalCount}
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Live Txs</div>
        </div>
        <div className="h-6 sm:h-8 w-px bg-yellow-500/30" />
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-gray-300 tabular-nums">
            {(totalCount * 847.32).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Volume</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 shadow-[0_0_10px_#00ff88]" />
            <div className="absolute inset-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 animate-ping opacity-30" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-300">Safe ({safeCount})</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-orange-500 shadow-[0_0_10px_#ffb020]" />
            <div className="absolute inset-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-orange-500 animate-ping opacity-30" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-300">Risky ({riskyCount})</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500 shadow-[0_0_10px_#ff2e2e]" />
            <div className="absolute inset-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500 animate-ping opacity-30" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-300">Fraud ({fraudCount})</span>
        </div>
      </div>
    </div>
  )
}