"use client"

import { useTransactions } from "@/hooks/useTransactions"

export default function Leaderboard() {
  const { leaderboard } = useTransactions()

  return (
    <div className="rounded-lg sm:rounded-xl border border-yellow-500/40 bg-black/60 p-3 sm:p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold text-sm sm:text-base mb-2 sm:mb-3">Top Fraudulent Countries</div>
      <div className="space-y-2">
        {leaderboard.length === 0 && (
          <div className="text-xs sm:text-sm text-gray-400">Collecting data…</div>
        )}
        {leaderboard.map((row, i) => (
          <div key={row.country} className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-black/50 px-2.5 sm:px-3 py-2 transition-all active:scale-95 hover:border-yellow-500/50">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-yellow-300 font-semibold text-xs sm:text-sm flex-shrink-0">#{i + 1}</span>
              <span className="text-foreground font-medium text-xs sm:text-sm truncate">{row.country}</span>
            </div>
            <span className="text-red-400 font-mono font-semibold text-xs sm:text-sm flex-shrink-0">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}