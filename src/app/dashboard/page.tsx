"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlockchainIdentifier } from "@/components/BlockchainIdentifier"
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  FileText,
  Key,
  Loader2,
  Globe
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { toast } from "sonner"

interface AnalyticsStats {
  total_transactions: number
  fraud_count: number
  safe_count: number
  total_volume: number
  transactions_change: number
  fraud_change: number
}

interface TrendData {
  timestamp: string
  transactions: number
  fraud: number
}

const riskDistribution = [
  { name: "Safe", value: 8547, color: "#10b981" },
  { name: "Low Risk", value: 1234, color: "#f59e0b" },
  { name: "High Risk", value: 567, color: "#ef4444" },
  { name: "Fraud", value: 234, color: "#dc2626" }
]

const recentAlerts = [
  { id: 1, type: "fraud", message: "High-value transaction flagged", amount: "$45,230", time: "2 min ago", from: "0x7a9f6e4b2a8f9c3d", to: "0x4b1c8f9a2d3e4f5a" },
  { id: 2, type: "risk", message: "Unusual transaction pattern", amount: "$12,450", time: "5 min ago", from: "0x3c8e4a1b9d2f7e6c", to: "0x9d2f7e6c3c8e4a1b" },
  { id: 3, type: "fraud", message: "Known fraudulent wallet detected", amount: "$28,900", time: "8 min ago", from: "0x1f5a9c3d6e4b2a8f", to: "0x6e4b2a8f1f5a9c3d" },
  { id: 4, type: "risk", message: "Multi-hop transaction detected", amount: "$8,340", time: "12 min ago", from: "0x8b3c5d1e2a9f4c7b", to: "0x2a9f4c7b8b3c5d1e" }
]

const topCountries = [
  { country: "🇺🇸 United States", transactions: 12847, fraud: 234, percentage: 1.8 },
  { country: "🇨🇳 China", transactions: 9821, fraud: 412, percentage: 4.2 },
  { country: "🇷🇺 Russia", transactions: 7654, fraud: 523, percentage: 6.8 },
  { country: "🇮🇳 India", transactions: 6432, fraud: 189, percentage: 2.9 },
  { country: "🇧🇷 Brazil", transactions: 5234, fraud: 298, percentage: 5.7 }
]

export default function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        fetch("/api/analytics/stats"),
        fetch("/api/analytics/trends?period=24h")
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrends(trendsData.trends || [])
      }
    } catch {
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Real-time crypto fraud monitoring & analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">
                {stats?.total_transactions.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                {stats && stats.transactions_change >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">{stats.transactions_change.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{Math.abs(stats?.transactions_change || 0).toFixed(1)}%</span>
                  </>
                )}
                from last hour
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Fraud Detected</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {stats?.fraud_count.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                {stats && stats.fraud_change <= 0 ? (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">{Math.abs(stats.fraud_change).toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{stats?.fraud_change.toFixed(1)}%</span>
                  </>
                )}
                from last hour
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Safe Transactions</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {stats?.safe_count.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <span className="text-yellow-400">
                  {stats ? ((stats.safe_count / stats.total_transactions) * 100).toFixed(1) : "0"}%
                </span>
                success rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">
                ${((stats?.total_volume || 0) / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-400" />
                <span className="text-green-400">8.2%</span> from last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Transaction Activity Chart */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-300">Transaction Activity</CardTitle>
              <CardDescription className="text-gray-400">Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.length > 0 ? trends : [{ timestamp: "No data", transactions: 0, fraud: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#999"
                      tickFormatter={(value) => {
                        if (value === "No data") return value
                        const date = new Date(value)
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }}
                    />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid #ffd700',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="transactions" stroke="#ffd700" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} name="Fraud" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-300">Risk Distribution</CardTitle>
              <CardDescription className="text-gray-400">Current status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid #ffd700',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>

          </Card>
        </div>

        {/* Alerts & Top Countries */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Recent Alerts */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-yellow-300">Recent Alerts</CardTitle>
                  <CardDescription className="text-gray-400">Live fraud detection</CardDescription>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                  {recentAlerts.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-yellow-500/20 bg-black/40 group">
                    {alert.type === "fraud" ? (
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">{alert.message}</p>
                      <div className="flex flex-col gap-1.5 mt-2">
                        <BlockchainIdentifier type="address" value={alert.from} label="From" />
                        <BlockchainIdentifier type="address" value={alert.to} label="To" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                          {alert.amount}
                        </Badge>
                        <span className="text-xs text-gray-500">{alert.time}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-yellow-300">Top Countries</CardTitle>
                  <CardDescription className="text-gray-400">By transaction volume</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/20">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCountries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-200">{item.country}</span>
                        <span className="text-xs text-gray-400">{item.transactions.toLocaleString()} tx</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"
                            style={{ width: `${100 - item.percentage * 10}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${
                          item.percentage > 5 ? 'text-red-400' : item.percentage > 3 ? 'text-orange-400' : 'text-green-400'
                        }`}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-yellow-500/40 bg-black/60 p-6 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
          <h2 className="text-xl font-semibold text-yellow-300 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button
              onClick={() => router.push("/hub")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-gold/5 border border-gold/20 text-gold hover:bg-gold/10 hover:border-gold/40 shadow-[0_0_20px_rgba(255,215,0,0.1)]"
            >
              <Globe className="size-6" />
              <span className="font-bold text-sm tracking-tighter">Intel Hub</span>
            </Button>
            <Button
              onClick={() => router.push("/scanner")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            >
              <Shield className="size-6" />
              <span className="font-semibold text-sm">Scan Wallet</span>
            </Button>
            <Button
              onClick={() => router.push("/watchlist")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            >
              <Eye className="size-6" />
              <span className="font-semibold text-sm">Watchlist</span>
            </Button>
            <Button
              onClick={() => router.push("/alerts")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            >
              <AlertTriangle className="size-6" />
              <span className="font-semibold text-sm">Alerts</span>
            </Button>
            <Button
              onClick={() => router.push("/graph")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            >
              <Activity className="size-6" />
              <span className="font-semibold text-sm">Graph Explorer</span>
            </Button>
            <Button
              onClick={() => router.push("/reports")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            >
              <Download className="size-6" />
              <span className="font-semibold text-sm">Reports</span>
            </Button>
            <Button
              onClick={() => router.push("/api-keys")}
              className="h-auto flex flex-col items-center gap-2 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            >
              <Key className="size-6" />
              <span className="font-semibold text-sm">API Keys</span>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
