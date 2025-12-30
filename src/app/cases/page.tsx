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
  History
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
                onClick={() => toast.info(`Viewing details for Case #${c.id}`)}
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
                      <Button variant="ghost" size="sm" className="text-yellow-300 hover:bg-yellow-500/20">
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
      <Footer />
    </div>
  )
}
