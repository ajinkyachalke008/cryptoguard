"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Filter
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const statsData = [
  { name: "00:00", transactions: 245, fraud: 12 },
  { name: "04:00", transactions: 189, fraud: 8 },
  { name: "08:00", transactions: 421, fraud: 18 },
  { name: "12:00", transactions: 567, fraud: 24 },
  { name: "16:00", transactions: 489, fraud: 21 },
  { name: "20:00", transactions: 356, fraud: 15 }
]

const riskDistribution = [
  { name: "Safe", value: 8547, color: "#10b981" },
  { name: "Low Risk", value: 1234, color: "#f59e0b" },
  { name: "High Risk", value: 567, color: "#ef4444" },
  { name: "Fraud", value: 234, color: "#dc2626" }
]

const recentAlerts = [
  { id: 1, type: "fraud", message: "High-value transaction flagged", amount: "$45,230", time: "2 min ago", from: "0x7a9f...3d2e", to: "0x4b1c...8f9a" },
  { id: 2, type: "risk", message: "Unusual transaction pattern", amount: "$12,450", time: "5 min ago", from: "0x3c8e...4a1b", to: "0x9d2f...7e6c" },
  { id: 3, type: "fraud", message: "Known fraudulent wallet detected", amount: "$28,900", time: "8 min ago", from: "0x1f5a...9c3d", to: "0x6e4b...2a8f" },
  { id: 4, type: "risk", message: "Multi-hop transaction detected", amount: "$8,340", time: "12 min ago", from: "0x8b3c...5d1e", to: "0x2a9f...4c7b" }
]

const topCountries = [
  { country: "🇺🇸 United States", transactions: 12847, fraud: 234, percentage: 1.8 },
  { country: "🇨🇳 China", transactions: 9821, fraud: 412, percentage: 4.2 },
  { country: "🇷🇺 Russia", transactions: 7654, fraud: 523, percentage: 6.8 },
  { country: "🇮🇳 India", transactions: 6432, fraud: 189, percentage: 2.9 },
  { country: "🇧🇷 Brazil", transactions: 5234, fraud: 298, percentage: 5.7 }
]

export default function DashboardPage() {
  const [liveCount, setLiveCount] = useState(10582)
  const [fraudCount, setFraudCount] = useState(234)

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3))
      if (Math.random() > 0.7) {
        setFraudCount(prev => prev + 1)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <NavBar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-300 mb-2">Dashboard</h1>
          <p className="text-gray-400">Real-time crypto fraud detection and monitoring</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">{liveCount.toLocaleString()}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-400" />
                <span className="text-green-400">12.5%</span> from last hour
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Fraud Detected</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{fraudCount}</div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <ArrowDownRight className="h-3 w-3 text-green-400" />
                <span className="text-green-400">2.3%</span> from last hour
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Safe Transactions</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">8,547</div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <span className="text-yellow-400">80.8%</span> success rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">$2.4M</div>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
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
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-300">Risk Distribution</CardTitle>
              <CardDescription className="text-gray-400">Current status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-yellow-500/20 bg-black/40">
                    {alert.type === "fraud" ? (
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {alert.from} → {alert.to}
                      </p>
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
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-300">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">Manage your fraud detection operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button className="h-auto flex-col items-start p-4 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-left">
                <Shield className="h-6 w-6 text-yellow-400 mb-2" />
                <span className="font-semibold text-yellow-300">Review Cases</span>
                <span className="text-xs text-gray-400 mt-1">12 pending</span>
              </Button>
              <Button className="h-auto flex-col items-start p-4 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-left">
                <Download className="h-6 w-6 text-yellow-400 mb-2" />
                <span className="font-semibold text-yellow-300">Export Report</span>
                <span className="text-xs text-gray-400 mt-1">Generate PDF</span>
              </Button>
              <Button className="h-auto flex-col items-start p-4 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-left">
                <Users className="h-6 w-6 text-yellow-400 mb-2" />
                <span className="font-semibold text-yellow-300">Team Analytics</span>
                <span className="text-xs text-gray-400 mt-1">View performance</span>
              </Button>
              <Button className="h-auto flex-col items-start p-4 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-left">
                <TrendingUp className="h-6 w-6 text-yellow-400 mb-2" />
                <span className="font-semibold text-yellow-300">AI Insights</span>
                <span className="text-xs text-gray-400 mt-1">View predictions</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}