"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  FileText,
  Table as TableIcon,
  Wallet,
  Bell,
  Network,
  Eye,
  Calendar,
  Clock,
  Check,
  Loader2,
  FileSpreadsheet,
  FileType,
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  ArrowRightLeft,
  Search
} from "lucide-react"
import { toast } from "sonner"

type ReportType = "wallet" | "alerts" | "transactions" | "watchlist"
type ExportFormat = "pdf" | "excel" | "csv"

interface ReportConfig {
  type: ReportType
  format: ExportFormat
  address?: string
  dateRange: string
  includeGraph: boolean
  includeTransactions: boolean
  includeAlerts: boolean
  includeRiskFactors: boolean
}

interface GeneratedReport {
  id: string
  reportType: string
  entityAddress: string
  blockchain: string
  createdAt: string
  reportData?: any
}

const reportTypeConfig: Record<string, any> = {
  wallet: {
    label: "Single Wallet Report",
    icon: Wallet,
    description: "Comprehensive analysis of a single wallet including risk score, transactions, and connections",
    color: "text-yellow-400",
    sections: [
      "Header (address, chain, timestamp)",
      "Risk summary & score breakdown",
      "Key activity statistics",
      "Factors affecting risk score",
      "Suspicious alerts & patterns",
      "Transaction tables",
      "Graph visualization snapshot (optional)"
    ]
  },
  alerts: {
    label: "Alerts Report",
    icon: Bell,
    description: "Export all alerts with filtering by severity, status, and date range",
    color: "text-orange-400",
    sections: [
      "Summary statistics",
      "Alerts by severity",
      "Alerts by status",
      "Detailed alert list",
      "Triggering rules breakdown"
    ]
  },
  transactions: {
    label: "Transaction Dataset",
    icon: ArrowRightLeft,
    description: "Raw transaction data export for further analysis",
    color: "text-green-400",
    sections: [
      "Transaction hash",
      "From/To addresses",
      "Amount & asset",
      "Timestamp",
      "Risk classification",
      "Related alerts"
    ]
  },
  watchlist: {
    label: "Watchlist Snapshot",
    icon: Eye,
    description: "Current state of all monitored wallets with settings and stats",
    color: "text-blue-400",
    sections: [
      "Overview summary",
      "Wallet addresses & chains",
      "Monitoring settings",
      "Current risk scores",
      "Alert history",
      "Notes"
    ]
  }
}

