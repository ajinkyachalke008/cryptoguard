"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Droplets,
  Lock,
  Unlock,
  Users,
  Coins,
  BarChart3,
  Flame
} from "lucide-react"

export type RugPullRisk = "LOW" | "MEDIUM" | "HIGH" | "EXTREME"

export interface RugPullData {
  rug_pull_risk: RugPullRisk
  rug_pull_reasons: string[]
  liquidity_analysis: {
    total_liquidity_usd: number
    liquidity_locked: boolean
    lock_duration_days?: number
    lock_percentage?: number
    top_lp_holder_share: number
    num_liquidity_providers: number
  }
  ownership_analysis: {
    deployer_holdings_pct: number
    top_10_holders_pct: number
    holder_count: number
    recent_large_sells?: {
      address: string
      amount: number
      timestamp: string
    }[]
  }
  dangerous_functions: {
    function_name: string
    risk_description: string
    detected: boolean
  }[]
}

interface RugPullPanelProps {
  data: RugPullData
}

const riskConfig = {
  LOW: {
    label: "Low Rug Pull Risk",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  },
  MEDIUM: {
    label: "Medium Rug Pull Risk",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  HIGH: {
    label: "High Rug Pull Risk",
    icon: AlertTriangle,
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
    textColor: "text-orange-400",
    glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.3)]"
  },
  EXTREME: {
    label: "EXTREME Rug Pull Risk",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  }
}

export function RugPullPanel({ data }: RugPullPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const config = riskConfig[data.rug_pull_risk]
  const StatusIcon = config.icon

  const detectedDangerousFunctions = data.dangerous_functions.filter(f => f.detected)

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">Rug Pull Risk</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          Liquidity, ownership, and contract analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Reasons */}
        {data.rug_pull_reasons.length > 0 && (
          <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
            <ul className="space-y-2">
              {data.rug_pull_reasons.map((reason, idx) => (
                <li key={idx} className={`flex items-start gap-2 ${config.textColor}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Liquidity Analysis */}
        <div className="p-4 rounded-lg bg-black/40 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-gray-200">Liquidity Analysis</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Liquidity</p>
              <p className="text-lg font-bold text-blue-400">
                ${data.liquidity_analysis.total_liquidity_usd.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Liquidity Providers</p>
              <p className="text-lg font-bold text-gray-200">
                {data.liquidity_analysis.num_liquidity_providers}
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">Liquidity Lock Status</p>
                {data.liquidity_analysis.liquidity_locked ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 border text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked {data.liquidity_analysis.lock_duration_days && `(${data.liquidity_analysis.lock_duration_days} days)`}
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 border text-xs">
                    <Unlock className="w-3 h-3 mr-1" />
                    Not Locked
                  </Badge>
                )}
              </div>
              {data.liquidity_analysis.lock_percentage && (
                <Progress 
                  value={data.liquidity_analysis.lock_percentage} 
                  className="h-2 [&>div]:bg-green-500"
                />
              )}
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Top LP Holder Share</p>
              <div className="flex items-center gap-2">
                <Progress 
                  value={data.liquidity_analysis.top_lp_holder_share} 
                  className={`h-2 flex-1 ${
                    data.liquidity_analysis.top_lp_holder_share > 80 ? "[&>div]:bg-red-500" :
                    data.liquidity_analysis.top_lp_holder_share > 50 ? "[&>div]:bg-yellow-500" :
                    "[&>div]:bg-green-500"
                  }`}
                />
                <span className={`text-sm font-medium ${
                  data.liquidity_analysis.top_lp_holder_share > 80 ? "text-red-400" :
                  data.liquidity_analysis.top_lp_holder_share > 50 ? "text-yellow-400" :
                  "text-green-400"
                }`}>
                  {data.liquidity_analysis.top_lp_holder_share}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Analysis */}
        <div className="p-4 rounded-lg bg-black/40 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-gray-200">Ownership Distribution</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Deployer Holdings</p>
              <p className={`text-2xl font-bold ${
                data.ownership_analysis.deployer_holdings_pct > 30 ? "text-red-400" :
                data.ownership_analysis.deployer_holdings_pct > 10 ? "text-yellow-400" :
                "text-green-400"
              }`}>
                {data.ownership_analysis.deployer_holdings_pct}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Top 10 Holders</p>
              <p className={`text-2xl font-bold ${
                data.ownership_analysis.top_10_holders_pct > 70 ? "text-red-400" :
                data.ownership_analysis.top_10_holders_pct > 50 ? "text-yellow-400" :
                "text-green-400"
              }`}>
                {data.ownership_analysis.top_10_holders_pct}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Holders</p>
              <p className="text-2xl font-bold text-gray-200">
                {data.ownership_analysis.holder_count.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Dangerous Functions */}
        {detectedDangerousFunctions.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-gray-400 hover:text-yellow-300"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                Dangerous Functions ({detectedDangerousFunctions.length})
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {detectedDangerousFunctions.map((func, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <Flame className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <code className="text-sm text-red-300">{func.function_name}</code>
                      <p className="text-xs text-gray-400 mt-1">{func.risk_description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Large Sells */}
        {data.ownership_analysis.recent_large_sells && data.ownership_analysis.recent_large_sells.length > 0 && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <span className="font-medium text-orange-400">Recent Large Sells</span>
            </div>
            <div className="space-y-2">
              {data.ownership_analysis.recent_large_sells.map((sell, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/40">
                  <code className="text-xs text-gray-400">
                    {sell.address.slice(0, 10)}...{sell.address.slice(-6)}
                  </code>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-400">-${sell.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{sell.timestamp}</p>
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
