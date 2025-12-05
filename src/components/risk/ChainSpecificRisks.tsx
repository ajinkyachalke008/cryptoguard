"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle,
  ChevronRight,
  Info
} from "lucide-react"

export interface ChainSpecificRiskData {
  chain: string
  top_red_flags: {
    flag: string
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    contributing_txs?: number
    description?: string
  }[]
}

interface ChainSpecificRisksProps {
  data: ChainSpecificRiskData[]
  onFlagClick?: (chain: string, flag: string) => void
}

const chainIcons: Record<string, string> = {
  Ethereum: "Ξ",
  Bitcoin: "₿",
  BSC: "BNB",
  Polygon: "MATIC",
  Solana: "SOL",
  Arbitrum: "ARB",
  Avalanche: "AVAX",
  Base: "BASE"
}

const chainColors: Record<string, { bg: string; border: string; text: string }> = {
  Ethereum: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400" },
  Bitcoin: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400" },
  BSC: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400" },
  Polygon: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400" },
  Solana: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400" },
  Arbitrum: { bg: "bg-blue-600/20", border: "border-blue-600/50", text: "text-blue-300" },
  Avalanche: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400" },
  Base: { bg: "bg-blue-400/20", border: "border-blue-400/50", text: "text-blue-300" }
}

const severityColors = {
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/50"
}

export function ChainSpecificRisks({ data, onFlagClick }: ChainSpecificRisksProps) {
  return (
    <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_#ffd70022]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-foreground">Chain-Specific Red Flags</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Top risk indicators per blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((chainData, idx) => {
          const colors = chainColors[chainData.chain] || { bg: "bg-gray-500/20", border: "border-gray-500/50", text: "text-gray-400" }
          const icon = chainIcons[chainData.chain] || chainData.chain.charAt(0)

          return (
            <div key={idx} className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-lg font-bold ${colors.text}`}>{icon}</span>
                <span className="font-medium text-gray-200">{chainData.chain}</span>
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 ml-auto">
                  {chainData.top_red_flags.length} flags
                </Badge>
              </div>

              {chainData.top_red_flags.length === 0 ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Info className="w-4 h-4" />
                  No significant red flags detected
                </div>
              ) : (
                <div className="space-y-2">
                  {chainData.top_red_flags.map((flag, flagIdx) => (
                    <div 
                      key={flagIdx}
                      className="flex items-start gap-3 p-2 rounded bg-black/30 group cursor-pointer hover:bg-black/50 transition-colors"
                      onClick={() => onFlagClick?.(chainData.chain, flag.flag)}
                    >
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        flag.severity === "CRITICAL" ? "text-red-400" :
                        flag.severity === "HIGH" ? "text-orange-400" :
                        flag.severity === "MEDIUM" ? "text-yellow-400" : "text-blue-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-200">{flag.flag}</span>
                          <Badge className={`text-[10px] border ${severityColors[flag.severity]}`}>
                            {flag.severity}
                          </Badge>
                        </div>
                        {flag.description && (
                          <p className="text-xs text-gray-500">{flag.description}</p>
                        )}
                        {flag.contributing_txs && (
                          <p className="text-xs text-gray-500 mt-1">
                            {flag.contributing_txs} contributing transactions
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {data.length === 0 && (
          <div className="py-8 text-center">
            <Info className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No chain-specific risk data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
