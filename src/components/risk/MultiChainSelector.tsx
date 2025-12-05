"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react"

export type ChainType = "Ethereum" | "Bitcoin" | "BSC" | "Polygon" | "Solana" | "Arbitrum" | "Avalanche" | "Base"

export interface ChainRiskData {
  chain: ChainType
  chain_risk_score: number
  key_risks: string[]
  transaction_count: number
  total_volume_usd: number
  active: boolean
}

export interface MultiChainData {
  wallet: string
  chains: ChainRiskData[]
  global_risk_score: number
}

interface MultiChainSelectorProps {
  data: MultiChainData
  selectedChain: ChainType | "ALL"
  onChainSelect: (chain: ChainType | "ALL") => void
}

const chainColors: Record<ChainType, { bg: string; border: string; text: string; icon: string }> = {
  Ethereum: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400", icon: "Ξ" },
  Bitcoin: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400", icon: "₿" },
  BSC: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400", icon: "BNB" },
  Polygon: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", icon: "MATIC" },
  Solana: { bg: "bg-gradient-to-r from-purple-500/20 to-cyan-500/20", border: "border-purple-500/50", text: "text-purple-400", icon: "SOL" },
  Arbitrum: { bg: "bg-blue-600/20", border: "border-blue-600/50", text: "text-blue-300", icon: "ARB" },
  Avalanche: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400", icon: "AVAX" },
  Base: { bg: "bg-blue-400/20", border: "border-blue-400/50", text: "text-blue-300", icon: "BASE" }
}

function getRiskColor(score: number) {
  if (score >= 75) return { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400" }
  if (score >= 50) return { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400" }
  if (score >= 25) return { bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400" }
  return { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400" }
}

export function MultiChainSelector({ data, selectedChain, onChainSelect }: MultiChainSelectorProps) {
  const globalRiskColor = getRiskColor(data.global_risk_score)
  const activeChains = data.chains.filter(c => c.active)

  return (
    <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_#ffd70022]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-yellow-400" />
            <span className="text-foreground">Multi-Chain Overview</span>
          </CardTitle>
          <div className={`flex items-center gap-2 p-2 rounded-lg ${globalRiskColor.bg} border ${globalRiskColor.border}`}>
            <span className="text-xs text-gray-400">Global Risk:</span>
            <span className={`text-xl font-bold ${globalRiskColor.text}`}>
              {data.global_risk_score}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chain Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedChain === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => onChainSelect("ALL")}
            className={selectedChain === "ALL" 
              ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30" 
              : "border-gray-600 text-gray-400 hover:border-yellow-500/50 hover:text-yellow-300"
            }
          >
            <Globe className="w-4 h-4 mr-1" />
            All Chains
          </Button>
          {activeChains.map((chain) => {
            const colors = chainColors[chain.chain]
            const riskColors = getRiskColor(chain.chain_risk_score)
            const isSelected = selectedChain === chain.chain
            
            return (
              <Button
                key={chain.chain}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onChainSelect(chain.chain)}
                className={isSelected 
                  ? `${colors.bg} ${colors.border} ${colors.text} hover:opacity-80` 
                  : "border-gray-600 text-gray-400 hover:border-gray-500"
                }
              >
                <span className="mr-1">{colors.icon}</span>
                {chain.chain}
                <Badge className={`ml-2 ${riskColors.bg} ${riskColors.text} text-[10px] px-1`}>
                  {chain.chain_risk_score}
                </Badge>
              </Button>
            )
          })}
        </div>

        {/* Chain Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(selectedChain === "ALL" ? activeChains : activeChains.filter(c => c.chain === selectedChain)).map((chain) => {
            const colors = chainColors[chain.chain]
            const riskColors = getRiskColor(chain.chain_risk_score)
            
            return (
              <div 
                key={chain.chain}
                className={`p-4 rounded-lg ${colors.bg} border ${colors.border} cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={() => onChainSelect(chain.chain)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${colors.text}`}>{colors.icon}</span>
                    <span className="font-medium text-gray-200">{chain.chain}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${riskColors.text}`}>
                    {chain.chain_risk_score >= 70 ? (
                      <XCircle className="w-4 h-4" />
                    ) : chain.chain_risk_score >= 40 ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span className="font-bold">{chain.chain_risk_score}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Transactions</p>
                    <p className="text-sm font-medium text-gray-200">{chain.transaction_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Volume</p>
                    <p className="text-sm font-medium text-gray-200">${chain.total_volume_usd.toLocaleString()}</p>
                  </div>
                </div>

                {chain.key_risks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Key Risks:</p>
                    {chain.key_risks.slice(0, 2).map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-400">{risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Inactive Chains */}
        {data.chains.filter(c => !c.active).length > 0 && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2">No activity detected on:</p>
            <div className="flex flex-wrap gap-2">
              {data.chains.filter(c => !c.active).map((chain) => (
                <Badge key={chain.chain} variant="outline" className="text-gray-500 border-gray-700">
                  {chainColors[chain.chain].icon} {chain.chain}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
