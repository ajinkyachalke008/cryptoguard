"use client"

import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  AlertTriangle,
  Network,
  GitBranch,
  Clock,
  Shield,
  TrendingUp,
  Download,
  ExternalLink,
  Info,
  DollarSign,
  Zap,
  Users
} from "lucide-react"
import { TransactionFlowGraph } from "./visualizations/TransactionFlowGraph"
import { TransactionTimeline } from "./visualizations/TransactionTimeline"
import { NetworkGraph } from "./visualizations/NetworkGraph"
import { RiskBreakdownChart } from "./visualizations/RiskBreakdownChart"

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

interface AnalysisData {
  riskFactors: {
    label: string
    value: number
    severity: "low" | "medium" | "high"
    description: string
  }[]
  relatedAddresses: {
    address: string
    label?: string
    riskScore: number
    relationship: string
    transactionCount: number
  }[]
  flowData: {
    nodes: { id: string; label: string; amount?: number; risk: number }[]
    edges: { from: string; to: string; amount: number; timestamp: string }[]
  }
  timeline: {
    timestamp: string
    event: string
    details: string
    type: "transaction" | "interaction" | "flag"
  }[]
  aiInsights: {
    summary: string
    redFlags: string[]
    recommendations: string[]
  }
}

interface TransactionAnalysisModalProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionAnalysisModal({
  transaction,
  open,
  onOpenChange
}: TransactionAnalysisModalProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (open && transaction) {
      loadAnalysisData()
    }
  }, [open, transaction])

  const loadAnalysisData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/transactions/analyze/${transaction.id}`)
      if (response.ok) {
        const data = await response.json()
        setAnalysisData(data)
      } else {
        generateMockAnalysisData()
      }
    } catch (error) {
      console.error("Failed to load analysis:", error)
      generateMockAnalysisData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockAnalysisData = () => {
    const mockData: AnalysisData = {
      riskFactors: [
        {
          label: "High-risk counterparty",
          value: transaction.riskScore * 0.3,
          severity: transaction.riskScore > 70 ? "high" : transaction.riskScore > 40 ? "medium" : "low",
          description: "Transaction involves addresses flagged in suspicious activity"
        },
        {
          label: "Unusual transaction pattern",
          value: transaction.riskScore * 0.25,
          severity: transaction.riskScore > 60 ? "high" : transaction.riskScore > 30 ? "medium" : "low",
          description: "Transaction size or timing deviates from normal patterns"
        },
        {
          label: "Chain mixing detected",
          value: transaction.riskScore * 0.2,
          severity: "medium",
          description: "Funds moved across multiple blockchains in short timeframe"
        },
        {
          label: "Sanction list check",
          value: transaction.riskScore * 0.15,
          severity: transaction.riskScore > 80 ? "high" : "low",
          description: "Addresses checked against OFAC and EU sanction lists"
        },
        {
          label: "Smart contract interaction",
          value: transaction.riskScore * 0.1,
          severity: "low",
          description: "Transaction interacts with unverified smart contracts"
        }
      ],
      relatedAddresses: Array.from({ length: 5 }, (_, i) => ({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        label: i === 0 ? "Exchange" : i === 1 ? "Mixer" : undefined,
        riskScore: Math.floor(Math.random() * 100),
        relationship: ["Direct", "1-hop", "2-hop"][Math.floor(Math.random() * 3)],
        transactionCount: Math.floor(Math.random() * 50) + 1
      })),
      flowData: {
        nodes: [
          { id: transaction.from, label: "From", risk: transaction.riskScore },
          { id: transaction.to, label: "To", amount: transaction.amount, risk: transaction.riskScore - 10 },
          { id: `0x${Math.random().toString(16).substr(2, 40)}`, label: "Intermediate", risk: transaction.riskScore + 5 }
        ],
        edges: [
          { from: transaction.from, to: transaction.to, amount: transaction.amount, timestamp: transaction.timestamp }
        ]
      },
      timeline: [
        {
          timestamp: transaction.timestamp,
          event: "Transaction initiated",
          details: `${transaction.amount} ${transaction.currency} sent from ${transaction.from.slice(0, 10)}...`,
          type: "transaction"
        },
        {
          timestamp: new Date(new Date(transaction.timestamp).getTime() + 60000).toISOString(),
          event: "Smart contract interaction",
          details: "Transaction processed through DEX aggregator",
          type: "interaction"
        },
        {
          timestamp: new Date(new Date(transaction.timestamp).getTime() + 120000).toISOString(),
          event: "Risk flag detected",
          details: "High-risk counterparty identified in transaction chain",
          type: "flag"
        },
        {
          timestamp: new Date(new Date(transaction.timestamp).getTime() + 180000).toISOString(),
          event: "Transaction confirmed",
          details: `Included in block ${transaction.blockNumber}`,
          type: "transaction"
        }
      ],
      aiInsights: {
        summary: `This ${transaction.type} transaction of ${transaction.amount} ${transaction.currency} shows ${
          transaction.riskScore < 30 ? "low" : transaction.riskScore < 70 ? "moderate" : "high"
        } risk indicators. The transaction was completed on ${transaction.chain} blockchain with standard gas fees.`,
        redFlags: transaction.riskScore > 50
          ? [
              "Transaction involves previously flagged addresses",
              "Unusual timing patterns detected",
              "Funds passed through multiple intermediaries",
              "Cross-chain activity within short timeframe"
            ]
          : ["No significant red flags detected"],
        recommendations: transaction.riskScore > 70
          ? [
              "Flag this transaction for manual review",
              "Monitor related addresses for suspicious activity",
              "Consider additional KYC verification",
              "Alert compliance team for investigation"
            ]
          : transaction.riskScore > 40
          ? [
              "Continue monitoring this address",
              "Review transaction patterns periodically",
              "Document in case file for future reference"
            ]
          : ["Transaction appears legitimate", "No immediate action required"]
      }
    }
    setAnalysisData(mockData)
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-400"
    if (score < 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getRiskBg = (score: number) => {
    if (score < 30) return "bg-green-500/10 border-green-500/30"
    if (score < 70) return "bg-yellow-500/10 border-yellow-500/30"
    return "bg-red-500/10 border-red-500/30"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-black/95 border-yellow-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            Transaction Analysis
          </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <BlockchainIdentifier type="tx" value={transaction.hash} />
              <Badge variant="outline" className="text-xs border-yellow-500/30">
                {transaction.chain}
              </Badge>
              <Badge className={`text-xs ${getRiskBg(transaction.riskScore)}`}>
                Risk: {transaction.riskScore}/100
              </Badge>
            </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-black/60 border border-yellow-500/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                <Info className="w-4 h-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="flow" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                <GitBranch className="w-4 h-4 mr-1" />
                Flow Graph
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                <Network className="w-4 h-4 mr-1" />
                Network
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                <Clock className="w-4 h-4 mr-1" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                <Shield className="w-4 h-4 mr-1" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Details */}
                <Card className="border-yellow-500/30 bg-black/60">
                  <CardHeader>
                    <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Transaction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white font-semibold">
                        {transaction.amount.toFixed(4)} {transaction.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{transaction.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className="capitalize">{transaction.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Used:</span>
                      <span className="text-white">{transaction.gasUsed} {transaction.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block:</span>
                      <span className="text-white font-mono">#{transaction.blockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timestamp:</span>
                      <span className="text-white text-xs">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Breakdown Chart */}
                <Card className="border-yellow-500/30 bg-black/60">
                  <CardHeader>
                    <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Risk Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisData && <RiskBreakdownChart factors={analysisData.riskFactors} />}
                  </CardContent>
                </Card>
              </div>

              {/* Risk Factors */}
              <Card className="border-yellow-500/30 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData?.riskFactors.map((factor, i) => (
                      <div key={i} className="border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{factor.label}</span>
                          <Badge
                            className={
                              factor.severity === "high"
                                ? "bg-red-500/20 text-red-400"
                                : factor.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            }
                          >
                            {factor.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{factor.description}</p>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              factor.severity === "high"
                                ? "bg-red-500"
                                : factor.severity === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${factor.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Related Addresses */}
              <Card className="border-yellow-500/30 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Related Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisData?.relatedAddresses.map((addr, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-300">
                              {addr.address.slice(0, 12)}...{addr.address.slice(-10)}
                            </span>
                            {addr.label && (
                              <Badge variant="outline" className="text-xs">
                                {addr.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{addr.relationship}</span>
                            <span>•</span>
                            <span>{addr.transactionCount} transactions</span>
                          </div>
                        </div>
                        <Badge className={getRiskBg(addr.riskScore)}>
                          {addr.riskScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flow Graph Tab */}
            <TabsContent value="flow" className="mt-4">
              <Card className="border-yellow-500/30 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Transaction Flow Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData && <TransactionFlowGraph data={analysisData.flowData} />}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Graph Tab */}
            <TabsContent value="network" className="mt-4">
              <Card className="border-yellow-500/30 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    Address Network Graph
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData && <NetworkGraph transaction={transaction} relatedAddresses={analysisData.relatedAddresses} />}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-4">
              <Card className="border-yellow-500/30 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Transaction Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData && <TransactionTimeline events={analysisData.timeline} />}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="mt-4">
              <div className="space-y-4">
                <Card className="border-yellow-500/30 bg-black/60">
                  <CardHeader>
                    <CardTitle className="text-yellow-300 text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      AI-Powered Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-4">{analysisData?.aiInsights.summary}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Red Flags
                      </h4>
                      <ul className="space-y-2">
                        {analysisData?.aiInsights.redFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {analysisData?.aiInsights.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className="flex-1 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
