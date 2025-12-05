"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye
} from "lucide-react"

export type FakeVolumeLabel = "AUTHENTIC" | "SUSPICIOUS" | "HEAVILY_MANIPULATED"

export interface FakeVolumeData {
  collection: string
  total_volume_eth: number
  fake_volume_ratio: number
  estimated_real_volume_eth: number
  fake_volume_label: FakeVolumeLabel
  volume_breakdown: {
    organic_trades: number
    suspected_wash: number
    bot_activity: number
  }
  comparison: {
    reported_floor: number
    estimated_floor: number
    price_inflation: number
  }
}

interface FakeVolumePanelProps {
  data: FakeVolumeData
}

const labelConfig = {
  AUTHENTIC: {
    label: "Authentic Volume",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  },
  SUSPICIOUS: {
    label: "Suspicious Volume",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  HEAVILY_MANIPULATED: {
    label: "Heavily Manipulated",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  }
}

export function FakeVolumePanel({ data }: FakeVolumePanelProps) {
  const config = labelConfig[data.fake_volume_label]
  const StatusIcon = config.icon
  const fakePercentage = data.fake_volume_ratio * 100
  const realPercentage = 100 - fakePercentage

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">Volume Analysis</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          {data.collection} - Fake volume detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Volume Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Reported Volume</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {data.total_volume_eth.toLocaleString()} ETH
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Estimated Real Volume</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {data.estimated_real_volume_eth.toLocaleString()} ETH
            </p>
          </div>
        </div>

        {/* Fake Volume Bar */}
        <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Volume Authenticity</span>
            <span className={`font-bold ${config.textColor}`}>
              {fakePercentage.toFixed(0)}% Fake
            </span>
          </div>
          <div className="h-6 rounded-full bg-black/40 overflow-hidden flex">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${realPercentage}%` }}
            />
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${fakePercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-green-400">Real: {realPercentage.toFixed(0)}%</span>
            <span className="text-red-400">Fake: {fakePercentage.toFixed(0)}%</span>
          </div>
        </div>

        {/* Volume Breakdown */}
        <div className="p-4 rounded-lg bg-black/40 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-gray-200">Volume Breakdown</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Organic Trades</span>
                <span className="text-sm text-green-400">{data.volume_breakdown.organic_trades}%</span>
              </div>
              <Progress value={data.volume_breakdown.organic_trades} className="h-2 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Suspected Wash Trading</span>
                <span className="text-sm text-orange-400">{data.volume_breakdown.suspected_wash}%</span>
              </div>
              <Progress value={data.volume_breakdown.suspected_wash} className="h-2 [&>div]:bg-orange-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Bot Activity</span>
                <span className="text-sm text-red-400">{data.volume_breakdown.bot_activity}%</span>
              </div>
              <Progress value={data.volume_breakdown.bot_activity} className="h-2 [&>div]:bg-red-500" />
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        {data.comparison.price_inflation > 0 && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-orange-400" />
              <span className="font-medium text-orange-400">Price Inflation Warning</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Reported Floor</p>
                <p className="text-lg font-bold text-blue-400">{data.comparison.reported_floor} ETH</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estimated Floor</p>
                <p className="text-lg font-bold text-green-400">{data.comparison.estimated_floor} ETH</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Inflation</p>
                <p className="text-lg font-bold text-orange-400">+{data.comparison.price_inflation}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
