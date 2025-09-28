"use client"

import { useTransactions } from "@/hooks/useTransactions"

export default function TransactionsTable() {
  const { txs } = useTransactions()

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-black/40 p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold mb-3">Transactions</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-4">Tx ID</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">From</th>
              <th className="py-2 pr-4">To</th>
              <th className="py-2 pr-4">Risk</th>
            </tr>
          </thead>
          <tbody>
            {txs.slice(0, 10).map((t) => (
              <tr key={t.id} className="border-t border-yellow-500/10">
                <td className="py-2 pr-4 font-mono">…{t.id.slice(-8)}</td>
                <td className="py-2 pr-4">${t.amount.toLocaleString()}</td>
                <td className="py-2 pr-4">{t.from}</td>
                <td className="py-2 pr-4">{t.to}</td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      t.status === "safe"
                        ? "text-emerald-400"
                        : t.status === "risky"
                        ? "text-amber-400"
                        : "text-red-500"
                    }
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}