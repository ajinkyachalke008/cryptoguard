"use client"

import { useTransactions } from "@/hooks/useTransactions"

export function GlobeLegend() {
  const { txs } = useTransactions()
  
  const safeCount = txs.filter(t => t.status === "safe").length
  const riskyCount = txs.filter(t => t.status === "risky").length
  const fraudCount = txs.filter(t => t.status === "fraud").length
  const totalCount = txs.length

  return (
    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-yellow-500/30 bg-black/80 px-4 py-3 backdrop-blur-sm z-10">
      {/* Transaction Count */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400 tabular-nums animate-pulse">
            {totalCount}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Live Transactions</div>
        </div>
        <div className="h-8 w-px bg-yellow-500/30" />
        <div className="text-center">
          <div className="text-lg font-bold text-gray-300 tabular-nums">
            {(totalCount * 847.32).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Volume</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_#00ff88]" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-30" />
          </div>
          <span className="text-xs text-gray-300">Safe ({safeCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_10px_#ffb020]" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-orange-500 animate-ping opacity-30" />
          </div>
          <span className="text-xs text-gray-300">Risky ({riskyCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_#ff2e2e]" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-red-500 animate-ping opacity-30" />
          </div>
          <span className="text-xs text-gray-300">Fraud ({fraudCount})</span>
        </div>
      </div>
    </div>
  )
}
