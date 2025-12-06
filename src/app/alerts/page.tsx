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
  AlertTriangle,
  AlertOctagon,
  Bell,
  BellRing,
  Search,
  Filter,
  Eye,
  Network,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  ArrowUpRight,
  Flame,
  Zap,
  Shield,
  TrendingUp,
  Activity,
  RefreshCw,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

type AlertSeverity = "low" | "medium" | "high" | "critical"
type AlertStatus = "new" | "in_progress" | "resolved" | "dismissed"
type AlertType = "watchlist" | "pattern" | "risk_spike"

interface Alert {
  id: string
  severity: AlertSeverity
  type: AlertType
  status: AlertStatus
  wallet_address: string
  tx_hash?: string
  blockchain: string
  message: string
  description: string
  triggering_rule: string
  amount?: number
  timestamp: string
  detected_at: string
}

const severityConfig = {
  low: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400", icon: Bell, label: "Low" },
  medium: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400", icon: AlertTriangle, label: "Medium" },
  high: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400", icon: AlertOctagon, label: "High" },
  critical: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400", icon: Flame, label: "Critical" }
}

const statusConfig = {
  new: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", icon: BellRing, label: "New" },
  in_progress: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400", icon: Clock, label: "In Progress" },
  resolved: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400", icon: CheckCircle2, label: "Resolved" },
  dismissed: { bg: "bg-gray-500/20", border: "border-gray-500/50", text: "text-gray-400", icon: XCircle, label: "Dismissed" }
}

