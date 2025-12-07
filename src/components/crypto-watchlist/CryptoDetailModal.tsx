"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Globe,
  Activity,
  BarChart3,
  X
} from "lucide-react"
import { MiniSparkline } from "./MiniSparkline"
import type { CryptoData } from "@/lib/types/crypto"

interface CryptoDetailModalProps {
  crypto: CryptoData | null
  open: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function CryptoDetailModal({
  crypto,
  open,
  onClose,
  isFavorite,
  onToggleFavorite
}: CryptoDetailModalProps) {
  const [detailData, setDetailData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && crypto) {
      fetchDetailData()
    }
  }, [open, crypto])

  const fetchDetailData = async () => {
    if (!crypto) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${crypto.id}`
      )
      const data = await response.json()
      setDetailData(data)
    } catch (error) {
      console.error("Failed to fetch detail data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!crypto) return null

  const isPositive = crypto.price_change_percentage_24h >= 0
  const volatility = (() => {
    const abs = Math.abs(crypto.price_change_percentage_24h)
    if (abs < 2) return { level: "Low", color: "text-green-400", bg: "bg-green-500/20" }
    if (abs < 5) return { level: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" }
    return { level: "High", color: "text-red-400", bg: "bg-red-500/20" }
  })()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-yellow-500/40 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="size-10 rounded-full ring-2 ring-yellow-500/40"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-300">
                  {crypto.name}
                </h2>
                <p className="text-sm text-gray-400">{crypto.symbol.toUpperCase()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="hover:bg-yellow-500/20"
            >
              <Star
                className={`size-5 ${
                  isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600 hover:text-yellow-400"
                }`}
              />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Price Section */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-4 flex-wrap">
            <span className="text-3xl sm:text-4xl font-bold text-yellow-300">
              ${crypto.current_price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: crypto.current_price < 1 ? 6 : 2
              })}
            </span>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="size-5 text-green-400" />
              ) : (
                <TrendingDown className="size-5 text-red-400" />
              )}
              <span
                className={`text-xl font-bold ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Sparkline */}
          {crypto.sparkline_in_7d && (
            <div className="bg-black/60 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                7-Day Price Trend
              </h3>
              <MiniSparkline
                data={crypto.sparkline_in_7d.price}
                color={isPositive ? "#10b981" : "#ef4444"}
                height={80}
              />
            </div>
          )}
        </div>

        <Separator className="bg-yellow-500/20" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/60 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="size-4 text-gray-500" />
              <span className="text-xs text-gray-500">Market Cap Rank</span>
            </div>
            <p className="text-xl font-bold text-yellow-300">
              #{crypto.market_cap_rank}
            </p>
          </div>

          <div className="bg-black/60 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4 text-gray-500" />
              <span className="text-xs text-gray-500">Market Cap</span>
            </div>
            <p className="text-xl font-bold text-white">
              ${(crypto.market_cap / 1e9).toFixed(2)}B
            </p>
          </div>

          <div className="bg-black/60 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4 text-gray-500" />
              <span className="text-xs text-gray-500">24h Volume</span>
            </div>
            <p className="text-xl font-bold text-white">
              ${(crypto.total_volume / 1e9).toFixed(2)}B
            </p>
          </div>

          <div className="bg-black/60 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4 text-gray-500" />
              <span className="text-xs text-gray-500">Volatility</span>
            </div>
            <Badge className={`${volatility.bg} ${volatility.color} border-0`}>
              {volatility.level}
            </Badge>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-400">24h High</span>
            <span className="text-sm font-semibold text-white">
              ${crypto.high_24h.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-400">24h Low</span>
            <span className="text-sm font-semibold text-white">
              ${crypto.low_24h.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-400">All-Time High</span>
            <span className="text-sm font-semibold text-green-400">
              ${crypto.ath.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-400">All-Time Low</span>
            <span className="text-sm font-semibold text-red-400">
              ${crypto.atl.toLocaleString()}
            </span>
          </div>
          {crypto.circulating_supply && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-400">Circulating Supply</span>
              <span className="text-sm font-semibold text-white">
                {crypto.circulating_supply.toLocaleString()} {crypto.symbol.toUpperCase()}
              </span>
            </div>
          )}
          {crypto.max_supply && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-400">Max Supply</span>
              <span className="text-sm font-semibold text-white">
                {crypto.max_supply.toLocaleString()} {crypto.symbol.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {detailData?.description?.en && (
          <>
            <Separator className="bg-yellow-500/20" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">About</h3>
              <p
                className="text-sm text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: detailData.description.en.split(". ")[0] + "."
                }}
              />
            </div>
          </>
        )}

        {/* Links */}
        {detailData?.links && (
          <>
            <Separator className="bg-yellow-500/20" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-3">Links</h3>
              <div className="flex flex-wrap gap-2">
                {detailData.links.homepage?.[0] && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                  >
                    <a
                      href={detailData.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="size-4 mr-2" />
                      Website
                      <ExternalLink className="size-3 ml-2" />
                    </a>
                  </Button>
                )}
                {detailData.links.blockchain_site?.[0] && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                  >
                    <a
                      href={detailData.links.blockchain_site[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BarChart3 className="size-4 mr-2" />
                      Explorer
                      <ExternalLink className="size-3 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Risk Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-300">
            ⚠️ <strong>Risk Disclaimer:</strong> Cryptocurrency prices are highly volatile.
            This data is for informational purposes only and should not be considered
            financial advice. Always do your own research before investing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
