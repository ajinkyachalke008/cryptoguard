"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Repeat, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Users,
  ArrowRightLeft,
  TrendingUp,
  Eye
} from "lucide-react"

export type WashTradingLevel = "LOW" | "MEDIUM" | "HIGH"

export interface WashTradingData {
  collection: string
  wash_trading_level: WashTradingLevel
  wash_trading_ratio: number
  wash_trading_explanation: string
  suspicious_wallets: {
    address: string
    trade_count: number
    volume_usd: number
    connected_wallets: number
  }[]
  circular_trades: {
    pattern: string
    occurrences: number
    volume_usd: number
  }[]
  volume_analysis: {
    total_volume_24h: number
    wash_volume_24h: number
    organic_volume_24h: number
  }
}

interface WashTradingPanelProps {
  data: WashTradingData
}

const levelConfig = {
  LOW: {
    label: "Low Wash Trading",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  },
  MEDIUM: {
    label: "Medium Wash Trading",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  HIGH: {
    label: "High Wash Trading",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  }
}

export function WashTradingPanel({ data }: WashTradingPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const config = levelConfig[data.wash_trading_level]
  const StatusIcon = config.icon

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Repeat className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">Wash Trading Detection</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          {data.collection} - Trading pattern analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wash Trading Ratio */}
        <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Wash Trading Ratio</span>
            <span className={`text-2xl font-bold ${config.textColor}`}>
              {(data.wash_trading_ratio * 100).toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={data.wash_trading_ratio * 100} 
            className={`h-3 ${
              data.wash_trading_ratio > 0.7 ? "[&>div]:bg-red-500" :
              data.wash_trading_ratio > 0.4 ? "[&>div]:bg-yellow-500" :
              "[&>div]:bg-green-500"
            }`}
          />
          <p className={`mt-2 text-sm ${config.textColor}`}>{data.wash_trading_explanation}</p>
        </div>

        {/* Volume Analysis */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Total Volume (24h)</p>
            <p className="text-lg font-bold text-blue-400">
              ${data.volume_analysis.total_volume_24h.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <Repeat className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Wash Volume</p>
            <p className="text-lg font-bold text-red-400">
              ${data.volume_analysis.wash_volume_24h.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Organic Volume</p>
            <p className="text-lg font-bold text-green-400">
              ${data.volume_analysis.organic_volume_24h.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Suspicious Wallets */}
        {data.suspicious_wallets.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-gray-400 hover:text-yellow-300"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Suspicious Wallets ({data.suspicious_wallets.length})
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {data.suspicious_wallets.map((wallet, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-black/40 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs text-yellow-300">
                        {wallet.address.slice(0, 10)}...{wallet.address.slice(-6)}
                      </code>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300 h-6 px-2">
                        <Eye className="w-3 h-3 mr-1" />
                        Investigate
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Trades</p>
                        <p className="text-sm font-bold text-gray-200">{wallet.trade_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-sm font-bold text-orange-400">${wallet.volume_usd.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Connected</p>
                        <p className="text-sm font-bold text-purple-400">{wallet.connected_wallets}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Circular Trade Patterns */}
        {data.circular_trades.length > 0 && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="w-5 h-5 text-orange-400" />
              <span className="font-medium text-orange-400">Circular Trade Patterns</span>
            </div>
            <div className="space-y-2">
              {data.circular_trades.map((trade, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-sm text-gray-300">{trade.pattern}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-400">{trade.occurrences}x</p>
                    <p className="text-xs text-gray-500">${trade.volume_usd.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