const formatConfig: Record<string, any> = {
  pdf: { label: "PDF Document", icon: FileText, extension: ".pdf" },
  excel: { label: "Excel Spreadsheet", icon: FileSpreadsheet, extension: ".xlsx" },
  csv: { label: "CSV File", icon: TableIcon, extension: ".csv" }
}

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<ReportType>("wallet")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<GeneratedReport[]>([])
  
  const [config, setConfig] = useState<ReportConfig>({
    type: "wallet",
    format: "pdf",
    address: "",
    dateRange: "7d",
    includeGraph: true,
    includeTransactions: true,
    includeAlerts: true,
    includeRiskFactors: true
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (!response.ok) throw new Error("Failed to fetch reports")
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error("Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize from URL params
  useEffect(() => {
    const address = searchParams.get("address")
    const type = searchParams.get("type") as ReportType | null
    
    if (address) {
      setConfig(prev => ({ ...prev, address }))
    }
    if (type && reportTypeConfig[type]) {
      setActiveTab(type)
      setConfig(prev => ({ ...prev, type }))
    }
  }, [searchParams])

  const handleGenerate = async () => {
    if (config.type === "wallet" && !config.address?.trim()) {
      toast.error("Please enter a wallet address")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_address: config.address || "SYSTEM_GEN",
          blockchain: "ethereum",
          report_type: config.type
        })
      })

      if (!response.ok) throw new Error("Report generation failed")
      
      const newReport = await response.json()
      setReports(prev => [newReport, ...prev])
      toast.success("Report generated successfully!")
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (report: GeneratedReport) => {
    try {
      const response = await fetch(`/api/reports/${report.id}/download?format=${config.format}`)
      if (!response.ok) throw new Error("Download failed")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${report.id}.${config.format}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Downloading report...`)
    } catch (error) {
      toast.error("Download failed")
    }
  }

  const TypeIcon = reportTypeConfig[activeTab]?.icon || FileText
  const FormatIcon = formatConfig[config.format]?.icon || FileText

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Reports & Exports
          </h1>
          <p className="text-gray-400 mt-2">Generate comprehensive reports and export data for investigations</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Report Builder */}
          <div className="space-y-6">
            {/* Report Type Selection */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Report Type</CardTitle>
                <CardDescription className="text-gray-400">Select the type of report to generate</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => {
                  setActiveTab(v as ReportType)
                  setConfig(prev => ({ ...prev, type: v as ReportType }))
                }}>
                  <TabsList className="grid grid-cols-4 bg-black/40">
                    {(Object.keys(reportTypeConfig) as ReportType[]).map(type => {
                      const Icon = reportTypeConfig[type].icon
                      return (
                        <TabsTrigger
                          key={type}
                          value={type}
                          className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {(Object.keys(reportTypeConfig) as ReportType[]).map(type => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <div className="p-4 rounded-lg bg-black/40 border border-yellow-500/20">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center ${reportTypeConfig[type].color}`}>
                            {(() => {
                              const Icon = reportTypeConfig[type].icon
                              return <Icon className="w-5 h-5" />
                            })()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-200">{reportTypeConfig[type].label}</h3>
                            <p className="text-sm text-gray-400 mt-1">{reportTypeConfig[type].description}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-2">Included sections:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {reportTypeConfig[type].sections.map((section: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                <Check className="w-3 h-3 text-green-500" />
                                {section}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Configuration</CardTitle>
                <CardDescription className="text-gray-400">Customize your report options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Address (for wallet reports) */}
                {activeTab === "wallet" && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Wallet Address</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500/70" />
                      <Input
                        placeholder="0x..."
                        value={config.address}
                        onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10 bg-black/40 border-yellow-500/30 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Date Range</Label>
                  <Select value={config.dateRange} onValueChange={(v) => setConfig(prev => ({ ...prev, dateRange: v }))}>
                    <SelectTrigger className="bg-black/40 border-yellow-500/30">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-500/30">
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Export Format</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(formatConfig) as ExportFormat[]).map(format => {
                      const Icon = formatConfig[format].icon
                      const isSelected = config.format === format
                      return (
                        <button
                          key={format}
                          onClick={() => setConfig(prev => ({ ...prev, format }))}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                            isSelected 
                              ? "border-yellow-500 bg-yellow-500/20 text-yellow-300" 
                              : "border-yellow-500/30 bg-black/40 text-gray-400 hover:border-yellow-500/50"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-medium">{formatConfig[format].label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Include Options */}
                {(activeTab === "wallet" || activeTab === "alerts") && (
                  <div className="space-y-3">
                    <Label className="text-gray-300">Include in Report</Label>
                    <div className="space-y-2">
                      {activeTab === "wallet" && (
                        <>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="graph"
                              checked={config.includeGraph}
                              onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeGraph: !!v }))}
                            />
                            <label htmlFor="graph" className="text-sm text-gray-400">Graph visualization snapshot</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="riskFactors"
                              checked={config.includeRiskFactors}
                              onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeRiskFactors: !!v }))}
                            />
                            <label htmlFor="riskFactors" className="text-sm text-gray-400">Risk factor breakdown</label>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="transactions"
                          checked={config.includeTransactions}
                          onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeTransactions: !!v }))}
                        />
                        <label htmlFor="transactions" className="text-sm text-gray-400">Transaction history</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="alerts"
                          checked={config.includeAlerts}
                          onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeAlerts: !!v }))}
                        />
                        <label htmlFor="alerts" className="text-sm text-gray-400">Related alerts</label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-12 bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066] transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview & History */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center gap-2">
                  <TypeIcon className="w-5 h-5" />
                  Report Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-black/40 border border-yellow-500/20 space-y-4">
                  {/* Mock PDF preview */}
                  <div className="aspect-[8.5/11] bg-white/5 rounded-lg p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-yellow-500/30 pb-2">
                      <span className="text-yellow-400 font-bold">CRYPTOGUARD</span>
                      <span className="text-gray-500">Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    
                    <div className="text-center py-2">
                      <h4 className="text-yellow-300 font-semibold">{reportTypeConfig[activeTab]?.label || "Report"}</h4>
                      {config.address && (
                        <p className="text-gray-400 text-[10px] mt-1 font-mono">{config.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-black/40 rounded">
                        <p className="text-gray-500 text-[10px]">Risk Score</p>
                        <p className="text-orange-400 font-bold">72</p>
                      </div>
                      <div className="p-2 bg-black/40 rounded">
                        <p className="text-gray-500 text-[10px]">Risk Level</p>
                        <p className="text-orange-400 font-bold">HIGH</p>
                      </div>
                      <div className="p-2 bg-black/40 rounded">
                        <p className="text-gray-500 text-[10px]">Transactions</p>
                        <p className="text-gray-300 font-bold">234</p>
                      </div>
                      <div className="p-2 bg-black/40 rounded">
                        <p className="text-gray-500 text-[10px]">Volume</p>
                        <p className="text-gray-300 font-bold">$1.2M</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {reportTypeConfig[activeTab]?.sections.slice(0, 4).map((section: string, i: number) => (
                        <div key={i} className="h-2 bg-gray-700/50 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FormatIcon className="w-4 h-4" />
                      <span>{formatConfig[config.format]?.label}</span>
                    </div>
                    <span className="text-gray-500">~{activeTab === "transactions" ? "5.2" : "2.1"} MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Recent Reports</CardTitle>
                <CardDescription className="text-gray-400">Previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="size-6 text-yellow-500 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading history...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No reports found.</p>
                  ) : (
                    reports.slice(0, 5).map(report => {
                      const ReportIcon = reportTypeConfig[report.reportType]?.icon || FileText
                      return (
                        <div
                          key={report.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/20 bg-black/40 hover:border-yellow-500/40 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded flex items-center justify-center bg-yellow-500/10 ${reportTypeConfig[report.reportType]?.color || "text-gray-400"}`}>
                            <ReportIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">
                              {report.reportType === "wallet" ? `Wallet Scan: ${report.entityAddress.slice(0, 10)}...` : report.reportType.toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-500">{report.blockchain}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(report)}
                            className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
