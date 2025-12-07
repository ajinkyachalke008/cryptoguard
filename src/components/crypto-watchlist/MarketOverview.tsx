"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import type { CryptoData } from "@/lib/types/crypto"

interface MarketOverviewProps {
  data: CryptoData[]
  loading: boolean
}

export function MarketOverview({ data, loading }: MarketOverviewProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null

    const totalMarketCap = data.reduce((sum, coin) => sum + coin.market_cap, 0)
    const total24hVolume = data.reduce((sum, coin) => sum + coin.total_volume, 0)
    
    const btc = data.find((coin) => coin.symbol.toLowerCase() === "btc")
    const btcDominance = btc ? (btc.market_cap / totalMarketCap) * 100 : 0

    const sorted = [...data].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    )
    const topGainers = sorted.slice(0, 5)
    const topLosers = sorted.slice(-5).reverse()

    return {
      totalMarketCap,
      total24hVolume,
      btcDominance,
      topGainers,
      topLosers,
    }
  }, [data])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-yellow-500/20 bg-black/60 animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-yellow-500/20 rounded w-24 mb-2" />
              <div className="h-8 bg-yellow-500/20 rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-yellow-500/40 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Total Market Cap</span>
              <Activity className="size-4 text-yellow-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-300">
              ${(stats.totalMarketCap / 1e12).toFixed(2)}T
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/40 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">24h Volume</span>
              <Activity className="size-4 text-yellow-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-300">
              ${(stats.total24hVolume / 1e9).toFixed(2)}B
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/40 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">BTC Dominance</span>
              <Activity className="size-4 text-yellow-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-300">
              {stats.btcDominance.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/40 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Tracked Coins</span>
              <Activity className="size-4 text-yellow-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-300">{data.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <Card className="border-green-500/40 bg-black/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Top 5 Gainers (24h)</h3>
            </div>
            <div className="space-y-3">
              {stats.topGainers.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.name} className="size-6 rounded-full" />
                    <span className="text-sm text-white font-medium">{coin.symbol.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-bold text-green-400">
                    +{coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="size-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Top 5 Losers (24h)</h3>
            </div>
            <div className="space-y-3">
              {stats.topLosers.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.name} className="size-6 rounded-full" />
                    <span className="text-sm text-white font-medium">{coin.symbol.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-bold text-red-400">
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
