"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { MiniSparkline } from "./MiniSparkline"
import type { CryptoData } from "@/lib/types/crypto"

interface CryptoGridProps {
  data: CryptoData[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onSelectCrypto: (crypto: CryptoData) => void
}

export function CryptoGrid({ data, favorites, onToggleFavorite, onSelectCrypto }: CryptoGridProps) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((crypto) => {
        const isFavorite = favorites.has(crypto.id)
        const isPositive = crypto.price_change_percentage_24h >= 0
        const volatility = getVolatilityLevel(crypto.price_change_percentage_24h)

        return (
          <Card
            key={crypto.id}
            className={`group relative border-yellow-500/40 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all hover:shadow-[0_0_40px_#ffd70022] cursor-pointer active:scale-95 ${
              isPositive ? "hover:from-green-500/5" : "hover:from-red-500/5"
            }`}
            onClick={() => onSelectCrypto(crypto)}
          >
            <CardContent className="pt-6 relative">
              {/* Favorite Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(crypto.id)
                }}
                className="absolute top-3 right-3 z-10 transition-all hover:scale-110 active:scale-95"
              >
                <Star
                  className={`size-5 ${
                    isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-600 hover:text-yellow-400"
                  }`}
                />
              </button>

              {/* Logo & Info */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="size-10 sm:size-12 rounded-full ring-2 ring-yellow-500/20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {crypto.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {crypto.symbol.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className="text-xl sm:text-2xl font-bold text-yellow-300">
                  ${crypto.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: crypto.current_price < 1 ? 6 : 2
                  })}
                </p>
              </div>

              {/* 24h Change */}
              <div className="flex items-center gap-2 mb-4">
                {isPositive ? (
                  <TrendingUp className="size-4 text-green-400" />
                ) : (
                  <TrendingDown className="size-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${volatilityColors[volatility]}`}
                >
                  {volatility}
                </Badge>
              </div>

              {/* Sparkline - shown on hover */}
              {crypto.sparkline_in_7d && (
                <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MiniSparkline
                    data={crypto.sparkline_in_7d.price}
                    color={isPositive ? "#10b981" : "#ef4444"}
                    height={60}
                  />
                </div>
              )}

              {/* Stats */}
              <div className="space-y-2 text-xs border-t border-yellow-500/20 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Market Cap</span>
                  <span className="text-gray-300 font-medium">
                    ${(crypto.market_cap / 1e9).toFixed(2)}B
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rank</span>
                  <span className="text-yellow-300 font-bold">
                    #{crypto.market_cap_rank}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Volume (24h)</span>
                  <span className="text-gray-300 font-medium">
                    ${(crypto.total_volume / 1e6).toFixed(0)}M
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
