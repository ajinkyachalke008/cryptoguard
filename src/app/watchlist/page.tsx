"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  Plus,
  Search,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Edit,
  Bell,
  BellOff,
  Activity,
  AlertTriangle,
  Shield,
  Network,
  Clock,
  Filter,
  Download,
  Wallet,
  ArrowUpDown,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

type WatchlistStatus = "active" | "paused"
type RiskLevel = "low" | "medium" | "high" | "critical"

interface WatchlistItem {
  id: string
  address: string
  blockchain: string
  notes: string
  riskThreshold: number
  alertIncoming: boolean
  alertOutgoing: boolean
  minTxSize: number
  status: WatchlistStatus
  currentRiskScore: number
  currentRiskLevel: RiskLevel
  lastActivity: string
  alertCount: number
  addedAt: string
}

const initialWatchlist: WatchlistItem[] = [
  {
    id: "1",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44E",
    blockchain: "Ethereum",
    notes: "Suspected mixer activity - under investigation",
    riskThreshold: 50,
    alertIncoming: true,
    alertOutgoing: true,
    minTxSize: 1000,
    status: "active",
    currentRiskScore: 72,
    currentRiskLevel: "high",
    lastActivity: "2 min ago",
    alertCount: 12,
    addedAt: "2024-11-28"
  },
  {
    id: "2",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    blockchain: "Ethereum",
    notes: "USDT Treasury - monitoring large movements",
    riskThreshold: 30,
    alertIncoming: true,
    alertOutgoing: false,
    minTxSize: 50000,
    status: "active",
    currentRiskScore: 15,
    currentRiskLevel: "low",
    lastActivity: "15 min ago",
    alertCount: 3,
    addedAt: "2024-11-25"
  },
  {
    id: "3",
    address: "0x28C6c06298d514Db089934071355E5743bf21d60",
    blockchain: "Ethereum",
    notes: "Binance Hot Wallet - reference only",
    riskThreshold: 70,
    alertIncoming: false,
    alertOutgoing: true,
    minTxSize: 100000,
    status: "paused",
    currentRiskScore: 8,
    currentRiskLevel: "low",
    lastActivity: "1 hour ago",
    alertCount: 0,
    addedAt: "2024-11-20"
  },
  {
    id: "4",
    address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    blockchain: "Ethereum",
    notes: "Flagged for potential fraud - high priority",
    riskThreshold: 40,
    alertIncoming: true,
    alertOutgoing: true,
    minTxSize: 500,
    status: "active",
    currentRiskScore: 89,
    currentRiskLevel: "critical",
    lastActivity: "5 min ago",
    alertCount: 28,
    addedAt: "2024-12-01"
  },
]

const riskColors = {
  low: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400" },
  medium: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400" },
  high: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400" },
  critical: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400" }
}

const blockchains = ["Ethereum", "Bitcoin", "Polygon", "Arbitrum", "BSC", "Solana", "Avalanche"]

