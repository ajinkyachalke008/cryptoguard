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
  Activity,
  Zap,
  Cpu,
  Radio,
  Scan
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
      .slice(0, 50)
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
      case "safe": return "text-emerald-400"
      case "risky": return "text-amber-400"
      case "fraud": return "text-rose-400"
    }
  }

  const getStatusGlow = (status: TxStatus) => {
    switch (status) {
      case "safe": return "shadow-[0_0_20px_rgba(52,211,153,0.4),inset_0_0_20px_rgba(52,211,153,0.1)]"
      case "risky": return "shadow-[0_0_20px_rgba(251,191,36,0.4),inset_0_0_20px_rgba(251,191,36,0.1)]"
      case "fraud": return "shadow-[0_0_20px_rgba(251,113,133,0.4),inset_0_0_20px_rgba(251,113,133,0.1)]"
    }
  }

  const getStatusBg = (status: TxStatus) => {
    switch (status) {
      case "safe": return "bg-emerald-500/10 border-emerald-500/40"
      case "risky": return "bg-amber-500/10 border-amber-500/40"
      case "fraud": return "bg-rose-500/10 border-rose-500/40"
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
    <section className="mx-auto max-w-7xl px-4 mt-12">
      {/* Futuristic Container */}
      <div className="relative rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-black/80 via-black/60 to-yellow-950/20 p-1 backdrop-blur-xl shadow-[0_0_60px_rgba(255,215,0,0.15),0_0_100px_rgba(255,215,0,0.05)]">
        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-yellow-500/60 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-yellow-500/60 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-yellow-500/60 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-yellow-500/60 rounded-br-2xl" />
        
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,215,0,0.03)_50%)] bg-[length:100%_4px] animate-pulse" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent animate-pulse" />
        </div>

        <div className="relative p-6 rounded-xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              {/* Animated icon container */}
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-xl animate-pulse" />
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/40 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                  <Cpu className="size-8 text-yellow-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent flex items-center gap-2">
                  Transaction Control Center
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-normal bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400">
                    <Radio className="size-3 animate-pulse" /> LIVE
                  </span>
                </h2>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <Zap className="size-3 text-yellow-500" />
                  AI-powered monitoring • Real-time threat analysis
                </p>
              </div>
            </div>
            
            {/* Futuristic Stats Cards */}
            <div className="flex gap-3">
              {[
                { label: "SECURE", value: stats.safe, color: "emerald", icon: Shield },
                { label: "FLAGGED", value: stats.risky, color: "amber", icon: AlertTriangle },
                { label: "THREAT", value: stats.fraud, color: "rose", icon: XCircle }
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className={`relative group px-4 py-3 rounded-xl bg-${stat.color}-500/5 border border-${stat.color}-500/30 hover:border-${stat.color}-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]`}
                >
                  <div className={`absolute inset-0 bg-${stat.color}-500/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className={`flex items-center gap-1 text-xs text-${stat.color}-400 mb-1`}>
                      <stat.icon className="size-3" />
                      {stat.label}
                    </div>
                    <div className={`text-2xl font-bold text-${stat.color}-300 font-mono tracking-wider`}>
                      {stat.value.toString().padStart(3, '0')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Futuristic Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 rounded-xl bg-black/40 border border-yellow-500/20">
            {/* Search with glow */}
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-yellow-500/60 group-focus-within:text-yellow-400 transition-colors" />
              <Input
                placeholder="Search transaction matrix..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative pl-11 h-12 bg-black/60 border-yellow-500/30 text-white placeholder:text-gray-600 focus:border-yellow-500 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all font-mono"
              />
              <Scan className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-yellow-500/40" />
            </div>
            
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-12 min-w-[160px] border-yellow-500/30 bg-black/60 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-500/60 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all font-mono"
                >
                  <Filter className="size-4 mr-2" />
                  {filter === "all" ? "ALL STATUS" : filter.toUpperCase()}
                  <ChevronDown className="size-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border-yellow-500/30 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setFilter("all")} className="text-white hover:bg-yellow-500/20 font-mono">
                  ALL TRANSACTIONS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("safe")} className="text-emerald-400 hover:bg-emerald-500/20 font-mono">
                  <Shield className="size-4 mr-2" /> SECURE
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("risky")} className="text-amber-400 hover:bg-amber-500/20 font-mono">
                  <AlertTriangle className="size-4 mr-2" /> FLAGGED
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("fraud")} className="text-rose-400 hover:bg-rose-500/20 font-mono">
                  <XCircle className="size-4 mr-2" /> THREAT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Transactions Grid */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredTxs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Scan className="size-12 mx-auto mb-4 opacity-30" />
                <p className="font-mono">NO MATCHING TRANSACTIONS IN DATABASE</p>
              </div>
            ) : (
              filteredTxs.map((tx, index) => (
                <div
                  key={tx.id}
                  className={`group relative p-4 rounded-xl border ${getStatusBg(tx.status)} ${getStatusGlow(tx.status)} transition-all duration-300 hover:scale-[1.01] ${
                    frozenAccounts.has(tx.from) || frozenAccounts.has(tx.to) ? "opacity-50" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Holographic overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  <div className="relative flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className={`relative p-2.5 rounded-lg ${getStatusBg(tx.status)} ${getStatusColor(tx.status)}`}>
                        <div className={`absolute inset-0 rounded-lg animate-ping opacity-20 ${
                          tx.status === "fraud" ? "bg-rose-500" : tx.status === "risky" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        {getStatusIcon(tx.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Hash className="size-3 text-gray-600" />
                          <span className="text-xs text-gray-500 font-mono tracking-wider">{tx.id.slice(0, 10)}...</span>
                        </div>
                        <div className={`text-sm font-bold ${getStatusColor(tx.status)} uppercase tracking-wider`}>
                          {tx.status === "safe" ? "VERIFIED" : tx.status === "risky" ? "FLAGGED" : "THREAT"}
                        </div>
                      </div>
                    </div>

                    {/* Amount with glow */}
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <DollarSign className="size-4 text-yellow-500" />
                      <span className="text-white font-bold font-mono text-lg tracking-wider">
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Route Visualization */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <MapPin className="size-3 text-blue-400" />
                        <span className="text-blue-300 text-sm font-mono">{tx.from}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-yellow-500" />
                        <ArrowRight className="size-4 text-yellow-500 -mx-1" />
                        <div className="w-8 h-px bg-gradient-to-r from-yellow-500 to-purple-500" />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <MapPin className="size-3 text-purple-400" />
                        <span className="text-purple-300 text-sm font-mono">{tx.to}</span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 min-w-[110px]">
                      <Clock className="size-4 text-gray-600" />
                      <span className="text-gray-400 text-sm font-mono">{formatTime(tx.id)}</span>
                    </div>

                    {/* Frozen Badge */}
                    {(frozenAccounts.has(tx.from) || frozenAccounts.has(tx.to)) && (
                      <div className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs flex items-center gap-2 font-mono shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <Snowflake className="size-3 animate-pulse" /> FROZEN
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFreeze(tx)}
                        disabled={frozenAccounts.has(tx.from) && frozenAccounts.has(tx.to)}
                        className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-mono text-xs"
                      >
                        <Snowflake className="size-4 mr-1" />
                        FREEZE
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeepResearch(tx)}
                        className="border-purple-500/40 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/60 hover:text-purple-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all font-mono text-xs"
                      >
                        <Microscope className="size-4 mr-1" />
                        ANALYZE
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Freeze Confirmation Dialog */}
      <Dialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-black/98 to-cyan-950/30 border-cyan-500/40 text-white max-w-md backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2 font-mono">
              <Snowflake className="size-5" />
              FREEZE PROTOCOL
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Initiating account suspension sequence
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 shadow-[0_0_20px_rgba(251,113,133,0.2)]">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <AlertOctagon className="size-4 animate-pulse" />
                  <span className="font-bold font-mono">⚠ CRITICAL ACTION</span>
                </div>
                <p className="text-sm text-gray-300">
                  This will immediately halt all transactions for associated wallets. Manual override required for restoration.
                </p>
              </div>
              
              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-cyan-500/20">
                {[
                  { label: "TX-ID", value: selectedTx.id.slice(0, 16) + "..." },
                  { label: "SOURCE", value: selectedTx.from },
                  { label: "TARGET", value: selectedTx.to },
                  { label: "VALUE", value: `$${selectedTx.amount.toLocaleString()}`, highlight: true }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm font-mono">
                    <span className="text-gray-500">{item.label}:</span>
                    <span className={item.highlight ? "text-yellow-400 font-bold" : "text-gray-300"}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFreezeDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 font-mono"
            >
              ABORT
            </Button>
            <Button
              onClick={confirmFreeze}
              className="bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)] font-mono"
            >
              <Snowflake className="size-4 mr-2" />
              EXECUTE FREEZE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deep Research Dialog */}
      <Dialog open={researchDialogOpen} onOpenChange={setResearchDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-black/98 to-purple-950/30 border-purple-500/40 text-white max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-purple-400 flex items-center gap-2 font-mono">
              <Microscope className="size-5" />
              DEEP ANALYSIS MODULE
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Neural network threat assessment and pattern recognition
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-6 py-4">
              {/* Transaction Summary */}
              <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2 font-mono">
                  <Hash className="size-4" />
                  TRANSACTION MATRIX
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "ID", value: selectedTx.id.slice(0, 12) + "..." },
                    { label: "VALUE", value: `$${selectedTx.amount.toLocaleString()}` },
                    { label: "ROUTE", value: `${selectedTx.from} → ${selectedTx.to}` },
                    { label: "STATUS", value: selectedTx.status.toUpperCase(), status: true }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-xs text-gray-500 font-mono">{item.label}</div>
                      <div className={`text-sm font-mono ${item.status ? getStatusColor(selectedTx.status) : "text-gray-300"} font-bold`}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Accounts */}
              <div>
                <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2 font-mono">
                  <Network className="size-4" />
                  CONNECTED NODES ({generateRelatedAccounts(selectedTx).length})
                </h3>
                <div className="space-y-3">
                  {generateRelatedAccounts(selectedTx).map((account, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            <User className="size-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white font-mono">{account.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{account.id}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 font-mono">RISK</div>
                            <div className={`font-bold font-mono ${
                              account.riskScore >= 70 ? "text-rose-400" : 
                              account.riskScore >= 40 ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              {account.riskScore}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-mono">TOTAL</div>
                            <div className="text-gray-300 font-mono">{account.totalTransactions}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-mono">THREATS</div>
                            <div className="text-rose-400 font-mono">{account.fraudTransactions}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-mono">LOCATION</div>
                            <div className="text-gray-300 flex items-center gap-1 font-mono">
                              <Globe className="size-3" />
                              {account.location}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 font-mono text-xs"
                        >
                          <Snowflake className="size-3 mr-1" />
                          FREEZE
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Patterns */}
              <div>
                <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2 font-mono">
                  <TrendingUp className="size-4" />
                  BEHAVIOR PATTERNS
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {generatePatterns(selectedTx).map((pattern, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-white font-mono text-sm">{pattern.pattern}</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                          pattern.riskLevel === "high" ? "bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)]" :
                          pattern.riskLevel === "medium" ? "bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" :
                          "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                        }`}>
                          {pattern.riskLevel.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{pattern.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              pattern.riskLevel === "high" ? "bg-gradient-to-r from-rose-600 to-rose-400" :
                              pattern.riskLevel === "medium" ? "bg-gradient-to-r from-amber-600 to-amber-400" :
                              "bg-gradient-to-r from-emerald-600 to-emerald-400"
                            }`}
                            style={{ width: `${pattern.frequency}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-mono w-10">{pattern.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2 font-mono">
                  <Cpu className="size-4" />
                  AI RECOMMENDATIONS
                </h3>
                <div className="space-y-2">
                  {selectedTx.status === "fraud" && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_10px_rgba(251,113,133,0.5)]" />
                        <span className="text-gray-300 font-mono">IMMEDIATE: Freeze all linked wallets</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_10px_rgba(251,113,133,0.5)]" />
                        <span className="text-gray-300 font-mono">FLAG: Escalate to compliance team</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                        <span className="text-gray-300 font-mono">SCAN: Analyze network graph for threats</span>
                      </div>
                    </>
                  )}
                  {selectedTx.status === "risky" && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                        <span className="text-gray-300 font-mono">MONITOR: 24-hour surveillance protocol</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <span className="text-gray-300 font-mono">VERIFY: Request enhanced KYC data</span>
                      </div>
                    </>
                  )}
                  {selectedTx.status === "safe" && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        <span className="text-gray-300 font-mono">STATUS: No action required</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        <span className="text-gray-300 font-mono">CONTINUE: Standard monitoring active</span>
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
              className="border-gray-600 text-gray-300 hover:bg-gray-800 font-mono"
            >
              <X className="size-4 mr-2" />
              CLOSE
            </Button>
            <Button
              onClick={() => {
                toast.success("Report exported successfully")
              }}
              className="bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.3)] font-mono font-bold"
            >
              EXPORT REPORT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}