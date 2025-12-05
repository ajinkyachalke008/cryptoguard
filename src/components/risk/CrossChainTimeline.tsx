"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GitBranch,
  ArrowRight,
  Wallet,
  Building2,
  Shuffle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign
} from "lucide-react"

export type HopType = "WALLET" | "BRIDGE" | "DEX" | "CEX" | "MIXER" | "SCAM_POOL" | "CONTRACT" | "NFT_MARKETPLACE"

export interface FlowHop {
  hop_type: HopType
  chain: string
  address: string
  description: string
  tx_hash?: string
  timestamp?: string
  amount?: number
  risk_tags?: string[]
}

export interface CrossChainFlowData {
  case_id: string
  title?: string
  flow: FlowHop[]
  total_value_usd?: number
  risk_summary?: string
}

interface CrossChainTimelineProps {
  data: CrossChainFlowData
  onAddressClick?: (address: string) => void
}

const hopConfig: Record<HopType, { icon: typeof Wallet; color: string; bgColor: string; borderColor: string }> = {
  WALLET: { icon: Wallet, color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/50" },
  BRIDGE: { icon: GitBranch, color: "text-purple-400", bgColor: "bg-purple-500/20", borderColor: "border-purple-500/50" },
  DEX: { icon: Shuffle, color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/50" },
  CEX: { icon: Building2, color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/50" },
  MIXER: { icon: Shuffle, color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/50" },
  SCAM_POOL: { icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/50" },
  CONTRACT: { icon: Building2, color: "text-gray-400", bgColor: "bg-gray-500/20", borderColor: "border-gray-500/50" },
  NFT_MARKETPLACE: { icon: Building2, color: "text-pink-400", bgColor: "bg-pink-500/20", borderColor: "border-pink-500/50" }
}

const chainColors: Record<string, string> = {
  Ethereum: "bg-blue-500/30 text-blue-300 border-blue-500/50",
  Bitcoin: "bg-orange-500/30 text-orange-300 border-orange-500/50",
  BSC: "bg-yellow-500/30 text-yellow-300 border-yellow-500/50",
  Polygon: "bg-purple-500/30 text-purple-300 border-purple-500/50",
  Solana: "bg-purple-500/30 text-purple-300 border-purple-500/50",
  Arbitrum: "bg-blue-600/30 text-blue-200 border-blue-600/50",
  Avalanche: "bg-red-500/30 text-red-300 border-red-500/50"
}

export function CrossChainTimeline({ data, onAddressClick }: CrossChainTimelineProps) {
  const [expandedHops, setExpandedHops] = useState<Set<number>>(new Set())

  const toggleHop = (index: number) => {
    const newExpanded = new Set(expandedHops)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedHops(newExpanded)
  }

  return (
    <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_#ffd70022]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-yellow-400" />
              <span className="text-foreground">Cross-Chain Transaction Flow</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              {data.title || `Case: ${data.case_id}`}
            </CardDescription>
          </div>
          {data.total_value_usd && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-yellow-300">
                ${data.total_value_usd.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        {data.risk_summary && (
          <div className="mt-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
              <p className="text-sm text-orange-300">{data.risk_summary}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/50 via-yellow-500/30 to-yellow-500/10" />

          {/* Timeline Items */}
          <div className="space-y-4">
            {data.flow.map((hop, index) => {
              const config = hopConfig[hop.hop_type]
              const HopIcon = config.icon
              const isExpanded = expandedHops.has(index)
              const isLast = index === data.flow.length - 1
              const chainColor = chainColors[hop.chain] || "bg-gray-500/30 text-gray-300 border-gray-500/50"

              return (
                <div key={index} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center`}>
                    <HopIcon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${chainColor} border text-xs`}>
                            {hop.chain}
                          </Badge>
                          <Badge variant="outline" className={`${config.color} border-current text-xs`}>
                            {hop.hop_type.replace("_", " ")}
                          </Badge>
                          {hop.risk_tags?.map((tag, tagIdx) => (
                            <Badge key={tagIdx} className="bg-red-500/20 text-red-400 border-red-500/50 border text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-200 mb-2">{hop.description}</p>
                        <code 
                          className="text-xs text-yellow-300/80 bg-black/40 px-2 py-1 rounded cursor-pointer hover:bg-black/60"
                          onClick={() => onAddressClick?.(hop.address)}
                        >
                          {hop.address}
                        </code>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHop(index)}
                        className="text-gray-400 hover:text-yellow-300"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-700 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                          {hop.timestamp && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                              <p className="text-sm text-gray-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {hop.timestamp}
                              </p>
                            </div>
                          )}
                          {hop.amount && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Amount</p>
                              <p className="text-sm text-yellow-300 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${hop.amount.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {hop.tx_hash && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-gray-400 bg-black/40 px-2 py-1 rounded flex-1 truncate">
                                  {hop.tx_hash}
                                </code>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300 h-6 px-2">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow to next */}
                  {!isLast && (
                    <div className="absolute left-6 -translate-x-1/2 top-full mt-1">
                      <ArrowRight className="w-4 h-4 text-yellow-500/50 rotate-90" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
