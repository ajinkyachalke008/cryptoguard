"use client"

import { useTransactions } from "@/hooks/useTransactions"

export default function Leaderboard() {
  const { leaderboard } = useTransactions()

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-black/40 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Top Fraudulent Countries</div>
      <div className="space-y-2">
        {leaderboard.length === 0 && (
          <div className="text-sm text-muted-foreground">Collecting data…</div>
        )}
        {leaderboard.map((row, i) => (
          <div key={row.country} className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-black/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300/80">#{i + 1}</span>
              <span className="text-foreground">{row.country}</span>
            </div>
            <span className="text-red-400 font-mono">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}