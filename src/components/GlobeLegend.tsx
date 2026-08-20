"use client"

import { useTransactions } from "@/hooks/useTransactions"

export function GlobeLegend() {
  const { txs } = useTransactions()
  
  const safeCount = txs.filter(t => t.status === "safe").length
  const riskyCount = txs.filter(t => t.status === "risky").length
  const fraudCount = txs.filter(t => t.status === "fraud").length
  const totalCount = txs.length

  return (
    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 sm:gap-4 rounded-xl border-2 border-yellow-500/40 bg-black/95 px-4 sm:px-5 py-2.5 sm:py-3.5 backdrop-blur-md z-10 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
      {/* Transaction Count */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-black text-yellow-400 tabular-nums animate-pulse drop-shadow-[0_0_8px_#ffd70066]">
            {totalCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-300 font-bold uppercase tracking-wider">Live Telemetry Txs</div>
        </div>
        <div className="h-7 sm:h-9 w-px bg-yellow-500/40" />
        <div className="text-center">
          <div className="text-base sm:text-lg font-black text-white tabular-nums">
            {(totalCount * 847.32).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-300 font-bold uppercase tracking-wider">Global Volume</div>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/40">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_10px_#00ff88]" />
            <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-400 animate-ping opacity-40" />
          </div>
          <span className="text-xs font-bold text-green-300">Safe ({safeCount})</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_10px_#ffb020]" />
            <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-orange-400 animate-ping opacity-40" />
          </div>
          <span className="text-xs font-bold text-orange-300">Risky ({riskyCount})</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ff2e2e]" />
            <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping opacity-40" />
          </div>
          <span className="text-xs font-black text-red-300">Fraud ({fraudCount})</span>
        </div>
      </div>
    </div>
  )
}