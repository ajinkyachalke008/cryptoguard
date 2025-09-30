"use client"

import { useTransactions } from "@/hooks/useTransactions"

export default function Leaderboard() {
  const { leaderboard } = useTransactions()

  return (
    <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Top Fraudulent Countries</div>
      <div className="space-y-2">
        {leaderboard.length === 0 && (
          <div className="text-sm text-gray-400">Collecting data…</div>
        )}
        {leaderboard.map((row, i) => (
          <div key={row.country} className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-black/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 font-semibold">#{i + 1}</span>
              <span className="text-foreground font-medium">{row.country}</span>
            </div>
            <span className="text-red-400 font-mono font-semibold">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}