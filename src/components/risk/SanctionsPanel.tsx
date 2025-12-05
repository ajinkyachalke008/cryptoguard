"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText
} from "lucide-react"

export type SanctionsStatus = "CLEAR" | "POSSIBLE_MATCH" | "CONFIRMED_MATCH"

export interface SanctionsData {
  sanctions_status: SanctionsStatus
  sanctions_sources: string[]
  sanctions_reason: string
  confidence: number
  matched_addresses?: {
    address: string
    list: string
    match_type: "DIRECT" | "CLUSTER"
    exposure_percentage?: number
  }[]
  example_transactions?: {
    hash: string
    amount: number
    timestamp: string
    counterparty: string
  }[]
}

interface SanctionsPanelProps {
  data: SanctionsData
}

const statusConfig = {
  CLEAR: {
    label: "No sanctions match",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    textColor: "text-green-400",
    glowColor: "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
  },
  POSSIBLE_MATCH: {
    label: "Possible sanctions exposure",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    textColor: "text-yellow-400",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]"
  },
  CONFIRMED_MATCH: {
    label: "Confirmed sanctions address - High Risk",
    icon: XCircle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    textColor: "text-red-400",
    glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  }
}

export function SanctionsPanel({ data }: SanctionsPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[data.sanctions_status]
  const StatusIcon = config.icon

  return (
    <Card className={`border-2 ${config.borderColor} bg-black/60 backdrop-blur-sm ${config.glowColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-foreground">Sanctions Screening</span>
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          OFAC SDN, UN, EU, UK HMT sanctions list check
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Status */}
        <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <p className={`${config.textColor} font-medium`}>{data.sanctions_reason}</p>
          {data.confidence > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">Confidence:</span>
              <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden max-w-32">
                <div 
                  className={`h-full ${config.bgColor.replace('/20', '')}`}
                  style={{ width: `${data.confidence * 100}%` }}
                />
              </div>
              <span className={`text-xs ${config.textColor}`}>{(data.confidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Sources */}
        {data.sanctions_sources.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Lists Checked:</p>
            <div className="flex flex-wrap gap-2">
              {data.sanctions_sources.map((source, idx) => (
                <Badge key={idx} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {(data.matched_addresses || data.example_transactions) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-gray-400 hover:text-yellow-300"
            >
              <span>View Details</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Matched Addresses */}
                {data.matched_addresses && data.matched_addresses.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Matched Addresses:</p>
                    <div className="space-y-2">
                      {data.matched_addresses.map((match, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-black/40 border border-gray-700">
                          <div className="flex items-center justify-between">
                            <code className="text-xs text-yellow-300">{match.address}</code>
                            <Badge className={`text-[10px] ${
                              match.match_type === "DIRECT" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                            }`}>
                              {match.match_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>List: {match.list}</span>
                            {match.exposure_percentage && (
                              <span>Exposure: {match.exposure_percentage}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example Transactions */}
                {data.example_transactions && data.example_transactions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Example Transactions:</p>
                    <div className="space-y-2">
                      {data.example_transactions.map((tx, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-black/40 border border-gray-700 flex items-center justify-between">
                          <div>
                            <code className="text-xs text-gray-300">{tx.hash}</code>
                            <p className="text-xs text-gray-500 mt-1">→ {tx.counterparty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-yellow-300">${tx.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{tx.timestamp}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-300">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
