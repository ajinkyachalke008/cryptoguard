"use client"

import { useState, useMemo } from "react"
import { useTransactions, Tx, TxStatus } from "@/hooks/useTransactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Shield, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Snowflake, 
  Microscope,
  MapPin,
  Clock,
  Hash,
  DollarSign,
  Filter,
  ChevronDown,
  User,
  Network,
  TrendingUp,
  Globe,
  ArrowRight,
  X,
  CheckCircle,
  AlertOctagon,
  Activity
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type FilterStatus = "all" | TxStatus

interface RelatedAccount {
  id: string
  name: string
  riskScore: number
  totalTransactions: number
  fraudTransactions: number
  lastActivity: string
  location: string
}

interface TransactionPattern {
  pattern: string
  frequency: number
  riskLevel: "low" | "medium" | "high"
  description: string
}

export default function TransactionManagement() {
  const { txs } = useTransactions()
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false)
  const [researchDialogOpen, setResearchDialogOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)
  const [frozenAccounts, setFrozenAccounts] = useState<Set<string>>(new Set())

  // Filter and search transactions
  const filteredTxs = useMemo(() => {
    return txs
      .filter((tx) => filter === "all" || tx.status === filter)
      .filter((tx) => 
        searchQuery === "" ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 50) // Show latest 50
  }, [txs, filter, searchQuery])

  // Generate mock related accounts for deep research
  const generateRelatedAccounts = (tx: Tx): RelatedAccount[] => {
    const accounts: RelatedAccount[] = [
      {
        id: `ACC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: `Wallet ${tx.from.substring(0, 3)}***`,
        riskScore: tx.status === "fraud" ? 85 : tx.status === "risky" ? 55 : 15,
        totalTransactions: Math.floor(Math.random() * 500) + 50,
        fraudTransactions: tx.status === "fraud" ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 3),
        lastActivity: "2 hours ago",
        location: tx.from
      },
      {
        id: `ACC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: `Wallet ${tx.to.substring(0, 3)}***`,
        riskScore: tx.status === "fraud" ? 72 : tx.status === "risky" ? 45 : 12,
        totalTransactions: Math.floor(Math.random() * 300) + 30,
        fraudTransactions: tx.status === "fraud" ? Math.floor(Math.random() * 15) + 3 : Math.floor(Math.random() * 2),
        lastActivity: "5 hours ago",
        location: tx.to
      },
      {
        id: `ACC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: `Exchange Hub ${Math.floor(Math.random() * 100)}`,
        riskScore: tx.status === "fraud" ? 65 : 25,
        totalTransactions: Math.floor(Math.random() * 1000) + 200,
        fraudTransactions: Math.floor(Math.random() * 10),
        lastActivity: "1 day ago",
        location: "Multiple"
      }
    ]
    return accounts
  }

  // Generate mock transaction patterns
  const generatePatterns = (tx: Tx): TransactionPattern[] => {
    const patterns: TransactionPattern[] = [
      {
        pattern: "Rapid Sequential Transfers",
        frequency: tx.status === "fraud" ? 87 : tx.status === "risky" ? 45 : 12,
        riskLevel: tx.status === "fraud" ? "high" : tx.status === "risky" ? "medium" : "low",
        description: "Multiple transactions within short time intervals"
      },
      {
        pattern: "Cross-Border Routing",
        frequency: tx.status === "fraud" ? 92 : tx.status === "risky" ? 60 : 30,
        riskLevel: tx.status === "fraud" ? "high" : "medium",
        description: "Funds routed through multiple countries"
      },
      {
        pattern: "Amount Structuring",
        frequency: tx.status === "fraud" ? 78 : tx.status === "risky" ? 35 : 8,
        riskLevel: tx.status === "fraud" ? "high" : tx.status === "risky" ? "medium" : "low",
        description: "Transactions structured to avoid reporting thresholds"
      },
      {
        pattern: "Dormant Account Activity",
        frequency: tx.status === "fraud" ? 65 : 15,
        riskLevel: tx.status === "fraud" ? "high" : "low",
        description: "Sudden activity from previously inactive accounts"
      }
    ]
    return patterns
  }

  const handleFreeze = (tx: Tx) => {
    setSelectedTx(tx)
    setFreezeDialogOpen(true)
  }

  const handleDeepResearch = (tx: Tx) => {
    setSelectedTx(tx)
    setResearchDialogOpen(true)
  }

  const confirmFreeze = () => {
    if (selectedTx) {
      setFrozenAccounts(prev => new Set([...prev, selectedTx.from, selectedTx.to]))
      toast.success(`Accounts frozen successfully`, {
        description: `Both sender and receiver accounts have been frozen for transaction ${selectedTx.id.slice(0, 8)}...`
      })
    }
    setFreezeDialogOpen(false)
    setSelectedTx(null)
  }

  const getStatusColor = (status: TxStatus) => {
    switch (status) {
      case "safe": return "text-green-400"
      case "risky": return "text-orange-400"
      case "fraud": return "text-red-400"
    }
  }

  const getStatusBg = (status: TxStatus) => {
    switch (status) {
      case "safe": return "bg-green-500/20 border-green-500/50"
      case "risky": return "bg-orange-500/20 border-orange-500/50"
      case "fraud": return "bg-red-500/20 border-red-500/50"
    }
  }

  const getStatusIcon = (status: TxStatus) => {
    switch (status) {
      case "safe": return <Shield className="size-4" />
      case "risky": return <AlertTriangle className="size-4" />
      case "fraud": return <XCircle className="size-4" />
    }
  }

  const formatTime = (id: string) => {
    const timestamp = parseInt(id.split("-")[0])
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const stats = useMemo(() => {
    const recent = txs.slice(0, 100)
    return {
      total: recent.length,
      safe: recent.filter(t => t.status === "safe").length,
      risky: recent.filter(t => t.status === "risky").length,
      fraud: recent.filter(t => t.status === "fraud").length,
    }
  }, [txs])

  return (
    <section className="mx-auto max-w-7xl px-4 mt-8">
      <div className="rounded-xl border border-yellow-500/40 bg-black/50 p-6 backdrop-blur-sm shadow-[0_0_40px_#ffd70022]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <Activity className="size-6" />
              Transaction Management
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Monitor, analyze, and take action on suspicious transactions
            </p>
          </div>
          
          {/* Stats Overview */}
          <div className="flex gap-3">
            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-xs text-green-400">Safe</div>
              <div className="text-lg font-bold text-green-300">{stats.safe}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="text-xs text-orange-400">Risky</div>
              <div className="text-lg font-bold text-orange-300">{stats.risky}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-xs text-red-400">Fraud</div>
              <div className="text-lg font-bold text-red-300">{stats.fraud}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <Input
              placeholder="Search by Transaction ID, Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500"
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-yellow-500/30 bg-black/40 text-yellow-300 hover:bg-yellow-500/10 min-w-[140px]">
                <Filter className="size-4 mr-2" />
                {filter === "all" ? "All Status" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                <ChevronDown className="size-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/95 border-yellow-500/30">
              <DropdownMenuItem onClick={() => setFilter("all")} className="text-white hover:bg-yellow-500/20">
                All Transactions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("safe")} className="text-green-400 hover:bg-green-500/20">
                <Shield className="size-4 mr-2" /> Safe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("risky")} className="text-orange-400 hover:bg-orange-500/20">
                <AlertTriangle className="size-4 mr-2" /> Risky
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("fraud")} className="text-red-400 hover:bg-red-500/20">
                <XCircle className="size-4 mr-2" /> Fraud
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Transactions List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTxs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No transactions found matching your criteria
            </div>
          ) : (
            filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 rounded-lg border ${getStatusBg(tx.status)} transition-all hover:shadow-lg ${
                  frozenAccounts.has(tx.from) || frozenAccounts.has(tx.to) ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Status Badge & ID */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className={`p-2 rounded-full ${getStatusBg(tx.status)} ${getStatusColor(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Hash className="size-3 text-gray-500" />
                        <span className="text-xs text-gray-400 font-mono">{tx.id.slice(0, 12)}...</span>
                      </div>
                      <div className={`text-sm font-semibold ${getStatusColor(tx.status)} capitalize`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <DollarSign className="size-4 text-yellow-500" />
                    <span className="text-white font-semibold">${tx.amount.toLocaleString()}</span>
                  </div>

                  {/* Location From -> To */}
                  <div className="flex items-center gap-2 flex-1">
                    <MapPin className="size-4 text-blue-400" />
                    <span className="text-gray-300">{tx.from}</span>
                    <ArrowRight className="size-4 text-yellow-500" />
                    <span className="text-gray-300">{tx.to}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Clock className="size-4 text-gray-500" />
                    <span className="text-gray-400 text-sm">{formatTime(tx.id)}</span>
                  </div>

                  {/* Frozen Badge */}
                  {(frozenAccounts.has(tx.from) || frozenAccounts.has(tx.to)) && (
                    <div className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs flex items-center gap-1">
                      <Snowflake className="size-3" /> Frozen
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFreeze(tx)}
                      disabled={frozenAccounts.has(tx.from) && frozenAccounts.has(tx.to)}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      <Snowflake className="size-4 mr-1" />
                      Freeze
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeepResearch(tx)}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                    >
                      <Microscope className="size-4 mr-1" />
                      Research
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Freeze Confirmation Dialog */}
      <Dialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <DialogContent className="bg-black/95 border-yellow-500/40 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 flex items-center gap-2">
              <Snowflake className="size-5" />
              Freeze Account Confirmation
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action will freeze both sender and receiver accounts associated with this transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertOctagon className="size-4" />
                  <span className="font-semibold">Warning</span>
                </div>
                <p className="text-sm text-gray-300">
                  Freezing these accounts will immediately halt all transactions. This action requires manual review to unfreeze.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="text-gray-300 font-mono">{selectedTx.id.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sender Account:</span>
                  <span className="text-gray-300">{selectedTx.from}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Receiver Account:</span>
                  <span className="text-gray-300">{selectedTx.to}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="text-yellow-400 font-semibold">${selectedTx.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFreezeDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmFreeze}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Snowflake className="size-4 mr-2" />
              Confirm Freeze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deep Research Dialog */}
      <Dialog open={researchDialogOpen} onOpenChange={setResearchDialogOpen}>
        <DialogContent className="bg-black/95 border-yellow-500/40 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 flex items-center gap-2">
              <Microscope className="size-5" />
              Deep Research Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Comprehensive analysis of related accounts and transaction patterns
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-6 py-4">
              {/* Transaction Summary */}
              <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                  <Hash className="size-4" />
                  Transaction Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">ID</div>
                    <div className="text-sm font-mono text-gray-300">{selectedTx.id.slice(0, 12)}...</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="text-sm font-semibold text-yellow-400">${selectedTx.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Route</div>
                    <div className="text-sm text-gray-300">{selectedTx.from} → {selectedTx.to}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className={`text-sm font-semibold ${getStatusColor(selectedTx.status)} capitalize`}>
                      {selectedTx.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Accounts */}
              <div>
                <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  <Network className="size-4" />
                  Related Accounts ({generateRelatedAccounts(selectedTx).length})
                </h3>
                <div className="space-y-3">
                  {generateRelatedAccounts(selectedTx).map((account, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-500/20">
                            <User className="size-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{account.name}</div>
                            <div className="text-xs text-gray-500">{account.id}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Risk Score</div>
                            <div className={`font-semibold ${
                              account.riskScore >= 70 ? "text-red-400" : 
                              account.riskScore >= 40 ? "text-orange-400" : "text-green-400"
                            }`}>
                              {account.riskScore}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Total Txns</div>
                            <div className="text-gray-300">{account.totalTransactions}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Fraud Txns</div>
                            <div className="text-red-400">{account.fraudTransactions}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Location</div>
                            <div className="text-gray-300 flex items-center gap-1">
                              <Globe className="size-3" />
                              {account.location}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Last Activity</div>
                            <div className="text-gray-400">{account.lastActivity}</div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Snowflake className="size-3 mr-1" />
                          Freeze
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Patterns */}
              <div>
                <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  Detected Patterns
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {generatePatterns(selectedTx).map((pattern, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-white">{pattern.pattern}</div>
                        <div className={`px-2 py-0.5 rounded text-xs ${
                          pattern.riskLevel === "high" ? "bg-red-500/20 text-red-400" :
                          pattern.riskLevel === "medium" ? "bg-orange-500/20 text-orange-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {pattern.riskLevel}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{pattern.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              pattern.riskLevel === "high" ? "bg-red-500" :
                              pattern.riskLevel === "medium" ? "bg-orange-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${pattern.frequency}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pattern.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="size-4" />
                  AI Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedTx.status === "fraud" && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-red-400" />
                        <span className="text-gray-300">Immediately freeze all associated accounts</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-red-400" />
                        <span className="text-gray-300">Flag transaction for compliance review</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-orange-400" />
                        <span className="text-gray-300">Analyze connected wallet network for additional fraud</span>
                      </div>
                    </>
                  )}
                  {selectedTx.status === "risky" && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-orange-400" />
                        <span className="text-gray-300">Monitor account for 24 hours before action</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-yellow-400" />
                        <span className="text-gray-300">Request additional KYC verification</span>
                      </div>
                    </>
                  )}
                  {selectedTx.status === "safe" && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-green-400" />
                        <span className="text-gray-300">No immediate action required</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1 size-1.5 rounded-full bg-green-400" />
                        <span className="text-gray-300">Continue standard monitoring</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResearchDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <X className="size-4 mr-2" />
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success("Report exported successfully")
              }}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}