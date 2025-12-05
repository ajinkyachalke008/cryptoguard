"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Store, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Repeat,
  ImageOff,
  AlertOctagon,
  ExternalLink
} from "lucide-react"

export type MarketplaceRiskLabel = "LOW" | "MEDIUM" | "HIGH"

export interface MarketplaceRiskData {
  marketplace: string
  marketplace_url?: string
  marketplace_risk_score: number
  marketplace_risk_label: MarketplaceRiskLabel
  marketplace_risk_reasons: string[]
  metrics: {
    wash_trading_percentage: number
    fake_collection_count: number
    fraud_incident_count: number
    verified_collection_ratio: number
    average_response_time_hours: number
  }
  recent_incidents?: {
    date: string
    type: string
    description: string
    affected_users?: number
    amount_lost?: number
  }[]
  safety_features: {
    feature: string
    implemented: boolean
  }[]
}

interface MarketplaceRiskPanelProps {
  data: MarketplaceRiskData
}

const riskConfig = {
  LOW: {
    label: "Low Risk Marketplace",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  },
  MEDIUM: {
    label: "Medium Risk Marketplace",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  HIGH: {
    label: "High Risk Marketplace",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  }
}

export function MarketplaceRiskPanel({ data }: MarketplaceRiskPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const config = riskConfig[data.marketplace_risk_label]
  const StatusIcon = config.icon

  const scoreColor = data.marketplace_risk_score >= 70 ? "text-red-400" : 
                     data.marketplace_risk_score >= 40 ? "text-yellow-400" : "text-green-400"

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">Marketplace Risk</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400 flex items-center gap-2">
          {data.marketplace}
          {data.marketplace_url && (
            <Button variant="ghost" size="sm" className="h-5 px-1 text-gray-400 hover:text-yellow-300">
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${data.marketplace_risk_score * 2.51} 251`}
                className={scoreColor}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>{data.marketplace_risk_score}</span>
              <span className="text-[10px] text-gray-400">Risk Score</span>
            </div>
          </div>
          <div className="flex-1">
            <ul className="space-y-1">
              {data.marketplace_risk_reasons.map((reason, idx) => (
                <li key={idx} className={`flex items-start gap-2 text-sm ${config.textColor}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <Repeat className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Wash Trading</p>
            <p className={`text-lg font-bold ${
              data.metrics.wash_trading_percentage > 30 ? "text-red-400" :
              data.metrics.wash_trading_percentage > 15 ? "text-yellow-400" :
              "text-green-400"
            }`}>
              {data.metrics.wash_trading_percentage}%
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <ImageOff className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Fake Collections</p>
            <p className="text-lg font-bold text-red-400">
              {data.metrics.fake_collection_count}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <AlertOctagon className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Fraud Incidents</p>
            <p className="text-lg font-bold text-orange-400">
              {data.metrics.fraud_incident_count}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-gray-700 text-center">
            <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Verified Ratio</p>
            <p className="text-lg font-bold text-green-400">
              {data.metrics.verified_collection_ratio}%
            </p>
          </div>
        </div>

        {/* Safety Features */}
        <div className="p-4 rounded-lg bg-black/40 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-gray-200">Safety Features</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.safety_features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-black/30">
                {feature.implemented ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span className={`text-sm ${feature.implemented ? "text-gray-200" : "text-gray-500"}`}>
                  {feature.feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        {data.recent_incidents && data.recent_incidents.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-gray-400 hover:text-yellow-300"
            >
              <span className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Recent Incidents ({data.recent_incidents.length})
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {data.recent_incidents.map((incident, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/50 border text-xs">
                        {incident.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{incident.date}</span>
                    </div>
                    <p className="text-sm text-gray-200 mb-2">{incident.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      {incident.affected_users && (
                        <span>Affected: {incident.affected_users} users</span>
                      )}
                      {incident.amount_lost && (
                        <span className="text-red-400">Lost: ${incident.amount_lost.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
