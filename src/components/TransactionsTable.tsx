"use client"

import { useTransactions } from "@/hooks/useTransactions"

export default function TransactionsTable() {
  const { txs } = useTransactions()

  return (
    <div className="rounded-lg sm:rounded-xl border border-yellow-500/40 bg-black/60 p-3 sm:p-4 backdrop-blur shadow-[0_0_30px_#ffd70033]">
      <div className="text-yellow-400 font-semibold text-sm sm:text-base mb-2 sm:mb-3">Transactions</div>
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">Tx ID</th>
              <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">Amount</th>
              <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">From</th>
              <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">To</th>
              <th className="py-2 pr-3 sm:pr-4 font-semibold whitespace-nowrap">Risk</th>
            </tr>
          </thead>
          <tbody>
            {txs.slice(0, 10).map((t) => (
              <tr key={t.id} className="border-t border-yellow-500/20">
                <td className="py-2 pr-3 sm:pr-4 font-mono text-gray-300 whitespace-nowrap">…{t.id.slice(-8)}</td>
                <td className="py-2 pr-3 sm:pr-4 text-foreground whitespace-nowrap">${t.amount.toLocaleString()}</td>
                <td className="py-2 pr-3 sm:pr-4 text-foreground whitespace-nowrap">{t.from}</td>
                <td className="py-2 pr-3 sm:pr-4 text-foreground whitespace-nowrap">{t.to}</td>
                <td className="py-2 pr-3 sm:pr-4 whitespace-nowrap">
                  <span
                    className={
                      t.status === "safe"
                        ? "text-emerald-400 font-semibold"
                        : t.status === "risky"
                        ? "text-amber-400 font-semibold"
                        : "text-red-500 font-semibold"
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