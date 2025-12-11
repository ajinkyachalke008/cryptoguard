"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  DollarSign,
  BarChart3
} from "lucide-react"
import { TransactionAnalysisModal } from "@/components/TransactionAnalysisModal"

interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  amount: number
  currency: string
  timestamp: string
  status: "completed" | "pending" | "failed"
  riskScore: number
  chain: string
  type: "send" | "receive" | "swap"
  gasUsed?: string
  blockNumber?: number
}

export default function TransactionCenter() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [filterRisk, setFilterRisk] = useState<"all" | "low" | "medium" | "high">("all")
  const [filterType, setFilterType] = useState<"all" | "send" | "receive" | "swap">("all")

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions/list")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      } else {
        generateMockTransactions()
      }
    } catch (error) {
      console.error("Failed to load transactions:", error)
      generateMockTransactions()
    } finally {
      setLoading(false)
    }
  }

  const generateMockTransactions = () => {
    const mockData: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
      id: `tx-${i + 1}`,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: Math.random() * 10,
      currency: ["ETH", "BTC", "USDT", "USDC", "BNB"][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)] as Transaction["status"],
      riskScore: Math.floor(Math.random() * 100),
      chain: ["Ethereum", "Bitcoin", "BSC", "Polygon", "Arbitrum"][Math.floor(Math.random() * 5)],
      type: ["send", "receive", "swap"][Math.floor(Math.random() * 3)] as Transaction["type"],
      gasUsed: (Math.random() * 0.01).toFixed(6),
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000
    }))
    setTransactions(mockData)
  }

  const handleAnalyze = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setAnalysisOpen(true)
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-400 bg-green-500/10 border-green-500/30"
    if (score < 70) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
    return "text-red-400 bg-red-500/10 border-red-500/30"
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low"
    if (score < 70) return "Medium"
    return "High"
  }

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-500/10"
      case "pending": return "text-yellow-400 bg-yellow-500/10"
      case "failed": return "text-red-400 bg-red-500/10"
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchQuery === "" || 
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRisk = filterRisk === "all" || 
      (filterRisk === "low" && tx.riskScore < 30) ||
      (filterRisk === "medium" && tx.riskScore >= 30 && tx.riskScore < 70) ||
      (filterRisk === "high" && tx.riskScore >= 70)
    
    const matchesType = filterType === "all" || tx.type === filterType

    return matchesSearch && matchesRisk && matchesType
  })

  const stats = {
    total: transactions.length,
    highRisk: transactions.filter(tx => tx.riskScore >= 70).length,
    totalValue: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    avgRisk: Math.round(transactions.reduce((sum, tx) => sum + tx.riskScore, 0) / transactions.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
                Transaction Control Center
              </h1>
              <p className="text-gray-400 text-sm">
                Analyze transactions with detailed insights and visual graphs
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-yellow-300">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">High Risk</p>
                  <p className="text-2xl font-bold text-red-400">{stats.highRisk}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-green-400">${stats.totalValue.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Avg Risk Score</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.avgRisk}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-yellow-300 text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by hash, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/60 border-yellow-500/30 text-white"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value as typeof filterRisk)}
                  className="w-full h-10 px-3 rounded-md bg-black/60 border border-yellow-500/30 text-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className="w-full h-10 px-3 rounded-md bg-black/60 border border-yellow-500/30 text-white"
                >
                  <option value="all">All Types</option>
                  <option value="send">Send</option>
                  <option value="receive">Receive</option>
                  <option value="swap">Swap</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={loadTransactions}
                variant="outline"
                size="sm"
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-yellow-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-300">
              Transactions ({filteredTransactions.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Click "Analyze" on any transaction to view detailed insights and visual graphs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-yellow-500/20">
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Hash</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Type</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Amount</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Chain</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Time</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Status</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Risk</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-mono text-xs text-gray-300">
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1">
                            {tx.type === "send" && <ArrowUpRight className="w-3 h-3 text-red-400" />}
                            {tx.type === "receive" && <ArrowDownLeft className="w-3 h-3 text-green-400" />}
                            {tx.type === "swap" && <RefreshCw className="w-3 h-3 text-blue-400" />}
                            <span className="text-xs capitalize text-gray-300">{tx.type}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-sm font-semibold text-white">
                            {tx.amount.toFixed(4)} {tx.currency}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-300">
                            {tx.chain}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge className={`text-xs capitalize ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge className={`text-xs ${getRiskColor(tx.riskScore)}`}>
                            {getRiskLabel(tx.riskScore)} ({tx.riskScore})
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button
                            onClick={() => handleAnalyze(tx)}
                            size="sm"
                            className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Analyze
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />

      {/* Transaction Analysis Modal */}
      {selectedTransaction && (
        <TransactionAnalysisModal
          transaction={selectedTransaction}
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
        />
      )}
    </div>
  )
}
