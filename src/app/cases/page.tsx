"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  FolderArchive,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  ArrowRight,
  Filter,
  Loader2,
  FileText,
  Activity,
  History,
  Wallet,
  Network,
  ScanSearch,
  Download,
  Copy,
  ExternalLink,
  ShieldAlert
} from "lucide-react"
import { toast } from "sonner"

interface Case {
  id: number
  title: string
  description: string | null
  status: "open" | "in_progress" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  open: { label: "Open", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  in_progress: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
  closed: { label: "Closed", color: "bg-green-500/20 text-green-400 border-green-500/50" }
}

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-500/20 text-gray-400" },
  medium: { label: "Medium", color: "bg-blue-500/20 text-blue-400" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400" },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-400" }
}

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCase, setNewCase] = useState({ title: "", description: "", priority: "medium" })
  const [isCreating, setIsCreating] = useState(false)

  // Case Detail Modal States
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [selectedCaseItems, setSelectedCaseItems] = useState<any[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [newEvidence, setNewEvidence] = useState({ itemType: "wallet", itemId: "" })
  const [isAddingEvidence, setIsAddingEvidence] = useState(false)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/cases")
      if (!response.ok) throw new Error("Failed to fetch cases")
      const data = await response.json()
      setCases(data.cases || [])
    } catch (error) {
      toast.error("Failed to load cases")
    } finally {
      setIsLoading(false)
    }
  }

  const openCaseDetail = async (caseObj: Case) => {
    setSelectedCase(caseObj)
    setIsDetailOpen(true)
    setIsDetailLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseObj.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.case) setSelectedCase(data.case)
        if (data.items) setSelectedCaseItems(data.items)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: "open" | "in_progress" | "closed") => {
    if (!selectedCase) return
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedCase(data.case)
        setCases(prev => prev.map(c => c.id === selectedCase.id ? data.case : c))
        toast.success(`Case status set to ${newStatus.replace('_', ' ').toUpperCase()}`)
      }
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleUpdatePriority = async (newPriority: "low" | "medium" | "high" | "critical") => {
    if (!selectedCase) return
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority })
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedCase(data.case)
        setCases(prev => prev.map(c => c.id === selectedCase.id ? data.case : c))
        toast.success(`Case priority set to ${newPriority.toUpperCase()}`)
      }
    } catch (err) {
      toast.error("Failed to update priority")
    }
  }

  const handleAddEvidence = async () => {
    if (!selectedCase || !newEvidence.itemId.trim()) {
      toast.error("Please enter a valid wallet address or transaction hash")
      return
    }
    setIsAddingEvidence(true)
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: newEvidence.itemType,
          itemId: newEvidence.itemId.trim()
        })
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedCaseItems(prev => [data.item, ...prev])
        setNewEvidence({ itemType: "wallet", itemId: "" })
        toast.success("Evidence item linked to case")
      }
    } catch (err) {
      toast.error("Failed to link evidence item")
    } finally {
      setIsAddingEvidence(false)
    }
  }

  const handleCreateCase = async () => {
    if (!newCase.title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase)
      })

      if (!response.ok) throw new Error("Failed to create case")
      
      const data = await response.json()
      setCases(prev => [data.case, ...prev])
      setIsCreateDialogOpen(false)
      setNewCase({ title: "", description: "", priority: "medium" })
      toast.success("Investigation case created successfully")
    } catch (error) {
      toast.error("Failed to create case")
    } finally {
      setIsCreating(false)
    }
  }

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FolderArchive className="size-8 text-yellow-400" />
              <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
                Case Management
              </h1>
            </div>
            <p className="text-gray-400">Manage and track your fraud investigations</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066]">
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-yellow-500/50">
              <DialogHeader>
                <DialogTitle className="text-yellow-300">Create Investigation Case</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Group related scans and alerts into a single case for tracking.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Case Title</label>
                  <Input
                    placeholder="e.g., Suspicious activity on 0x742d..."
                    value={newCase.title}
                    onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                  <Input
                    placeholder="Provide details about the investigation..."
                    value={newCase.description}
                    onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Priority</label>
                  <Select 
                    value={newCase.priority} 
                    onValueChange={(v) => setNewCase(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger className="bg-black/40 border-yellow-500/30">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-500/30">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCase} 
                  disabled={isCreating}
                  className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Case"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-yellow-300">{cases.length}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-400">Open Cases</p>
              <p className="text-2xl font-bold text-blue-400">{cases.filter(c => c.status === "open").length}</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">{cases.filter(c => c.status === "in_progress").length}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-400">High/Critical</p>
              <p className="text-2xl font-bold text-red-400">{cases.filter(c => c.priority === "high" || c.priority === "critical").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search cases by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                />
              </div>
              <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                  <FolderArchive className="w-10 h-10 text-yellow-500/50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No cases found</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Start an investigation by creating your first case.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-yellow-500 text-black">
                  Create First Case
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((c) => (
              <Card 
                key={c.id} 
                className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all cursor-pointer group"
                onClick={() => openCaseDetail(c)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 font-mono">CASE-{c.id.toString().padStart(4, '0')}</span>
                        <Badge className={`${statusConfig[c.status].color} text-[10px]`}>
                          {statusConfig[c.status].label}
                        </Badge>
                        <Badge className={`${priorityConfig[c.priority].color} border-none text-[10px]`}>
                          {priorityConfig[c.priority].label} Priority
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-yellow-300 group-hover:text-yellow-200 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {c.description || "No description provided."}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3" />
                          Updated: {new Date(c.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2 mr-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-yellow-500/20 flex items-center justify-center text-[10px] text-yellow-300">
                            ID
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">
                          +2
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-yellow-300 hover:bg-yellow-500/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          openCaseDetail(c)
                        }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Case Detail & Evidence Management Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto bg-black/95 border-yellow-500/50 text-white shadow-[0_0_50px_rgba(255,215,0,0.15)]">
          {selectedCase && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-yellow-500/20 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                      CASE-{selectedCase.id.toString().padStart(4, "0")}
                    </span>
                    <Badge className={`${statusConfig[selectedCase.status].color} text-xs`}>
                      {statusConfig[selectedCase.status].label}
                    </Badge>
                    <Badge className={`${priorityConfig[selectedCase.priority].color} border-none text-xs`}>
                      {priorityConfig[selectedCase.priority].label} Priority
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span>Created: {new Date(selectedCase.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(selectedCase.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
                  {selectedCase.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  {selectedCase.description || "Active fraud investigation dossier and linked forensic artifacts."}
                </DialogDescription>
              </div>

              {/* Status and Priority Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-500/5 p-4 rounded-lg border border-yellow-500/20">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Investigation Lifecycle Status</label>
                  <Select
                    value={selectedCase.status}
                    onValueChange={(val: any) => handleUpdateStatus(val)}
                  >
                    <SelectTrigger className="bg-black/60 border-yellow-500/40 text-white">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-500/50">
                      <SelectItem value="open">Open (Initial Discovery)</SelectItem>
                      <SelectItem value="in_progress">In Progress (Active Tracing)</SelectItem>
                      <SelectItem value="closed">Closed (Report Filed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Threat / Priority Level</label>
                  <Select
                    value={selectedCase.priority}
                    onValueChange={(val: any) => handleUpdatePriority(val)}
                  >
                    <SelectTrigger className="bg-black/60 border-yellow-500/40 text-white">
                      <SelectValue placeholder="Update Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-500/50">
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Threat</SelectItem>
                      <SelectItem value="critical">Critical Threat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linked Evidence Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-lg font-semibold text-gray-200">
                      Linked Evidence & Targets ({selectedCaseItems.length})
                    </h4>
                  </div>
                </div>

                {isDetailLoading ? (
                  <div className="py-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-yellow-500 mb-2" />
                    Loading linked forensic items...
                  </div>
                ) : selectedCaseItems.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-gray-800 rounded-lg text-gray-500 text-sm">
                    No wallet addresses or transactions linked to this case yet. Add one below to begin cross-module forensics.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCaseItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-lg bg-black/60 border border-yellow-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-yellow-500/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded bg-yellow-500/10 text-yellow-400 shrink-0">
                            {item.itemType === "wallet" ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 uppercase">
                                {item.itemType}
                              </span>
                              <span className="text-xs text-gray-500">
                                Linked {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-mono text-xs text-yellow-300 truncate mt-0.5">
                              {item.itemId}
                            </p>
                          </div>
                        </div>

                        {/* Direct Forensics Pivots */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-gray-300"
                            onClick={() => {
                              navigator.clipboard.writeText(String(item.itemId))
                              toast.success("Identifier copied to clipboard")
                            }}
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 text-cyan-400"
                            onClick={() => router.push(`/graph?address=${encodeURIComponent(item.itemId)}`)}
                          >
                            <Network className="w-3.5 h-3.5 mr-1" />
                            Graph
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400"
                            onClick={() => router.push(`/wallet-scan?address=${encodeURIComponent(item.itemId)}`)}
                          >
                            <ScanSearch className="w-3.5 h-3.5 mr-1" />
                            Scan
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400"
                            onClick={() => router.push(`/reports?address=${encodeURIComponent(item.itemId)}`)}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            Dossier
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Evidence Item */}
                <div className="mt-4 p-4 rounded-lg bg-gray-950/80 border border-yellow-500/30 space-y-3">
                  <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-yellow-400" />
                    Attach New Forensic Target or Evidence
                  </h5>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={newEvidence.itemType}
                      onValueChange={(val) => setNewEvidence(prev => ({ ...prev, itemType: val }))}
                    >
                      <SelectTrigger className="w-full sm:w-36 bg-black/60 border-yellow-500/40 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-yellow-500/50 text-xs">
                        <SelectItem value="wallet">Wallet Address</SelectItem>
                        <SelectItem value="transaction">Transaction Hash</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={newEvidence.itemType === "wallet" ? "0x... target wallet address" : "0x... transaction hash"}
                      value={newEvidence.itemId}
                      onChange={(e) => setNewEvidence(prev => ({ ...prev, itemId: e.target.value }))}
                      className="flex-1 bg-black/60 border-yellow-500/40 text-xs font-mono"
                    />
                    <Button
                      onClick={handleAddEvidence}
                      disabled={isAddingEvidence || !newEvidence.itemId.trim()}
                      className="bg-yellow-500 text-black hover:bg-yellow-400 text-xs font-semibold shrink-0"
                    >
                      {isAddingEvidence ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 mr-1" />
                      )}
                      Attach
                    </Button>
                  </div>
                </div>
              </div>

              {/* Direct Download Dossier */}
              <div className="pt-4 border-t border-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Export law-enforcement ready forensic dossier with cryptographic proof chains.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                    onClick={() => {
                      window.open(`/api/reports/1/download?format=pdf`, "_blank")
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download Executive PDF
                  </Button>
                  <Button
                    className="bg-yellow-500 text-black hover:bg-yellow-400 text-xs font-semibold"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  )
}
