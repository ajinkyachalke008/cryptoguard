"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Grid3x3, 
  Table as TableIcon, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Sparkles,
  RefreshCw,
  Filter,
  X
} from "lucide-react"
import { CryptoGrid } from "@/components/crypto-watchlist/CryptoGrid"
import { CryptoTable } from "@/components/crypto-watchlist/CryptoTable"
import { CryptoDetailModal } from "@/components/crypto-watchlist/CryptoDetailModal"
import { MarketOverview } from "@/components/crypto-watchlist/MarketOverview"
import type { CryptoData } from "@/lib/types/crypto"

const COIN_IDS = [
  "bitcoin", "ethereum", "ripple", "tether", "binancecoin", "solana", 
  "usd-coin", "staked-ether", "dogecoin", "cardano", "tron", "hype", 
  "wrapped-bitcoin", "wrapped-steth", "sui", "stellar", "chainlink", 
  "wrapped-beacon-eth", "hedera-hashgraph", "bitcoin-cash", "monero", 
  "avalanche-2", "the-open-network", "shiba-inu", "polkadot", "matic-network", 
  "litecoin", "uniswap", "internet-computer"
]

const CATEGORIES = [
  "All",
  "Layer 1",
  "Stablecoin",
  "DeFi",
  "Meme"
]

export default function CryptoWatchlistPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch crypto data
  const fetchCryptoData = async () => {
    try {
      setError(null)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS.join(",")}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d`
      )
      
      if (!response.ok) throw new Error("Failed to fetch crypto data")
      
      const data = await response.json()
      setCryptoData(data)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCryptoData()
  }, [])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      fetchCryptoData()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("crypto-favorites")
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save favorites to localStorage
  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
    localStorage.setItem("crypto-favorites", JSON.stringify([...newFavorites]))
  }

  // Filter and search
  const filteredData = useMemo(() => {
    let filtered = cryptoData

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((crypto) => {
        const symbol = crypto.symbol.toLowerCase()
        switch (selectedCategory) {
          case "Stablecoin":
            return ["usdt", "usdc", "dai", "busd"].includes(symbol)
          case "Layer 1":
            return ["btc", "eth", "sol", "ada", "avax", "dot", "matic"].includes(symbol)
          case "DeFi":
            return ["uni", "link", "aave", "crv", "mkr"].includes(symbol)
          case "Meme":
            return ["doge", "shib", "pepe", "floki"].includes(symbol)
          default:
            return true
        }
      })
    }

    return filtered
  }, [cryptoData, searchQuery, selectedCategory])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Rank", "Name", "Symbol", "Price", "24h Change", "Market Cap", "Volume"]
    const rows = filteredData.map((crypto) => [
      crypto.market_cap_rank,
      crypto.name,
      crypto.symbol.toUpperCase(),
      `$${crypto.current_price.toLocaleString()}`,
      `${crypto.price_change_percentage_24h?.toFixed(2)}%`,
      `$${crypto.market_cap.toLocaleString()}`,
      `$${crypto.total_volume.toLocaleString()}`
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cryptoguard-watchlist-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <NavBar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-yellow-500/20 bg-gradient-to-b from-black via-black/95 to-black/90">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-20%,rgba(255,215,0,0.12),transparent_60%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="size-5 sm:size-6 text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
              Crypto Watchlist
            </h1>
          </div>
          <p className="text-center text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mb-6">
            Monitor 30+ cryptocurrencies with real-time prices, market data, and advanced analytics
          </p>

          {/* Market Overview */}
          <MarketOverview data={cryptoData} loading={loading} />
        </div>
      </section>

      {/* Controls */}
      <section className="sticky top-16 z-20 bg-black/95 backdrop-blur-md border-b border-yellow-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/60 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-black/60 rounded-lg border border-yellow-500/30 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-yellow-500 text-black hover:bg-yellow-400" : "text-gray-400 hover:text-white"}
              >
                <Grid3x3 className="size-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-yellow-500 text-black hover:bg-yellow-400" : "text-gray-400 hover:text-white"}
              >
                <TableIcon className="size-4 mr-2" />
                Table
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCryptoData()}
                disabled={loading}
                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
              >
                <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
              >
                <Download className="size-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Filter className="size-4 text-gray-500" />
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <span>
              Showing {filteredData.length} of {cryptoData.length} cryptocurrencies
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading && cryptoData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="size-12 text-yellow-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading crypto data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <Card className="border-red-500/40 bg-black/60">
              <CardContent className="pt-6 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={() => fetchCryptoData()}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Search className="size-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No cryptocurrencies found</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="mt-4 text-yellow-300 hover:text-yellow-200"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <CryptoGrid
            data={filteredData}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectCrypto={setSelectedCrypto}
          />
        ) : (
          <CryptoTable
            data={filteredData}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectCrypto={setSelectedCrypto}
          />
        )}
      </section>

      {/* Detail Modal */}
      <CryptoDetailModal
        crypto={selectedCrypto}
        open={!!selectedCrypto}
        onClose={() => setSelectedCrypto(null)}
        isFavorite={selectedCrypto ? favorites.has(selectedCrypto.id) : false}
        onToggleFavorite={() => selectedCrypto && toggleFavorite(selectedCrypto.id)}
      />

      <Footer />
    </div>
  )
}
