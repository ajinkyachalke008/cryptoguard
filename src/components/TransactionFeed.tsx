"use client"

import { useTransactions } from "@/hooks/useTransactions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function TransactionFeed() {
  const { txs } = useTransactions()

  return (
    <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Live Transactions</div>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {txs.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
              t.status === "safe" && "border border-emerald-400/40 bg-emerald-950/40",
              t.status === "risky" && "border border-amber-400/40 bg-amber-950/40",
              t.status === "fraud" && "border border-red-500/40 bg-red-950/40"
            )}
          >
            <div className="flex-1">
              <div className="text-foreground font-medium">
                {t.from} → {t.to}
              </div>
              <div className="text-gray-400 text-xs">Tx {t.id.slice(-6)} · ${""}
                {t.amount.toLocaleString()}
              </div>
            </div>
            <Badge
              className={cn(
                "capitalize font-semibold",
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