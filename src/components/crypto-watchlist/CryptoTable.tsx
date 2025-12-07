"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react"
import type { CryptoData } from "@/lib/types/crypto"

interface CryptoTableProps {
  data: CryptoData[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onSelectCrypto: (crypto: CryptoData) => void
}

type SortKey = "rank" | "name" | "price" | "change" | "volume" | "marketCap"

export function CryptoTable({ data, favorites, onToggleFavorite, onSelectCrypto }: CryptoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0

    switch (sortKey) {
      case "rank":
        comparison = a.market_cap_rank - b.market_cap_rank
        break
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "price":
        comparison = a.current_price - b.current_price
        break
      case "change":
        comparison = a.price_change_percentage_24h - b.price_change_percentage_24h
        break
      case "volume":
        comparison = a.total_volume - b.total_volume
        break
      case "marketCap":
        comparison = a.market_cap - b.market_cap
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const getVolatilityLevel = (change: number): "low" | "medium" | "high" => {
    const abs = Math.abs(change)
    if (abs < 2) return "low"
    if (abs < 5) return "medium"
    return "high"
  }

  const volatilityColors = {
    low: "bg-green-500/20 text-green-400 border-green-500/40",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    high: "bg-red-500/20 text-red-400 border-red-500/40"
  }

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-yellow-300 transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`size-3 ${sortKey === column ? "text-yellow-400" : "text-gray-600"}`}
      />
    </button>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-yellow-500/20 bg-black/60">
            <th className="py-3 px-2 sm:px-4 text-left">
              <span className="text-xs sm:text-sm font-semibold text-gray-400">Fav</span>
            </th>
            <th className="py-3 px-2 sm:px-4 text-left">
              <SortButton column="rank" label="Rank" />
            </th>
            <th className="py-3 px-2 sm:px-4 text-left">
              <SortButton column="name" label="Name" />
            </th>
            <th className="py-3 px-2 sm:px-4 text-right">
              <SortButton column="price" label="Price" />
            </th>
            <th className="py-3 px-2 sm:px-4 text-right">
              <SortButton column="change" label="24h %" />
            </th>
            <th className="py-3 px-2 sm:px-4 text-right hidden md:table-cell">
              <SortButton column="volume" label="Volume" />
            </th>
            <th className="py-3 px-2 sm:px-4 text-right hidden lg:table-cell">
              <SortButton column="marketCap" label="Market Cap" />
            </th>
            <th className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">
              <span className="text-xs sm:text-sm font-semibold text-gray-400">Volatility</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((crypto) => {
            const isFavorite = favorites.has(crypto.id)
            const isPositive = crypto.price_change_percentage_24h >= 0
            const volatility = getVolatilityLevel(crypto.price_change_percentage_24h)

            return (
              <tr
                key={crypto.id}
                className="border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors cursor-pointer"
                onClick={() => onSelectCrypto(crypto)}
              >
                {/* Favorite */}
                <td className="py-3 px-2 sm:px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(crypto.id)
                    }}
                    className="transition-all hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`size-4 ${
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                </td>

                {/* Rank */}
                <td className="py-3 px-2 sm:px-4">
                  <span className="text-xs sm:text-sm font-bold text-yellow-300">
                    #{crypto.market_cap_rank}
                  </span>
                </td>

                {/* Name */}
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="size-6 sm:size-8 rounded-full"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {crypto.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {crypto.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-2 sm:px-4 text-right">
                  <span className="text-xs sm:text-sm font-semibold text-yellow-300 whitespace-nowrap">
                    ${crypto.current_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: crypto.current_price < 1 ? 6 : 2
                    })}
                  </span>
                </td>

                {/* 24h Change */}
                <td className="py-3 px-2 sm:px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? (
                      <TrendingUp className="size-3 text-green-400" />
                    ) : (
                      <TrendingDown className="size-3 text-red-400" />
                    )}
                    <span
                      className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </td>

                {/* Volume */}
                <td className="py-3 px-2 sm:px-4 text-right hidden md:table-cell">
                  <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    ${(crypto.total_volume / 1e6).toFixed(0)}M
                  </span>
                </td>

                {/* Market Cap */}
                <td className="py-3 px-2 sm:px-4 text-right hidden lg:table-cell">
                  <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    ${(crypto.market_cap / 1e9).toFixed(2)}B
                  </span>
                </td>

                {/* Volatility */}
                <td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={`text-xs ${volatilityColors[volatility]}`}
                  >
                    {volatility}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