const typeConfig = {
  watchlist: { label: "Watchlist Triggered", icon: Eye },
  pattern: { label: "Suspicious Pattern", icon: Zap },
  risk_spike: { label: "Risk Score Spike", icon: TrendingUp }
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | AlertStatus>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | AlertType>("all")
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      if (!response.ok) {
        throw new Error("Failed to fetch alerts")
      }
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
      toast.error("Failed to load alerts")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter
    const matchesType = typeFilter === "all" || alert.type === typeFilter
    return matchesSearch && matchesSeverity && matchesStatus && matchesType
  })

  const handleUpdateStatus = async (alertId: string, newStatus: AlertStatus) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error("Failed to update alert")
      }

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      ))
      toast.success(`Alert status updated to ${statusConfig[newStatus].label}`)
    } catch (error) {
      console.error("Failed to update alert:", error)
      toast.error("Failed to update alert status")
    }
  }

  const criticalCount = alerts.filter(a => a.severity === "critical" && a.status !== "resolved" && a.status !== "dismissed").length
  const highCount = alerts.filter(a => a.severity === "high" && a.status !== "resolved" && a.status !== "dismissed").length
  const newCount = alerts.filter(a => a.status === "new").length
  const inProgressCount = alerts.filter(a => a.status === "in_progress").length

  const SeverityIcon = selectedAlert ? severityConfig[selectedAlert.severity].icon : Bell

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
              Alert Center
            </h1>
            <p className="text-gray-400 mt-2">Monitor and manage fraud detection alerts</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchAlerts}
            className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-red-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
                </div>
                <Flame className="w-8 h-8 text-red-500/50 animate-pulse" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">High Priority</p>
                  <p className="text-2xl font-bold text-orange-400">{highCount}</p>
                </div>
                <AlertOctagon className="w-8 h-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">New Alerts</p>
                  <p className="text-2xl font-bold text-purple-400">{newCount}</p>
                </div>
                <BellRing className="w-8 h-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/40 bg-black/60 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500/50" />
              </div>
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
                  placeholder="Search by ID, wallet, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                />
              </div>
              <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}>
                <SelectTrigger className="w-[140px] bg-black/40 border-yellow-500/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-black border-yellow-500/30">
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[140px] bg-black/40 border-yellow-500/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-yellow-500/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="w-[160px] bg-black/40 border-yellow-500/30">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-yellow-500/30">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="watchlist">Watchlist</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                  <SelectItem value="risk_spike">Risk Spike</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-300">Alerts</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="py-12 text-center">
                  <Shield className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                  <p className="text-gray-400">No alerts match your filters</p>
                  <p className="text-sm text-gray-500 mt-1">All clear or adjust your filter criteria</p>
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  const severity = severityConfig[alert.severity]
                  const status = statusConfig[alert.status]
                  const alertType = typeConfig[alert.type]
                  const SevIcon = severity.icon
                  const StatusIcon = status.icon
                  const TypeIcon = alertType.icon

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`p-4 rounded-lg border ${severity.border} ${alert.status === "resolved" || alert.status === "dismissed" ? "opacity-60" : ""} bg-black/40 hover:bg-black/60 cursor-pointer transition-all hover:shadow-lg`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Severity Icon */}
                        <div className={`w-10 h-10 rounded-full ${severity.bg} flex items-center justify-center flex-shrink-0`}>
                          <SevIcon className={`w-5 h-5 ${severity.text}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 font-mono">{alert.id}</span>
                            <Badge className={`${severity.bg} ${severity.text} ${severity.border} text-xs`}>
                              {severity.label}
                            </Badge>
                            <Badge className={`${status.bg} ${status.text} ${status.border} text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-xs">
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {alertType.label}
                            </Badge>
                          </div>
                          <p className={`font-medium ${severity.text}`}>{alert.message}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="font-mono">{alert.wallet_address.slice(0, 10)}...{alert.wallet_address.slice(-6)}</span>
                            <span>•</span>
                            <span>{alert.blockchain}</span>
                            {alert.amount && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-400">${alert.amount.toLocaleString()}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{new Date(alert.detected_at).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/scanner?address=${alert.wallet_address}`)
                            }}
                            className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/graph?address=${alert.wallet_address}`)
                            }}
                            className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
                          >
                            <Network className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-yellow-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-black border-yellow-500/30">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateStatus(alert.id, "in_progress")
                                }}
                                className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateStatus(alert.id, "resolved")
                                }}
                                className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateStatus(alert.id, "dismissed")
                                }}
                                className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Dismiss
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
          <DialogContent className="bg-black/95 border-yellow-500/50 shadow-[0_0_60px_#ffd70033] max-w-2xl">
            {selectedAlert && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${severityConfig[selectedAlert.severity].bg} flex items-center justify-center`}>
                      <SeverityIcon className={`w-5 h-5 ${severityConfig[selectedAlert.severity].text}`} />
                    </div>
                    <div>
                      <DialogTitle className={severityConfig[selectedAlert.severity].text}>
                        {selectedAlert.message}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Alert {selectedAlert.id} • {new Date(selectedAlert.detected_at).toLocaleString()}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${severityConfig[selectedAlert.severity].bg} ${severityConfig[selectedAlert.severity].text} ${severityConfig[selectedAlert.severity].border}`}>
                      {severityConfig[selectedAlert.severity].label} Severity
                    </Badge>
                    <Badge className={`${statusConfig[selectedAlert.status].bg} ${statusConfig[selectedAlert.status].text} ${statusConfig[selectedAlert.status].border}`}>
                      {statusConfig[selectedAlert.status].label}
                    </Badge>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                      {typeConfig[selectedAlert.type].label}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg bg-black/40 border border-yellow-500/20">
                    <p className="text-gray-300">{selectedAlert.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Wallet Address</p>
                      <code className="text-sm text-yellow-300">{selectedAlert.wallet_address}</code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Blockchain</p>
                      <p className="text-sm text-gray-300">{selectedAlert.blockchain}</p>
                    </div>
                    {selectedAlert.tx_hash && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Transaction Hash</p>
                        <code className="text-sm text-gray-300">{selectedAlert.tx_hash}</code>
                      </div>
                    )}
                    {selectedAlert.amount && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm text-yellow-400 font-semibold">${selectedAlert.amount.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-gray-500">Triggering Rule</p>
                      <p className="text-sm text-orange-400">{selectedAlert.triggering_rule}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() => {
                        router.push(`/scanner?address=${selectedAlert.wallet_address}`)
                        setSelectedAlert(null)
                      }}
                      className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Scan Wallet
                    </Button>
                    <Button
                      onClick={() => {
                        router.push(`/graph?address=${selectedAlert.wallet_address}`)
                        setSelectedAlert(null)
                      }}
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                    >
                      <Network className="w-4 h-4 mr-2" />
                      Graph Explorer
                    </Button>
                    <Button
                      onClick={() => router.push(`/reports?address=${selectedAlert.wallet_address}`)}
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    {selectedAlert.tx_hash && (
                      <Button variant="ghost" className="text-gray-400 hover:text-yellow-300">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAlert.id, "in_progress")}
                      className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      In Progress
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAlert.id, "resolved")}
                      className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Resolved
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAlert.id, "dismissed")}
                      className="flex-1 border-gray-500/50 text-gray-400 hover:bg-gray-500/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  )
}