export default function WatchlistPage() {
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialWatchlist)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | WatchlistStatus>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null)
  
  // New item form state
  const [newAddress, setNewAddress] = useState("")
  const [newBlockchain, setNewBlockchain] = useState("Ethereum")
  const [newNotes, setNewNotes] = useState("")
  const [newRiskThreshold, setNewRiskThreshold] = useState([50])
  const [newAlertIncoming, setNewAlertIncoming] = useState(true)
  const [newAlertOutgoing, setNewAlertOutgoing] = useState(true)
  const [newMinTxSize, setNewMinTxSize] = useState("1000")

  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddWallet = () => {
    if (!newAddress.trim()) {
      toast.error("Please enter a wallet address")
      return
    }

    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      address: newAddress,
      blockchain: newBlockchain,
      notes: newNotes,
      riskThreshold: newRiskThreshold[0],
      alertIncoming: newAlertIncoming,
      alertOutgoing: newAlertOutgoing,
      minTxSize: parseInt(newMinTxSize) || 0,
      status: "active",
      currentRiskScore: Math.floor(Math.random() * 100),
      currentRiskLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as RiskLevel,
      lastActivity: "Just now",
      alertCount: 0,
      addedAt: new Date().toISOString().split("T")[0]
    }

    setWatchlist(prev => [newItem, ...prev])
    setIsAddDialogOpen(false)
    resetForm()
    toast.success("Wallet added to watchlist")
  }

  const handleUpdateWallet = () => {
    if (!editingItem) return

    setWatchlist(prev => prev.map(item => 
      item.id === editingItem.id ? {
        ...editingItem,
        riskThreshold: newRiskThreshold[0],
        alertIncoming: newAlertIncoming,
        alertOutgoing: newAlertOutgoing,
        minTxSize: parseInt(newMinTxSize) || 0,
        notes: newNotes
      } : item
    ))
    setEditingItem(null)
    resetForm()
    toast.success("Watchlist settings updated")
  }

  const handleToggleStatus = (id: string) => {
    setWatchlist(prev => prev.map(item => 
      item.id === id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item
    ))
    toast.success("Monitoring status updated")
  }

  const handleRemove = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id))
    toast.success("Wallet removed from watchlist")
  }

  const startEditing = (item: WatchlistItem) => {
    setEditingItem(item)
    setNewNotes(item.notes)
    setNewRiskThreshold([item.riskThreshold])
    setNewAlertIncoming(item.alertIncoming)
    setNewAlertOutgoing(item.alertOutgoing)
    setNewMinTxSize(item.minTxSize.toString())
  }

  const resetForm = () => {
    setNewAddress("")
    setNewBlockchain("Ethereum")
    setNewNotes("")
    setNewRiskThreshold([50])
    setNewAlertIncoming(true)
    setNewAlertOutgoing(true)
    setNewMinTxSize("1000")
  }

  const activeCount = watchlist.filter(w => w.status === "active").length
  const totalAlerts = watchlist.reduce((sum, w) => sum + w.alertCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
              Watchlist
            </h1>
            <p className="text-gray-400 mt-2">Monitor wallets and receive real-time alerts</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066]">
                <Plus className="w-4 h-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-yellow-500/50 shadow-[0_0_60px_#ffd70033]">
              <DialogHeader>
                <DialogTitle className="text-yellow-300">Add Wallet to Watchlist</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Configure monitoring settings for the wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="bg-black/60 border-yellow-500/30 focus:border-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Blockchain</Label>
                  <Select value={newBlockchain} onValueChange={setNewBlockchain}>
                    <SelectTrigger className="bg-black/60 border-yellow-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-500/30">
                      {blockchains.map(chain => (
                        <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Notes</Label>
                  <Textarea
                    placeholder="Add notes about this wallet..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="bg-black/60 border-yellow-500/30 focus:border-yellow-500 min-h-[80px]"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Risk Threshold for Alerts</Label>
                    <span className="text-yellow-400 font-semibold">{newRiskThreshold[0]}</span>
                  </div>
                  <Slider
                    value={newRiskThreshold}
                    onValueChange={setNewRiskThreshold}
                    max={100}
                    step={5}
                    className="[&>[data-orientation=horizontal]]:bg-yellow-500/30 [&_[role=slider]]:bg-yellow-500 [&_[role=slider]]:border-yellow-400"
                  />
                  <p className="text-xs text-gray-500">Alert when risk score exceeds this threshold</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Minimum Transaction Size ($)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={newMinTxSize}
                    onChange={(e) => setNewMinTxSize(e.target.value)}
                    className="bg-black/60 border-yellow-500/30 focus:border-yellow-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Alert on Incoming</Label>
                  <Switch
                    checked={newAlertIncoming}
                    onCheckedChange={setNewAlertIncoming}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Alert on Outgoing</Label>
                  <Switch
                    checked={newAlertOutgoing}
                    onCheckedChange={setNewAlertOutgoing}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddWallet} className="bg-yellow-500 text-black hover:bg-yellow-400">
                  Add to Watchlist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total Wallets</p>
                  <p className="text-2xl font-bold text-yellow-300">{watchlist.length}</p>
                </div>
                <Wallet className="w-8 h-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Active Monitoring</p>
                  <p className="text-2xl font-bold text-green-400">{activeCount}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total Alerts</p>
                  <p className="text-2xl font-bold text-orange-400">{totalAlerts}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">High Risk</p>
                  <p className="text-2xl font-bold text-red-400">
                    {watchlist.filter(w => w.currentRiskLevel === "high" || w.currentRiskLevel === "critical").length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by address or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[160px] bg-black/40 border-yellow-500/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-yellow-500/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Watchlist Table */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-300">Monitored Wallets</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredWatchlist.length} wallet{filteredWatchlist.length !== 1 ? "s" : ""} in watchlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredWatchlist.length === 0 ? (
                <div className="py-12 text-center">
                  <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No wallets found</p>
                  <p className="text-sm text-gray-500 mt-1">Add a wallet to start monitoring</p>
                </div>
              ) : (
                filteredWatchlist.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${item.status === "active" ? "border-yellow-500/30 bg-black/40" : "border-gray-700/30 bg-black/20 opacity-70"} hover:border-yellow-500/50 transition-all`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Address & Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm text-yellow-300 truncate">
                            {item.address.slice(0, 10)}...{item.address.slice(-8)}
                          </code>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                            {item.blockchain}
                          </Badge>
                          <Badge className={`${riskColors[item.currentRiskLevel].bg} ${riskColors[item.currentRiskLevel].text} ${riskColors[item.currentRiskLevel].border} text-xs`}>
                            Score: {item.currentRiskScore}
                          </Badge>
                          {item.status === "active" ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                              <Activity className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-xs">
                              <Pause className="w-3 h-3 mr-1" />
                              Paused
                            </Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-400 truncate">{item.notes}</p>
                        )}
                      </div>

                      {/* Alert Config */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Threshold: {item.riskThreshold}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.alertIncoming && <span className="text-green-400">↓IN</span>}
                          {item.alertOutgoing && <span className="text-orange-400">↑OUT</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.lastActivity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          <span>{item.alertCount} alerts</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/scanner?address=${item.address}`)}
                          className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/graph?address=${item.address}`)}
                          className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
                        >
                          <Network className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-black border-yellow-500/30">
                            <DropdownMenuItem onClick={() => startEditing(item)} className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item.id)} className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20">
                              {item.status === "active" ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause Monitoring
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Resume Monitoring
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRemove(item.id)} className="text-red-400 focus:text-red-300 focus:bg-red-500/20">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="bg-black/95 border-yellow-500/50 shadow-[0_0_60px_#ffd70033]">
            <DialogHeader>
              <DialogTitle className="text-yellow-300">Edit Watchlist Settings</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update monitoring configuration for {editingItem?.address.slice(0, 10)}...
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 focus:border-yellow-500 min-h-[80px]"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Risk Threshold</Label>
                  <span className="text-yellow-400 font-semibold">{newRiskThreshold[0]}</span>
                </div>
                <Slider
                  value={newRiskThreshold}
                  onValueChange={setNewRiskThreshold}
                  max={100}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Minimum Transaction Size ($)</Label>
                <Input
                  type="number"
                  value={newMinTxSize}
                  onChange={(e) => setNewMinTxSize(e.target.value)}
                  className="bg-black/60 border-yellow-500/30 focus:border-yellow-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Alert on Incoming</Label>
                <Switch
                  checked={newAlertIncoming}
                  onCheckedChange={setNewAlertIncoming}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Alert on Outgoing</Label>
                <Switch
                  checked={newAlertOutgoing}
                  onCheckedChange={setNewAlertOutgoing}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleUpdateWallet} className="bg-yellow-500 text-black hover:bg-yellow-400">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  )
}
